/*
  Warnings:

  - You are about to drop the column `embeddings` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "embeddings";

-- AddForeignKey
ALTER TABLE "KnowledgeMap" ADD CONSTRAINT "KnowledgeMap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
