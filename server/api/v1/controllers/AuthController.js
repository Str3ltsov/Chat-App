import {
    createUser,
    findExistingUser,
    checkIfPasswordsMatch,
    getToken,
    setResetPasswordTokenAndExpiration,
    sendEmail,
    findUserByResetPasswordToken,
    updateUserPassword
} from "../services/AuthService.js";

export const register = async (req, res) => {
    const { username, firstName, lastName, email, password } = req.body;
    try {
        await createUser(username, firstName, lastName, email, password);

        res.status(201).json({
            status: res.statusCode,
            success: true,
            message: 'Successfully registered account'
        });
    }
    catch (error) {
        res.status(500).json({
            status: res.statusCode,
            success: false,
            message: error.message || error
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({
            status: res.statusCode,
            success: false,
            message: 'Please provide email and password'
        });
        return;
    }

    try {
        const user = await findExistingUser(email);
        await checkIfPasswordsMatch(user, password);

        const accessToken = await getToken(user);
        await res.cookie("accessToken", accessToken, { maxAge: 86400000 });

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: 'Successfully logged in',
            accessToken
        });
    }
    catch (error) {
        res.status(500).json({
            status: res.statusCode,
            success: false,
            message: error.message || error,
        });
    }
};

export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await findExistingUser(email);
        const resetPasswordToken = await getToken(user);
        const error = false;

        await setResetPasswordTokenAndExpiration(user, resetPasswordToken, error);

        const resetUrl = `http://localhost:${process.env.API_PORT}/resetpassword/${resetPasswordToken}`
        const message = `
            <h3>Greetings, ${user.username}</h3>
            <p>Your reset password request has been delivered.</p>
            <p>Note that the reset link has a duration of 1 minute.</p>
            <div>
                <span>Reset password link:</span>
                <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
            </div>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Reset Password Request',
                text: message,
            });

            res.status(200).json({
                status: res.statusCode,
                success: true,
                message: 'Successfully sent Reset Password Request',
                resetPasswordToken
            });
        }
        catch (error) {
            await setResetPasswordTokenAndExpiration(user, resetPasswordToken, error);

            res.status(400).json({
                status: res.statusCode,
                success: false,
                message: error.message || error,
            });
        }
    }
    catch (error) {
        res.status(500).json({
            status: res.statusCode,
            success: false,
            message: error.message || error
        });
    }
}

export const resetPassword = async (req, res, next) => {
    const { resetPasswordToken } = req.params
    const { newPassword, confirmPassword } = req.body;

    try {
        const user = await findUserByResetPasswordToken(resetPasswordToken);

        if (newPassword !== confirmPassword) {
            res.status(404).json({
                status: res.statusCode,
                success: false,
                message: "Passwords do not match"
            });
            return;
        }

        await updateUserPassword(user, newPassword)

        res.status(200).json({
            status: res.statusCode,
            success: true,
            message: "Successfully updated password"
        });
    } catch (error) {
        res.status(500).json({
            status: res.statusCode,
            success: false,
            message: error.message || error
        });
    }
}