# .gitignore Generator

A fast, offline-friendly `.gitignore` generator built with **Next.js 16** and **Node.js**.  
Pick one or more technology templates, add optional custom rules, then copy or download a clean, labelled `.gitignore` file — all without leaving the browser.

---

## Features

- 🔍 Search & filter templates by category
- ⚡ Quick-start presets (e.g. "Node + React")
- ✏️ Custom rules textarea merged server-side
- 🔗 Shareable URLs (selection stored in `?t=` param)
- 📴 Works entirely offline once loaded
- 🚀 One-click deploy to Render via `render.yaml`

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 20.9.0 |
| npm | bundled with Node |
| Git | any recent version |

---

## Getting Started (Local Development)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/gitignore-generator.git
cd gitignore-generator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.  
The dev server supports hot-reload — changes to any source file are reflected instantly.

### Useful keyboard shortcut

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` / `⌘ K` | Focus the template search box |

---

## Testing the App

There is no automated test suite yet. To verify everything works manually:

1. **Start the dev server** (`npm run dev`)
2. **Template list** – open http://localhost:3000 and confirm templates load
3. **Search** – type "node" in the search box; matching cards should appear
4. **Category filter** – click a category pill; the grid should filter accordingly
5. **Generate** – select two or more templates; the preview panel on the right should show a merged `.gitignore` with section headers
6. **Custom rules** – click **Custom rules**, type `*.secret`, and confirm it appears in the preview
7. **Copy** – click **Copy** and paste into a text editor to verify the content
8. **Download** – click **Download** and confirm a `.gitignore` file is saved
9. **Share link** – copy the browser URL (it should contain `?t=…`) and open it in a new tab; the same templates should be pre-selected

**API routes** (can be tested with `curl` or a REST client):

```bash
# List all available templates
curl http://localhost:3000/api/templates

# Generate a .gitignore for Node and Python
curl -s -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"selected":["node","python"],"custom":""}' | jq .
```

---

## Building for Production

```bash
npm run build   # compiles Next.js to .next/
npm start       # starts the production server on port 3000
```

Or use the helper script which also prints the Render deployment steps:

```bash
bash deploy.sh
```

---

## Pushing to GitHub

### First push (new repo)

```bash
# 1. Create a new repo on github.com (do NOT tick "Add a README")

# 2. Add the remote and push
git remote add origin https://github.com/<your-username>/gitignore-generator.git
git branch -M main
git push -u origin main
```

### Subsequent pushes

```bash
git add .
git commit -m "your message"
git push
```

> **Tip:** `node_modules/` and `.next/` are already listed in `.gitignore` and will never be committed.

---

## Deploying to Render

The repo includes a [`render.yaml`](render.yaml) Blueprint that configures the service automatically.

### Option A — Blueprint (recommended, one-click)

1. Push the repo to GitHub (see above).
2. Log in to [render.com](https://render.com) → **New → Blueprint**.
3. Select your `gitignore-generator` repository.
4. Render reads `render.yaml` and creates the web service with:
   - **Build command:** `npm ci --no-bin-links && npm run build`
   - **Start command:** `npm start`
   - **Health check:** `/`
   - **Plan:** Free · **Region:** Oregon
5. Click **Apply** and wait for the deploy to finish (~2–3 min).
6. Your site will be live at `https://gitignore-generator.onrender.com` (or a similar URL shown in the dashboard).

### Option B — Manual setup

1. **New → Web Service** → connect your GitHub repo.
2. Fill in the fields:

   | Field | Value |
   |-------|-------|
   | Runtime | **Node** |
   | Build Command | `npm ci --no-bin-links && npm run build` |
   | Start Command | `npm start` |
   | Health Check Path | `/` |
   | Node Version | `20.9.0` (set via Environment → `NODE_VERSION`) |

3. Click **Create Web Service**.

### Auto-deploy on push

By default Render re-deploys every time you push to the connected branch (`main`). No extra configuration needed.

---

## Project Structure

```
gitignore-generator/
├── app/
│   ├── api/
│   │   ├── generate/route.js   # POST  /api/generate  — merges templates
│   │   └── templates/route.js  # GET   /api/templates — lists all templates
│   ├── globals.css             # global styles
│   ├── layout.js               # root layout (HTML shell)
│   └── page.js                 # main UI (client component)
├── lib/
│   └── templates.js            # template definitions & categories
├── deploy.sh                   # helper: build + print Render steps
├── render.yaml                 # Render Blueprint config
└── package.json
```

---

## License

MIT
