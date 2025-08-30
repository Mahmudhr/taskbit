-- CreateTable
CREATE TABLE "employee_of_months" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "is_view" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_of_months_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_of_months_year_month_key" ON "employee_of_months"("year", "month");

-- AddForeignKey
ALTER TABLE "employee_of_months" ADD CONSTRAINT "employee_of_months_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
