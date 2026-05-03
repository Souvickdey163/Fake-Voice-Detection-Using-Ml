import os

import gradio as gr
import librosa
import numpy as np
import torch
import torch.nn as nn


SAMPLE_RATE = 16000
MAX_AUDIO_LEN = 4
N_MFCC = 40
MODEL_PATH = "best_model_improved.pth"


class DeepfakeCNN(nn.Module):
    def __init__(self):
        super(DeepfakeCNN, self).__init__()

        self.features = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Dropout(0.2),
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Dropout(0.25),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Dropout(0.3),
        )

        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 17 * 15, 128),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(128, 32),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(32, 2),
        )

    def forward(self, x):
        x = self.features(x)
        return self.classifier(x)


def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

    model = DeepfakeCNN()
    state_dict = torch.load(MODEL_PATH, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()
    return model


model = load_model()


def extract_features(file_path):
    audio, _ = librosa.load(file_path, sr=SAMPLE_RATE, mono=True)

    if not np.isfinite(audio).all():
        raise ValueError("Invalid audio values found in uploaded file.")

    max_samples = SAMPLE_RATE * MAX_AUDIO_LEN
    if len(audio) < max_samples:
        audio = np.pad(audio, (0, max_samples - len(audio)), mode="constant")
    else:
        audio = audio[:max_samples]

    mfcc = librosa.feature.mfcc(y=audio, sr=SAMPLE_RATE, n_mfcc=N_MFCC)
    delta = librosa.feature.delta(mfcc)
    delta2 = librosa.feature.delta(mfcc, order=2)
    chroma = librosa.feature.chroma_stft(y=audio, sr=SAMPLE_RATE)
    spectral_contrast = librosa.feature.spectral_contrast(y=audio, sr=SAMPLE_RATE)

    feature = np.vstack([mfcc, delta, delta2, chroma, spectral_contrast])
    feature = (feature - np.mean(feature)) / (np.std(feature) + 1e-6)
    feature = np.expand_dims(feature, axis=0)
    feature = np.expand_dims(feature, axis=0)
    return feature.astype(np.float32)


def predict(audio_path):
    if audio_path is None:
        return "Upload an audio file first.", {"Real Voice": 0.0, "Fake Voice": 0.0}

    features = torch.tensor(extract_features(audio_path), dtype=torch.float32)

    with torch.no_grad():
        output = model(features)
        probabilities = torch.softmax(output, dim=1)[0].cpu().numpy()

    real_probability = float(probabilities[0])
    fake_probability = float(probabilities[1])
    label = "Fake Voice" if fake_probability >= real_probability else "Real Voice"
    confidence = max(real_probability, fake_probability) * 100

    return (
        f"{label} ({confidence:.2f}% confidence)",
        {
            "Real Voice": real_probability,
            "Fake Voice": fake_probability,
        },
    )


demo = gr.Interface(
    fn=predict,
    inputs=gr.Audio(type="filepath", label="Upload audio"),
    outputs=[
        gr.Textbox(label="Prediction"),
        gr.Label(label="Class probabilities"),
    ],
    title="Fake Audio Detection",
    description="Upload a short voice recording to classify it as real or fake.",
)


if __name__ == "__main__":
    demo.launch()
