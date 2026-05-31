-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "questionTypes" TEXT NOT NULL DEFAULT 'MCQ';

-- AlterTable
ALTER TABLE "Summary" ADD COLUMN     "chapterSummaries" TEXT,
ADD COLUMN     "documentType" TEXT NOT NULL DEFAULT 'Study Material',
ADD COLUMN     "keyInsights" TEXT,
ADD COLUMN     "revisionNotes" TEXT,
ADD COLUMN     "technologyStack" TEXT;
