BEGIN;
CREATE TABLE IF NOT EXISTS "requests" (
    "id" SERIAL,
    "from" VARCHAR NOT NULL,
    "to" VARCHAR NOT NULL,
    "ipAddress" VARCHAR NOT NULL,
    "requestType" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
COMMIT;