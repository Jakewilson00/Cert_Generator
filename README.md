# BGA Fumigation Certificate Builder

A Vite-based web app for generating, saving, and reprinting Bean Growers
Australia fumigation certificates, backed by Supabase.

## Stack

- **Vite** + vanilla ES modules (no framework — fast and simple)
- **Supabase** for the database, auto-generated REST API, and authentication
- **html2pdf.js** for PDF export (lazy-loaded)

The app runs in two modes:

- **Offline** (no Supabase configured): generate, preview, print, and export
  PDFs. Nothing is saved.
- **Connected** (Supabase configured): sign-in required; every certificate is
  saved with a sequential number and can be searched/reloaded from History.

## Project layout

```
index.html              App shell (auth screen, form, history, preview)
public/logo.png         BGA logo (was an inline base64 blob before)
src/
  main.js               Entry point + view routing
  supabase.js           Supabase client (reads .env)
  auth.js               Sign in / out
  certificates.js       Save / list / fetch certificates (the "API" calls)
  form.js               Form state, line items, validation
  certificate.js        Renders the printable certificate HTML
  dates.js, toast.js, pdf.js   Helpers
supabase/schema.sql     Database tables + Row Level Security policies
```

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Connecting Supabase (one-time)

1. Create a project at https://supabase.com (any region close to AU, e.g.
   Sydney). Pick a database password and save it.
2. **Create the tables.** Open **SQL Editor → New query**, paste the contents
   of [`supabase/schema.sql`](supabase/schema.sql), and run it.
3. **Create your login.** Go to **Authentication → Users → Add user**, enter
   your email + a password, and tick "Auto Confirm".
4. **Get your keys.** **Project Settings → API**. Copy the *Project URL* and the
   *anon public* key.
5. Create a `.env` file in the project root (copy `.env.example`) and fill in:

   ```
   VITE_SUPABASE_URL=https://YOUR-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

6. Restart `npm run dev`. You'll now get a sign-in screen, and certificates
   save to the database.

> The anon key is **safe to ship** in the frontend — it's public by design and
> guarded by the Row Level Security policies in `schema.sql`. Never put the
> `service_role` key in `.env` or the frontend.

## Optional: managing Supabase from Claude Code via MCP

You can let Claude create tables and query data directly instead of pasting SQL.

1. Create a **personal access token**: Supabase dashboard → Account →
   **Access Tokens**.
2. Add the official Supabase MCP server. In Claude Code:

   ```bash
   claude mcp add supabase -- npx -y @supabase/mcp-server-supabase@latest \
     --read-only --project-ref=YOUR-PROJECT-REF
   ```

   Set the token via the `SUPABASE_ACCESS_TOKEN` environment variable when
   launching, or follow the server's prompt.
3. **Start with `--read-only`** and a non-production project. Only remove
   read-only once you trust the workflow — an MCP with write access to your
   production database can change or delete data.

## Deploying

`npm run build` produces a static `dist/` folder. Host it anywhere static
(Netlify, Vercel, Cloudflare Pages, GitHub Pages). Set the two `VITE_`
environment variables in the host's build settings.

## Notes

- The certifier name and licence number are constants at the top of
  [`src/certificate.js`](src/certificate.js) — edit there if they change.
- `index.legacy.html.bak` is the original single-file version, kept for
  reference. It can be deleted once you're happy with the rebuild.
