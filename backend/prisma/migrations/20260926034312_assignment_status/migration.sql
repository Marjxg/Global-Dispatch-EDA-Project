-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('Pending', 'Assigned');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "AssignmentStatus" NOT NULL DEFAULT 'Pending',
ALTER COLUMN "assignedAt" DROP NOT NULL,
ALTER COLUMN "assignedAt" DROP DEFAULT;
