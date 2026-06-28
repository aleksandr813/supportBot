class Answer {
    CODES = {
        //main errors
        242: 'Не переданы все необходимые параметры или значения не валидны',
        404: 'NOT FOUND',
        //other
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