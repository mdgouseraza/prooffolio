"""OCR extraction for marksheets — process in-memory only; caller must not persist uploads."""

from __future__ import annotations

from typing import Any


def extract_marksheet_data(file_bytes: bytes, content_type: str | None) -> dict[str, Any]:
    """
    Placeholder OCR pipeline. Replace with Tesseract / Vision API integration.
    Returns structured data + per-field confidence (0–100).
    """
    return {
        "semester_number": 1,
        "subjects": [
            {"subject": "Sample Subject", "marks": 0, "confidence": 50},
        ],
        "cgpa": None,
        "percentage": None,
        "overall_confidence": 50,
        "raw_error": "OCR not configured — set up Tesseract or Google Vision in portfolio/ocr.py",
    }
