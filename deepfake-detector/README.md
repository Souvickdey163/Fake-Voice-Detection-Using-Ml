# Deepfake Audio Detection Web App

A full-stack application that detects AI-generated fake audio using a PyTorch CNN model.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI + PyTorch + Librosa
- **Database**: MongoDB Atlas
- **Authentication**: JWT & Google OAuth

---

## 🚀 Deployment Instructions

### 1. Backend (Railway)
1. Go to [Railway.app](https://railway.app/).
2. Create a new Project from your GitHub Repository.
3. Select the `server` directory as your **Root Directory**, or configure the Build and Start commands explicitly:
   - **Root Directory**: `server`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Go to the "Variables" tab and add the environment variables defined in `server/.env.example`.
5. Deploy and get the generated `.up.railway.app` URL.

### 2. Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com/).
2. Import your GitHub Repository.
3. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: Your new Railway URL (e.g. `https://your-app.up.railway.app/api`)
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth ID
5. Deploy.

### 3. Google OAuth Settings
Once you have your production URLs, remember to update your Google Cloud Console OAuth credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Add your Vercel frontend URL to **Authorized JavaScript origins**.
3. Add your Vercel frontend URL + callback path to **Authorized redirect URIs**.

## 💻 Local Development

### 1. Backend
```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
