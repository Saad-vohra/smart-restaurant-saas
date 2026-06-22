const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');
const { auth } = require('../middleware/auth');

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// Register a new restaurant (SaaS sign-up) — creates the tenant + its first admin user
router.post('/register', async (req, res) => {
  try {
    const { restaurantName, ownerName, email, password, phone, address } = req.body;
    if (!restaurantName || !ownerName || !email || !password) {
      return res.status(400).json({ message: 'Restaurant name, owner name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    let baseSlug = slugify(restaurantName) || 'restaurant';
    let slug = baseSlug;
    let i = 1;
    while (await Restaurant.findOne({ slug })) {
      slug = `${baseSlug}-${i++}`;
    }

    const restaurant = await Restaurant.create({
      name: restaurantName,
      slug,
      email: email.toLowerCase(),
      phone: phone || '',
      address: address || ''
    });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      restaurantId: restaurant._id,
      name: ownerName,
      email: email.toLowerCase(),
      password: hash,
      role: 'admin'
    });

    // Seed a few starter tables so the dashboard isn't empty
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      tables.push({ restaurantId: restaurant._id, tableNumber: i, capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2 });
    }
    await Table.insertMany(tables);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      restaurant: { id: restaurant._id, name: restaurant.name, slug: restaurant.slug, plan: restaurant.plan }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.active) return res.status(400).json({ message: 'Account is deactivated' });

    const restaurant = await Restaurant.findById(user.restaurantId);
    if (!restaurant || !restaurant.active) {
      return res.status(403).json({ message: 'This restaurant account is inactive. Please contact support.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      restaurant: { id: restaurant._id, name: restaurant.name, slug: restaurant.slug, plan: restaurant.plan }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({ ...req.user.toObject(), restaurant: req.restaurant });
});

module.exports = router;
