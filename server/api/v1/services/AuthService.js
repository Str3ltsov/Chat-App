import User from "../models/User.js";

export const createUser = async (res, username, firstName, lastName, email, password) => {
    await User.create({ username, firstName, lastName, email, password });

    res.status(201).json({
        status: res.statusCode,
        success: true,
        message: 'Successfully registered account'
    });
}

export const findExistingUser = async (res, email) => {
    const user = await User.findOne({ email }).select('+password');

    if (!user)
        res.status(400).json({
            status: res.statusCode,
            success: false,
            message: 'Invalid credentials'
        });

    return user;
}

export const checkIfPasswordsMatch = async (res, user, password) => {
    const match = await user.matchPasswords(password);

    if (!match)
        res.status(404).json({
            status: res.statusCode,
            success: false,
            message: 'Passwords do not match',
        });
}

export const getToken = async (res, user) => {
    const token = await user.createSignedToken();

    if (!token)
        res.status(400).json({
            status: res.statusCode,
            success: false,
            message: 'Token not found'
        });

    return token;
}

export const storeTokenAsCookie = async (res, token) => {
    await res.cookie("token", token, {
        maxAge: 86400000
    });
}