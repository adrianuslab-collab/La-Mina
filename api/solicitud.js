// Vercel Serverless Function: recibe la solicitud del plan Premium, la vuelve a validar
// en el servidor (nunca confiamos en lo que diga el navegador) y, si es válida,
// la reenvía a Formspree y devuelve un token firmado que da acceso a reserva.html.
//
// Variables de entorno necesarias (Vercel → Settings → Environment Variables):
//   FORMSPREE_ENDPOINT  → la URL que te da Formspree, tipo https://formspree.io/f/xxxxxxx
//   TOKEN_SECRET        → cadena secreta para firmar el token (ya generada, ver chat)

const crypto = require('crypto');

const PRESUPUESTO_QUE_CALIFICA = 'premium';

function firmar(payload) {
  return crypto.createHmac('sha256', process.env.TOKEN_SECRET).update(payload).digest('hex');
}

function emailValido(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'metodo_no_permitido' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const presupuestoKey = body.presupuestoKey || '';
  const presupuestoLabel = (body.presupuestoLabel || '').trim();
  const nombre = (body.nombre || '').trim();
  const email = (body.email || '').trim();
  const telefono = (body.telefono || '').trim();
  const experiencia = (body.experiencia || '').trim();
  const retiros = (body.retiros || '').trim();
  const situacion = (body.situacion || '').trim();
  const confirmacion = body.confirmacion === true;
  const origen = (body.origen || '').trim();

  // Re-validación en servidor: esto es lo que de verdad impide saltarse el filtro,
  // no basta con que el navegador oculte un botón.
  if (presupuestoKey !== PRESUPUESTO_QUE_CALIFICA) {
    res.status(403).json({ ok: false, error: 'presupuesto_no_califica' });
    return;
  }
  if (!nombre || !email || !telefono || !situacion || !experiencia || !retiros || !confirmacion) {
    res.status(400).json({ ok: false, error: 'campos_incompletos' });
    return;
  }
  if (!emailValido(email)) {
    res.status(400).json({ ok: false, error: 'email_invalido' });
    return;
  }

  const FORMSPREE_ENDPOINT = process.env.FORMSPREE_ENDPOINT;
  if (!FORMSPREE_ENDPOINT) {
    res.status(500).json({ ok: false, error: 'formspree_no_configurado' });
    return;
  }

  const solicitudId = crypto.randomUUID();
  const fecha = new Date().toISOString();

  const datosParaFormspree = {
    'Nombre y apellidos': nombre,
    'Email': email,
    'Teléfono': telefono,
    'Tiempo operando': experiencia,
    'Retiradas': retiros,
    'Situación actual': situacion,
    'Presupuesto declarado': presupuestoLabel,
    'Confirmación': 'Quiere solicitar el acceso al plan Premium',
    'Fecha de la solicitud': fecha,
    'ID de solicitud': solicitudId,
    'Origen': origen || '(no disponible)',
    '_subject': 'Nueva solicitud de plan Premium — ' + nombre
  };

  try {
    const respuestaFormspree = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(datosParaFormspree)
    });
    if (!respuestaFormspree.ok) {
      res.status(502).json({ ok: false, error: 'formspree_fallo' });
      return;
    }
  } catch (e) {
    res.status(502).json({ ok: false, error: 'formspree_fallo' });
    return;
  }

  // Token firmado, válido 2 horas, que da acceso a la página de reserva.
  const expira = Date.now() + 1000 * 60 * 60 * 2;
  const payload = solicitudId + '|' + expira + '|' + email;
  const firma = firmar(payload);
  const token = Buffer.from(payload + '|' + firma, 'utf8').toString('base64url');

  res.status(200).json({ ok: true, token: token });
};
