// Puntos de medición del funnel. De momento no hay ningún proveedor de analítica
// conectado (Google Analytics, Meta Pixel, Plausible...), así que track() solo
// registra el evento en la consola del navegador. Cuando se decida un proveedor,
// esta es la única función que hay que rellenar — el resto del código ya llama
// a track() en los puntos correctos y no hace falta tocarlo.
window.track = function (nombre, props) {
  try { console.debug('[track]', nombre, props || {}); } catch (e) {}
  // Ejemplo para cuando haya un proveedor, sin activar todavía:
  // if (window.gtag) gtag('event', nombre, props || {});
  // if (window.fbq) fbq('trackCustom', nombre, props || {});
};
