-- AlterTable
ALTER TABLE "User" ADD COLUMN     "goalMilestones" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "spendingAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "weeklyDigest" BOOLEAN NOT NULL DEFAULT false;
