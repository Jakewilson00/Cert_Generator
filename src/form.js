import { isoToday, addDays } from './dates.js';

// Default loader initials, used if the database has no loaders table / rows.
const DEFAULT_LOADERS = ['JW', 'CM', 'CMc', 'PC', 'NS', 'LW'];

let lineIdx = 0;

// ── Count parsing: "10 x 42" -> { units: 10, each: 42 } ──
export function parseCount(val) {
  const m = val.trim().match(/^(\d+)\s*[xX×]\s*(\d+)$/);
  if (m) return { units: parseInt(m[1]), each: parseInt(m[2]) };
  const s = val.trim().match(/^(\d+)$/);
  if (s) return { units: parseInt(s[1]), each: 1 };
  return null;
}

function recalcChep() {
  let total = 0;
  document.querySelectorAll('.count-input').forEach((inp) => {
    const p = parseCount(inp.value);
    if (p) total += p.units;
  });
  document.getElementById('chepCount').value = total > 0 ? total : '';
}

function syncDates(iso) {
  document.getElementById('certDate').value = iso;
  document.getElementById('loadDate').value = iso;
  document.getElementById('releaseDate').value = addDays(iso, 10);
  document.getElementById('availDate').value = addDays(iso, 11);
}

// ── Line items ──
export function addLine(data = null) {
  lineIdx++;
  const n = lineIdx;
  const div = document.createElement('div');
  div.className = 'line-item';
  div.id = 'li-' + n;
  div.innerHTML = `
    <div class="li-header">
      <span class="li-title">Item ${n}</span>
      <button type="button" class="del-line" data-line="${n}">✕</button>
    </div>
    <div class="li-row">
      <div class="input-group" style="margin:0">
        <label>Line No.</label>
        <input type="text" class="line-no" placeholder="e.g. I1182" />
      </div>
      <div class="input-group" style="margin:0">
        <label>Count</label>
        <input type="text" class="count-input" placeholder="10 x 42" />
      </div>
      <div class="stat-box" style="margin:0">
        <span class="stat-label">Bags</span>
        <input type="number" class="bags-input stat-value" readonly placeholder="—" />
      </div>
    </div>
    <div class="input-group">
      <label>Comments</label>
      <input type="text" class="comments-input" placeholder="Optional comments..." />
    </div>
    <div class="input-group" style="margin-top: 16px;">
      <label>Type</label>
      <div class="checks">
        <label class="check-pill on"><input type="checkbox" class="cb-dom" checked /> Domestic</label>
        <label class="check-pill"><input type="checkbox" class="cb-exp" /> Export</label>
        <label class="check-pill"><input type="checkbox" class="cb-seed" /> Seed</label>
      </div>
    </div>
  `;
  document.getElementById('linesContainer').appendChild(div);

  div.querySelector('.del-line').addEventListener('click', () => removeLine(n));

  div.querySelectorAll('.check-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const cb = pill.querySelector('input[type="checkbox"]');
      setTimeout(() => pill.classList.toggle('on', cb.checked), 0);
    });
  });

  const countInp = div.querySelector('.count-input');
  const bagsInp = div.querySelector('.bags-input');
  countInp.addEventListener('input', () => {
    const p = parseCount(countInp.value);
    bagsInp.value = p ? p.units * p.each : '';
    recalcChep();
  });

  // Pre-fill when loading a saved certificate.
  if (data) {
    div.querySelector('.line-no').value = data.line_no || '';
    countInp.value = data.count_text || '';
    bagsInp.value = data.bags ?? '';
    const setPill = (sel, cbSel, on) => {
      div.querySelector(cbSel).checked = on;
      div.querySelector(sel).classList.toggle('on', on);
    };
    setPill('.check-pill:nth-child(1)', '.cb-dom', !!data.domestic);
    setPill('.check-pill:nth-child(2)', '.cb-exp', !!data.export_flag);
    setPill('.check-pill:nth-child(3)', '.cb-seed', !!data.seed);
    div.querySelector('.comments-input').value = data.comments || '';
  }
  return div;
}

export function removeLine(n) {
  const el = document.getElementById('li-' + n);
  if (el) {
    el.remove();
    recalcChep();
  }
}

function clearLines() {
  document.getElementById('linesContainer').innerHTML = '';
  lineIdx = 0;
}

// ── Read the whole form into a structured object, validating as we go. ──
export function collectFormData() {
  const get = (id) => document.getElementById(id).value;
  const errors = [];

  const containerNo = get('containerNo').trim();
  const fumDate = get('fumDate');
  const loadedBy = get('loadedBy').trim();

  const lines = [];
  document.querySelectorAll('.line-item').forEach((el, i) => {
    const lineNo = el.querySelector('.line-no').value.trim();
    if (!lineNo) return;
    const bagsRaw = el.querySelector('.bags-input').value.trim();
    lines.push({
      line_no: lineNo,
      count_text: el.querySelector('.count-input').value.trim(),
      bags: bagsRaw ? parseInt(bagsRaw) : null,
      domestic: el.querySelector('.cb-dom').checked,
      export_flag: el.querySelector('.cb-exp').checked,
      seed: el.querySelector('.cb-seed').checked,
      comments: el.querySelector('.comments-input').value.trim(),
      position: i,
    });
  });

  if (!containerNo) errors.push('Container number is required');
  if (!fumDate) errors.push('Fumigation date is required');
  if (!loadedBy) errors.push('Loaded By is required');
  if (lines.length === 0) errors.push('At least one line item is required');

  if (errors.length) {
    const err = new Error(errors[0]);
    err.validation = true;
    throw err;
  }

  const chepRaw = get('chepCount');
  return {
    certificate: {
      container_no: containerNo,
      volume: parseFloat(get('volume')),
      fum_date: fumDate,
      cert_date: get('certDate'),
      release_date: get('releaseDate'),
      avail_date: get('availDate'),
      load_date: get('loadDate'),
      loaded_from: get('loadedFrom').trim() || 'SHED',
      loaded_by: loadedBy,
      chep_count: chepRaw ? parseInt(chepRaw) : null,
      vent_period: get('ventPeriod').trim() || '24 HOURS',
    },
    lines,
  };
}

// ── Populate the form from a saved record (for re-edit / reprint). ──
export function populateForm(record) {
  const set = (id, v) => { document.getElementById(id).value = v ?? ''; };
  set('containerNo', record.container_no);
  set('volume', record.volume);
  set('fumDate', record.fum_date);
  set('certDate', record.cert_date);
  set('releaseDate', record.release_date);
  set('availDate', record.avail_date);
  set('loadDate', record.load_date);
  set('loadedFrom', record.loaded_from);
  set('loadedBy', record.loaded_by);
  set('chepCount', record.chep_count);
  set('ventPeriod', record.vent_period);

  clearLines();
  const lines = (record.certificate_lines || []).slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  if (lines.length) lines.forEach((l) => addLine(l));
  else { addLine(); addLine(); }
}

export function resetForm() {
  document.getElementById('containerNo').value = '';
  document.getElementById('loadedBy').value = '';
  document.getElementById('loadedFrom').value = 'SHED';
  document.getElementById('ventPeriod').value = '24 HOURS';
  document.getElementById('volume').value = '33.2';
  document.getElementById('chepCount').value = '';

  const t = isoToday();
  document.getElementById('fumDate').value = t;
  syncDates(t);

  clearLines();
  addLine();
  addLine();
  window.scrollTo(0, 0);
}

export function populateLoaders(codes) {
  const list = document.getElementById('loaders-list');
  const values = (codes && codes.length ? codes : DEFAULT_LOADERS);
  list.innerHTML = values.map((c) => `<option value="${c}"></option>`).join('');
}

// ── One-time wiring of the static form controls. ──
export function initForm() {
  document.getElementById('fumDate').addEventListener('change', function () {
    syncDates(this.value);
  });
  document.getElementById('add-line-btn').addEventListener('click', () => addLine());

  populateLoaders();
  const t = isoToday();
  document.getElementById('fumDate').value = t;
  syncDates(t);
  addLine();
  addLine();
}
