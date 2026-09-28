// Pega este código en Extensiones > Apps Script de tu Google Sheet "Leads La Mina".
// Luego: Implementar > Gestionar implementaciones > editar (lápiz) > Implementar
// (misma URL de siempre, no hace falta cambiar nada en la web)
//
// Antes de implementar, añade estas dos cabeceras nuevas en la fila 1 de la hoja,
// después de "Inversión": Mensaje | Tipo

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.fecha || new Date().toISOString(),
    data.nombre || '',
    data.email || '',
    data.telefono || '',
    data.experiencia || '',
    data.retiros || '',
    data.situacion || '',
    data.inversion || '',
    data.mensaje || '',
    data.tipo || 'Lead'
  ]);

  // Cuando alguien escribe un mensaje (no solo completa el quiz), avisa también por email
  if (data.tipo === 'Mensaje') {
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: 'Nuevo mensaje en LA MINA — ' + (data.nombre || 'sin nombre'),
      body: 'Nombre: ' + (data.nombre || '') + '\n' +
            'Email: ' + (data.email || '') + '\n' +
            'Teléfono: ' + (data.telefono || '') + '\n\n' +
            'Mensaje:\n' + (data.mensaje || '')
    });
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
