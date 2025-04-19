class ApiError extends Error {
    constructor(
        statusCode,
        message = "something went wrong",
        errors = [],
        stack = ""

    ){
        super(message)
        this.statusCode = statusCode;
        this.data = null
        this.message = message;
        this.success = false;
        this.errors = errors;

        if(stack) {
            this.stack = stack
        }
        else{
            Error.captureStack(this, this.constructor)
        }
    }
}
export {ApiError};




/*class ApiError extends Error {
    constructor(code, message) {
        super(message); // Call the parent class constructor
        this.code = code;

        // Capture the stack trace (only works if this is an instance of Error)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };*/