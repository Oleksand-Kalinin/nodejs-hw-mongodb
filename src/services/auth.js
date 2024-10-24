import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import createHttpError from 'http-errors';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';


export const registerUser = async (payload) => {
    const user = await UsersCollection.findOne({ email: payload.email });

    if (user !== null) {
        throw createHttpError(409, 'Email in use');
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    return await UsersCollection.create({
        ...payload,
        password: encryptedPassword,
    });
};

export const loginUser = async (email, password) => {
    const user = await UsersCollection.findOne({ email });

    if (user === null) {
        throw createHttpError(401, 'Email or password is incorrect(email)');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch !== true) {
        throw createHttpError(401, 'Email or password is incorrect(password)');
    }

    await SessionsCollection.deleteOne({ userId: user._id });

    const accessToken = crypto.randomBytes(30).toString('base64');
    const refreshToken = crypto.randomBytes(30).toString('base64');

    return await SessionsCollection.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
    });

};
