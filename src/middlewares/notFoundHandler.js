import createHttpError from 'http-errors';

export const notFoundHandler = (req, res, next) => {
    return next(createHttpError(404, 'Route not found'));
};
