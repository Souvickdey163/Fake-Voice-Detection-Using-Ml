# 🚀 Complete Deployment Guide: Deepfake Detector

Follow these exact steps to successfully push your project live, ensuring both the backend (FastAPI) and frontend (React) can communicate seamlessly in production.

---

## 1. Final Cleaned Project Structure

Your codebase has now been structured so you don't push unnecessary large files. The layout looks like this:

```text
/Fake Audio Detection Using ML By Souvick
│
├── .gitignore               <-- Excludes massive datasets but ALLOWS models
├── deepfake-detector/
│   ├── README.md            <-- Updated with deployment instructions
│   ├── client/              <-- Frontend app
│   │   ├── .env.example
│   │   ├── src/
│   │   └── package.json
│   │
│   └── server/              <-- Backend app
│       ├── .env.example
│       ├── requirements.txt <-- Specifies CPU-torch for small bundle size
│       ├── app/
│       └── models/
│           ├── best_model_improved.pth  <-- IMPORTANT: NOT blocklisted 
│           └── model_config.json
```

---

## 2. GitHub Push Checklist

Before moving to Vercel and Railway, your code must be on GitHub.

1. Open your terminal at `/Users/souvickdey/Fake Audio Detection Using ML By Souvick`
2. Make sure you don't accidentally commit everything without checking `.gitignore`.
3. Add and push your files:
```bash
git add .
git commit -m "Prepare project for production deployment"
git push origin main
```
> [!NOTE]
> Ensure the git push does **not** upload `processed_data/` or `node_modules/`. It *should* upload `deepfake-detector/server/models/...`.

---

## 3. Backend Deployment (Railway) Checklist

Deploy your backend first so you can get the production API URL which the frontend needs.

1. **Dashboard**: Go to [Railway Dashboard](https://railway.app/).
2. **New Project**: Click "New Project" -> "Deploy from GitHub repo".
3. **Select Repo**: Select your `Fake Audio Detection Using ML By Souvick` repository.
4. **Configure Deployment Settings** (Click on the newly created app tile -> Settings):
   - **Root Directory**: `deepfake-detector/server`
   - **Build Command**: (Leave default or `pip install -r requirements.txt`)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables** (Go to Variables tab):
   - Click "Raw Editor" and paste your `.env.example` content, filling in your actual Production values.
   - Leave `FRONTEND_URL` blank initially until step 4 is complete, or guess your Vercel URL first.
6. **Deploy**: Wait for the deployment to finish to get a domain like `deepfake-production.up.railway.app`.

---

## 4. Frontend Deployment (Vercel) Checklist

1. **Dashboard**: Go to [Vercel](https://vercel.com/dashboard).
2. **New Project**: "Add New..." -> "Project".
3. **Select Repo**: Import your GitHub repo.
4. **Configure Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `deepfake-detector/client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   - `VITE_API_URL` = `https://your-railway-app-url.up.railway.app/api` (the url from Step 3)
   - `VITE_GOOGLE_CLIENT_ID` = `your-google-oauth-client-id...`
6. **Deploy**: Click Deploy and wait for your Vercel URL (e.g. `https://deepfake-client.vercel.app`).

> [!IMPORTANT]  
> After Vercel gives you your frontend URL, go back to **Railway**, update the `FRONTEND_URL` environment variable to match your Vercel URL, and Railway will automatically trigger a redeploy to fix CORS.

---

## 5. Post-Deployment Testing Checklist

- [ ] Open the Vercel Frontend URL. Does the UI load?
- [ ] Inspect the browser console (Right Click -> Inspect -> Console). Are there CORS errors?
- [ ] Try Google Login. Does it succeed?
- [ ] Upload an audio file and test prediction. Ensure the backend returns a confident model output.

> [!WARNING]  
> **Google OAuth Note**: Once your Vercel URL is live, you MUST log in to Google Cloud Console and add your `https://your-vercel-url.vercel.app` to the "Authorized JavaScript origins" list in your OAuth client config. Otherwise, login won't work in production.

---

## 6. Common Deployment Issues & Fixes

### "CORS Error" / "Network Error" on Frontend
- **Cause**: The backend rejected the request because it doesn't trust your Vercel origin.
- **Fix**: Make sure `FRONTEND_URL` in Railway variables strictly equals your Vercel URL without a trailing slash (e.g., `https://my-app.vercel.app`).

### Backend Exceeds RAM/Storage Limits during Build
- **Cause**: PyTorch installing full CUDA functionality.
- **Fix**: We already added `--extra-index-url https://download.pytorch.org/whl/cpu` in `requirements.txt`. If it still fails, consider adding `--no-cache-dir` to Railway's pip install arguments.

### Model Cannot Be Found
- **Cause**: Incorrect file reference path or failing to push `.pth`.
- **Fix**: Ensure your GitHub repo has the file `deepfake-detector/server/models/best_model_improved.pth` synced. We fixed the path logic to be absolute natively.
