-- AlterTable
ALTER TABLE "ReportLog" ADD COLUMN     "sentVia" TEXT NOT NULL DEFAULT 'manual';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);
