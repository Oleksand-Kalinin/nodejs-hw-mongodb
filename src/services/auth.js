import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import createHttpError from 'http-errors';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';

const createSession = () => {
    const accessToken = crypto.randomBytes(30).toString('base64');
    const refreshToken = crypto.randomBytes(30).toString('base64');

    return {
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
    };
};

// REGISTER USER
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

// LOGIN USER
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

    const newSession = createSession();

    return await SessionsCollection.create({
        userId: user._id,
        ...newSession,
    });
};

// LOGOUT USER
export const logoutUser = async (sessionId) => {
    await SessionsCollection.deleteOne({ _id: sessionId });
};

// REFRESH SESSION
export const refreshUsersSession = async (sessionId, refreshToken) => {
    const session = await SessionsCollection.findOne({
        _id: sessionId,
        refreshToken,
    });

    if (!session) {
        throw createHttpError(401, 'Session not found');
    }

    const isSessionTokenExpired =
        new Date() > new Date(session.refreshTokenValidUntil);

    if (isSessionTokenExpired) {
        throw createHttpError(401, 'Session token expired');
    }

    const newSession = createSession();

    await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

    return await SessionsCollection.create({
        userId: session.userId,
        ...newSession,
    });
};
