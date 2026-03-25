// ─── Mock Data ─────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "Organic Tomatoes", farmer: "Ravi Kumar", farmerId: 1, location: "Pune, MH", price: 45, unit: "kg", rating: 4.8, reviews: 234, stock: 150, category: "Vegetables", organic: true, img: "🍅", discount: 10, deliveryDays: 1 },
  { id: 2, name: "Fresh Spinach", farmer: "Lakshmi Devi", farmerId: 2, location: "Nashik, MH", price: 30, unit: "bunch", rating: 4.6, reviews: 189, stock: 80, category: "Leafy Greens", organic: true, img: "🥬", discount: 0, deliveryDays: 1 },
  { id: 3, name: "Alphonso Mangoes", farmer: "Suresh Patil", farmerId: 3, location: "Ratnagiri, MH", price: 320, unit: "dozen", rating: 4.9, reviews: 567, stock: 40, category: "Fruits", organic: false, img: "🥭", discount: 15, deliveryDays: 2 },
  { id: 4, name: "Baby Potatoes", farmer: "Meera Singh", farmerId: 4, location: "Shimla, HP", price: 55, unit: "kg", rating: 4.5, reviews: 143, stock: 200, category: "Vegetables", organic: false, img: "🥔", discount: 0, deliveryDays: 2 },
  { id: 5, name: "Green Capsicum", farmer: "Ravi Kumar", farmerId: 1, location: "Pune, MH", price: 60, unit: "kg", rating: 4.7, reviews: 98, stock: 60, category: "Vegetables", organic: true, img: "🫑", discount: 5, deliveryDays: 1 },
  { id: 6, name: "Strawberries", farmer: "Anita Sharma", farmerId: 5, location: "Mahabaleshwar, MH", price: 180, unit: "250g", rating: 4.8, reviews: 412, stock: 30, category: "Fruits", organic: true, img: "🍓", discount: 20, deliveryDays: 1 },
  { id: 7, name: "Sweet Corn", farmer: "Suresh Patil", farmerId: 3, location: "Ratnagiri, MH", price: 25, unit: "piece", rating: 4.4, reviews: 76, stock: 120, category: "Vegetables", organic: false, img: "🌽", discount: 0, deliveryDays: 1 },
  { id: 8, name: "Dragon Fruit", farmer: "Anita Sharma", farmerId: 5, location: "Mahabaleshwar, MH", price: 220, unit: "kg", rating: 4.6, reviews: 203, stock: 25, category: "Fruits", organic: true, img: "🍈", discount: 10, deliveryDays: 2 },
];

const FARMERS = [
  { id: 1, name: "Ravi Kumar", location: "Pune, MH", rating: 4.8, products: 12, orders: 1240, joined: "2022", avatar: "👨‍🌾", verified: true, totalRevenue: 284000, pendingOrders: 8 },
  { id: 2, name: "Lakshmi Devi", location: "Nashik, MH", rating: 4.6, products: 8, orders: 890, joined: "2023", avatar: "👩‍🌾", verified: true, totalRevenue: 178000, pendingOrders: 3 },
  { id: 3, name: "Suresh Patil", location: "Ratnagiri, MH", rating: 4.9, products: 15, orders: 2100, joined: "2021", avatar: "👨‍🌾", verified: true, totalRevenue: 520000, pendingOrders: 14 },
];

const ORDERS = [
  { id: "ORD-2401", product: "Alphonso Mangoes", qty: 2, total: 544, status: "delivered", date: "2024-01-15", farmer: "Suresh Patil", img: "🥭", tracking: ["ordered", "confirmed", "packed", "shipped", "delivered"] },
  { id: "ORD-2389", product: "Organic Tomatoes", qty: 3, total: 121, status: "shipped", date: "2024-01-18", farmer: "Ravi Kumar", img: "🍅", tracking: ["ordered", "confirmed", "packed", "shipped"] },
  { id: "ORD-2401", product: "Strawberries", qty: 1, total: 144, status: "packed", date: "2024-01-20", farmer: "Anita Sharma", img: "🍓", tracking: ["ordered", "confirmed", "packed"] },
];

export const CATEGORIES = ["All", "Vegetables", "Fruits", "Leafy Greens", "Herbs", "Grains", "Dairy"];
