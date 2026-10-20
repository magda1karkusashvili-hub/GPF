(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const menu = $('#menu'), tg = $('.menu-toggle');
tg.addEventListener('click', () => tg.setAttribute('aria-expanded', menu.classList.toggle('active')));
document.addEventListener('click', e => { if (!menu.contains(e.target) && !tg.contains(e.target)) menu.classList.remove('active'); });
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
$$('.reveal').forEach(el => io.observe(el));
$$('[data-count]').forEach(el => {
  const end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
  const step = t => { const p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(end * p) + suf; if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
});
const lb = $('#lightbox');
if (lb) {
  const img = $('img', lb), close = () => lb.hidden = true;
  $$('.masonry img').forEach(i => { const open = () => { img.src = i.src; lb.hidden = false; };
    i.addEventListener('click', open); i.addEventListener('keydown', e => e.key === 'Enter' && open()); });
  lb.addEventListener('click', close); document.addEventListener('keydown', e => e.key === 'Escape' && close());
}
$$('.tab').forEach(b => b.addEventListener('click', () => {
  $$('.tab').forEach(x => x.classList.toggle('on', x === b));
  $$('.news').forEach(c => c.hidden = b.dataset.f !== 'all' && c.dataset.cat !== b.dataset.f);
}));
})();
