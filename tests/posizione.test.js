const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');

test('ogni figura ha la sua scheda Posizione con numeri sul corpo', () => {
  const ctx = carica();
  const senza = Object.keys(ctx.FIG).filter(n => !ctx.posHas(n));
  assert.deepEqual([...senza], []);
  for (const n of Object.keys(ctx.FIG)) {
    const p = ctx.posDef(n);
    assert.ok(p.co.length >= 3 && p.co.length <= 4, n + ': 3-4 numeri sul corpo');
    for (const c of p.co) assert.ok(c[1].length <= 62, n + ': testo troppo lungo: ' + c[1]);
    assert.ok(Array.isArray(p.no) && p.no.length, n + ': zone da non sentire');
    p.no.forEach(z => assert.ok(ctx.ZONE.some(x => x[0] === z), n + ': zona sconosciuta ' + z));
  }
});

test('partenza, arrivo ed errore si disegnano senza coordinate non valide', () => {
  const ctx = carica();
  for (const n of Object.keys(ctx.FIG)) {
    const p = ctx.posDef(n), fasi = p.err ? ['a', 'b', 'err'] : ['a', 'b'];
    for (const f of fasi) {
      const svg = ctx.posSVG(n, f);
      assert.ok(svg.length > 500, n + ' ' + f);
      assert.ok(!/NaN|undefined|Infinity/.test(svg), n + ' ' + f + ' ha coordinate non valide');
    }
    const vb = ctx.posInquadra(n);
    assert.ok(vb.w > 80 && vb.h > 60 && isFinite(vb.x) && isFinite(vb.y), n + ': inquadratura');
  }
});

test('i fotogrammi di partenza e arrivo esistono e i riferimenti dei numeri sono punti veri', () => {
  const ctx = carica();
  for (const n of Object.keys(ctx.FIG)) {
    const d = ctx.fgDef(n), p = ctx.posDef(n);
    assert.ok((p.a || 0) < d.k.length && (p.b != null ? p.b : d.k.length - 1) < d.k.length, n + ': indici dei fotogrammi');
    const P = ctx.fgPosa(ctx.posPose(n, 'b').p);
    for (const c of p.co) { const q = ctx.fgPunto(P, c[0]); assert.ok(isFinite(q[0]) && isFinite(q[1]), n + ': riferimento ' + c[0]); }
    (p.ang || []).forEach(a => a[0].forEach(r => { const q = ctx.fgPunto(P, r); assert.ok(isFinite(q[0]) && isFinite(q[1]), n + ': angolo ' + r); }));
  }
});

test('l\'errore e\' davvero diverso dalla posa giusta', () => {
  const ctx = carica();
  for (const n of Object.keys(ctx.FIG)) {
    const p = ctx.posDef(n); if (!p.err) continue;
    const ok = ctx.fgPosa(ctx.posPose(n, 'b').p), er = ctx.fgPosa(ctx.posPose(n, 'err').p);
    const pt = P => [P.hip, P.sh, P.hc, P.braccia.n.h, P.braccia.f.h, P.gambe.n.k, P.gambe.n.a, P.gambe.f.a, P.gambe.f.toe, [P.sp, P.br]].flat();
    const d = pt(ok).reduce((s, v, i) => s + Math.abs(v - pt(er)[i]), 0);
    assert.ok(d > 0.5, n + ': l\'errore coincide con la posa giusta (' + d.toFixed(2) + ')');
  }
});

test('gli angoli del ginocchio negli squat stanno in un intervallo sensato', () => {
  const ctx = carica();
  const ang = (n, fase) => {
    const P = ctx.fgPosa(ctx.posPose(n, fase).p), A = P.hip, B = P.gambe.n.k, C = P.gambe.n.a;
    const ua = [A[0] - B[0], A[1] - B[1]], uc = [C[0] - B[0], C[1] - B[1]];
    return Math.round(Math.acos((ua[0] * uc[0] + ua[1] * uc[1]) / (Math.hypot(...ua) * Math.hypot(...uc))) * 180 / Math.PI);
  };
  assert.ok(ang('Box Squat', 'a') > 150);
  const fondo = ang('Box Squat', 'b'); assert.ok(fondo >= 85 && fondo <= 130, 'squat al box: ' + fondo);
  const aff = ang('Affondi indietro manubri', 'b'); assert.ok(aff >= 80 && aff <= 110, 'affondo: ' + aff);
});
