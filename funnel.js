// funnel.js — shared behaviour for the AlexusLab funnel pages.
(function () {
  // reveal on scroll
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });

  // count-up numbers: <b data-count="50">50+</b>
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      var t0 = performance.now(), dur = 1400;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(performance.now());
    }, { threshold: 0.4 });
    o.observe(el);
  });

  // sticky mobile CTA appears after the hero
  var sticky = document.querySelector('.sticky-cta');
  var anchor = document.querySelector('[data-sticky-after]');
  if (sticky) {
    document.body.classList.add('has-sticky');
    if (sticky.hasAttribute('data-always') || !anchor) {
      setTimeout(function () { sticky.classList.add('on'); }, 500);
    } else {
      var so = new IntersectionObserver(function (es) {
        sticky.classList.toggle('on', !es[0].isIntersecting && es[0].boundingClientRect.top < 0);
      }, { threshold: 0 });
      so.observe(anchor);
    }
  }
})();
