CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updatedAt()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = now();
   RETURN NEW;
END;
$$ language "plpgsql";

CREATE TABLE "users" (
  "userId" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "email" VARCHAR NOT NULL,
  "emailVerified" BOOLEAN DEFAULT FALSE NOT NULL,
  "firstName" VARCHAR NOT NULL,
  "lastName" VARCHAR NOT NULL,
  "dob" VARCHAR,
  "phoneNumber" VARCHAR,
  "phoneNumberVerified" BOOLEAN DEFAULT FALSE NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "address" VARCHAR NOT NULL,
  "idVerified" BOOLEAN DEFAULT FALSE NOT NULL,
  "expoPushToken" VARCHAR,
  PRIMARY KEY("userId"),
  UNIQUE("email"),
  UNIQUE("phoneNumber")
);

CREATE TRIGGER update_users_updatedAt BEFORE UPDATE
  ON users FOR EACH ROW EXECUTE PROCEDURE 
  update_updatedAt();