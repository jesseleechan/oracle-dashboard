-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "universalDay" INTEGER NOT NULL,
    "transitAspect" TEXT NOT NULL,
    "tarotCards" TEXT NOT NULL,
    "scene" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
