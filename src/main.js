import './styles.css';
import { isConfigured } from './supabase.js';
import { getSession, signIn, signOut, onAuthChange } from './auth.js';
import {
  initForm, collectFormData, resetForm, populateForm, populateLoaders,
} from './form.js';
import { renderCertificate } from './certificate.js';
import { savePDF } from './pdf.js';
import {
  saveCertificate, listCertificates, getCertificate, listLoaders,
} from './certificates.js';
import { showToast } from './toast.js';

const el = (id) => document.getElementById(id);

// Holds the data + cert number currently shown in the preview (for PDF naming).
let current = { data: null, certNumber: null };

// ── View switching ──
function showView(name) {
  el('auth-screen').style.display = name === 'auth' ? 'flex' : 'none';
  el('header').style.display = (name === 'form' || name === 'history') ? 'flex' : 'none';
  el('app').style.display = name === 'form' ? 'flex' : 'none';
  el('history-view').style.display = name === 'history' ? 'block' : 'none';
  el('cert-preview').style.display = name === 'preview' ? 'block' : 'none';
  window.scrollTo(0, 0);
}

// ── Save only (no preview) ──
async function save() {
  let data;
  try {
    data = collectFormData();
  } catch (e) {
    if (e.validation) { showToast(e.message); return; }
    throw e;
  }

  const btn = el('save-btn');
  btn.disabled = true;
  btn.textContent = 'Saving…';
  try {
    const saved = await saveCertificate(data);
    showToast(`Saved as certificate #${saved.cert_number}`, 'success');
  } catch (e) {
    console.error(e);
    showToast('Could not save: ' + (e.message || 'unknown error'));
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save';
  }
}

// ── Generate (and save, when possible) ──
async function generate() {
  let data;
  try {
    data = collectFormData();
  } catch (e) {
    if (e.validation) { showToast(e.message); return; }
    throw e;
  }

  let certNumber = null;
  if (isConfigured) {
    const btn = el('generate-btn');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      const saved = await saveCertificate(data);
      certNumber = saved.cert_number;
      showToast(`Saved as certificate #${certNumber}`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Could not save: ' + (e.message || 'unknown error'));
    } finally {
      btn.disabled = false;
      btn.textContent = 'Generate & Save Certificate';
    }
  }

  current = { data, certNumber };
  el('certificate').innerHTML = renderCertificate(data, certNumber);
  showView('preview');
}

// ── History ──
async function openHistory() {
  showView('history');
  await refreshHistory('');
}

async function refreshHistory(search) {
  const listEl = el('history-list');
  listEl.innerHTML = '<div class="empty-state">Loading…</div>';
  try {
    const rows = await listCertificates(search);
    if (!rows.length) {
      listEl.innerHTML = '<div class="empty-state">No certificates found.</div>';
      return;
    }
    listEl.innerHTML = rows.map((r) => `
      <div class="history-item" data-id="${r.id}">
        <div class="hi-main">
          <span class="hi-cont">${r.container_no}</span>
          <span class="hi-meta">${formatDateMeta(r.fum_date)} · ${r.loaded_by || ''}</span>
        </div>
        <span class="hi-num">#${r.cert_number}</span>
      </div>
    `).join('');
    listEl.querySelectorAll('.history-item').forEach((item) => {
      item.addEventListener('click', () => loadCertificate(item.dataset.id));
    });
  } catch (e) {
    console.error(e);
    listEl.innerHTML = '<div class="empty-state">Error loading certificates.</div>';
  }
}

function formatDateMeta(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

async function loadCertificate(id) {
  try {
    const record = await getCertificate(id);
    populateForm(record);
    showView('form');
    showToast(`Loaded certificate #${record.cert_number} — review then re-generate to reprint`, 'success');
  } catch (e) {
    console.error(e);
    showToast('Could not load certificate');
  }
}

// ── Auth ──
async function handleLogin(e) {
  e.preventDefault();
  const errEl = el('login-error');
  errEl.textContent = '';
  const btn = el('login-btn');
  btn.disabled = true;
  btn.textContent = 'Signing in…';
  try {
    await signIn(el('login-email').value.trim(), el('login-password').value);
    // onAuthChange will swap the view.
  } catch (err) {
    errEl.textContent = err.message || 'Sign in failed';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

async function enterApp() {
  // Refresh loader suggestions from the DB (falls back to defaults on error).
  try {
    const loaders = await listLoaders();
    if (loaders.length) populateLoaders(loaders);
  } catch { /* keep defaults */ }
  showView('form');
}

// ── Boot ──
function wireEvents() {
  el('generate-btn').addEventListener('click', generate);
  el('save-btn').addEventListener('click', save);
  el('reset-btn').addEventListener('click', () => {
    if (confirm('Start a new certificate? This will clear all fields.')) resetForm();
  });
  el('nav-history').addEventListener('click', openHistory);
  el('history-back').addEventListener('click', () => showView('form'));
  el('history-search').addEventListener('input', (e) => refreshHistory(e.target.value));
  el('cert-back').addEventListener('click', () => showView('form'));
  el('cert-print').addEventListener('click', () => window.print());
  el('cert-pdf').addEventListener('click', () => savePDF({
    containerNo: current.data?.certificate.container_no,
    fumDate: current.data?.certificate.fum_date,
  }));
  el('login-form').addEventListener('submit', handleLogin);
  el('logout-btn').addEventListener('click', async () => {
    await signOut();
    showView('auth');
  });
}

async function boot() {
  initForm();
  wireEvents();

  // No Supabase yet: run as a standalone generator (save + history disabled).
  if (!isConfigured) {
    el('nav-history').style.display = 'none';
    el('logout-btn').style.display = 'none';
    el('generate-btn').textContent = 'Generate Certificate';
    showView('form');
    showToast('Running offline — set up Supabase to save certificates', 'success');
    return;
  }

  el('save-btn').style.display = '';

  onAuthChange((session) => {
    if (session) enterApp();
    else showView('auth');
  });

  const session = await getSession();
  if (session) await enterApp();
  else showView('auth');
}

boot();
