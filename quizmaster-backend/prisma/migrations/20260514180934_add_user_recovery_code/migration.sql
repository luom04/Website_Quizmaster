-- AlterTable
ALTER TABLE "users" ADD COLUMN     "recovery_code_hash" TEXT,
ADD COLUMN     "recovery_code_updated_at" TIMESTAMP(3);
