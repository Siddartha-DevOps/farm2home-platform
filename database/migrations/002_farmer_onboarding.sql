-- database/migrations/002_farmer_onboarding.sql
-- New tables for Farmer App, Buyer App, and Admin features
-- Run after: 001_initial_schema.sql

-- ── Farmer Profiles (Aadhaar, location, crops) ───────────────────────────────
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_name           VARCHAR(150),
  farm_size_acres     NUMERIC(8,2),
  bio                 TEXT,

  -- Aadhaar (store encrypted in prod, only masked visible)
  aadhaar_masked      VARCHAR(20),
  aadhaar_verified    BOOLEAN DEFAULT FALSE,
  aadhaar_verified_at TIMESTAMP,

  -- Farm location
  address             VARCHAR(255),
  village             VARCHAR(100),
  district            VARCHAR(100),
  state               VARCHAR(100),
  pincode             VARCHAR(10),
  latitude            NUMERIC(10,7),
  longitude           NUMERIC(10,7),

  -- Verification
  verification_status VARCHAR(30) DEFAULT 'pending'
    CHECK (verification_status IN ('pending','documents_submitted','under_review','approved','rejected')),
  verification_note   TEXT,
  verified_by         UUID REFERENCES users(id),

  -- Bank for payouts (store encrypted in prod)
  bank_account_holder VARCHAR(150),
  bank_masked_account VARCHAR(20),
  bank_ifsc           VARCHAR(15),
  bank_name           VARCHAR(100),
  razorpay_fund_account_id VARCHAR(100),

  -- Stats (denormalized)
  total_orders        INTEGER DEFAULT 0,
  total_revenue       NUMERIC(14,2) DEFAULT 0,
  avg_rating          NUMERIC(3,2) DEFAULT 0,
  review_count        INTEGER DEFAULT 0,

  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_farmer_profiles_status ON farmer_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_location ON farmer_profiles(district, state);

-- ── Farmer Crop Types ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS farmer_crop_types (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id      UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  crop_name      VARCHAR(100) NOT NULL,
  category       VARCHAR(50),
  is_organic     BOOLEAN DEFAULT FALSE,
  season_months  INTEGER[],   -- e.g. ARRAY[3,4,5] = March-May
  certifications TEXT[],
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_types_farmer ON farmer_crop_types(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crop_types_name   ON farmer_crop_types(crop_name);

-- ── Demand Alerts ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demand_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by       UUID NOT NULL REFERENCES users(id),
  buyer_type      VARCHAR(20) CHECK (buyer_type IN ('household','retailer','hotel','wholesaler')),
  buyer_name      VARCHAR(150),
  crop_name       VARCHAR(100) NOT NULL,
  category        VARCHAR(50),
  quantity_kg     NUMERIC(10,2) NOT NULL,
  unit            VARCHAR(20) DEFAULT 'kg',
  offer_price     NUMERIC(10,2) NOT NULL,
  is_organic      BOOLEAN DEFAULT FALSE,
  needed_by       DATE NOT NULL,
  delivery_city   VARCHAR(100),
  delivery_state  VARCHAR(100),
  delivery_pincode VARCHAR(10),
  radius_km       INTEGER DEFAULT 100,
  status          VARCHAR(20) DEFAULT 'open'
    CHECK (status IN ('open','partially_filled','fulfilled','expired','cancelled')),
  expires_at      TIMESTAMP,
  views           INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demand_alerts_status    ON demand_alerts(status);
CREATE INDEX IF NOT EXISTS idx_demand_alerts_crop      ON demand_alerts(crop_name, status);
CREATE INDEX IF NOT EXISTS idx_demand_alerts_city      ON demand_alerts(delivery_city);
CREATE INDEX IF NOT EXISTS idx_demand_alerts_needed_by ON demand_alerts(needed_by);

-- ── Demand Alert Responses (farmer responses to buyer demands) ────────────────
CREATE TABLE IF NOT EXISTS demand_alert_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id        UUID NOT NULL REFERENCES demand_alerts(id) ON DELETE CASCADE,
  farmer_id       UUID NOT NULL REFERENCES users(id),
  offered_price   NUMERIC(10,2),
  offered_qty_kg  NUMERIC(10,2),
  message         TEXT,
  status          VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected')),
  responded_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(alert_id, farmer_id)   -- one response per farmer per alert
);

CREATE INDEX IF NOT EXISTS idx_dar_alert  ON demand_alert_responses(alert_id);
CREATE INDEX IF NOT EXISTS idx_dar_farmer ON demand_alert_responses(farmer_id);

-- ── Subscriptions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id         UUID NOT NULL REFERENCES users(id),
  name             VARCHAR(150),
  frequency        VARCHAR(20) CHECK (frequency IN ('daily','weekly','biweekly','monthly')),
  delivery_days    INTEGER[],    -- 0=Sun...6=Sat
  delivery_slot    VARCHAR(20),
  payment_method   VARCHAR(20) DEFAULT 'cod',
  total_per_cycle  NUMERIC(10,2),
  start_date       DATE NOT NULL,
  end_date         DATE,
  next_delivery_date DATE,
  status           VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active','paused','cancelled')),
  paused_until     DATE,
  street           VARCHAR(200),
  city             VARCHAR(100),
  state            VARCHAR(100),
  pincode          VARCHAR(10),
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_buyer  ON subscriptions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next   ON subscriptions(next_delivery_date, status);

-- ── Subscription Items ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id  UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  product_id       UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name     VARCHAR(150),
  quantity_kg      NUMERIC(8,2) NOT NULL,
  unit             VARCHAR(20) DEFAULT 'kg',
  price_per_unit   NUMERIC(10,2)
);

-- ── Bulk Orders ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bulk_orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id             UUID NOT NULL REFERENCES users(id),
  buyer_type           VARCHAR(20),
  buyer_name           VARCHAR(150),
  total_quantity_kg    NUMERIC(12,2),
  total_amount         NUMERIC(14,2),
  advance_amount       NUMERIC(14,2),
  balance_amount       NUMERIC(14,2),
  delivery_date        DATE NOT NULL,
  street               VARCHAR(200),
  city                 VARCHAR(100),
  state                VARCHAR(100),
  pincode              VARCHAR(10),
  status               VARCHAR(20) DEFAULT 'submitted'
    CHECK (status IN ('draft','submitted','negotiating','confirmed','in_progress','fulfilled','cancelled')),
  payment_status       VARCHAR(20) DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','advance_paid','fully_paid','refunded')),
  special_instructions TEXT,
  internal_notes       TEXT,
  created_at           TIMESTAMP DEFAULT NOW(),
  updated_at           TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bulk_orders_buyer  ON bulk_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bulk_orders_status ON bulk_orders(status);

-- ── Bulk Order Items ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bulk_order_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulk_order_id    UUID NOT NULL REFERENCES bulk_orders(id) ON DELETE CASCADE,
  product_id       UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name     VARCHAR(150) NOT NULL,
  quantity_kg      NUMERIC(10,2) NOT NULL,
  unit             VARCHAR(20) DEFAULT 'kg',
  requested_price  NUMERIC(10,2),
  agreed_price     NUMERIC(10,2)
);

-- ── Bulk Order Farmer Assignments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bulk_order_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulk_order_id UUID NOT NULL REFERENCES bulk_orders(id) ON DELETE CASCADE,
  farmer_id     UUID NOT NULL REFERENCES users(id),
  status        VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected','fulfilled')),
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ── Delivery Tracking ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id               UUID UNIQUE NOT NULL REFERENCES orders(id),
  buyer_id               UUID NOT NULL REFERENCES users(id),
  farmer_id              UUID REFERENCES users(id),

  -- Delivery partner
  partner_name           VARCHAR(100),
  partner_phone          VARCHAR(15),
  partner_vehicle_number VARCHAR(20),

  -- Addresses (snapshot)
  pickup_address         TEXT,
  delivery_address       TEXT,

  -- Live GPS
  current_lat            NUMERIC(10,7),
  current_lng            NUMERIC(10,7),
  location_updated_at    TIMESTAMP,

  -- Times
  estimated_pickup_time    TIMESTAMP,
  estimated_delivery_time  TIMESTAMP,
  actual_delivery_time     TIMESTAMP,

  -- Status
  current_status  VARCHAR(30) DEFAULT 'order_placed'
    CHECK (current_status IN (
      'order_placed','farmer_confirmed','being_packed',
      'picked_up','in_transit','out_for_delivery',
      'delivered','delivery_failed'
    )),

  -- OTP for delivery confirmation
  delivery_otp   VARCHAR(6),
  otp_verified   BOOLEAN DEFAULT FALSE,

  -- Buyer feedback
  delivery_rating   SMALLINT CHECK (delivery_rating BETWEEN 1 AND 5),
  delivery_feedback TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order  ON delivery_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_buyer  ON delivery_tracking(buyer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_status ON delivery_tracking(current_status);

-- ── Delivery Timeline Events ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_timeline (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id  UUID NOT NULL REFERENCES delivery_tracking(id) ON DELETE CASCADE,
  status       VARCHAR(30),
  description  TEXT,
  location     VARCHAR(200),
  lat          NUMERIC(10,7),
  lng          NUMERIC(10,7),
  event_time   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_timeline_tracking ON delivery_timeline(tracking_id);

-- ── Notifications table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50),   -- 'demand_alert', 'order_status', 'payment', 'verification'
  title      VARCHAR(200),
  body       TEXT,
  data       JSONB,         -- extra context (e.g. orderId, alertId)
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);