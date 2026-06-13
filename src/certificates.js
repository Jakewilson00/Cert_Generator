import { supabase, isConfigured } from './supabase.js';

// Insert a certificate plus its line items. Returns the saved certificate row
// (including the generated sequential cert_number). The lines are written via
// a single insert keyed by the new certificate id.
export async function saveCertificate({ certificate, lines }) {
  if (!isConfigured) throw new Error('Supabase not configured');

  const { data: cert, error: certErr } = await supabase
    .from('certificates')
    .insert(certificate)
    .select()
    .single();
  if (certErr) throw certErr;

  if (lines.length) {
    const rows = lines.map((l) => ({ ...l, certificate_id: cert.id }));
    const { error: lineErr } = await supabase.from('certificate_lines').insert(rows);
    if (lineErr) throw lineErr;
  }

  return cert;
}

// List recent certificates, optionally filtered by container number.
export async function listCertificates(search = '') {
  if (!isConfigured) return [];
  let query = supabase
    .from('certificates')
    .select('id, cert_number, container_no, fum_date, loaded_by, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (search.trim()) query = query.ilike('container_no', `%${search.trim()}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Fetch a single certificate with its line items, for reprint / re-edit.
export async function getCertificate(id) {
  if (!isConfigured) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('certificates')
    .select('*, certificate_lines(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// Distinct loader codes seen so far, for the "Loaded By" datalist.
export async function listLoaders() {
  if (!isConfigured) return [];
  const { data, error } = await supabase.from('loaders').select('code').order('code');
  if (error) {
    console.warn('Could not load loaders', error.message);
    return [];
  }
  return (data || []).map((r) => r.code);
}
