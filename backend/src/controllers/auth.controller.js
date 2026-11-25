const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

const authResponse = (user) => ({ token: generateToken(user._id), user });

// POST /auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, 'Email already registered');
  const user = await User.create({ name, email, password }); // role is NEVER taken from the body
  res.status(201).json({ success: true, message: 'Account created', data: authResponse(user) });
});

// POST /auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Invalid email or password');
  if (!user.isActive) throw new ApiError(403, 'Your account is deactivated');
  res.json({ success: true, message: 'Logged in', data: authResponse(user) });
});

// GET /auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// PUT /auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  req.user.name = req.body.name;
  await req.user.save();
  res.json({ success: true, message: 'Profile updated', data: req.user });
});

// PUT /auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) throw new ApiError(400, 'Current password is wrong');
  user.password = req.body.newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed' });
});
