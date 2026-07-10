/*
  Warnings:

  - Made the column `imageUrl` on table `Picto` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Picto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL
);
INSERT INTO "new_Picto" ("id", "imageUrl", "label") SELECT "id", "imageUrl", "label" FROM "Picto";
DROP TABLE "Picto";
ALTER TABLE "new_Picto" RENAME TO "Picto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
