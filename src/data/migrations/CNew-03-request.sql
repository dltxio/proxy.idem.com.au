BEGIN;
CREATE TABLE IF NOT EXISTS "testers" (
    "testerId" SERIAL,
    "email" VARCHAR NOT NULL,
    "firstName" VARCHAR NOT NULL,
    "lastName" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("email"),
    PRIMARY KEY("testerId")
);
COMMIT;