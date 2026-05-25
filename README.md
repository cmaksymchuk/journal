# Mood Journal

A simple daily mood journal web app — one user, password-protected, designed for tracking mood, energy, sleep, and medication alongside how the day felt.

## Project structure

```
journal/
├── api/
│   ├── auth.js       # Password check → returns app token
│   └── entries.js    # GET/POST journal entries via JSONBin
├── public/
│   └── index.html    # Static frontend (vanilla JS)
├── vercel.json       # Routes static files from /public
└── README.md
```

## JSONBin setup

1. Go to [jsonbin.io](https://jsonbin.io) and create a free account.
2. Create a new bin with this content:

   ```json
   { "entries": [] }
   ```

3. Copy the **Bin ID** from the URL (the part after `/b/`).
4. Create an **Access Key** on **Account → API Keys** with **Bins Read** and **Bins Update** enabled, or use your **Master Key** instead.

| Variable | Use |
|----------|-----|
| `JSONBIN_ACCESS_KEY` | Access key (uses `X-Access-Key` header) — recommended |
| `JSONBIN_API_KEY` | Master key (uses `X-Master-Key` header) — alternative |

Set one of the two key variables, not both.

If saves fail with `JSONBin GET failed: 401`, the key is wrong, lacks read/update permission, or the bin ID is from a different account.

## Vercel setup

1. Push this project to GitHub.
2. Import the repo into [Vercel](https://vercel.com).
3. Add these four environment variables in **Project Settings → Environment Variables**:

   | Variable | Description |
   |----------|-------------|
   | `JSONBIN_ACCESS_KEY` | Your JSONBin access key (Bins Read + Update), **or** |
   | `JSONBIN_API_KEY` | Your JSONBin master key (if not using an access key) |
   | `JSONBIN_BIN_ID` | Your bin ID |
   | `APP_PASSWORD` | The shared password for the app |
   | `APP_TOKEN` | A long random string for authenticated API requests (e.g. generate with `openssl rand -hex 16`) |

4. Deploy.

## Local development

Install the Vercel CLI and run:

```bash
npx vercel dev
```

Create a `.env.local` file in the project root (not committed) with the four variables. The API loads this file automatically when running locally if Vercel does not inject them. Restart `vercel dev` after changing `.env.local`.

## How it works

- **Login**: Enter the shared password once. A token is stored in `localStorage` and sent with every API request.
- **Journal tab**: Pick today or one of the previous three days, then log mood (1–10), energy, sleep the night before, med time, flavour tags, appetite, social energy, mood shifts, and optional notes. One entry per day — saving again updates that day's entry.
- **CSV export** includes Appetite and Social energy columns for doctor visits.
- **History tab**: Browse past entries (newest first, up to 60 shown). Export all entries as CSV for a doctor visit.
