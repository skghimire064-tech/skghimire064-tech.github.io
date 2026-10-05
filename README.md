<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b62ae5db-b07e-4546-b416-996eaff7e04e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Publish to GitHub Pages

In the repository settings, set **Pages → Build and deployment → Source** to
**GitHub Actions**. Pushing to `main` then automatically builds the Vite app
and deploys the `dist/` directory to GitHub Pages.
