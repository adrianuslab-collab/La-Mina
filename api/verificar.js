// Vercel Serverless Function: comprueba que un token de reserva es válido
// (fue emitido por /api/solicitud.js, no ha caducado y no ha sido manipulado)
// antes de dejar ver el calendario de Calendly en reserva.html.

const crypto = require('crypto');

function firmar(payload) {
  return crypto.createHmac('sha256', process.env.TOKEN_SECRET).update(payload).digest('hex');
}

module.exports = async (req, res) => {
  const token = req.method === 'GET' ? req.query.token : (req.body && req.body.token);

  if (!token) {
    res.status(400).json({ valid: false, error: 'falta_token' });
    return;
  }

  let decoded;
  try {
    decoded = Buffer.from(String(token), 'base64url').toString('utf8');
  } catch (e) {
    res.status(200).json({ valid: false, error: 'token_invalido' });
    return;
  }

  const partes = decoded.split('|');
  if (partes.length !== 4) {
    res.status(200).json({ valid: false, error: 'token_invalido' });
    return;
  }

  const [solicitudId, expiraStr, email, firmaRecibida] = partes;
  const payload = solicitudId + '|' + expiraStr + '|' + email;
  const firmaEsperada = firmar(payload);

  const bufRecibida = Buffer.from(firmaRecibida, 'hex');
  const bufEsperada = Buffer.from(firmaEsperada, 'hex');
  const firmaValida = bufRecibida.length === bufEsperada.length && crypto.timingSafeEqual(bufRecibida, bufEsperada);

  if (!firmaValida) {
    res.status(200).json({ valid: false, error: 'firma_invalida' });
    return;
  }

  const expira = parseInt(expiraStr, 10);
  if (!expira || Date.now() > expira) {
    res.status(200).json({ valid: false, error: 'token_expirado' });
    return;
  }

  res.status(200).json({ valid: true, email: email });
};
