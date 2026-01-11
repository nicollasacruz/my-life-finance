-- AlterEnum
ALTER TYPE "AccountType" ADD VALUE 'FINANCING';

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "interestRate" DECIMAL(5,2),
ADD COLUMN     "principalAmount" DECIMAL(12,2),
ADD COLUMN     "totalInstallments" INTEGER;
