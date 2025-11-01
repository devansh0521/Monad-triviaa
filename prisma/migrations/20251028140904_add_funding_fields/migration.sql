-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "host_funded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "host_funded_tx_hash" TEXT;

-- AlterTable
ALTER TABLE "GamePlayer" ADD COLUMN     "funded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "funded_tx_hash" TEXT;
