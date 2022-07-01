import User from "../models/User.js";
import {
    createUser,
    findExistingUser,
    checkIfPasswordsMatch,
    getToken,
    storeTokenAsCookie
} from "../services/AuthService.js";

export const register = async (req, res) => {
    const { username, firstName, lastName, email, password } = req.body;
    try {
        await createUser(res, username, firstName, lastName, email, password);
    }
    catch (error) {
        res.status(500).json({
            status: res.statusCode,
            success: false,
            error
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        res.status(400).json({
            status: res.statusCode,
            success: false,
            message: 'Please provide email and password'
        });

    try {
        const user = await findExistingUser(res, email);
        await checkIfPasswordsMatch(res, user, password);
        const token = await getToken(res, user);
        await storeTokenAsCookie(res, token);

        res.status(200).json({
            success: true,
            message: 'Successfully logged in',
            token
        });
    }
    catch (error) {
        res.status(500).json({
            status: res.statusCode,
            success: false,
            message: error.message,
        });
    }
};