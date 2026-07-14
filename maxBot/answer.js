class Answer {
    CODES = {
        242: 'Не переданы все необходимые параметры или значения не валидны',
        243: 'Неверный токен',
        244: 'Не передан файл для загрузки',

        2002: 'Ошибка отправки сообщения',
        2003: 'Ошибка загрузки файла в max',
        9000: 'Неизвестная ошибка',
    };

    bad(code) {
        return {
            result: "error",
            error: {
                code,
                message: this.CODES[code],
            }
        };
    }

    good(data) {
        if (!data) {
            return this.bad(9000);
        }
        return {
            result: "ok",
            data,
        };
    }
}

module.exports = Answer;