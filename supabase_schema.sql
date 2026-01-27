-- Creation of the schema for Supabase (PostgreSQL)

-- User table (better-auth standard + custom fields)
CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL,
    image TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    type TEXT,
    "raisonSociale" TEXT,
    phone TEXT,
    allergies TEXT
);

-- Session table
CREATE TABLE session (
    id TEXT PRIMARY KEY,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    token TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

-- Account table
CREATE TABLE account (
    id TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
    "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    password TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Verification table
CREATE TABLE verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE,
    "updatedAt" TIMESTAMP WITH TIME ZONE
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT,
    description TEXT,
    price DECIMAL(10,2),
    category TEXT,
    subcategory TEXT,
    image TEXT,
    cuisine TEXT,
    dietary TEXT,
    allergies TEXT
);

-- Addresses table
CREATE TABLE addresses (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    city TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'product' or 'service'
    status TEXT NOT NULL DEFAULT 'pending',
    total DECIMAL(10,2) NOT NULL,
    items TEXT, -- JSON string
    "serviceType" TEXT,
    "refusalReason" TEXT,
    history TEXT, -- JSON string
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Contact Messages table
CREATE TABLE contact_messages (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    entreprise TEXT,
    motif TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "manualAddress" TEXT,
    "manualPostalCode" TEXT,
    "manualCity" TEXT,
    "selectedAddress" TEXT
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    "productId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "orderId" TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    "isOrderReview" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("productId", "userId", "orderId")
);

-- Cart table
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "productId" INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("userId", "productId")
);

-- Indexes
CREATE INDEX idx_addresses_userId ON addresses("userId");
CREATE INDEX idx_orders_userId ON orders("userId");
CREATE INDEX idx_orders_createdAt ON orders("createdAt");
CREATE INDEX idx_contact_messages_userId ON contact_messages("userId");
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_createdAt ON contact_messages("createdAt");
CREATE INDEX idx_cart_userId ON cart("userId");
