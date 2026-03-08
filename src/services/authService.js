const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt
  };
}

async function signup({ name, email, password, role }) {
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    const error = new Error('User already exists with this email');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role: role || 'agent' });

  const token = signToken(user);
  return { token, user: publicUser(user) };
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);
  return { token, user: publicUser(user) };
}

async function me(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return publicUser(user);
}

module.exports = {
  signup,
  login,
  me
};
