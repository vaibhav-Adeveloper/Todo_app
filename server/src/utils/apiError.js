// template for API error

class ApiError extends Error {
    constructor(statusCode, message="Something went wrong", errors=[], stack=null){
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.errors = errors;
        this.success = false;
        if(stack){
            this.stack = stack;
        }
    }
}


export {ApiError};