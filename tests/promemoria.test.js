const test = require('node:test');
const assert = require('node:assert/strict');
const { carica } = require('./carica');

test('il file calendario ha 5 eventi ricorrenti con allarme e orari scelti', () => {
  const ctx = carica();
  ctx.S.orari = { mattina: '07:10', sera: '22:05', domenica: '18:30' };
  const ics = ctx.icsPromemoria();
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 5);
  assert.equal((ics.match(/BEGIN:VALARM/g) || []).length, 5);
  assert.match(ics, /DTSTART:\d{8}T071000\r\n[^]*RRULE:FREQ=DAILY/);
  assert.match(ics, /DTSTART:\d{8}T220500/);
  assert.match(ics, /DTSTART:\d{8}T183000\r\nDURATION:PT5M\r\nRRULE:FREQ=WEEKLY;BYDAY=SU/);
  assert.match(ics, /RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=SU/);
  /* nessuna riga senza CRLF e testo con virgole protetto */
  assert.ok(!/[^\r]\n/.test(ics));
  assert.ok(/Reflusso\\, camminate/.test(ics));
});

test('il promemoria della simmetria cade in una settimana di check (31, 35, 39...)', () => {
  const ctx = carica();
  const m = ctx.icsPromemoria().match(/UID:rachide-simmetria@rachide\r\nDTSTAMP:\d{8}T\d{6}\r\nDTSTART:(\d{4})(\d{2})(\d{2})/);
  const d = new ctx.Date(+m[1], +m[2] - 1, +m[3]);
  const w = ctx.weekOf(ctx.d2s(d));
  assert.equal(d.getDay(), 1);
  assert.equal((w - 31) % 4, 0);
});
