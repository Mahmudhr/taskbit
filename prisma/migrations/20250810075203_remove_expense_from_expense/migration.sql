/*
  Warnings:

  - You are about to drop the column `user_id` on the `expenses` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_user_id_fkey";

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "user_id";
