# Deployment

## Build Locally

```bash
npm install
npm run lint
npm run build
npm run start
```

## Vercel

1. Import the GitHub repository into Vercel.
2. Keep the default Next.js build command: `npm run build`.
3. Deploy.

## Cloudflare Pages

1. Create a Pages project from the repository.
2. Use `npm run build`.
3. Use `.next` output through Cloudflare's Next.js adapter if needed.

## Netlify

1. Create a Netlify site from the repository.
2. Use `npm run build`.
3. Use the Netlify Next.js runtime.

## Static Build

This app uses browser-only camera and WebGL APIs behind client components. A fully static export may work for the shell, but deploy with a Next.js runtime when possible.

## Camera Security Notes

- Camera requires HTTPS in production.
- Camera works on `localhost` and `127.0.0.1` during development.
- HTTP LAN IP addresses may not allow camera access in some browsers.
- MediaPipe assets must be served from the same origin under `public/mediapipe`.
