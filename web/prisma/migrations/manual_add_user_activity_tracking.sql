-- Add user activity tracking fields for email notification system
-- These fields help prevent spam by tracking user activity and email cooldowns

-- Add lastSeenAt field to track when user was last active
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP(3);

-- Add lastMessageEmailAt field to track when we last sent a message notification email (24h cooldown)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastMessageEmailAt" TIMESTAMP(3);

-- Optional: Create index for efficient queries (if sending batch notifications in future)
-- CREATE INDEX IF NOT EXISTS "User_lastSeenAt_idx" ON "User"("lastSeenAt");
