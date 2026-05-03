# NeuroVoice: Fake Audio Detection Using Machine Learning

NeuroVoice is a full-stack fake audio detection project that classifies uploaded voice recordings as real or AI-generated/spoofed audio. The project includes dataset preprocessing, PyTorch model training, a FastAPI backend with authentication and usage history, a React/Vite frontend, and an optional Hugging Face Space for hosted ML inference.

## Project Overview

The production architecture is:

```text
Frontend (Vercel / React)
        |
        v
Backend API (Render / FastAPI)
        |
        v
Hugging Face Space (Gradio ML inference)
        |
        v
Local PyTorch fallback model
```

The backend remains the main API layer. It handles authentication, credits, history, file upload validation, result formatting, and optional fallback to the local PyTorch model if Hugging Face inference is unavailable.

## Live Website

Frontend website:

```text
https://fake-voice-detection-using-ml.vercel.app
```

Backend API:

```text
https://your-render-backend.onrender.com
```

Hugging Face Space:

```text
https://your-space-name.hf.space
```

## Features

- Email/password authentication with JWT
- Google OAuth support
- OTP-based registration flow
- Audio upload and deepfake prediction
- Hugging Face Space integration for ML inference
- Local PyTorch model fallback
- MongoDB-backed prediction history
- Credit/plan-based usage tracking
- PDF report download from the frontend
- Health check endpoint for deployment platforms

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Axios |
| Backend | FastAPI, Uvicorn, PyMongo, JWT |
| ML | PyTorch, Librosa, NumPy, SciPy |
| Database | MongoDB Atlas |
| ML Hosting | Hugging Face Spaces, Gradio |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## Repository Structure

```text
.
├── ASVspoof 2019 Dataset/          # Raw dataset directory
├── cleaned_data/                   # Cleaned metadata CSV files
├── processed_data/                 # Preprocessed NumPy feature arrays
├── saved_models/                   # Training output models
├── deepfake-detector/
│   ├── client/                     # React/Vite frontend
│   └── server/                     # FastAPI backend
├── huggingface-space/              # Minimal Gradio Space app
├── cleaningData.py                 # Dataset cleaning script
├── preprocess.py                   # Feature extraction script
├── train.py                        # PyTorch training script
└── walkthrough.md                  # Deployment walkthrough
```

## Dataset

This project is built around an ASVspoof-style fake audio detection dataset. The dataset contains bonafide human speech and spoofed/fake audio samples.

Expected cleaned metadata files:

```text
cleaned_data/train_cleaned.csv
cleaned_data/dev_cleaned.csv
cleaned_data/eval_cleaned.csv
```

Each cleaned CSV is expected to include:

- `file_path`: path to the audio file
- `file_id`: audio file identifier
- `label_int`: numeric class label

Class mapping:

```text
0 = bonafide / real
1 = spoof / fake
```

Large raw and processed datasets should not be committed to GitHub. Keep only code, lightweight metadata when appropriate, and the final model file required for deployment.

## ML Pipeline

### 1. Clean Dataset

Use `cleaningData.py` to prepare dataset metadata from the raw ASVspoof data.

```bash
python3 cleaningData.py
```

### 2. Preprocess Audio

`preprocess.py` loads audio files and extracts features.

Feature settings:

```text
Sample rate: 16000 Hz
Max audio length: 4 seconds
MFCC count: 40
```

Extracted feature groups:

- MFCC
- Delta MFCC
- Delta-delta MFCC
- Chroma
- Spectral contrast

Run preprocessing:

```bash
python3 preprocess.py
```

This creates:

```text
processed_data/X_train.npy
processed_data/y_train.npy
processed_data/X_dev.npy
processed_data/y_dev.npy
processed_data/X_eval.npy
processed_data/y_eval.npy
```

### 3. Train Model

`train.py` trains a CNN classifier using PyTorch.

Training highlights:

- Weighted sampler for class imbalance
- Class-weighted cross entropy
- Early stopping
- Evaluation on train/dev/eval splits
- Threshold search using F1 score

Run training:

```bash
python3 train.py
```

The best model is saved to:

```text
saved_models/best_model_improved.pth
```

The deployed backend and Hugging Face Space use the same CNN architecture and preprocessing shape.

## Backend

Backend path:

```text
deepfake-detector/server
```

Main app:

```text
deepfake-detector/server/app/main.py
```

Important endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | Root API status |
| GET | `/health` | Deployment health check |
| POST | `/api/auth/register` | Register with OTP |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/google` | Google OAuth start |
| POST | `/api/predict` | Upload audio and run prediction |
| GET | `/api/history` | Prediction history |
| GET | `/api/user/me` | Current user profile |

### Backend Setup

```bash
cd deepfake-detector/server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Local backend URL:

```text
http://127.0.0.1:8000
```

### Backend Environment Variables

Create `deepfake-detector/server/.env` from `.env.example`.

Important variables:

```text
FRONTEND_URL=http://127.0.0.1:5173
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secure_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
HF_SPACE_URL=https://your-space-name.hf.space
HF_API_NAME=/predict
HF_MAX_RETRIES=3
HF_RETRY_DELAY_SECONDS=2
```

If `HF_SPACE_URL` is not set, the backend uses the local PyTorch model in `deepfake-detector/server/models/` or `saved_models/`.

## Frontend

Frontend path:

```text
deepfake-detector/client
```

The frontend provides:

- Landing pages
- Auth UI
- Dashboard audio upload
- Prediction result report
- Confidence breakdown
- PDF report download
- History and settings pages

### Frontend Setup

```bash
cd deepfake-detector/client
npm install
npm run dev
```

Local frontend URL:

```text
http://127.0.0.1:5173
```

### Frontend Environment Variables

Create `deepfake-detector/client/.env` from `.env.example`.

```text
VITE_API_URL=http://127.0.0.1:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

For Vercel, set:

```text
VITE_API_URL=https://your-render-backend.onrender.com
```

Vite environment variables must start with `VITE_`.

## Hugging Face Space

Hugging Face Space path:

```text
huggingface-space
```

Final Space structure:

```text
huggingface-space/
├── app.py
├── requirements.txt
├── README.md
└── best_model_improved.pth
```

This Space is intentionally ML-only. Do not upload the full FastAPI backend to Hugging Face.

The Space:

- Loads `best_model_improved.pth`
- Reconstructs the CNN architecture
- Uses the same audio preprocessing as the backend/training pipeline
- Exposes a Gradio UI and prediction API

### Hugging Face Requirements

```text
librosa
numpy
soundfile
torch==2.11.0+cpu
--extra-index-url https://download.pytorch.org/whl/cpu
```

After deployment, set the Space URL in Render:

```text
HF_SPACE_URL=https://your-space-name.hf.space
HF_API_NAME=/predict
```

## Deployment

### Backend on Render

Settings:

```text
Root Directory: deepfake-detector/server
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health Check Path: /health
```

Required environment variables:

```text
FRONTEND_URL=https://your-vercel-url.vercel.app
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secure_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
HF_SPACE_URL=https://your-space-name.hf.space
HF_API_NAME=/predict
```

### Frontend on Vercel

Settings:

```text
Framework Preset: Vite
Root Directory: deepfake-detector/client
Build Command: npm run build
Output Directory: dist
```

Environment variables:

```text
VITE_API_URL=https://your-render-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Hugging Face Space

Create a Gradio Space and upload only:

```text
app.py
requirements.txt
README.md
best_model_improved.pth
```

## End-to-End Flow

1. User logs in on the React frontend.
2. User uploads an audio file from the dashboard.
3. Frontend sends `multipart/form-data` to `/api/predict`.
4. Backend validates auth and remaining credits.
5. Backend sends the audio to Hugging Face Space if `HF_SPACE_URL` is configured.
6. If Hugging Face fails, backend falls back to the local PyTorch model.
7. Backend stores the prediction in MongoDB.
8. Frontend displays the authenticity score, fake probability, model confidence, and PDF report.

## Troubleshooting

### Frontend Sends No Request

- Check browser console logs.
- Confirm `VITE_API_URL` is set in Vercel.
- Remember: Vite uses `VITE_API_URL`, not `REACT_APP_API_URL`.

### Request Times Out

ML inference can be slow on free hosting because Render and Hugging Face Spaces may cold start.

Current frontend ML timeout:

```text
300000 ms / 5 minutes
```

Open the Hugging Face Space once manually to warm it before testing.

### Render Health Check Fails

Confirm:

```text
GET /health -> {"ok": true, "status": "running"}
```

Set Render Health Check Path:

```text
/health
```

### MongoDB Startup Issues

MongoDB is lazy-loaded so the backend can start even if the database is temporarily slow. Prediction, auth, and history routes still require a valid `MONGO_URI`.

### Gradio/Hugging Face Dependency Errors

For Hugging Face Spaces, keep `huggingface-space/requirements.txt` minimal and let the Space manage Gradio.

## Useful Commands

Run backend:

```bash
cd deepfake-detector/server
source .venv/bin/activate
uvicorn app.main:app --reload
```

Run frontend:

```bash
cd deepfake-detector/client
npm run dev
```

Build frontend:

```bash
cd deepfake-detector/client
npm run build
```

Preprocess dataset:

```bash
python3 preprocess.py
```

Train model:

```bash
python3 train.py
```

## Notes

- Keep large datasets out of Git.
- Keep secrets out of Git.
- Commit only deployment-safe model files that are required by the backend or Hugging Face Space.
- The current deployed model file is a PyTorch `state_dict`, not a full serialized model object.
- The Hugging Face `app.py` must define the model architecture before loading `best_model_improved.pth`.
