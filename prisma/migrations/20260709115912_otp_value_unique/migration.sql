/*
  Warnings:

  - A unique constraint covering the columns `[value]` on the table `Otp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Otp_value_key" ON "Otp"("value");
