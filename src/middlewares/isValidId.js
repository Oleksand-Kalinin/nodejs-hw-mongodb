import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';

export const isValidId = (nameId) => {
    return (req, res, next) => {
        const id = req.params[nameId];
        if (!isValidObjectId(id)) {
            return next(createHttpError(400, 'Bad Request'));
        }

        next();
    };
};

