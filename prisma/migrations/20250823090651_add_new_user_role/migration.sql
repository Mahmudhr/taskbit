-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'EMPLOYEE';

-- CreateTable
CREATE TABLE "receivable_amounts" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "task_id" INTEGER,

    CONSTRAINT "receivable_amounts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "receivable_amounts" ADD CONSTRAINT "receivable_amounts_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
