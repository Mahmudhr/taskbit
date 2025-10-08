/*
  Warnings:

  - You are about to drop the column `unique_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[unique_id]` on the table `tasks` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_unique_id_key";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "unique_id" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "unique_id";

-- CreateIndex
CREATE UNIQUE INDEX "tasks_unique_id_key" ON "tasks"("unique_id");
