-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Pending', 'Accepted', 'Cancelled', 'Assigned');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "shipperOrderId" TEXT NOT NULL,
    "pickupDate" DATE,
    "deliveryDate" DATE,
    "price" DECIMAL(12,2),
    "transportationReleaseNotes" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'Pending',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stop" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "stopNumber" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "postalCode" VARCHAR(10) NOT NULL,

    CONSTRAINT "Stop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "year" VARCHAR(4) NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "carrierName" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedEvent" (
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedEvent_pkey" PRIMARY KEY ("eventId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_shipperOrderId_key" ON "Order"("shipperOrderId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Stop_orderId_stopNumber_key" ON "Stop"("orderId", "stopNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_assignmentId_key" ON "Assignment"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_orderId_key" ON "Assignment"("orderId");

-- AddForeignKey
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
