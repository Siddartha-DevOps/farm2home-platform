// backend/tests/orders.test.js
// npm install --save-dev jest supertest mongodb-memory-server

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // your Express app export
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

let mongoServer;
let buyerToken, farmerToken;
let testProduct;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Seed a buyer user token
  buyerToken = jwt.sign({ id: new mongoose.Types.ObjectId(), role: 'buyer' }, process.env.JWT_SECRET || 'testsecret');
  farmerToken = jwt.sign({ id: new mongoose.Types.ObjectId(), role: 'farmer' }, process.env.JWT_SECRET || 'testsecret');

  testProduct = await Product.create({
    name: 'Test Tomatoes',
    price: 40,
    stock: 100,
    category: 'vegetables',
    farmer: new mongoose.Types.ObjectId(),
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Order.deleteMany({});
});

describe('POST /api/orders', () => {
  it('should return 401 if no token provided', async () => {
    const res = await request(app).post('/api/orders').send({});
    expect(res.status).toBe(401);
  });

  it('should return 422 if items is missing', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ paymentMethod: 'cod' });
    expect(res.status).toBe(422);
  });

  it('should create an order successfully', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        items: [{ productId: testProduct._id, quantity: 2 }],
        shippingAddress: { street: '123 Main St', city: 'Hyderabad', pincode: '500001' },
        paymentMethod: 'cod',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAmount).toBe(80);
  });
});

describe('GET /api/orders', () => {
  it('should return user orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('PATCH /api/orders/:id/status', () => {
  it('should allow farmer to update order status', async () => {
    const order = await Order.create({
      user: new mongoose.Types.ObjectId(),
      items: [{ product: testProduct._id, name: 'Tomatoes', price: 40, quantity: 1 }],
      shippingAddress: { street: 'st', city: 'city', pincode: '500001' },
      paymentMethod: 'cod',
      totalAmount: 40,
    });

    const res = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('confirmed');
  });

  it('should deny buyer from updating order status', async () => {
    const order = await Order.create({
      user: new mongoose.Types.ObjectId(),
      items: [{ product: testProduct._id, name: 'Tomatoes', price: 40, quantity: 1 }],
      shippingAddress: { street: 'st', city: 'city', pincode: '500001' },
      paymentMethod: 'cod',
      totalAmount: 40,
    });

    const res = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'confirmed' });

    expect(res.status).toBe(403);
  });
});
