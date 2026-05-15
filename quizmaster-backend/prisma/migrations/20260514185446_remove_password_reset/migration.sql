/*
  Warnings:

  - You are about to drop the `password_resets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "password_resets" DROP CONSTRAINT "password_resets_user_id_fkey";

-- DropTable
DROP TABLE "password_resets";
