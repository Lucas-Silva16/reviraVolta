CREATE TABLE "admin_login_throttle" (
  "id" INTEGER NOT NULL,
  "attempts" TIMESTAMPTZ(3)[] NOT NULL DEFAULT ARRAY[]::TIMESTAMPTZ[],
  CONSTRAINT "admin_login_throttle_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_login_throttle_singleton" CHECK ("id" = 1),
  CONSTRAINT "admin_login_throttle_max_attempts" CHECK (cardinality("attempts") <= 10)
);

INSERT INTO "admin_login_throttle" ("id") VALUES (1);
REVOKE ALL ON TABLE "admin_login_throttle" FROM PUBLIC;
