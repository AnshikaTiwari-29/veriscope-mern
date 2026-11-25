const User = require('../models/User');
const Analysis = require('../models/Analysis');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /users?page=1&limit=10&search=riya   (admin)
exports.getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const filter = {};
  if (req.query.search) {
    const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
});

// PATCH /users/:id  { role, isActive }   (admin)
exports.updateUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) throw new ApiError(400, 'You cannot change your own account here');
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (req.body.role !== undefined) user.role = req.body.role;
  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  await user.save();
  res.json({ success: true, message: 'User updated', data: user });
});

// DELETE /users/:id   (admin) - also deletes the user's checks
exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) throw new ApiError(400, 'You cannot delete yourself');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  await Analysis.deleteMany({ createdBy: user._id });
  res.json({ success: true, message: 'User deleted' });
});
