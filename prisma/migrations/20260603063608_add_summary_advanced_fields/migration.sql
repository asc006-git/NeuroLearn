-- AlterTable
ALTER TABLE "Summary" ADD COLUMN     "advantages" TEXT,
ADD COLUMN     "examples" TEXT,
ADD COLUMN     "futureScope" TEXT,
ADD COLUMN     "limitations" TEXT,
ADD COLUMN     "tldr" TEXT;

-- CreateIndex
CREATE INDEX "Analytics_userId_date_idx" ON "Analytics"("userId", "date");

-- CreateIndex
CREATE INDEX "Analytics_userId_idx" ON "Analytics"("userId");
