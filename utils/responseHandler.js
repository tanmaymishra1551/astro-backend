export const ApiError = (statusCode, message = "Error", details = null) => {
    return {
        statusCode,
        success: false,
        message,
        error: details,
    };
};


export const ApiResponse = (statusCode, data = null, message = "Success") => {
    return {
        statusCode,
        success: statusCode >= 200 && statusCode < 300,
        message,
        data,
    };
};
