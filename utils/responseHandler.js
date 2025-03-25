export const ApiError = (statusCode, message = "Error", details = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.success = false;
    error.error = details;
    throw error; // Throw the error to stop execution
};



export const ApiResponse = (statusCode, data = null, message = "Success") => {
    return {
        statusCode,
        success: statusCode >= 200 && statusCode < 300,
        message,
        data,
    };
};
