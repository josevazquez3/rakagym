ALTER TABLE "Inquiry" ADD COLUMN "calle" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "numero" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "piso" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "dpto" TEXT;

UPDATE "Inquiry" SET "calle" = '' WHERE "calle" IS NULL;
UPDATE "Inquiry" SET "numero" = '' WHERE "numero" IS NULL;

ALTER TABLE "Inquiry" ALTER COLUMN "calle" SET NOT NULL;
ALTER TABLE "Inquiry" ALTER COLUMN "numero" SET NOT NULL;
