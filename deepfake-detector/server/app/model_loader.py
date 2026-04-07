import os
import torch
import torch.nn as nn

device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
model = None


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


def load_model():
    global model
    if model is None:
        model = DeepfakeCNN().to(device)
        # Safely resolve absolute path regardless of where uvicorn is executed from
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, "models", "best_model_improved.pth")
        model.load_state_dict(torch.load(model_path, map_location=device))
        model.eval()


def predict(input_tensor):
    load_model()
    with torch.no_grad():
        if not isinstance(input_tensor, torch.Tensor):
            input_tensor = torch.tensor(input_tensor, dtype=torch.float32)
        input_tensor = input_tensor.to(device)
        output = model(input_tensor)

        probs = torch.softmax(output, dim=1)
        pred = torch.argmax(probs, dim=1).item()

        confidence = probs[0][pred].item()
        spoof_probability = probs[0][1].item()   # probability of fake/spoof

        label = "Spoof (Fake)" if pred == 1 else "Bonafide (Real)"

        return label, confidence, spoof_probability