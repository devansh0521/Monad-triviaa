-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "username" TEXT,
    "avatar_id" INTEGER,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avatar" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "image_url" TEXT,
    "nft_token_id" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "mode" TEXT NOT NULL,
    "room_code" TEXT,
    "status" TEXT NOT NULL,
    "entry_fee" DECIMAL(65,30),
    "pool_amount" DECIMAL(65,30),
    "platform_fee" DECIMAL(65,30),
    "player_count" INTEGER,
    "host_user_id" INTEGER,
    "winner_user_id" INTEGER,
    "tokens_sent" BOOLEAN NOT NULL DEFAULT false,
    "fee_deducted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER,
    "user_id" INTEGER,
    "amount" DECIMAL(65,30),
    "tx_hash" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlayer" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER,
    "user_id" INTEGER,
    "status" TEXT,
    "join_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "elimination_time" TIMESTAMP(3),
    "final_correct" INTEGER NOT NULL DEFAULT 0,
    "final_time_ms" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GamePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "category" TEXT,
    "difficulty" TEXT,
    "question_text" TEXT,
    "options" JSONB,
    "correct_option" TEXT,
    "hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameRound" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER,
    "round_number" INTEGER,
    "question_id" INTEGER,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "GameRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER,
    "user_id" INTEGER,
    "selected_option" TEXT,
    "is_correct" BOOLEAN,
    "answer_time_ms" INTEGER,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tab_change_detected" BOOLEAN NOT NULL DEFAULT false,
    "fullscreen_exited" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "total_wins" INTEGER NOT NULL DEFAULT 0,
    "total_games" INTEGER NOT NULL DEFAULT 0,
    "total_streak" INTEGER NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "type" TEXT,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "game_id" INTEGER,
    "event_type" TEXT,
    "details" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_address_key" ON "User"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "Game_room_code_key" ON "Game"("room_code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatar_id_fkey" FOREIGN KEY ("avatar_id") REFERENCES "Avatar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_host_user_id_fkey" FOREIGN KEY ("host_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_winner_user_id_fkey" FOREIGN KEY ("winner_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRound" ADD CONSTRAINT "GameRound_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRound" ADD CONSTRAINT "GameRound_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "GameRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
