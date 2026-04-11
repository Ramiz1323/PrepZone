import jwt from 'jsonwebtoken';
import { User } from './auth.model.js';
import { env } from '../../shared/config/env.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered. Please login.');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      streak: user.streak,
      createdAt: user.createdAt,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      streak: user.streak,
      createdAt: user.createdAt,
    },
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  const { password, ...safeUser } = user;
  return safeUser;
};

export const updateDailyGoal = async (userId, goal) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { dailyMCQGoal: goal },
    { new: true, runValidators: true }
  ).lean();

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const { password, ...safeUser } = user;
  return safeUser;
};
