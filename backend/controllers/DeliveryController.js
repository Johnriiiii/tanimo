const Delivery = require('../models/Delivery');
const Order = require('../models/Order');

// Get all deliveries for a vendor
exports.getVendorDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ vendor: req.user._id })
      .populate('orderId')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ message: 'Failed to fetch deliveries' });
  }
};

// Get a single delivery by ID
exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('orderId')
      .populate('customer', 'name email');

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Check if the user is authorized to view this delivery
    if (delivery.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this delivery' });
    }

    res.json(delivery);
  } catch (error) {
    console.error('Error fetching delivery:', error);
    res.status(500).json({ message: 'Failed to fetch delivery details' });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Check if the user is authorized to update this delivery
    if (delivery.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this delivery' });
    }

    delivery.status = status;
    await delivery.save();

    res.json(delivery);
  } catch (error) {
    console.error('Error updating delivery:', error);
    res.status(500).json({ message: 'Failed to update delivery status' });
  }
};

// Create a new delivery (store directly in Deliveries collection)
exports.createDelivery = async (req, res) => {
  try {
    const { address, expectedDeliveryDate, items, customer, orderId } = req.body;

    // Helper to generate a unique delivery order number
    function generateDeliveryOrderNumber() {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `DLV${timestamp}${random}`;
    }

    let orderNumber = null;
    let customerName = null;
    let orderObj = null;
    if (orderId) {
      orderObj = await Order.findById(orderId);
      if (orderObj) {
        orderNumber = orderObj.orderNumber;
        customerName = orderObj.customerContact?.name || undefined;
      }
    }
    if (!orderNumber) {
      orderNumber = generateDeliveryOrderNumber();
    }

    const delivery = new Delivery({
      orderId: orderId || undefined,
      orderNumber,
      customerName: customerName || undefined,
      status: 'pending',
      address,
      expectedDeliveryDate,
      items,
      customer: customer || req.user._id, // fallback to current user if not provided
      vendor: req.user._id
    });

    await delivery.save();
    res.status(201).json(delivery);
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({ message: 'Failed to create delivery' });
  }
};

// Health check endpoint
exports.healthCheck = async (req, res) => {
  try {
    res.json({ status: 'ok', message: 'Delivery service is running' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
