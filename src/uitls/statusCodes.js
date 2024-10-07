const { StatusCodes } = require('http-status-codes');

module.exports = {
    badRequest: StatusCodes.BAD_REQUEST,
    notFound: StatusCodes.NOT_FOUND,
    internalServerError: StatusCodes.INTERNAL_SERVER_ERROR,
    created: StatusCodes.CREATED,
    ok: StatusCodes.OK,
    unauthorized: StatusCodes.UNAUTHORIZED,
    forbidden: StatusCodes.FORBIDDEN,
    reqTimeout: StatusCodes.REQUEST_TIMEOUT,
    paymentRequired: StatusCodes.PAYMENT_REQUIRED,
}