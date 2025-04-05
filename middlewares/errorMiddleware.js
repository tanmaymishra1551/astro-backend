const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const details = err.error || null;

    return res.status(statusCode).json({
        success: false,
        message,
        details,
    });
};

export default errorMiddleware;
