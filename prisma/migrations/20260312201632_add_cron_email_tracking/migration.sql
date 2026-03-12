-- AlterTable
ALTER TABLE "email_captures" ADD COLUMN     "abandoned_email_sent_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "follow_up_email_sent_at" TIMESTAMP(3);
