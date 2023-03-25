const RESPONSE = {
    SUCCESS: 'success',
    FAIL: 'fail'
}

class ResponseData {
    #status
    #resultMsg
    constructor(status, resultMsg) {
        const isValidStatus = Object.entries(RESPONSE).filter(([key, value]) => value === status);
        if (isValidStatus.length === 0) {
            throw Error("Must be status is success or fail");
        }

        this.#status = status;
        this.#resultMsg = resultMsg;
    }

    get json() {
        return {
            status: this.#status,
            resultMsg: this.#resultMsg
        }
    }
}

export class SuccessResponseData extends ResponseData {
    #data
    constructor(resultMsg, data) {
        super(RESPONSE.SUCCESS, resultMsg);

        this.#data = data;
    }

    get json() {
        return {
            ...super.json,
            data: this.#data
        }
    }
}

export class FailResponseData extends ResponseData {
    #error
    constructor(resultMsg, error) {
        super(RESPONSE.FAIL, resultMsg);

        if (!error instanceof Error) {
            throw Error("Must be error param is Error object");
        }

        this.#error = error;
    }

    get json() {
        return {
            ...super.json,
            error: this.#error
        }
    }
}