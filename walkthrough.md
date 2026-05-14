# Complete Project Walkthrough: Fake Audio Detection Using ML

This project is a full-stack fake/deepfake audio detection web app built by Souvick. It lets a user sign up or log in, upload an audio file, run ML-based fake voice detection, view a confidence score, and keep a prediction history.

## Live Deployment

- Frontend: https://fake-voice-detection-using-ml.vercel.app
- Backend API: Add your Railway backend URL here after deployment, for example `https://your-backend.up.railway.app`
- API health check: `https://your-backend.up.railway.app/health`

> Important: The frontend URL above is already allowed in the FastAPI CORS configuration. After Railway gives you the backend URL, set the same frontend URL in Railway as `FRONTEND_URL`.

---

## Project Summary

The application has three main parts:

1. Frontend web app
   - Built with React, Vite, Tailwind CSS, Framer Motion, Axios, and React Router.
   - Handles landing page, authentication pages, dashboard, upload flow, prediction result UI, pricing, settings, and history.

2. Backend API
   - Built with FastAPI.
   - Handles authentication, Google OAuth, email OTP, user profile, payments, prediction history, and ML prediction requests.
   - Stores user and prediction data in MongoDB Atlas.

3. Machine learning model
   - Uses a trained PyTorch CNN model stored in `deepfake-detector/server/models/best_model_improved.pth`.
   - Uses audio preprocessing with Librosa and local feature extraction.
   - Can optionally call a Hugging Face Space for inference through `HF_SPACE_URL`; if Hugging Face is not configured, the backend falls back to the local PyTorch model.

---

## Final Project Structure

```text
Fake Audio Detection Using ML By Souvick/
|
├── walkthrough.md
├── .gitignore
├── cleaningData.py
├── preprocess.py
├── train.py
|
├── deepfake-detector/
|   ├── README.md
|   |
|   ├── client/
|   |   ├── package.json
|   |   ├── vite.config.js
|   |   ├── vercel.json
|   |   ├── .env.example
|   |   ├── public/
|   |   └── src/
|   |       ├── App.jsx
|   |       ├── main.jsx
|   |       ├── pages/
|   |       ├── components/
|   |       ├── context/
|   |       ├── hooks/
|   |       ├── services/
|   |       └── assets/
|   |
|   └── server/
|       ├── requirements.txt
|       ├── railway.toml
|       ├── Procfile
|       ├── runtime.txt
|       ├── .env.example
|       ├── app/
|       |   ├── main.py
|       |   ├── auth.py
|       |   ├── database.py
|       |   ├── model_loader.py
|       |   ├── hf_client.py
|       |   ├── utils.py
|       |   ├── routes/
|       |   └── schemas.py
|       └── models/
|           ├── best_model_improved.pth
|           └── model_config.json
|
└── huggingface-space/
    ├── app.py
    ├── README.md
    └── requirements.txt
```

---

## Main Features

- Audio upload and fake voice prediction.
- Prediction label such as likely authentic or likely fake.
- Confidence score and fake probability.
- Analysis report with authenticity score, model confidence, and explanation.
- JWT-based login system.
- Google OAuth login.
- Email OTP support for registration/password reset.
- MongoDB prediction history.
- User profile and settings pages.
- Pricing/payment route support with Razorpay integration.
- Production-ready deployment setup for Vercel and Railway.
- Optional Hugging Face Space inference support.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| UI/UX | Framer Motion, Lucide React |
| API Client | Axios |
| Backend | FastAPI, Uvicorn |
| ML | PyTorch, Librosa, NumPy |
| Database | MongoDB Atlas |
| Auth | JWT, Google OAuth, Email OTP |
| Payments | Razorpay |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |
| Optional ML Hosting | Hugging Face Spaces |

---

## Local Development Setup

### 1. Clone/Open Project

```bash
cd "/Users/souvickdey/Fake Audio Detection Using ML By Souvick"
```

### 2. Backend Setup

```bash
cd deepfake-detector/server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend local URLs:

- API root: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`
- API docs: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup

Open a second terminal:

```bash
cd deepfake-detector/client
npm install
npm run dev
```

Frontend local URL:

- `http://127.0.0.1:5173`

---

## Environment Variables

Do not commit real secrets to GitHub. Keep real values in local `.env` files and deployment dashboards.

### Backend: `deepfake-detector/server/.env`

```env
FRONTEND_URL=http://127.0.0.1:5173
MONGO_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_secure_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
BACKEND_URL=http://127.0.0.1:8000

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_TIMEOUT_SECONDS=20

HF_SPACE_URL=
HF_API_NAME=/predict
HF_MAX_RETRIES=3
HF_RETRY_DELAY_SECONDS=2

MAX_AUDIO_UPLOAD_MB=10
```

### Frontend: `deepfake-detector/client/.env`

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

For production, change `VITE_API_URL` to your Railway backend URL.

---

## Important API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/` | Backend running message |
| GET | `/health` | Health check |
| POST | `/api/predict` | Upload audio and get ML prediction |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET/POST | `/api/auth/google...` | Google OAuth flow |
| GET | `/api/history...` | Prediction history |
| GET/PATCH | `/api/user...` | User profile/settings |
| POST | `/api/payment...` | Payment/Razorpay flow |

Exact route details can be checked from FastAPI Swagger at `/docs`.

---

## GitHub Push Checklist

Before deployment, push the project to GitHub:

```bash
git add .
git commit -m "Prepare fake audio detection app for deployment"
git push origin main
```

Make sure these are not pushed:

- `node_modules/`
- Python virtual environments such as `.venv/` or `venv/`
- `processed_data/`
- Raw datasets
- Local `.env` files with secrets

Make sure these are pushed:

- `deepfake-detector/server/models/best_model_improved.pth`
- `deepfake-detector/server/models/model_config.json`
- `deepfake-detector/client/vercel.json`
- `deepfake-detector/server/railway.toml`
- `.env.example` files

---

## Backend Deployment on Railway

Deploy backend first because the frontend needs the backend API URL.

1. Go to https://railway.app/
2. Click `New Project`.
3. Choose `Deploy from GitHub repo`.
4. Select this GitHub repository.
5. Configure the Railway service:
   - Root Directory: `deepfake-detector/server`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add Railway environment variables:

```env
FRONTEND_URL=https://fake-voice-detection-using-ml.vercel.app
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
BACKEND_URL=https://your-railway-backend.up.railway.app
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_TIMEOUT_SECONDS=20
HF_SPACE_URL=https://your-huggingface-space.hf.space
HF_API_NAME=/predict
HF_MAX_RETRIES=3
HF_RETRY_DELAY_SECONDS=2
MAX_AUDIO_UPLOAD_MB=10
```

7. Deploy.
8. Copy the Railway backend URL.
9. Test:

```text
https://your-railway-backend.up.railway.app/health
```

Expected response:

```json
{
  "ok": true,
  "status": "running"
}
```

---

## Frontend Deployment on Vercel

1. Go to https://vercel.com/dashboard
2. Click `Add New` -> `Project`.
3. Import the GitHub repository.
4. Configure:
   - Framework Preset: `Vite`
   - Root Directory: `deepfake-detector/client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Vercel environment variables:

```env
VITE_API_URL=https://your-railway-backend.up.railway.app
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

6. Deploy.
7. Your current frontend deploy link is:

```text
https://fake-voice-detection-using-ml.vercel.app
```

8. After deployment, go back to Railway and confirm:

```env
FRONTEND_URL=https://fake-voice-detection-using-ml.vercel.app
```

Railway will redeploy automatically after variable changes.

---

## Google OAuth Production Setup

In Google Cloud Console, update your OAuth client:

Authorized JavaScript origins:

```text
https://fake-voice-detection-using-ml.vercel.app
```

Authorized redirect URIs:

```text
https://your-railway-backend.up.railway.app/api/auth/google/callback
```

Also ensure Railway has:

```env
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
BACKEND_URL=https://your-railway-backend.up.railway.app
FRONTEND_URL=https://fake-voice-detection-using-ml.vercel.app
```

---

## Hugging Face Space Optional Setup

The folder `huggingface-space/` contains a Gradio app for serving the ML model separately.

Use this if Railway becomes slow or if PyTorch model inference is too heavy for the backend service.

Steps:

1. Create a new Hugging Face Space.
2. Select Gradio as the SDK.
3. Upload files from `huggingface-space/`.
4. Add the trained model and config required by `app.py`.
5. Copy the Space URL, for example:

```text
https://your-username-your-space-name.hf.space
```

6. Add it to Railway:

```env
HF_SPACE_URL=https://your-username-your-space-name.hf.space
HF_API_NAME=/predict
```

If `HF_SPACE_URL` is empty, the backend uses local model inference.

---

## Post-Deployment Testing

After both deployments are live, test in this order:

- Open frontend: https://fake-voice-detection-using-ml.vercel.app
- Open backend health check: `https://your-railway-backend.up.railway.app/health`
- Create a new account.
- Verify email OTP if enabled.
- Try normal login.
- Try Google login.
- Upload a valid audio file.
- Confirm prediction result appears.
- Check dashboard/history page.
- Open browser console and confirm there are no CORS or network errors.
- Check Railway logs if prediction fails.

---

## Common Issues and Fixes

### CORS Error

Cause: Railway backend does not trust the Vercel frontend origin.

Fix:

```env
FRONTEND_URL=https://fake-voice-detection-using-ml.vercel.app
```

Do not add a trailing slash.

### Frontend Network Error

Cause: `VITE_API_URL` is missing or points to the wrong backend.

Fix in Vercel:

```env
VITE_API_URL=https://your-railway-backend.up.railway.app
```

Then redeploy frontend.

### Google Login Fails

Cause: OAuth origins or redirect URI are not configured correctly.

Fix:

- Add Vercel URL to Google Authorized JavaScript origins.
- Add Railway callback URL to Authorized redirect URIs.
- Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BACKEND_URL`, and `FRONTEND_URL` in Railway.

### Model File Not Found

Cause: `.pth` or config file was not pushed to GitHub or path is wrong.

Fix: Confirm these files exist in GitHub:

```text
deepfake-detector/server/models/best_model_improved.pth
deepfake-detector/server/models/model_config.json
```

### Railway Build Too Heavy

Cause: PyTorch dependencies can be large.

Fix:

- Keep CPU-only PyTorch dependencies in `requirements.txt`.
- If Railway cache causes issues, try build command:

```bash
pip install --no-cache-dir -r requirements.txt
```

### Audio Upload Fails

Cause: File too large or invalid audio format.

Fix:

- Keep file below `MAX_AUDIO_UPLOAD_MB`.
- Test with `.wav`, `.mp3`, or common audio formats.
- Check Railway logs for FFmpeg/Librosa errors.

---

## Recommended Final Production Values

Frontend:

```text
https://fake-voice-detection-using-ml.vercel.app
```

Backend:

```text
https://your-railway-backend.up.railway.app
```

Frontend env on Vercel:

```env
VITE_API_URL=https://your-railway-backend.up.railway.app
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Backend env on Railway:

```env
FRONTEND_URL=https://fake-voice-detection-using-ml.vercel.app
BACKEND_URL=https://your-railway-backend.up.railway.app
```

---

## Quick Demo Flow

1. User opens the Vercel app.
2. User registers or logs in.
3. User uploads an audio file.
4. Frontend sends file to `/api/predict`.
5. Backend checks user credits.
6. Backend runs Hugging Face inference if configured, otherwise local PyTorch inference.
7. Backend stores prediction in MongoDB.
8. Frontend shows fake/authentic result with confidence and analysis.
9. User can view previous predictions in history.

---

## Final Notes

This project is ready for production deployment with Vercel for the frontend and Railway for the backend. The most important production connection is:

```text
Vercel frontend -> Railway backend -> MongoDB + ML model
```

Live frontend:

```text
https://fake-voice-detection-using-ml.vercel.app
```
