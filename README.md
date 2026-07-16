# Nebula Technosys Website

Business website for **Nebula Technosys** — mechanical design, rapid prototyping & 3D printing.

Static site optimized for **GitHub Pages**. Drop images into a folder, run one command, deploy.

## Quick start

### 1. Add your assets (minimal manual work)

| What | Where |
|------|--------|
| Logo | `images/logo.png` |
| 3D print photos | `images/prints/` (dump all images here) |

No need to edit HTML or list filenames — the build script discovers images automatically.

### 2. Configure your business details

Edit [`config/site.config.json`](config/site.config.json):

```json
{
  "email": "your@email.com",
  "phone": "+91 XXXXX XXXXX",
  "whatsapp": "91XXXXXXXXXX",
  "web3formsAccessKey": "your-key-here",
  "map": {
    "lat": 21.1702,
    "lng": 72.8311,
    "address": "Your full office address",
    "zoom": 16
  }
}
```

**Map coordinates:** Open Google Maps, right-click your office, copy lat/lng.

### 3. Set up email notifications (contact form)

GitHub Pages has no backend, so the contact form uses [Web3Forms](https://web3forms.com) (free):

1. Go to [web3forms.com](https://web3forms.com)
2. Enter your email and get an **Access Key**
3. Paste it into `config/site.config.json` → `web3formsAccessKey`
4. Run `npm run build`

Messages from the website contact form will arrive in your inbox.

### 4. Build gallery

```bash
npm install
npm run build
```

This generates `gallery.json` and `js/site-config.json`.

### 5. Preview locally

```bash
npm run serve
```

Open http://localhost:3000

### 6. Deploy to GitHub Pages

1. Create a GitHub repo (e.g. `nebula_technosys`)
2. Push this project
3. In GitHub repo → **Settings → Pages** → Source: **GitHub Actions**

Your site will be at: `https://YOUR_USERNAME.github.io/nebula_technosys/`

## What happens automatically

- **Portfolio grid:** Masonry layout from each image's real aspect ratio
- **Hero background:** First 5 print images rotate (no video needed)
- **Logo:** Shows when `images/logo.png` exists; otherwise company name text
- **Contact form:** Sends email via Web3Forms
- **Map:** OpenStreetMap with your office pin (no API key)
- **WhatsApp:** Floating button + contact links from config
