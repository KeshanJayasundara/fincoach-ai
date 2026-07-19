-- AlterTable
ALTER TABLE "User" ADD COLUMN     "quickInsightSuggestions" TEXT,
ADD COLUMN     "quickInsightText" TEXT,
ADD COLUMN     "quickInsightUpdatedAt" TIMESTAMP(3);
