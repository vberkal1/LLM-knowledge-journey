# Knowledge Journey

Интерактивное учебное приложение на `React + TypeScript + Vite` с Node.js backend для генерации learning journey через OpenAI API. Если OpenAI недоступен, приложение автоматически использует резервный сценарий.

## Stack

- Frontend: `React`, `TypeScript`, `Vite`, `React Router`
- Backend: `Node.js`, `Express`, `OpenAI SDK`
- State: React Context + `localStorage`

## Local Setup

1. Установите зависимости:
```bash
npm install
```
2. Создайте `.env` в корне проекта:
```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
PORT=8787
```
3. Запустите проект:
```bash
npm run dev
```
4. Откройте `http://localhost:5173`.

## Build

```bash
npm run build
```

## Generation Source

В интерфейсе показывается источник генерации:

- `AI` — journey реально сгенерирован через OpenAI API
- `Fallback mock` — backend не смог получить ответ от OpenAI и вернул резервный сценарий

`Fallback mock` обычно появляется, если:

- не заполнен `OPENAI_API_KEY`
- у API-аккаунта нет quota / billing
- OpenAI временно недоступен

Это штатное поведение для локальной разработки: приложение остаётся рабочим даже без активной API-квоты.

## Notes

- `.env` не должен попадать в репозиторий
- каждый разработчик использует свой собственный `OPENAI_API_KEY`
- язык интерфейса влияет и на язык генерируемого journey (`ru/en`)
