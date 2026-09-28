// Pega este código en Extensiones > Apps Script de tu Google Sheet "Leads La Mina".
// Luego: Implementar > Nueva implementación > Aplicación web
//   Ejecutar como: Yo
//   Quién tiene acceso: Cualquier usuario
// Copia la URL que te da y pásasela a Claude para conectarla en la web.

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
    data.inversion || ''
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
