/*
  Warnings:

  - The values [DEDUCTION] on the enum `SalaryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SalaryType_new" AS ENUM ('MONTHLY', 'BONUS', 'OVERTIME');
ALTER TABLE "salaries" ALTER COLUMN "salary_type" TYPE "SalaryType_new" USING ("salary_type"::text::"SalaryType_new");
ALTER TYPE "SalaryType" RENAME TO "SalaryType_old";
ALTER TYPE "SalaryType_new" RENAME TO "SalaryType";
DROP TYPE "SalaryType_old";
COMMIT;

-- DropIndex
DROP INDEX "salaries_user_id_month_year_key";
