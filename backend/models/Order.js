const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  notes: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  orderNumber: { type: Number },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  tableNumber: { type: Number, required: true },
  waiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  waiterName: { type: String },
  items: [orderItemSchema],
  status: { type: String, enum: ['pending', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled'], default: 'pending' },
  totalAmount: { type: Number, default: 0 },
  customerCount: { type: Number, default: 1 },
  notes: { type: String, default: '' }
}, { timestamps: true });

orderSchema.index({ restaurantId: 1, orderNumber: 1 }, { unique: true });

orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastOrder = await this.constructor.findOne({ restaurantId: this.restaurantId }, {}, { sort: { orderNumber: -1 } });
    this.orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1001;
  }
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  next();
});

module.exports = mongoose.model('Order', orderSchema);
