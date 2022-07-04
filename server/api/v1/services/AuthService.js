import User from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';

export const createUser = async (username, firstName, lastName, email, password) => {
    await User.create({ username, firstName, lastName, email, password });
}

export const findExistingUser = async (email) => {
    const user = await User.findOne({ email }).select('+password');

    if (!user) throw new Error('Invalid credentials');

    return user;
}

export const checkIfPasswordsMatch = async (user, password) => {
    const match = await bcrypt.compare(password, user.password);

    if (!match) throw new Error('Incorrect password');

    return match;
}

export const getToken = async (user) => {
    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    if (!token) throw new Error('Failed to create token');

    return token;
}

export const setResetPasswordTokenAndExpiration = async (user, resetToken, error) => {
    if (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiration = undefined;
        await user.save();

        throw new Error('Failed to set reset password token and expiration');
    } else {
        user.resetPasswordToken = resetToken
        user.resetPasswordExpiration = Date.now() + (60 * 1000);
        await user.save();
    }
}

export const sendEmail = (options) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.text,
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            throw new Error(err);
        } else {
            throw info;
        }
    });
}

export const findUserByResetPasswordToken = async (resetPasswordToken) => {
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpiration: { $gt: Date.now() },
    });

    if (!user) throw new Error('Invalid reset password token');

    return user;
}

export const updateUserPassword = async (user, newPassword) => {
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiration = undefined;
    await user.save();
}