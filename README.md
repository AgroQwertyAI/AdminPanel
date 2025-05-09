![node.js](https://github.com/AgroQwertyAI/AdminPanel/actions/workflows/node.js.yml/badge.svg)

# Агрономическая отчётность

Веб-система для обработки, анализа и хранения агрономических отчётов, разработанная с использованием Next.js, DaisyUI, Tailwind CSS и MongoDB.

## Требования

Перед началом работы убедитесь, что у вас установлено:

- Node.js (версия 18.0.0 или выше)
- MongoDB (версия 6.0 или выше)

## Установка

1. Клонируйте репозиторий:

```bash
git clone https://github.com/AgroQwertyAI/AdminPanel
cd AdminPanel
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл `.env.local` в корневой директории проекта и добавьте следующие переменные окружения:

```
MONGODB_URI=mongodb://localhost:27017/agro_reports
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Запуск проекта

### Режим разработки

```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000).

### Сборка для production

```bash
npm run build
```

### Запуск production-версии

```bash
npm start
```

## База данных

Приложение использует MongoDB для хранения данных. Убедитесь, что сервер MongoDB запущен перед запуском приложения.

## Функциональность

- Создание и редактирование шаблонов агрономических отчётов
- Диаграммы со статистикой
- Реалтайм обработка сообщений
- Система пользователей и ролей
- Подключение ватсапа и телеграма
- Настройка яндекс и гугл диска
- Расписание отправки отчётов
- Загрузка отчётов из фронтенда
... и многоё другоё

## Технологии

- [Next.js](https://nextjs.org/) - React-фреймворк для создания веб-приложений
- [Tailwind CSS](https://tailwindcss.com/) - Утилитарный CSS-фреймворк
- [DaisyUI](https://daisyui.com/) - UI компоненты для Tailwind CSS
- [MongoDB](https://www.mongodb.com/) - NoSQL база данных

## Лицензия

Apache 2.0
