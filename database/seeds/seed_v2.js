// database/seeds/seed_v2.js
// Extended seed — adds demand alerts, subscriptions, bulk orders
// Run: node database/seeds/seed_v2.js
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

const DemandAlert  = require('../../backend/models/DemandAlert');
const Subscription = require('../../backend/models/Subscription');
const BulkOrder    = require('../../backend/models/BulkOrder');
const User         = require('../../backend/models/User');
const Product      = require('../../backend/models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farm2home';

async function seedV2() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const buyer  = await User.findOne({ role: 'buyer' });
  const farmer = await User.findOne({ role: 'farmer' });
  const mango  = await Product.findOne({ name: /mango/i });
  const milk   = await Product.findOne({ name: /milk/i });
  const tomato = await Product.findOne({ name: /tomato/i });
  const onion  = await Product.findOne({ name: /onion/i });

  if (!buyer || !farmer) {
    console.error('Run seed.js first to create base users');
    process.exit(1);
  }

  await DemandAlert.deleteMany({});
  await Subscription.deleteMany({});
  await BulkOrder.deleteMany({});

  // ── Demand Alerts ────────────────────────────────────────────────────────────
  await DemandAlert.insertMany([
    {
      postedBy:     buyer._id,
      buyerType:    'hotel',
      buyerName:    'Taj Hotel Hyderabad',
      cropName:     'Mango',
      category:     'fruits',
      quantityKg:   2000,
      offerPrice:   45,
      isOrganic:    false,
      neededBy:     new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deliveryCity: 'Hyderabad',
      deliveryState:'Telangana',
      radiusKm:     150,
      status:       'open',
      expiresAt:    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      postedBy:     buyer._id,
      buyerType:    'wholesaler',
      buyerName:    'Bowenpally Wholesale Market',
      cropName:     'Tomato',
      category:     'vegetables',
      quantityKg:   5000,
      offerPrice:   28,
      isOrganic:    false,
      neededBy:     new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      deliveryCity: 'Hyderabad',
      deliveryState:'Telangana',
      radiusKm:     200,
      status:       'open',
      expiresAt:    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      postedBy:     buyer._id,
      buyerType:    'retailer',
      buyerName:    'Reliance Fresh — Banjara Hills',
      cropName:     'Organic Vegetables Assortment',
      category:     'vegetables',
      quantityKg:   500,
      offerPrice:   55,
      isOrganic:    true,
      neededBy:     new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      deliveryCity: 'Hyderabad',
      deliveryState:'Telangana',
      radiusKm:     100,
      status:       'open',
      expiresAt:    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  ]);
  console.log('Seeded 3 demand alerts');

  // ── Subscriptions ─────────────────────────────────────────────────────────────
  if (milk && tomato) {
    await Subscription.insertMany([
      {
        buyer:       buyer._id,
        name:        'Daily Dairy Pack',
        items: [{ product: milk._id, productName: 'Buffalo Milk', quantityKg: 5, unit: 'litre', pricePerUnit: 70 }],
        frequency:   'daily',
        deliverySlot:'6am-9am',
        shippingAddress: { street: '12-1-123, Mehdipatnam', city: 'Hyderabad', state: 'Telangana', pincode: '500028' },
        startDate:   new Date(),
        nextDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        totalPerCycle: 350,
        status:      'active',
        paymentMethod: 'cod',
      },
      {
        buyer:       buyer._id,
        name:        'Weekly Vegetable Box',
        items: [
          { product: tomato?._id, productName: 'Fresh Tomatoes', quantityKg: 5, unit: 'kg', pricePerUnit: 40 },
          { product: onion?._id,  productName: 'Organic Onions', quantityKg: 3, unit: 'kg', pricePerUnit: 35 },
        ],
        frequency:    'weekly',
        deliveryDays: [1, 4],  // Monday and Thursday
        deliverySlot: '9am-12pm',
        shippingAddress: { street: '12-1-123, Mehdipatnam', city: 'Hyderabad', state: 'Telangana', pincode: '500028' },
        startDate:    new Date(),
        nextDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        totalPerCycle: 305,
        status:       'active',
        paymentMethod:'cod',
      },
    ]);
    console.log('Seeded 2 subscriptions');
  }

  // ── Bulk Orders ───────────────────────────────────────────────────────────────
  await BulkOrder.insertMany([
    {
      buyer:      buyer._id,
      buyerType:  'hotel',
      buyerName:  'ITC Grand Kakatiya',
      items: [
        { productName: 'Tomatoes',  quantityKg: 100, unit: 'kg',    requestedPrice: 35 },
        { productName: 'Onions',    quantityKg: 200, unit: 'kg',    requestedPrice: 30 },
        { productName: 'Coriander', quantityKg: 10,  unit: 'bunch', requestedPrice: 15 },
      ],
      totalQuantityKg: 310,
      deliveryDate:    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      deliveryAddress: { street: 'Begumpet', city: 'Hyderabad', state: 'Telangana', pincode: '500016' },
      status:          'submitted',
      paymentStatus:   'unpaid',
      specialInstructions: 'All vegetables must be Grade A quality. Delivery before 6 AM.',
    },
  ]);
  console.log('Seeded 1 bulk order');

  console.log('\nSeed V2 complete!');
  process.exit(0);
}

seedV2().catch((e) => { console.error(e); process.exit(1); });