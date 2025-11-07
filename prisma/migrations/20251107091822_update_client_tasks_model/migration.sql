-- CreateTable
CREATE TABLE "client_tasks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "paper_type" "PaperType" NOT NULL DEFAULT 'CONFERENCE',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "duration" TIMESTAMP(3),
    "unique_id" TEXT,
    "created_by_id" INTEGER NOT NULL,

    CONSTRAINT "client_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_tasks_unique_id_key" ON "client_tasks"("unique_id");

-- AddForeignKey
ALTER TABLE "client_tasks" ADD CONSTRAINT "client_tasks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
