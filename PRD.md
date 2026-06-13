# Cert Generator — Product Requirements

## What's live

| Item | Status |
|------|--------|
| Vite app (form, certificate preview, PDF export, print) | ✅ Done |
| Supabase project (Cert_Generator, ap-southeast-2) | ✅ Done |
| Database schema (`certificates`, `certificate_lines`, `loaders`) | ✅ Done |
| Row Level Security (logged-out users see nothing) | ✅ Done |
| Sign-in gate (email + password) | ✅ Done |
| Save certificate to Supabase with auto cert number | ✅ Done |
| History view (search + reload + reprint) | ✅ Done |
| GitHub repo (Jakewilson00/Cert_Generator) | ✅ Done |

---

## Before going live — must-do

### 1. Finish the Vercel deployment
- Add the two environment variables in the Vercel dashboard (Project → Settings → Environment Variables):
  - `VITE_SUPABASE_URL` = `https://filkexozsqltqzieogkc.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` *(full key in `.env`)*
- Trigger a redeploy after adding them (Deployments → Redeploy)

### 2. Update Supabase auth URL to match Vercel
Once you have your Vercel URL (e.g. `https://cert-generator-xxxx.vercel.app`), either:
- Tell me the URL and I'll update it via the API, or
- Supabase dashboard → Authentication → URL Configuration → update **Site URL** and add the Vercel URL to **Redirect URLs**

This is needed for password reset emails to link back to the right place.

### 3. Change your login password
The temp password `BGA-fum-1cbae68d` is in this chat history.
- Supabase dashboard → Authentication → Users → click your user → change password
- Or add a "Change password" flow to the app later

---

## Nice-to-have next features

### High value
- **Reprint from history** — currently loads a saved cert back into the form for re-generation. Could add a direct "Reprint" button that renders the cert immediately from the saved data without going through the form.
- **Add more users** — right now only one login exists. Add colleagues via Supabase dashboard → Authentication → Users → Add user.
- **Loader management** — add/remove loader initials from the app itself instead of editing the Supabase dashboard.

### Medium value
- **Certificate PDF auto-attach** — generate the PDF and store it in Supabase Storage alongside the database record, so you can re-download the exact original PDF later.
- **Date range filter** in History (e.g. show all certs this month).
- **Export to CSV** — download a spreadsheet of all certificates for a date range.

### Lower priority
- **Mobile PWA** — add a `manifest.json` so it installs as an app icon on iPhone/iPad (useful on the shed floor).
- **Offline queue** — save a draft locally when there's no internet, sync to Supabase when reconnected.
- **Signature capture** — draw a signature on the certificate instead of leaving the field blank.

---

## Credentials & config (keep private)

| Item | Value |
|------|-------|
| Supabase project ref | `filkexozsqltqzieogkc` |
| Supabase dashboard | https://supabase.com/dashboard/project/filkexozsqltqzieogkc |
| GitHub repo | https://github.com/Jakewilson00/Cert_Generator |
| Login email | jakewilson022@gmail.com |
| Login password | BGA-fum-1cbae68d *(change this)* |
| Certifier name/licence | `src/certificate.js` lines 4–5 |
