import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
    {
        isAdmin: {
            type: Boolean,
            default: false,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            min: [6, 'Username must be no less than 6 characters'],
            max: [20, 'Username must be no more than 20 characters'],
        },
        firstName: {
            type: String,
            required: [true, 'First Name is required'],
            min: [2, 'First Name must be no less than 2 characters'],
            max: [20, 'First name must be no more than 20 characters'],
        },
        lastName: {
            type: String,
            required: [true, 'Last Name is required'],
            min: [2, 'Last Name must be no less than 2 characters'],
            max: [20, 'Last name must be no more than 20 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false,
        },
        resetPasswordToken: String,
        resetPasswordExpiration: Date,
    },
    { timestamps: true }
);

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

UserSchema.post('save', function (error, doc, next) {
    if (error.code === 11000) {
        error.keyPattern.username && next("This username is already taken");
        error.keyPattern.email && next("This email is already taken");
    }

    next(error);
});

UserSchema.methods.matchPasswords = async function (password) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.createSignedToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};

const User = mongoose.model('User', UserSchema);

export default User;
