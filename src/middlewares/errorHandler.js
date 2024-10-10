import { isHttpError } from 'http-errors';



export const errorHandler = (err, req, res, next) => {
    if (isHttpError(err) === true) {
        return res.status(err.status).json({
            status: err.status,
            message: err.name,
            data: err,
        });
    }


    res.status(500).json({
        message: 'Something went wrong',
        error: err.message,
    });
};
