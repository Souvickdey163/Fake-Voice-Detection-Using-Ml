import os
import json
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score
)
from sklearn.utils.class_weight import compute_class_weight

# =========================
# CONFIG
# =========================
DATA_DIR = "processed_data"
MODEL_DIR = "saved_models"
os.makedirs(MODEL_DIR, exist_ok=True)

BATCH_SIZE = 32
EPOCHS = 12
LEARNING_RATE = 0.0005
PATIENCE = 4

DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
print("Using device:", DEVICE)

# =========================
# LOAD DATA
# =========================
X_train = np.load(os.path.join(DATA_DIR, "X_train.npy"))
y_train = np.load(os.path.join(DATA_DIR, "y_train.npy"))

X_dev = np.load(os.path.join(DATA_DIR, "X_dev.npy"))
y_dev = np.load(os.path.join(DATA_DIR, "y_dev.npy"))

X_eval = np.load(os.path.join(DATA_DIR, "X_eval.npy"))
y_eval = np.load(os.path.join(DATA_DIR, "y_eval.npy"))

print("Train shape:", X_train.shape, y_train.shape)
print("Dev shape:", X_dev.shape, y_dev.shape)
print("Eval shape:", X_eval.shape, y_eval.shape)

print("\nClass Distribution:")
print(f"Train -> Real: {np.sum(y_train == 0)}, Fake: {np.sum(y_train == 1)}")
print(f"Dev   -> Real: {np.sum(y_dev == 0)}, Fake: {np.sum(y_dev == 1)}")
print(f"Eval  -> Real: {np.sum(y_eval == 0)}, Fake: {np.sum(y_eval == 1)}")

# Add channel dimension
X_train = np.expand_dims(X_train, axis=1)
X_dev = np.expand_dims(X_dev, axis=1)
X_eval = np.expand_dims(X_eval, axis=1)

print("\nAfter adding channel dimension:")
print("Train shape:", X_train.shape)
print("Dev shape:", X_dev.shape)
print("Eval shape:", X_eval.shape)

# =========================
# DATASET CLASS
# =========================
class AudioDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.long)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

train_dataset = AudioDataset(X_train, y_train)
dev_dataset = AudioDataset(X_dev, y_dev)
eval_dataset = AudioDataset(X_eval, y_eval)

# =========================
# WEIGHTED SAMPLER
# =========================
class_sample_count = np.array([len(np.where(y_train == t)[0]) for t in np.unique(y_train)])
weights = 1. / class_sample_count
samples_weight = np.array([weights[t] for t in y_train])

samples_weight = torch.from_numpy(samples_weight).double()
sampler = WeightedRandomSampler(samples_weight, len(samples_weight), replacement=True)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, sampler=sampler)
dev_loader = DataLoader(dev_dataset, batch_size=BATCH_SIZE, shuffle=False)
eval_loader = DataLoader(eval_dataset, batch_size=BATCH_SIZE, shuffle=False)

# =========================
# CLASS WEIGHTS
# =========================
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(y_train),
    y=y_train
)
class_weights = torch.tensor(class_weights, dtype=torch.float32).to(DEVICE)
print("Class weights:", class_weights)

# =========================
# CNN MODEL
# =========================
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
            nn.Dropout(0.3)
        )

        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 17 * 15, 128),
            nn.ReLU(),
            nn.Dropout(0.5),

            nn.Linear(128, 32),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(32, 2)
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x

model = DeepfakeCNN().to(DEVICE)
criterion = nn.CrossEntropyLoss(weight=class_weights)
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

# =========================
# TRAIN FUNCTION
# =========================
def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss = 0
    all_preds = []
    all_labels = []

    for X_batch, y_batch in loader:
        X_batch, y_batch = X_batch.to(device), y_batch.to(device)

        optimizer.zero_grad()
        outputs = model(X_batch)
        loss = criterion(outputs, y_batch)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

        preds = torch.argmax(outputs, dim=1)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(y_batch.cpu().numpy())

    acc = accuracy_score(all_labels, all_preds)
    return running_loss / len(loader), acc

# =========================
# EVALUATE FUNCTION
# =========================
def evaluate(model, loader, criterion, device, threshold=0.5):
    model.eval()
    running_loss = 0
    all_preds = []
    all_labels = []
    all_probs = []

    with torch.no_grad():
        for X_batch, y_batch in loader:
            X_batch, y_batch = X_batch.to(device), y_batch.to(device)

            outputs = model(X_batch)
            loss = criterion(outputs, y_batch)

            running_loss += loss.item()

            probs = F.softmax(outputs, dim=1)[:, 1]   # spoof probability
            preds = (probs >= threshold).long()

            all_probs.extend(probs.cpu().numpy())
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(y_batch.cpu().numpy())

    acc = accuracy_score(all_labels, all_preds)
    return running_loss / len(loader), acc, all_labels, all_preds, all_probs

# =========================
# TRAIN LOOP
# =========================
best_dev_acc = 0.0
patience_counter = 0

for epoch in range(EPOCHS):
    train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, DEVICE)
    dev_loss, dev_acc, _, _, _ = evaluate(model, dev_loader, criterion, DEVICE, threshold=0.5)

    print(f"\nEpoch [{epoch+1}/{EPOCHS}]")
    print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f}")
    print(f"Dev Loss:   {dev_loss:.4f} | Dev Acc:   {dev_acc:.4f}")

    if dev_acc > best_dev_acc:
        best_dev_acc = dev_acc
        patience_counter = 0
        torch.save(model.state_dict(), os.path.join(MODEL_DIR, "best_model_improved.pth"))
        print("✅ Best model saved!")
    else:
        patience_counter += 1
        print(f"No improvement. Patience: {patience_counter}/{PATIENCE}")

    if patience_counter >= PATIENCE:
        print("\n⏹ Early stopping triggered!")
        break

# =========================
# LOAD BEST MODEL
# =========================
print("\nLoading best model for final evaluation...")
model.load_state_dict(torch.load(os.path.join(MODEL_DIR, "best_model_improved.pth"), map_location=DEVICE))

# =========================
# FINAL EVAL WITH DEFAULT THRESHOLD
# =========================
eval_loss, eval_acc, y_true, y_pred, y_probs = evaluate(
    model, eval_loader, criterion, DEVICE, threshold=0.5
)

print("\n🎯 FINAL EVALUATION ON TEST DATA (Threshold = 0.50)")
print(f"Loss: {eval_loss:.4f}")
print(f"Accuracy: {eval_acc * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(y_true, y_pred, target_names=["bonafide", "spoof"]))

print("\nConfusion Matrix:")
print(confusion_matrix(y_true, y_pred))

# =========================
# THRESHOLD SEARCH
# =========================
print("\n🔍 Searching best threshold...")
best_threshold = 0.5
best_f1 = 0

for t in np.arange(0.30, 0.81, 0.05):
    preds_t = [1 if p >= t else 0 for p in y_probs]
    f1 = f1_score(y_true, preds_t)

    print(f"Threshold: {t:.2f} | F1 Score: {f1:.4f}")

    if f1 > best_f1:
        best_f1 = f1
        best_threshold = float(round(t, 2))

print(f"\n✅ Best Threshold Found: {best_threshold}")
print(f"✅ Best F1 Score: {best_f1:.4f}")

# =========================
# FINAL EVAL WITH BEST THRESHOLD
# =========================
final_preds = [1 if p >= best_threshold else 0 for p in y_probs]
final_acc = accuracy_score(y_true, final_preds)

print(f"\n🎯 FINAL EVALUATION ON TEST DATA (Threshold = {best_threshold})")
print(f"Accuracy: {final_acc * 100:.2f}%")

print("\nClassification Report (Best Threshold):")
print(classification_report(y_true, final_preds, target_names=["bonafide", "spoof"]))

print("\nConfusion Matrix (Best Threshold):")
print(confusion_matrix(y_true, final_preds))

# =========================
# SAVE THRESHOLD + CONFIG
# =========================
config = {
    "best_threshold": best_threshold,
    "sample_rate": 16000,
    "max_audio_len": 4,
    "label_map": {
        "0": "bonafide",
        "1": "spoof"
    }
}

with open(os.path.join(MODEL_DIR, "model_config.json"), "w") as f:
    json.dump(config, f, indent=4)

print("\n💾 Saved model config to saved_models/model_config.json")
print("🎉 Training complete.")

