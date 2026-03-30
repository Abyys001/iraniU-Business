# Deploying Iraniu Directory on cPanel (Node.js)

## What you upload

- The full repository (or build output plus `server/`).
- After `npm run install:all` and `npm run build` locally, you need on the server:
  - `server/node_modules/`
  - `client/dist/` (Vite build)
  - `client/public/` assets are **baked into** `dist` for CSS/JS paths under `/` — ensure your build copied `public/` before `vite build`.

## One-time setup in cPanel

1. **Node.js** application: create an app pointing at your app root (folder containing `server/` and `client/`).
2. **Application root**: e.g. `iraniu-directory` (or your subdomain folder).
3. **Application URL**: your domain or subdomain.
4. **Application startup file**: use **Passenger** or **Application URL** per host docs; many cPanel setups expect:
   - `server/src/index.js` as the entry, **or**
   - a small `app.js` in the root that requires the server (if your host wraps Node differently).

   If the panel asks for a **startup file**, point it at `server/src/index.js` and set the working directory to the repo root, or follow your host’s “Node.js selector” instructions.

5. **Environment variables** (in cPanel Node app UI):

   | Name        | Value                          |
   |------------|---------------------------------|
   | `NODE_ENV` | `production`                    |
   | `PORT`     | Leave empty if the host injects it, or use the port cPanel assigns. |
   | `ALLOW_ANY_REVIEW_REDIRECT` | Omit in production. Set to `1` only if you need `/go` to accept **any** `https` target (default: **Google Maps / review URLs only**). |

   The server uses `process.env.PORT || 3001`.

6. **SQLite database path**: the app creates `server/data/iraniu.db`. Ensure that directory is **writable** by the web/Node user (`chmod 755` or `775` on `server/data/`).

## Install on the server (SSH)

If you have SSH:

```bash
cd /path/to/your/app
npm install --prefix server
npm install --prefix client
npm run build --prefix client
```

Then restart the Node app from cPanel.

## `better-sqlite3` (native module)

This package compiles native code for your Node version. On cPanel:

- Match the **Node.js version** in the panel to what you used locally (e.g. 20.x).
- If install fails, use SSH and run `npm install --prefix server` on the server so binaries match the host.

## Routing

- API: `/api/*`
- QR redirect: `/go?bid=...&t=...`
- SPA: all other paths should hit the Express app so `index.html` is served for React Router. The server already does this when `NODE_ENV=production` and `client/dist` exists.

## Reverse proxy

If Apache/Nginx fronts the app, ensure `/api` and `/go` are proxied to your Node process (same as static + SPA). Passenger usually handles this when the app is mounted at `/`.
