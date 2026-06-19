#!/usr/bin/env python3
import argparse
import base64
import io
import json
import os
import re
import sys
import tempfile
from pathlib import Path

import anthropic
import requests
from PIL import Image
from pdf2image import convert_from_path
import pytesseract


PDF_URL = "https://www.booksite.ru/fulltext/vepsa/text.pdf"

ENTRY_PATTERNS = [
    re.compile(
        r"^\s*([a-zA-ZäöüšžčÄÖÜŠŽČ'']{2,30})"
        r"\s*\([^)]{1,80}\)"
        r"\s+([а-яёА-ЯЁ][^;\n]{2,200})",
        re.MULTILINE,
    ),
    re.compile(
        r"^\s*([a-zA-ZäöüšžčÄÖÜŠŽČ'']{2,30})"
        r"\s{2,}"
        r"([а-яёА-ЯЁ][^;\n]{2,200})",
        re.MULTILINE,
    ),
]

POS_HINTS = {
    "сущ": "n", "существ": "n",
    "гл": "v", "глаг": "v",
    "прил": "adj", "прилаг": "adj",
    "нар": "adv", "нареч": "adv",
    "числ": "num",
    "мест": "pron",
    "послел": "postp",
    "союз": "conj",
}

_LLM_PROMPT = """Ты извлекаешь словарные статьи из страницы вепсско-русского словаря.

═══ СТРУКТУРА СЛОВАРЯ ═══

ЗАГЛАВНОЕ СЛОВО: жирный шрифт, вепсская латиница (спецсимволы: ä ö ü š ž č).
Заглавное слово может быть ОДНОЙ буквой — это валидная словарная статья (например союз «a»).
Не пропускай короткие слова!

ВЕРТИКАЛЬНАЯ ЧЕРТА |: разделяет НЕИЗМЕНЯЕМУЮ часть слова от изменяемой.
  oige|ta → неизм. часть = «oige», изм. часть начинается с «ta»
  Слова без | — полностью неизменяемы (напр. наречия).
  ВАЖНО: | — это разделитель морфем, НЕ буква! Не читай его как «l», «i», «ĺ» и т.п.

ДВОЙНАЯ ЧЕРТА ||: разделяет части составного слова: oiged||kirjutez, sarak||linduline.
  Поле word: убирай | и ||, пиши слово слитно строчными буквами.

ТИЛЬДА ~ в скобках: заменяет НЕИЗМЕНЯЕМУЮ часть (всё до |, или всё слово если | нет).
  paim|en (~nen, ~ent, ~nid) → paimnen, paiment, paimnid
  pagin (~an, ~oid) → paginan, paginoid (нет |, ~ = pagin)

СКОБКИ ПОСЛЕ ЗАГЛАВНОГО СЛОВА:
  • Существительные/прилагательные/числительные/местоимения:
      (~ген.ед., ~парт.ед.) — или для двухосновных: (~ген.ед., ~парт.мн.)
  • Глаголы: (~3л.наст.вр., ~прош.вр.ед.ч.)
      oige|ta (~ndab, ~nzi) → oigendab (наст.), oigenzi (прош.)
      Если формы совпадают — показана одна: tahto|ida (~b)

ОМОНИМЫ: нумерованные статьи 1., 2. — создавай отдельные записи для каждой.

МНОГОЗНАЧНОСТЬ: цифры 1), 2), 3) внутри статьи — всё это разные значения одного слова.

p. В ПРИМЕРАХ: «p.» = первая буква с точкой, означает само заглавное слово целиком.
  «pehmed... p. vezi» → «pehmed vezi»

◇: после него идут фразеологические примеры.
mšt: помета «пословица/поговорка». ozt: помета «загадка». Используй как пример.

═══ ВЫХОДНОЙ ФОРМАТ ═══

Верни ТОЛЬКО JSON-массив (без ```json обёрток), без других пояснений:
[{
  "word": "заглавное слово строчными, без | и ||",
  "ipa": "МФА-транскрипция в /слэшах/ (č=/tʃ/, š=/ʃ/, ž=/ʒ/, гласные краткие)",
  "pos": "одно из: существительное | глагол | прилагательное | наречие | местоимение | числительное | послелог | союз | частица",
  "translation": "первое/основное значение",
  "alt": "остальные значения через точку с запятой, или \"\" если нет",
  "tags": ["1-2 тега СТРОГО из списка: природа | животные | растения | еда | тело | здоровье | движение | пространство | время | погода | жильё | быт | одежда | труд | родство | речь | эмоции | вера | числа | грамматика | базовый"],
  "examples": [{"src": "ТОЛЬКО вепсский текст (раскрой p. в полное слово; убери русский текст если перемешан)", "tr": "русский перевод примера"}],
  "forms": [
    {"label": "им.ед.", "form": "само заглавное слово без |"},
    {"label": "ген.ед.", "form": "раскрытая форма"},
    {"label": "парт.ед.", "form": "раскрытая форма"}
  ]
}]

Правила forms:
  • Раскрывай ~ используя неизменяемую часть (до |, или всё слово).
  • Для существительных: им.ед. + формы из скобок (ген.ед., парт.ед./мн.).
  • Для глаголов: {"label": "инф.", "form": "..."}, {"label": "3л.наст.", ...}, {"label": "3л.прош.", ...}.
  • Если форм нет — [].

Пропускай: номера страниц, колонтитулы, вводный текст без статей → верни [].
Если страница — предисловие или оглавление → верни [].
"""


def download_pdf(url: str, dest: Path) -> None:
    print(f"Скачиваю {url}…", file=sys.stderr)
    r = requests.get(url, stream=True, timeout=120)
    r.raise_for_status()
    with open(dest, "wb") as f:
        for chunk in r.iter_content(65536):
            f.write(chunk)
    print(f"  → {dest} ({dest.stat().st_size // 1024} KB)", file=sys.stderr)


def pages_from_spec(spec: str | None, total: int) -> list[int]:
    if not spec:
        return list(range(total))
    result: list[int] = []
    for part in spec.split(","):
        part = part.strip()
        if "-" in part:
            a, b = part.split("-", 1)
            result.extend(range(int(a) - 1, min(int(b), total)))
        else:
            result.append(int(part) - 1)
    return [p for p in result if 0 <= p < total]


def ocr_page(img: Image.Image, lang: str = "fin+rus") -> str:
    config = "--oem 3 --psm 6"
    w, h = img.size
    mid = w // 2
    left = img.crop((0, 0, mid, h))
    right = img.crop((mid, 0, w, h))
    parts = []
    for half in (left, right):
        try:
            parts.append(pytesseract.image_to_string(half, lang=lang, config=config))
        except Exception as e:
            print(f"OCR error: {e}", file=sys.stderr)
    return "\n".join(parts)


def ocr_page_llm(img: Image.Image) -> list[dict]:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.standard_b64encode(buf.getvalue()).decode()

    client = anthropic.Anthropic()
    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=16000,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": _LLM_PROMPT},
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": b64,
                        },
                    },
                ],
            }],
        )
        text = message.content[0].text.strip()
        if not text:
            return []
        if text.startswith("```"):
            text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        bracket = text.find("[")
        if bracket > 0:
            text = text[bracket:]
        if not text or text[0] != "[":
            return []
        try:
            entries, _ = json.JSONDecoder().raw_decode(text)
        except json.JSONDecodeError:
            last_close = text.rfind("},")
            if last_close == -1:
                last_close = text.rfind("}")
            if last_close == -1:
                return []
            text = text[:last_close + 1] + "]"
            try:
                entries = json.loads(text)
            except json.JSONDecodeError:
                return []
        if not isinstance(entries, list):
            return []
        result = []
        for e in entries:
            word = str(e.get("word", "")).strip().lower()
            if len(word) < 1:
                continue
            result.append({
                "word": word,
                "ipa": str(e.get("ipa", "")).strip(),
                "pos": str(e.get("pos", "")).strip(),
                "translation": str(e.get("translation", "")).strip(),
                "alt": str(e.get("alt", "")).strip(),
                "tags": [str(t).strip() for t in e.get("tags", []) if str(t).strip()],
                "examples": [
                    {"src": str(ex.get("src", "")).strip(), "tr": str(ex.get("tr", "")).strip()}
                    for ex in e.get("examples", [])
                    if isinstance(ex, dict) and ex.get("src")
                ],
                "forms": [
                    {"label": str(f.get("label", "")).strip(), "form": str(f.get("form", "")).strip()}
                    for f in e.get("forms", [])
                    if isinstance(f, dict) and f.get("label") and f.get("form")
                ],
            })
        return result
    except Exception as ex:
        print(f"\nLLM error: {ex}", file=sys.stderr)
        return []


def extract_pos(translation: str) -> tuple[str, str]:
    for kw, pos in POS_HINTS.items():
        m = re.search(rf"\({kw}[а-яё.]*\)", translation, re.IGNORECASE)
        if m:
            clean = re.sub(rf"\s*\({kw}[а-яё.]*\)", "", translation).strip()
            return pos, clean
    return "", translation.strip()


def parse_text(text: str) -> list[dict]:
    entries: list[dict] = []
    seen: set[str] = set()
    for pattern in ENTRY_PATTERNS:
        for m in pattern.finditer(text):
            veps = m.group(1).strip().lower()
            raw_trans = m.group(2).strip().rstrip(".,;")
            if len(veps) < 2 or veps in seen:
                continue
            if not any(c.isalpha() and c.isascii() or c in "äöüšžčÄÖÜŠŽČ" for c in veps):
                continue
            raw_trans = re.sub(r"-$", "", raw_trans).strip()
            seen.add(veps)
            pos, translation = extract_pos(raw_trans)
            translations = [t.strip() for t in translation.split(";") if t.strip()]
            entries.append({"veps_word": veps, "pos": pos, "translations": translations})
    return entries


def _save_progress(path: Path, entries: list[dict], done_pages: set[int], word_key: str) -> None:
    progress = [{"_pages_done": sorted(done_pages)}] + entries
    with open(path, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=PDF_URL)
    ap.add_argument("--file")
    ap.add_argument("--pages")
    ap.add_argument("--lang", default="fin+rus")
    ap.add_argument("--dpi", type=int, default=300)
    ap.add_argument("--out", default="data/words.json")
    ap.add_argument("--mode", choices=["tesseract", "llm"], default="tesseract")
    args = ap.parse_args()

    os.makedirs(Path(args.out).parent, exist_ok=True)

    if args.mode == "llm" and not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("Ошибка: задайте ANTHROPIC_API_KEY в окружении")

    if args.file:
        pdf_path = Path(args.file)
    else:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            pdf_path = Path(tmp.name)
        download_pdf(args.url, pdf_path)

    print(f"Конвертирую страницы (dpi={args.dpi})…", file=sys.stderr)
    images = convert_from_path(str(pdf_path), dpi=args.dpi)
    page_nums = pages_from_spec(args.pages, len(images))
    print(f"  Всего страниц: {len(images)}, обрабатываем: {len(page_nums)}", file=sys.stderr)

    all_entries: list[dict] = []
    word_key = "word" if args.mode == "llm" else "veps_word"
    out_path = Path(args.out)

    done_pages: set[int] = set()
    if out_path.exists():
        try:
            with open(out_path, encoding="utf-8") as f:
                saved = json.load(f)
            if isinstance(saved, list) and saved and "_pages_done" in (saved[0] if saved else {}):
                done_pages = set(saved[0].get("_pages_done", []))
                all_entries = saved[1:]
                print(f"  Возобновляю: уже обработано страниц {sorted(done_pages)}", file=sys.stderr)
        except Exception:
            pass

    for i, page_idx in enumerate(page_nums):
        if page_idx in done_pages:
            print(f"  Пропускаю стр. {page_idx + 1} (уже готова)", file=sys.stderr)
            continue
        img = images[page_idx]
        print(f"  OCR страница {page_idx + 1}/{len(images)} [{i+1}/{len(page_nums)}]…",
              end="\r", file=sys.stderr)
        if args.mode == "llm":
            entries = ocr_page_llm(img)
        else:
            text = ocr_page(img, lang=args.lang)
            entries = parse_text(text)
        all_entries.extend(entries)
        done_pages.add(page_idx)
        _save_progress(out_path, all_entries, done_pages, word_key)
        print(f"  Стр. {page_idx + 1}: +{len(entries)} слов (всего ~{len(all_entries)})",
              file=sys.stderr)

    unique: dict[str, dict] = {}
    for e in all_entries:
        k = e.get(word_key, "")
        if k and k not in unique:
            unique[k] = e

    result = sorted(unique.values(), key=lambda x: x.get(word_key, ""))

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\nИзвлечено {len(result)} уникальных слов → {args.out}", file=sys.stderr)


if __name__ == "__main__":
    main()
