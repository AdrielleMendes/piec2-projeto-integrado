from __future__ import annotations

import hashlib
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODELS = {
    "face_detection_yunet_2023mar.onnx": (
        "https://github.com/opencv/opencv_zoo/raw/refs/heads/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
    ),
    "face_recognition_sface_2021dec.onnx": (
        "https://github.com/opencv/opencv_zoo/raw/refs/heads/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"
    ),
}

for filename, url in MODELS.items():
    destination = MODEL_DIR / filename
    if destination.exists() and destination.stat().st_size > 100_000:
        print(f"Já existe: {filename}")
        continue
    temporary = destination.with_suffix(destination.suffix + ".part")
    print(f"Baixando {filename}...")
    request = urllib.request.Request(url, headers={"User-Agent": "NexGuard-Setup/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response, temporary.open("wb") as output:
        while chunk := response.read(1024 * 1024):
            output.write(chunk)
    if temporary.stat().st_size < 100_000:
        temporary.unlink(missing_ok=True)
        raise RuntimeError(f"Download incompleto ou inválido: {filename}")
    temporary.replace(destination)
    digest = hashlib.sha256(destination.read_bytes()).hexdigest()
    print(f"Concluído: {filename} (SHA-256: {digest})")

print("Modelos prontos. Consulte os termos/licenças dos modelos antes do uso comercial.")
