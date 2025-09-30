-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaperType" ADD VALUE 'BOOK_CHAPTER';
ALTER TYPE "PaperType" ADD VALUE 'Journal_Q2';
ALTER TYPE "PaperType" ADD VALUE 'Journal_Q3';
ALTER TYPE "PaperType" ADD VALUE 'Journal_Q4';
ALTER TYPE "PaperType" ADD VALUE 'ASSIGNMENT';
ALTER TYPE "PaperType" ADD VALUE 'REWRITE';
ALTER TYPE "PaperType" ADD VALUE 'OTHERS';
