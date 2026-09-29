"""
Internationalization (i18n) API
- Dynamically serves supported languages and UI translation strings from a config file.
- NO hardcoded language logic. All strings are data-driven from translations/*.json files.
"""

import os
import json
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

router = APIRouter(prefix="/i18n", tags=["Internationalization"])

TRANSLATIONS_DIR = os.path.join(os.path.dirname(__file__), "..", "translations")


def _list_available_languages() -> List[Dict[str, str]]:
    """Scan the translations directory and return metadata for each language."""
    langs = []
    if not os.path.isdir(TRANSLATIONS_DIR):
        return langs
    for filename in sorted(os.listdir(TRANSLATIONS_DIR)):
        if filename.endswith(".json"):
            lang_code = filename[:-5]
            filepath = os.path.join(TRANSLATIONS_DIR, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                meta = data.get("_meta", {})
                langs.append({
                    "code": lang_code,
                    "name": meta.get("name", lang_code),
                    "native_name": meta.get("native_name", lang_code),
                    "direction": meta.get("direction", "ltr"),
                    "flag": meta.get("flag", "🌐"),
                })
            except Exception:
                pass
    return langs


def _load_translation(lang_code: str) -> Dict[str, Any]:
    """Load a specific language translation JSON file."""
    safe_code = "".join(c for c in lang_code if c.isalnum() or c in ("-", "_"))
    filepath = os.path.join(TRANSLATIONS_DIR, f"{safe_code}.json")
    if not os.path.isfile(filepath):
        raise HTTPException(status_code=404, detail=f"Translation file not found for language: '{lang_code}'")
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/languages")
def list_languages():
    """Returns all available UI languages loaded from translation data files."""
    return _list_available_languages()


@router.get("/translations/{lang_code}")
def get_translations(lang_code: str) -> Dict[str, Any]:
    """Returns the full UI translation string map for the given language code."""
    return _load_translation(lang_code)
