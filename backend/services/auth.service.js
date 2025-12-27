import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../model/user.model.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendEmail.js';
import { welcomeTemplate } from '../utils/email-template/welcome.js';

const generateToken = (userId) => {
    return jwt.sign({ userId }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
};

export const authService = {
    async signup({ name, email, password, role, interests }) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            passwordHash: hashedPassword,
            role: role || 'student',
            interests: interests || [],
        });

        const token = generateToken(user._id);

        // Send welcome email (async)
        sendEmail({
            to: user.email,
            subject: 'Welcome to SkillCerts! 🎓',
            html: welcomeTemplate({
                userName: user.name,
                userEmail: user.email,
            }),
        }).catch((err) => console.error('Welcome email error:', err));

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isVerified: user.isVerified,
                interests: user.interests,
            },
            token,
        };
    },

    async signin({ email, password }) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const token = generateToken(user._id);

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                bio: user.bio,
                isVerified: user.isVerified,
            },
            token,
        };
    },

    async getMe(user) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
        };
    },
};
