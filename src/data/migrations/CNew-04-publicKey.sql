BEGIN;

ALTER TABLE users
    ADD "publicKey" VARCHAR;

ALTER TABLE users
    ADD "emailVerified" BOOLEAN DEFAULT FALSE;

ALTER TABLE users
    ADD "emailVerificationCode" VARCHAR;
COMMIT;