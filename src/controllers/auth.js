import { loginUser, logoutUser, refreshUsersSession, registerUser } from '../services/auth.js';

const setupSession = (res, session) => {
    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        expires: session.refreshTokenValidUntil,
    });
    res.cookie('sessionId', session._id, {
        httpOnly: true,
        expires: session.refreshTokenValidUntil,
    });
};

export const registerUserController = async (req, res) => {
    const user = await registerUser(req.body);

    res.status(201).json({
        status: 201,
        message: 'Successfully registered a user!',
        data: user,
    });
};

export const loginUserController = async (req, res) => {
    const { email, password } = req.body;
    const session = await loginUser(email, password);

    setupSession(res, session);

    res.json({
        status: 200,
        message: 'Successfully logged in an user!',
        data: {
            accessToken: session.accessToken,
        },
    });
};

export const logoutUserController = async (req, res) => {
    const { sessionId } = req.cookies;

    if (sessionId) {
        await logoutUser(req.cookies.sessionId);
    };

    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.status(204).end();
};

export const refreshUserSessionController = async (req, res) => {
    const { sessionId, refreshToken } = req.cookies;

    const session = await refreshUsersSession(sessionId, refreshToken);

    setupSession(res, session);

    res.json({
        status: 200,
        message: 'Successfully refreshed a session!',
        data: {
            accessToken: session.accessToken,
        },
    });
};
