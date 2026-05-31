const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userService = require('../services/userService');
const AppError = require('../utils/appError');

exports.signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new AppError("Name,email and password are required", 400));

  }
  try {
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return next(new AppError("User already exists", 400));
    }
    const newUser = await userService.createUser(name, email, password);
    res.json({ message: 'Signup successful', user: newUser });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  try {
    const { token, expiresAt } = await userService.loginUser(email, password);
    res.json({
      message: 'Login successful',
      token,
      expiresAt
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
exports.refreshToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access token required', 401));
    }
    const token = authHeader.split(' ')[1].trim();

    const result = await userService.refreshAccessToken(token);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};


