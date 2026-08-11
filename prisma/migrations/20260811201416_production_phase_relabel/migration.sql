-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "budgetTier" TEXT NOT NULL,
    "shootMode" TEXT NOT NULL,
    "locationText" TEXT,
    "crewSizeEstimate" INTEGER,
    "targetShootDate" DATETIME,
    "targetDeliveryDate" DATETIME,
    "hasStunts" BOOLEAN NOT NULL DEFAULT false,
    "hasWeapons" BOOLEAN NOT NULL DEFAULT false,
    "hasMinors" BOOLEAN NOT NULL DEFAULT false,
    "hasNudity" BOOLEAN NOT NULL DEFAULT false,
    "hasAnimals" BOOLEAN NOT NULL DEFAULT false,
    "hasVehicles" BOOLEAN NOT NULL DEFAULT false,
    "hasWaterOrRain" BOOLEAN NOT NULL DEFAULT false,
    "hasHeights" BOOLEAN NOT NULL DEFAULT false,
    "hasFireOrPyro" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'creative-scoping',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("budgetTier", "companyId", "createdAt", "crewSizeEstimate", "format", "hasAnimals", "hasFireOrPyro", "hasHeights", "hasMinors", "hasNudity", "hasStunts", "hasVehicles", "hasWaterOrRain", "hasWeapons", "id", "locationText", "name", "shootMode", "status", "targetDeliveryDate", "targetShootDate", "updatedAt") SELECT "budgetTier", "companyId", "createdAt", "crewSizeEstimate", "format", "hasAnimals", "hasFireOrPyro", "hasHeights", "hasMinors", "hasNudity", "hasStunts", "hasVehicles", "hasWaterOrRain", "hasWeapons", "id", "locationText", "name", "shootMode", "status", "targetDeliveryDate", "targetShootDate", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
