// ============================================================
// Standard API Error Response
// FR-29 — Display Error Messages
// ============================================================

const sendError = (
    res,
    statusCode,
    code,
    message,
    details = null
) => {

    const response = {
        success: false,

        error: {
            code,
            message
        }
    };

    if (details) {
        response.error.details = details;
    }

    return res.status(statusCode).json(response);
};

module.exports = sendError;