// wrapper function to handle async request handlers.
// It ensures that any errors thrown in the async function are caught.
// promise syntax is used to handle the async function.
// promise syntax to catch errors and pass to next middleware.

export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    }
}