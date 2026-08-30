# supportBot

Бот поддержки для мессенджера MAX + сайт для операторов.

## Состав проекта

| Часть | Технологии | Как разворачивается |
|---|---|---|
| `client/` | React | собирается в статику и раздаётся сервером |
| `server/` | Node.js/Express, Socket.IO, SQLite | контейнер `server` |
| `maxBot/` | Node.js/Express, `@maxhub/max-bot-api` | контейнер `maxbot` |

Отдельного контейнера для фронтенда нет: `server/Dockerfile` на первом стейдже собирает `client/`, кладёт результат в `server/public`, и сервер раздаёт сайт и API с одного origin (порт `3003`). Контейнер `maxbot` не публикует порт наружу — он общается с `server` внутри docker-сети по имени сервиса.

API MAX (`platform-api2.max.ru`) выпускает сертификат через государственный удостоверяющий центр «Russian Trusted CA», которого нет в стандартном доверенном списке (в том числе в `node:alpine`). Поэтому `maxBot/Dockerfile` запускает бота с `NODE_TLS_REJECT_UNAUTHORIZED=0` — проверка TLS-сертификата у бота отключена полностью (не только для MAX). Это упрощает сборку, но открывает бота для MITM на любом исходящем HTTPS-запросе.

## Требования

- Docker ≥ 24, плагин Docker Compose (`docker compose`).
- Токен бота MAX (`BOT_TOKEN`), выдаётся при регистрации бота на платформе MAX.

## Установка

1. Склонируйте репозиторий и перейдите в его корень.

2. Создайте `.env` на основе примера:

   ```bash
   cp .env.example .env
   ```

3. Заполните `.env`:

   - `BOT_TOKEN` — токен бота MAX.
   - `SERVER_TOKEN` — произвольная секретная строка (например, `openssl rand -hex 32`). Один и тот же токен нужно будет указать на сайте на шаге 6 при добавлении бота.
   - `SERVER_PORT` — порт на хосте для сайта поддержки, по умолчанию `3003`.
   - `CORS_ORIGIN` — домен(ы), с которых разрешены запросы к API, по умолчанию `*`.
   - `DEFAULT_OPERATOR_LOGIN` / `DEFAULT_OPERATOR_PASSWORD` — логин/пароль первого оператора, создаётся автоматически при первом запуске сервера. Смените пароль после первого входа.

4. Соберите и запустите контейнеры:

   ```bash
   docker compose up -d --build
   ```

5. Проверьте, что оба сервиса поднялись:

   ```bash
   docker compose ps
   ```

   Сайт поддержки будет доступен на `http://localhost:${SERVER_PORT}` (по умолчанию `http://localhost:3003`).

6. Войдите на сайт под оператором (`DEFAULT_OPERATOR_LOGIN` / `DEFAULT_OPERATOR_PASSWORD`) и добавьте бота в разделе настроек:

   - адрес: `maxbot`
   - порт: `3004`
   - токен: значение `SERVER_TOKEN` из `.env`

   После этого бот сможет отправлять и принимать сообщения через сайт.

## Данные

База SQLite хранится в docker-volume `db-data` (путь внутри контейнера `/data/data.db`) и переживает пересоздание контейнеров. Чтобы полностью сбросить данные:

```bash
docker compose down -v
```

## Обновление

```bash
git pull
docker compose up -d --build
```

## Полезные команды

```bash
docker compose logs -f server
docker compose logs -f maxbot
docker compose restart maxbot
docker compose down
```
