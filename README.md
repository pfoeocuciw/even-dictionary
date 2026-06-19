# Even Dictionary — Вепсско-русский словарь

Веб-приложение для поиска и просмотра слов вепсского языка. Содержит транскрипцию (IPA), перевод на русский, грамматические формы и примеры употребления.

## Стек

| Часть | Технологии |
|---|---|
| Фронтенд | React 19, Vite, styled-components |
| Бэкенд | Node.js, Express |
| База данных | PostgreSQL |
| Парсер | Python, Claude Haiku (Anthropic API), Tesseract OCR |
| Инфраструктура | Yandex Cloud (Terraform), PM2 |

## Структура проекта

```
even-dictionary/
├── words_llm.json          # словарная база (JSON, результат работы парсера)
├── parser/
│   ├── parse_pdf.py        # парсер PDF-словаря (OCR + LLM)
│   └── requirements.txt
├── backend/
│   └── src/
│       ├── index.js        # точка входа Express-сервера
│       ├── db.js           # подключение к PostgreSQL
│       ├── dictionary.js   # запросы к БД
│       ├── seed.js         # импорт JSON в БД
│       └── routes/
│           └── words.js    # REST API маршруты
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── api.js          # обращения к бэкенду
│       └── components/
│           ├── SearchBar.jsx
│           ├── WordCard.jsx
│           ├── WordDetail.jsx
│           ├── AlphabetPage.jsx
│           └── AboutPage.jsx
└── infra/                  # Terraform (Yandex Cloud)
    ├── main.tf
    ├── compute.tf
    ├── database.tf
    ├── network.tf
    └── terraform.tfvars.example
```

## Парсер

Скрипт `parser/parse_pdf.py` извлекает словарные статьи из PDF-файла вепсско-русского словаря.

**Два режима работы:**

- `--mode tesseract` — OCR через Tesseract, быстро, без API-ключа
- `--mode llm` — изображение каждой страницы отправляется в Claude Haiku, который возвращает структурированный JSON. Требует `ANTHROPIC_API_KEY`.

```bash
cd parser
pip install -r requirements.txt

# LLM-режим (рекомендуется)
ANTHROPIC_API_KEY=sk-... python parse_pdf.py --mode llm --out ../words_llm.json

# Tesseract-режим
python parse_pdf.py --mode tesseract --out ../words_llm.json

# Обработать конкретные страницы
python parse_pdf.py --mode llm --pages 10-50 --out ../words_llm.json

# Использовать локальный PDF вместо скачивания
python parse_pdf.py --mode llm --file /path/to/dict.pdf --out ../words_llm.json
```

Парсер поддерживает **возобновление** — если прервать, при следующем запуске уже обработанные страницы будут пропущены.

## API

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/health` | статус сервера и количество слов |
| GET | `/api/words/search?q=&limit=&offset=` | поиск по слову или переводу |
| GET | `/api/words/alphabet` | примеры слов на каждую букву алфавита |
| GET | `/api/words/:id` | полная карточка слова |

## Запуск локально

### 1. База данных

```bash
# Создать БД
createdb even_dictionary

# Импортировать словарь
cd backend
npm install
npm run seed
```

Переменные окружения для подключения (по умолчанию — локальный PostgreSQL):

```
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=even_dictionary
PGUSER=<текущий пользователь>
PGPASSWORD=
```

### 2. Бэкенд

```bash
cd backend
npm run dev
```

Сервер запустится на `http://localhost:3001`.

### 3. Фронтенд

```bash
cd frontend
npm install
npm run dev
```

Откроется на `http://localhost:5173`.

## Продакшн

```bash
cd frontend && npm run build
cd ../backend && npm start
```

После сборки бэкенд раздаёт и API, и статику фронтенда. Для управления процессом используется PM2 (`ecosystem.config.cjs`).

## Деплой (Yandex Cloud)

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# заполнить terraform.tfvars

terraform init
terraform apply
```

Terraform поднимает виртуальную машину и управляемую PostgreSQL-базу в Yandex Cloud.

## Структура слова в базе данных

```json
{
  "word": "koumekümne",
  "ipa": "/koumeˈkymne/",
  "pos": "числительное",
  "translation": "тридцать",
  "alt": "",
  "tags": ["числа"],
  "examples": [
    { "src": "koumekümne päivää", "tr": "тридцать дней" }
  ],
  "forms": [
    { "label": "Генитив", "form": "koumekümnen", "pl": "koumekümniden" }
  ]
}
```

## Алфавит вепсского языка

Словарь поддерживает навигацию по всем буквам вепсского алфавита, включая специфические: **Ä, Č, Š, Ö, Ž, ʼ**.
