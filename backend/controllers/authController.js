const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = async (user) => {
  const expiredAt = new Date();
  expiredAt.setSeconds(expiredAt.getSeconds() + 7 * 24 * 60 * 60); // 7 days

  const _token = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  const refreshToken = new RefreshToken({
    token: _token,
    userId: user._id,
    expiryDate: expiredAt,
  });

  await refreshToken.save();
  return _token;
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;
  if (!requestToken) {
    return res.status(403).json({ message: 'Refresh Token is required' });
  }

  try {
    const refreshToken = await RefreshToken.findOne({ token: requestToken });
    if (!refreshToken) {
      return res.status(403).json({ message: 'Refresh token is not in database' });
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      await RefreshToken.findByIdAndRemove(refreshToken._id);
      return res.status(403).json({ message: 'Refresh token was expired' });
    }

    const user = await User.findById(refreshToken.userId);
    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken, refreshToken: refreshToken.token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await RefreshToken.findOneAndDelete({ token: refreshToken });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
