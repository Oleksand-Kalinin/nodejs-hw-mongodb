import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import createHttpError from 'http-errors';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendMail.js';

import { FIFTEEN_MINUTES, SMTP, TEMPLATES_DIR, THIRTY_DAYS } from '../constants/index.js';

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

// SEND EMAIL "RESET PASSWORD"
export const requestResetToken = async (email) => {
    const user = await UsersCollection.findOne({ email });

    if (!user) {
        throw createHttpError(404, 'User not found');
    }

    const resetToken = jwt.sign(
        {
            sub: user._id,
            email,
        },
        env('JWT_SECRET'),
        {
            expiresIn: '5m',
        },
    );

    const resetPasswordTemplatePath = path.join(
        TEMPLATES_DIR,
        'reset-password-email.html',
    );

    const templateSource = (
        await fs.readFile(resetPasswordTemplatePath)
    ).toString();

    const template = handlebars.compile(templateSource);
    const html = template({
        name: user.name,
        link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
    });

    try {
        await sendEmail({
            from: env(SMTP.SMTP_FROM),
            to: email,
            subject: 'Reset your password',
            html,
        });
    } catch (error) {
        console.error(error);
        throw createHttpError(500, "Failed to send the email, please try again later.");
    }
};

// RESET PASSWORD
export const resetPassword = async (token, password) => {
    try {
        const entries = jwt.verify(token, process.env.JWT_SECRET);

        const user = await UsersCollection.findOne({ _id: entries.sub, email: entries.email });

        if (user === null) {
            throw createHttpError(404, 'User not found');
        }

        await SessionsCollection.deleteOne({ userId: user._id });

        const encryptedPassword = await bcrypt.hash(password, 10);

        await UsersCollection.findByIdAndUpdate(user._id, { password: encryptedPassword });
    } catch (error) {
        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError'
        ) {
            throw createHttpError(401, 'Token error');
        }

        throw error;
    }
};
