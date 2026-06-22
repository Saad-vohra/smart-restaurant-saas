const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Table = require('../models/Table');
const { auth } = require('../middleware/auth');

// Get all orders
router.get('/', auth, async (req, res) => {
  try {
    const filter = { restaurantId: req.restaurantId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.tableNumber) filter.tableNumber = req.query.tableNumber;
    if (req.query.active === 'true') {
      filter.status = { $nin: ['completed', 'cancelled'] };
    }
    const orders = await Order.find(filter).sort('-createdAt').limit(100);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      restaurantId: req.restaurantId,
      waiterId: req.user._id,
      waiterName: req.user.name
    });
    await order.save();

    await Table.findOneAndUpdate(
      { _id: req.body.tableId, restaurantId: req.restaurantId },
      { status: 'occupied', currentOrderId: order._id, customerCount: req.body.customerCount || 1 }
    );

    const io = req.app.get('io');
    const room = `restaurant-${req.restaurantId}`;
    io.to(`kitchen-${req.restaurantId}`).emit('new-order', order);
    io.to(room).emit('table-updated');
    io.to(room).emit('order-created', order);

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update order status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, restaurantId: req.restaurantId },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const io = req.app.get('io');
    const room = `restaurant-${req.restaurantId}`;
    io.to(room).emit('order-status-updated', order);

    if (status === 'completed' || status === 'cancelled') {
      await Table.findOneAndUpdate(
        { _id: order.tableId, restaurantId: req.restaurantId },
        { status: 'available', currentOrderId: null, customerCount: 0 }
      );
      io.to(room).emit('table-updated');
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update order items
router.put('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, restaurantId: req.restaurantId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const update = { ...req.body };
    delete update.restaurantId;
    Object.assign(order, update);
    await order.save();

    const io = req.app.get('io');
    io.to(`kitchen-${req.restaurantId}`).emit('order-updated', order);

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
