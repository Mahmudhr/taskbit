/*
  Warnings:

  - Added the required column `total_amount` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "total_amount" DOUBLE PRECISION NOT NULL;
