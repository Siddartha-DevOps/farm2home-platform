 Run with: psql -U postgres -d farm2home -f 001_initial_schema.sql
-- (For MongoDB/Mongoose projects, use this as reference for your schema design)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'farmer', 'admin')),
  avatar      TEXT,
  phone       VARCHAR(15),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Farmers profile (extends users where role='farmer')
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_name   VARCHAR(150),
  location    VARCHAR(200),
  bio         TEXT,
  verified    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(150) NOT NULL,
  description  TEXT,
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  unit         VARCHAR(20) DEFAULT 'kg',
  category     VARCHAR(50) NOT NULL,
  images       TEXT[],           -- array of image URLs
  avg_rating   NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Indexes for common product queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_farmer   ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active);

-- Cart table
CREATE TABLE IF NOT EXISTS carts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id    UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL CHECK (quantity >= 1),
  price      NUMERIC(10,2) NOT NULL,  -- snapshot at add-time
  UNIQUE(cart_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id),
  total_amount        NUMERIC(10,2) NOT NULL,
  delivery_fee        NUMERIC(10,2) DEFAULT 0,
  status              VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','packed','shipped','delivered','cancelled')),
  payment_method      VARCHAR(20) CHECK (payment_method IN ('cod','online')),
  payment_status      VARCHAR(20) DEFAULT 'pending'
                        CHECK (payment_status IN ('pending','awaiting','paid','failed','refunded')),
  razorpay_order_id   VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  paid_at             TIMESTAMP,
  -- Shipping address (denormalized for immutability)
  street     VARCHAR(200),
  city       VARCHAR(100),
  state      VARCHAR(100),
  pincode    VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name       VARCHAR(150) NOT NULL,  -- snapshot
  price      NUMERIC(10,2) NOT NULL, -- snapshot
  quantity   INTEGER NOT NULL
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, user_id)        -- one review per user per product
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
