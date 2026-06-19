# Even Dictionary — Вепсско-русский словарь

Веб-приложение для поиска и просмотра слов вепсского языка. Содержит транскрипцию (IPA), перевод на русский, грамматические формы и примеры употребления.

## Стек

| Часть | Технологии |
|---|---|
| Фронтенд | React 19, Vite, styled-components |
| Бэкенд | Node.js, Express |
| Данные | JSON-файл (`words_llm.json`), сформированный с помощью LLM |

## Структура проекта

```
even-dictionary/
├── words_llm.json        # словарная база
├── backend/
│   └── src/
│       ├── index.js      # точка входа Express-сервера
│       ├── dictionary.js # загрузка и поиск по словарю
│       └── routes/
│           └── words.js  # REST API маршруты
└── frontend/
    └── src/
        ├── App.jsx
        ├── api.js        # обращения к бэкенду
        └── components/
            ├── SearchBar.jsx
            ├── WordCard.jsx
            ├── WordDetail.jsx
            ├── AlphabetPage.jsx
            └── AboutPage.jsx
```

## API

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/health` | статус сервера и количество слов |
| GET | `/api/words/search?q=&limit=&offset=` | поиск по слову или переводу |
| GET | `/api/words/alphabet` | примеры слов на каждую букву алфавита |
| GET | `/api/words/:id` | полная карточка слова |

## Запуск

### Разработка

```bash
# Бэкенд
cd backend
npm install
npm run dev

# Фронтенд (в отдельном терминале)
cd frontend
npm install
npm run dev
```

Фронтенд откроется по адресу `http://localhost:5173`, бэкенд — на `http://localhost:3001`.

### Продакшн

```bash
cd frontend && npm run build
cd ../backend && npm start
```

После сборки бэкенд раздаёт и API, и статику фронтенда.

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
