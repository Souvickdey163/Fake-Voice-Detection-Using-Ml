import os
import shutil
import subprocess
import time
import numpy as np
import librosa

# =========================
# CONFIG
# =========================
SAMPLE_RATE = 16000
MAX_AUDIO_LEN = 4   # must match training
N_MFCC = 40


# =========================
# CONVERT TO WAV
# =========================
def convert_to_wav(input_path):
    if not shutil.which("ffmpeg"):
        raise ValueError("ffmpeg is not installed in the deployment environment")

    start = time.perf_counter()
    output_path = input_path + ".wav"

    command = [
        "ffmpeg",
        "-y",
        "-i", input_path,
        "-t", str(MAX_AUDIO_LEN),
        "-ar", str(SAMPLE_RATE),
        "-ac", "1",
        "-vn",
        output_path
    ]

    try:
        result = subprocess.run(
            command,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            text=True,
            timeout=30
        )
    except subprocess.TimeoutExpired as exc:
        raise ValueError("Audio conversion timed out after 30 seconds") from exc

    if result.returncode != 0 or not os.path.exists(output_path):
        error_detail = (result.stderr or "").strip().splitlines()[-1:] or ["unknown ffmpeg error"]
        raise ValueError(f"Failed to convert audio to WAV: {error_detail[0]}")

    print(f"[predict] ffmpeg conversion done in {time.perf_counter() - start:.2f}s", flush=True)
    return output_path


# =========================
# EXTRACT SAME FEATURES AS TRAINING
# =========================
def extract_features_safe(file_path, sr=SAMPLE_RATE, max_len=MAX_AUDIO_LEN):
    try:
        start = time.perf_counter()
        audio, _ = librosa.load(file_path, sr=sr, mono=True)

        if not np.isfinite(audio).all():
            raise ValueError("Invalid audio values")

        max_samples = sr * max_len

        # Pad or trim audio
        if len(audio) < max_samples:
            pad_width = max_samples - len(audio)
            audio = np.pad(audio, (0, pad_width), mode='constant')
        else:
            audio = audio[:max_samples]

        # ===== SAME FEATURE EXTRACTION AS TRAINING =====
        feature_start = time.perf_counter()
        mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=N_MFCC)
        delta = librosa.feature.delta(mfcc)
        delta2 = librosa.feature.delta(mfcc, order=2)

        chroma = librosa.feature.chroma_stft(y=audio, sr=sr)
        spectral_contrast = librosa.feature.spectral_contrast(y=audio, sr=sr)

        # Combine all features
        feature = np.vstack([mfcc, delta, delta2, chroma, spectral_contrast])

        # Normalize (same as training)
        feature = (feature - np.mean(feature)) / (np.std(feature) + 1e-6)

        # Final shape for PyTorch CNN: (1, 1, 139, 126)
        feature = np.expand_dims(feature, axis=0)   # batch dimension
        feature = np.expand_dims(feature, axis=0)   # channel dimension

        print(
            "[predict] feature extraction done "
            f"in {time.perf_counter() - start:.2f}s "
            f"(librosa features {time.perf_counter() - feature_start:.2f}s)",
            flush=True
        )
        return feature.astype(np.float32)

    except Exception as e:
        print("FEATURE EXTRACTION ERROR:", e, flush=True)
        raise ValueError(str(e))
