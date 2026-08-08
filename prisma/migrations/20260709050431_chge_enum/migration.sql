/*
  Warnings:

  - The values [COMPLETEDF] on the enum `RentalRequentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RentalRequentStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED');
ALTER TABLE "public"."RentalRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "RentalRequest" ALTER COLUMN "status" TYPE "RentalRequentStatus_new" USING ("status"::text::"RentalRequentStatus_new");
ALTER TYPE "RentalRequentStatus" RENAME TO "RentalRequentStatus_old";
ALTER TYPE "RentalRequentStatus_new" RENAME TO "RentalRequentStatus";
DROP TYPE "public"."RentalRequentStatus_old";
ALTER TABLE "RentalRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- CreateIndex
CREATE INDEX "Property_propertyOwnerId_idx" ON "Property"("propertyOwnerId");
