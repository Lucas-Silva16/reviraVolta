CREATE TABLE "enchimentos" (
    "id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "curso" VARCHAR(120) NOT NULL,
    "quantidade_litros" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "enchimentos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "litros_validos" CHECK ("quantidade_litros" >= 0.10 AND "quantidade_litros" <= 5.00),
    CONSTRAINT "hash_valido" CHECK ("token_hash" ~ '^[0-9a-f]{64}$')
);
CREATE INDEX "enchimentos_token_hash_idx" ON "enchimentos"("token_hash");
CREATE INDEX "enchimentos_curso_idx" ON "enchimentos"("curso");
CREATE INDEX "enchimentos_created_at_idx" ON "enchimentos"("created_at");
