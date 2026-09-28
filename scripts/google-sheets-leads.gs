// Pega este código en Extensiones > Apps Script de tu Google Sheet "Leads La Mina".
// Luego: Implementar > Gestionar implementaciones > editar (lápiz) > Versión: Nueva versión > Implementar
// (misma URL de siempre, no hace falta cambiar nada en la web)
//
// Antes de implementar, añade estas dos cabeceras nuevas en la fila 1 de la hoja,
// después de "Inversión": Mensaje | Tipo

var EMAIL_AVISO = 'adrianuslab@gmail.com';

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  try {
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
      try {
        MailApp.sendEmail({
          to: EMAIL_AVISO,
          subject: 'Nuevo mensaje en LA MINA — ' + (data.nombre || 'sin nombre'),
          body: 'Nombre: ' + (data.nombre || '') + '\n' +
                'Email: ' + (data.email || '') + '\n' +
                'Teléfono: ' + (data.telefono || '') + '\n\n' +
                'Mensaje:\n' + (data.mensaje || '')
        });
      } catch (mailErr) {
        sheet.appendRow(['ERROR AL ENVIAR EMAIL: ' + mailErr.message]);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    sheet.appendRow(['ERROR GENERAL EN doPost: ' + err.message]);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Función de prueba manual: selecciónala en el desplegable de arriba del editor
// (donde pone "doPost") y dale a Ejecutar. No hace falta implementar nada para esto.
function testEmail() {
  MailApp.sendEmail(EMAIL_AVISO, 'Prueba manual La Mina', 'Si recibes esto, el envío de correo funciona.');
}
