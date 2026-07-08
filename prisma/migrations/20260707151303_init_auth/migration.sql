-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pseudo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pictoId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "consentVersion" TEXT,
    "consentAcceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConfirmationToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "ConfirmationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "blockedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_pseudo_key" ON "User"("pseudo");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmationToken_value_key" ON "ConfirmationToken"("value");
