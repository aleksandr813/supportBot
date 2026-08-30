# supportBot

Бот для обработки обращений + сайт

## Состав проекта

| Часть | Технологии | Как разворачивается |
|---|---|---|
| `client/` | React | собирается в статику на этапе сборки, отдельного контейнера нет |
| `server/` | Node.js/Express, Socket.IO, SQLite | контейнер `server` - сайт + API + собранный клиент, порт `3003` |
| `maxBot/` | Node.js/Express, `@maxhub/max-bot-api` | контейнер `maxbot` - наружу порт не публикуется |

## Установка

1. После загрузки и распаковки архива:

   ```bash
   cd supportBot
   ```

2. Создайте `.env` на основе примера и заполните:

   ```bash
   cp .env.example .env
   ```

   | Переменная | Обязательна | Назначение |
   |---|:---:|---|
   | `BOT_TOKEN` | да | Токен бота MAX. |
   | `SERVER_TOKEN` | да | Общий секрет между `maxbot` и `server`. Этот же токен нужно будет ввести на сайте на шаге про добавление бота. Сгенерировать: `openssl rand -hex 32`. |
   | `SERVER_PORT` | нет (`3003`) | Порт на **хосте**, на котором публикуется сайт. |
   | `CORS_ORIGIN` | нет (`*`) | В проде укажите сюда реальный домен вместо `*`. |
   | `DEFAULT_OPERATOR_LOGIN` / `DEFAULT_OPERATOR_PASSWORD` | нет (`admin`/`admin`) | Логин/пароль первого оператора. **Применяются только при первом запуске на пустой базе** - см. раздел «Смена логина/пароля оператора» ниже, если база уже создана. |

3. Соберите и запустите:

   ```bash
   docker compose up -d --build
   ```

4. Проверьте, что оба сервиса поднялись и прошли healthcheck:

   ```bash
   docker compose ps
   docker compose logs -f server
   docker compose logs -f maxbot
   ```

   Сайт будет доступен на `http://<host>:${SERVER_PORT}` (по умолчанию `:3003`).

5. Войдите на сайт под `DEFAULT_OPERATOR_LOGIN` / `DEFAULT_OPERATOR_PASSWORD` и в разделе настроек добавьте бота:

   - адрес: **`maxbot`** (имя сервиса в `docker-compose.yml`, не `localhost` - см. ниже, почему это важно)
   - порт: `3004`
   - токен: значение `SERVER_TOKEN` из `.env`

## Данные

SQLite хранится в docker-volume `db-data` (внутри контейнера - `/data/data.db`) и переживает пересоздание контейнеров. Полностью сбросить всё (конверсации, операторов, ботов):

```bash
docker compose down -v
```

После этого следующий `docker compose up -d --build` создаст базу заново и засеет оператора из текущих `DEFAULT_OPERATOR_LOGIN`/`DEFAULT_OPERATOR_PASSWORD` в `.env`.


### Реверс-прокси (nginx и т.п.) перед сайтом

Если ставите сайт за отдельный nginx/прокси на домене (а не просто открываете `http://host:3003` напрямую), недостаточно проксировать только `/`. Клиент - это SPA (React), и если весь сайт отдаётся статикой с фолбэком `try_files $uri $uri/ /index.html`, то **любой** запрос, для которого явно не прописан отдельный `location`, тоже упадёт в этот фолбэк и вернёт браузеру HTML главной страницы вместо ответа API. Внешне это выглядит не как ошибка, а как «не работает» - запрос как бы уходит, но по факту в бэкенд `server` не доходит: например, именно так молча ломается загрузка файлов и видео (`/upload`, `/videoProxy`), если для них нет отдельного `location`.

Нужно явно проксировать на контейнер `server` (порт `3003`) как минимум:

- **`/socket.io/`** - чаты, live-обновления. Обязателен WebSocket-апгрейд, иначе Socket.IO будет работать нестабильно или не работать вовсе.
- **`/upload`** - загрузка файлов/вложений с сайта.
- **`/videoProxy`** - проксирование видео-вложений.

Рабочий пример (проверено на практике):

```nginx
location /socket.io/ {
    proxy_pass http://127.0.0.1:3003;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
}

location /upload {
    proxy_pass http://127.0.0.1:3003;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 20M;
}

location /videoProxy {
    proxy_pass http://127.0.0.1:3003;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    proxy_pass http://127.0.0.1:3003;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

`client_max_body_size` в `/upload` можно подогнать под реальный размер вложений, которые должны проходить (по умолчанию у nginx - 1M, этого мало для файлов/фото).

**Важно:** `location /` в самом конце должен быть именно **`proxy_pass`** на контейнер `server`, а не `root` + `try_files $uri $uri/ /index.html`, отдающий статику с диска. Собирать клиент отдельно вручную и класть его в папку сайта (`/www/wwwroot/...` и т.п.) **не нужно** - актуальный билд `client/` уже лежит внутри образа `server` (см. `server/Dockerfile`, стадия `client-build` → `server/public`) и раздаётся самим Node-процессом на порту `3003`.

### Смена логина/пароля оператора после первого запуска

`DEFAULT_OPERATOR_LOGIN` / `DEFAULT_OPERATOR_PASSWORD` из `.env` применяются **только один раз** - когда таблица операторов в базе пустая (то есть на самом первом запуске на чистом volume). Если вы поменяете эти значения в `.env` и перезапустите контейнеры на уже существующей базе - ничего не изменится, оператор уже создан и повторный засев не выполняется. Интерфейса для смены пароля оператора на сайте нет.

Два варианта, если нужно сменить логин/пароль:

- **Сбросить базу целиком** (потеряются все конверсации, боты, история):

  ```bash
  docker compose down -v
  ```

  затем поднять заново с новыми значениями в `.env` - `docker compose up -d --build`.

- **Обновить пароль точечно, не теряя данные** - выполнить SQL-обновление внутри контейнера (пароль хранится как MD5-хэш):

  ```bash
  docker compose exec server node -e "
  const sqlite3 = require('sqlite3');
  const crypto = require('crypto');
  const db = new sqlite3.Database('/data/data.db');
  const hash = crypto.createHash('md5').update('НОВЫЙ_ПАРОЛЬ').digest('hex');
  db.run('UPDATE operators SET password_hash = ? WHERE name = ?', [hash, 'admin'], function (err) {
    if (err) return console.error(err);
    console.log('обновлено строк:', this.changes);
    db.close();
  });
  "
  ```

  Замените `НОВЫЙ_ПАРОЛЬ` и, если логин отличается от `admin`, значение `'admin'` во втором параметре на актуальный логин оператора.
