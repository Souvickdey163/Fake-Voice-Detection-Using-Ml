import os
import librosa
import csv
from tqdm import tqdm

# =========================
# CONFIG
# =========================
DATASET_ROOT = "ASVspoof 2019 Dataset"

LA_ROOT = os.path.join(DATASET_ROOT, "LA", "LA")

TRAIN_AUDIO_DIR = os.path.join(LA_ROOT, "ASVspoof2019_LA_train", "flac")
DEV_AUDIO_DIR   = os.path.join(LA_ROOT, "ASVspoof2019_LA_dev", "flac")
EVAL_AUDIO_DIR  = os.path.join(LA_ROOT, "ASVspoof2019_LA_eval", "flac")

TRAIN_PROTOCOL = os.path.join(LA_ROOT, "ASVspoof2019_LA_cm_protocols", "ASVspoof2019.LA.cm.train.trn.txt")
DEV_PROTOCOL   = os.path.join(LA_ROOT, "ASVspoof2019_LA_cm_protocols", "ASVspoof2019.LA.cm.dev.trl.txt")
EVAL_PROTOCOL  = os.path.join(LA_ROOT, "ASVspoof2019_LA_cm_protocols", "ASVspoof2019.LA.cm.eval.trl.txt")

OUTPUT_DIR = "cleaned_data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SAMPLE_RATE = 16000
MIN_DURATION = 0.3  # seconds


# =========================
# LABEL FUNCTION
# =========================
def label_to_int(label):
    return 0 if label.lower() == "bonafide" else 1


# =========================
# CHECK AUDIO FILE
# =========================
def check_audio(file_path):
    try:
        if not os.path.exists(file_path):
            return False, "missing"

        if os.path.getsize(file_path) == 0:
            return False, "empty"

        audio, sr = librosa.load(file_path, sr=SAMPLE_RATE, mono=True)

        if len(audio) == 0:
            return False, "zero_samples"

        duration = len(audio) / sr

        if duration < MIN_DURATION:
            return False, "too_short"

        if abs(audio).mean() < 1e-5:
            return False, "silent"

        return True, "ok"

    except Exception as e:
        return False, f"corrupted: {str(e)}"


# =========================
# CLEAN ONE SPLIT
# =========================
def clean_split(audio_dir, protocol_file, output_csv, rejected_csv):
    print(f"\nCleaning using protocol: {protocol_file}")

    with open(protocol_file, "r") as f:
        lines = f.readlines()

    total = len(lines)
    print(f"Total entries in protocol: {total}")

    kept_count = 0
    rejected_count = 0

    with open(output_csv, "w", newline="") as clean_f, \
         open(rejected_csv, "w", newline="") as reject_f:

        clean_writer = csv.writer(clean_f)
        reject_writer = csv.writer(reject_f)

        clean_writer.writerow(["file_id", "label", "label_int", "file_path"])
        reject_writer.writerow(["file_id", "label", "reason", "file_path"])

        for line in tqdm(lines):
            parts = line.strip().split()

            if len(parts) < 2:
                continue

            file_id = parts[1]
            label = parts[-1]
            file_path = os.path.join(audio_dir, file_id + ".flac")

            is_valid, reason = check_audio(file_path)

            if is_valid:
                clean_writer.writerow([
                    file_id,
                    label,
                    label_to_int(label),
                    file_path
                ])
                kept_count += 1
            else:
                reject_writer.writerow([
                    file_id,
                    label,
                    reason,
                    file_path
                ])
                rejected_count += 1

    print(f"\n✅ Cleaned file saved: {output_csv}")
    print(f"❌ Rejected file saved: {rejected_csv}")
    print(f"Kept: {kept_count} | Rejected: {rejected_count}")


# =========================
# MAIN
# =========================
if __name__ == "__main__":
    print("Starting LA dataset cleaning...")

    clean_split(
        TRAIN_AUDIO_DIR,
        TRAIN_PROTOCOL,
        os.path.join(OUTPUT_DIR, "train_cleaned.csv"),
        os.path.join(OUTPUT_DIR, "train_rejected.csv")
    )

    clean_split(
        DEV_AUDIO_DIR,
        DEV_PROTOCOL,
        os.path.join(OUTPUT_DIR, "dev_cleaned.csv"),
        os.path.join(OUTPUT_DIR, "dev_rejected.csv")
    )

    clean_split(
        EVAL_AUDIO_DIR,
        EVAL_PROTOCOL,
        os.path.join(OUTPUT_DIR, "eval_cleaned.csv"),
        os.path.join(OUTPUT_DIR, "eval_rejected.csv")
    )

    print("\n🎉 All LA dataset cleaning completed successfully.")