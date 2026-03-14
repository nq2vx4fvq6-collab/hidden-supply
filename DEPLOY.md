# Deploy to Vercel

## Manual deploy (no Git connection)

If Vercel is **not** connected to GitHub, deploy from your machine with the Vercel CLI:

```bash
cd urban-supply-ui-app
vercel --prod
```

- Run from the **project root** where `vercel.json` lives (the `urban-supply-ui-app` folder).
- Use the same Vercel account and project (**urban-supply-ui-app**) when prompted.
- When it finishes, the production URL (e.g. `https://urban-supply-ui-app.vercel.app`) has the latest code.

**Typical flow:** make changes → (optional) commit/push to GitHub → run `vercel --prod` → test the live site.

---

## Auto-deploy from GitHub (when Git is connected)

Your local project is linked to the Vercel project **urban-supply-ui-app**. To have the **live site update automatically when you push to GitHub**, connect the GitHub repo in Vercel.

## 1. Open Vercel project settings

- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Open the project **urban-supply-ui-app**
- Click **Settings** in the top nav

## 2. Connect the Git repository

- In the left sidebar, click **Git**
- Under **Connected Git Repository**:
  - If you see **nq2vx4fvq6-collab/hidden-supply** and a green “Connected” state, you’re done. Pushes to `main` already trigger production deployments.
  - If it says **No Git Repository** or a different repo:
    - Click **Connect Git Repository**
    - Choose **GitHub** and authorize Vercel if asked
    - Select **nq2vx4fvq6-collab/hidden-supply**
    - Set **Production Branch** to `main` (default)
    - Click **Connect**

## 3. Result

- Every **push to `main`** will trigger a new **production** deployment and update the live site.
- Pushes to other branches (or pull requests) get **preview** URLs.

## Repo used for this project

- **GitHub:** [github.com/nq2vx4fvq6-collab/hidden-supply](https://github.com/nq2vx4fvq6-collab/hidden-supply)

Reference: [Vercel – Deploying GitHub Projects](https://vercel.com/docs/deployments/git/vercel-for-github)
