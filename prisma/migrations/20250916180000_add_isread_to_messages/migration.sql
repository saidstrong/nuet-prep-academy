-- Add isRead column to messages table
ALTER TABLE "messages" ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;
