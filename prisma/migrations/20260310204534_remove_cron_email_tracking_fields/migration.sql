/*
  Warnings:

  - You are about to drop the column `abandoned_email_sent_at` on the `email_captures` table. All the data in the column will be lost.
  - You are about to drop the column `follow_up_email_sent_at` on the `submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "email_captures" DROP COLUMN "abandoned_email_sent_at";

-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "follow_up_email_sent_at";
