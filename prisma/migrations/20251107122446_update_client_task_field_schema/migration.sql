-- CreateEnum
CREATE TYPE "ClientTaskType" AS ENUM ('REGULAR', 'URGENT', 'CORRECTION');

-- AlterTable
ALTER TABLE "client_tasks" ADD COLUMN     "correction_description" TEXT,
ADD COLUMN     "task_type" "ClientTaskType" NOT NULL DEFAULT 'REGULAR';
