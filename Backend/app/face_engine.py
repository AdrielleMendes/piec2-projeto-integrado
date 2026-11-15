from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

from . import config

DETECTOR_FILE = "face_detection_yunet_2023mar.onnx"
RECOGNIZER_FILE = "face_recognition_sface_2021dec.onnx"
MODEL_NAME = "opencv-sface"
MODEL_VERSION = "2021dec"


class FaceProcessingError(Exception):
    """Imagem inválida, sem rosto, com vários rostos ou qualidade insuficiente."""


@dataclass
class FaceResult:
    embedding: np.ndarray
    quality: float


class FaceEngine:
    def __init__(self) -> None:
        detector_path = config.MODEL_DIR / DETECTOR_FILE
        recognizer_path = config.MODEL_DIR / RECOGNIZER_FILE
        if not detector_path.is_file() or not recognizer_path.is_file():
            raise RuntimeError(
                "Modelos ONNX ausentes. Execute: python scripts/download_models.py"
            )
        if not hasattr(cv2, "FaceDetectorYN") or not hasattr(cv2, "FaceRecognizerSF"):
            raise RuntimeError("Instale opencv-python-headless com suporte a FaceDetectorYN/FaceRecognizerSF.")
        self.detector = cv2.FaceDetectorYN.create(
            str(detector_path), "", (320, 320), 0.90, 0.3, 5000
        )
        self.recognizer = cv2.FaceRecognizerSF.create(str(recognizer_path), "")

    def embedding_from_bytes(self, image_bytes: bytes | bytearray) -> FaceResult:
        encoded = np.frombuffer(image_bytes, dtype=np.uint8)
        frame = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
        if frame is None or frame.size == 0:
            raise FaceProcessingError("A câmera enviou uma imagem inválida.")
        aligned = None
        gray = None
        try:
            height, width = frame.shape[:2]
            if width < 240 or height < 240:
                raise FaceProcessingError("Imagem muito pequena. Aproxime o rosto da câmera.")
            self.detector.setInputSize((width, height))
            _, faces = self.detector.detect(frame)
            if faces is None or len(faces) == 0:
                raise FaceProcessingError("Nenhum rosto foi detectado.")
            if len(faces) != 1:
                raise FaceProcessingError("Deve haver apenas uma pessoa diante da câmera.")
            face = faces[0]
            x, y, face_width, face_height = [int(round(value)) for value in face[:4]]
            detector_score = float(face[-1])
            if detector_score < 0.90 or min(face_width, face_height) < config.MIN_FACE_SIZE:
                raise FaceProcessingError("Rosto distante ou imagem de baixa qualidade.")
            x0, y0 = max(0, x), max(0, y)
            x1, y1 = min(width, x + face_width), min(height, y + face_height)
            crop = frame[y0:y1, x0:x1]
            if crop.size == 0:
                raise FaceProcessingError("Não foi possível validar a região do rosto.")
            gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
            blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            if blur_score < 35:
                raise FaceProcessingError("Imagem desfocada. Mantenha o rosto imóvel e bem iluminado.")
            aligned = self.recognizer.alignCrop(frame, face)
            feature = self.recognizer.feature(aligned).reshape(-1).astype(np.float32)
            norm = float(np.linalg.norm(feature))
            if norm <= 1e-8 or not np.isfinite(feature).all():
                raise FaceProcessingError("Não foi possível extrair as características faciais.")
            feature /= norm
            quality = min(1.0, max(0.0, detector_score * min(1.0, blur_score / 150.0)))
            return FaceResult(embedding=feature, quality=quality)
        finally:
            # Apaga buffers de pixels e recortes assim que o vetor é extraído.
            if gray is not None:
                gray.fill(0)
            if aligned is not None:
                aligned.fill(0)
            frame.fill(0)
            del frame


_engine: FaceEngine | None = None


def get_face_engine() -> FaceEngine:
    global _engine
    if _engine is None:
        _engine = FaceEngine()
    return _engine


def cosine_similarity(left: np.ndarray, right: np.ndarray) -> float:
    left = np.asarray(left, dtype=np.float32).reshape(-1)
    right = np.asarray(right, dtype=np.float32).reshape(-1)
    if left.shape != right.shape:
        return -1.0
    denominator = float(np.linalg.norm(left) * np.linalg.norm(right))
    if denominator <= 1e-8:
        return -1.0
    return float(np.dot(left, right) / denominator)
