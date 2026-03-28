/ database/seeds/seed.js
// npm install mongoose bcryptjs dotenv
// Run: node database/seeds/seed.js

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Adjust these paths to your actual model locations
const User    = require('../../backend/models/User');
const Product = require('../../backend/models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farm2home';

const users = [
  { name: 'Admin User',      email: 'admin@farm2home.com',   password: 'Admin@123',   role: 'admin'  },
  { name: 'Ravi Reddy',      email: 'ravi@farm2home.com',    password: 'Farmer@123',  role: 'farmer' },
  { name: 'Lakshmi Devi',    email: 'lakshmi@farm2home.com', password: 'Farmer@123',  role: 'farmer' },
  { name: 'Test Buyer',      email: 'buyer@farm2home.com',   password: 'Buyer@123',   role: 'buyer'  },
];

const products = (farmerId1, farmerId2) => [
  { name: 'Fresh Tomatoes',     price: 40,  stock: 200, unit: 'kg',     category: 'vegetables', farmer: farmerId1, description: 'Freshly harvested red tomatoes from Narayanpet farms.' },
  { name: 'Organic Onions',     price: 35,  stock: 150, unit: 'kg',     category: 'vegetables', farmer: farmerId1, description: 'Organically grown red onions, no pesticides.' },
  { name: 'Green Chillies',     price: 60,  stock: 80,  unit: 'kg',     category: 'vegetables', farmer: farmerId1, description: 'Spicy green chillies, perfect for Indian cooking.' },
  { name: 'Alphonso Mangoes',   price: 200, stock: 100, unit: 'dozen',  category: 'fruits',     farmer: farmerId1, description: 'Premium Alphonso mangoes from Ratnagiri.' },
  { name: 'Banana (Yelakki)',   price: 50,  stock: 60,  unit: 'dozen',  category: 'fruits',     farmer: farmerId2, description: 'Sweet Yelakki bananas, handpicked daily.' },
  { name: 'Toor Dal',           price: 130, stock: 300, unit: 'kg',     category: 'grains',     farmer: farmerId2, description: 'Premium quality toor dal from Gulbarga.' },
  { name: 'Raw Rice (Sona)',    price: 55,  stock: 500, unit: 'kg',     category: 'grains',     farmer: farmerId2, description: 'Freshly milled Sona Masuri raw rice.' },
  { name: 'Buffalo Milk',       price: 70,  stock: 50,  unit: 'litre',  category: 'dairy',      farmer: farmerId2, description: 'Fresh buffalo milk delivered daily from Medak.' },
  { name: 'Curry Leaves',       price: 15,  stock: 100, unit: 'bunch',  category: 'herbs',      farmer: farmerId1, description: 'Fresh curry leaves, packed in 100g bunches.' },
  { name: 'Coriander Leaves',   price: 20,  stock: 80,  unit: 'bunch',  category: 'herbs',      farmer: farmerId1, description: 'Fresh green coriander from Sangareddy farms.' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      users.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 10) }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Seeded ${createdUsers.length} users`);

    const farmer1 = createdUsers.find((u) => u.email === 'ravi@farm2home.com')._id;
    const farmer2 = createdUsers.find((u) => u.email === 'lakshmi@farm2home.com')._id;

    const createdProducts = await Product.insertMany(products(farmer1, farmer2));
    console.log(`Seeded ${createdProducts.length} products`);

    console.log('\n--- Seed complete! Login credentials ---');
    console.log('Admin:  admin@farm2home.com  /  Admin@123');
    console.log('Farmer: ravi@farm2home.com   /  Farmer@123');
    console.log('Buyer:  buyer@farm2home.com  /  Buyer@123');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
