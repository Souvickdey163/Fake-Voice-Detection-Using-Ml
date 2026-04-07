import os
import numpy as np
import pandas as pd
import librosa
from tqdm import tqdm

# =========================
# CONFIG
# =========================
CLEANED_DATA_DIR = "cleaned_data"
OUTPUT_DIR = "processed_data"

os.makedirs(OUTPUT_DIR, exist_ok=True)

SAMPLE_RATE = 16000
MAX_AUDIO_LEN = 4   # seconds
N_MFCC = 40


# =========================
# EXTRACT FEATURES
# =========================
def extract_features(file_path, sr=SAMPLE_RATE, max_len=MAX_AUDIO_LEN):
    try:
        audio, _ = librosa.load(file_path, sr=sr, mono=True)

        max_samples = sr * max_len

        # Pad or trim audio
        if len(audio) < max_samples:
            pad_width = max_samples - len(audio)
            audio = np.pad(audio, (0, pad_width), mode='constant')
        else:
            audio = audio[:max_samples]

        # ===== FEATURE EXTRACTION =====
        mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=N_MFCC)
        delta = librosa.feature.delta(mfcc)
        delta2 = librosa.feature.delta(mfcc, order=2)

        chroma = librosa.feature.chroma_stft(y=audio, sr=sr)
        spectral_contrast = librosa.feature.spectral_contrast(y=audio, sr=sr)

        # Combine all features
        feature = np.vstack([mfcc, delta, delta2, chroma, spectral_contrast])

        # Normalize
        feature = (feature - np.mean(feature)) / (np.std(feature) + 1e-6)

        return feature.astype(np.float32)

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None


# =========================
# PROCESS SPLIT
# =========================
def process_split(csv_path, split_name):
    print(f"\nProcessing {split_name} set from {csv_path}")

    df = pd.read_csv(csv_path)

    features = []
    labels = []
    file_ids = []

    for _, row in tqdm(df.iterrows(), total=len(df)):
        file_path = row["file_path"]
        label = row["label_int"]
        file_id = row["file_id"]

        feature = extract_features(file_path)

        if feature is not None:
            features.append(feature)
            labels.append(label)
            file_ids.append(file_id)

    X = np.array(features, dtype=np.float32)
    y = np.array(labels, dtype=np.int32)

    np.save(os.path.join(OUTPUT_DIR, f"X_{split_name}.npy"), X)
    np.save(os.path.join(OUTPUT_DIR, f"y_{split_name}.npy"), y)

    meta_df = pd.DataFrame({
        "file_id": file_ids,
        "label": labels
    })
    meta_df.to_csv(os.path.join(OUTPUT_DIR, f"{split_name}_metadata.csv"), index=False)

    print(f"\n✅ {split_name} preprocessing done")
    print(f"Saved: X_{split_name}.npy shape = {X.shape}")
    print(f"Saved: y_{split_name}.npy shape = {y.shape}")
    print(f"Real count: {np.sum(y == 0)}")
    print(f"Fake count: {np.sum(y == 1)}")


# =========================
# MAIN
# =========================
if __name__ == "__main__":
    process_split(os.path.join(CLEANED_DATA_DIR, "train_cleaned.csv"), "train")
    process_split(os.path.join(CLEANED_DATA_DIR, "dev_cleaned.csv"), "dev")
    process_split(os.path.join(CLEANED_DATA_DIR, "eval_cleaned.csv"), "eval")

    print("\n🎉 All preprocessing completed successfully.")