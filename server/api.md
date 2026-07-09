**Адрес сервера:** `localhost:3003`

### 1. Отправка сообщения
`POST localhost:3003/newMessage`

Параметры (body):
- `token` (string, обязательно)
- `externalId` (string, обязательно)
- `text` (string, обязательно)

---

### 2. Добавление пользователя
`POST localhost:3003/addUser`

Параметры (body):
- `token` (string, обязательно)
- `username` (string, обязательно)
- `externalId` (string, обязательно)
- `phone` (string, необязательно)

---

### 3. Создание диалога
`POST localhost:3003/createConversation`

Параметры (body):
- `token` (string, обязательно)
- `externalId` (string, обязательно)
- `role` (string, необязательно)

---

### 4. Завершение диалога
`POST localhost:3003/endConversation`

Параметры (body):
- `token` (string, обязательно)
- `externalId` (string, обязательно)

---

### 5. Любой другой путь
`ANY localhost:3003/*path` → 404 (`"not found"`)