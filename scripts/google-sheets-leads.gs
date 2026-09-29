// Pega este código en Extensiones > Apps Script de tu Google Sheet "Leads La Mina".
// Luego: Implementar > Gestionar implementaciones > editar (lápiz) > Versión: Nueva versión > Implementar
// (misma URL de siempre, no hace falta cambiar nada en la web)
//
// No envía ningún email: todo (quiz de la clase y mensajes de dudas) se guarda
// solo como fila nueva en la hoja. Las llamadas reservadas las avisa Calendly
// directamente por su cuenta, no este script.

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

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    sheet.appendRow(['ERROR GENERAL EN doPost: ' + err.message]);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
