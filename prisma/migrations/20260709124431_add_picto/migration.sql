-- CreateTable
CREATE TABLE "Picto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pseudo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pictoId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "consentVersion" TEXT,
    "consentAcceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "User_pictoId_fkey" FOREIGN KEY ("pictoId") REFERENCES "Picto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("consentAcceptedAt", "consentVersion", "createdAt", "email", "id", "pictoId", "pseudo", "status") SELECT "consentAcceptedAt", "consentVersion", "createdAt", "email", "id", "pictoId", "pseudo", "status" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_pseudo_key" ON "User"("pseudo");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
