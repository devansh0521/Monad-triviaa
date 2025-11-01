# Prediction Market Implementation

## Overview

The prediction market feature allows non-players (spectators) to watch gameplay and place bets on which player they think will win. This adds an exciting layer of engagement for viewers and provides additional rewards to both predictors and winners.

## How It Works

### For Spectators (Non-Players)

1. **Watch Gameplay (Questions 1-5)**
   - Spectators can watch the first 5 questions of the game
   - They observe player performance to make informed predictions
   - No betting is available during this phase

2. **Prediction Window Opens (After Question 5)**
   - After question 5 is completed, the prediction pool opens automatically
   - Spectators can bet **1 MONAD** on any active player
   - Each spectator can make only ONE prediction per game
   - The prediction window closes when the game finishes

3. **Game Completion (After Question 10)**
   - The game finishes and a winner is determined
   - Predictions are automatically settled
   - Correct predictors can claim their winnings

### Prize Distribution

When predictions are settled:

- **10%** of the total prediction pool → Goes to the winning player as a bonus
- **90%** of the total prediction pool → Split equally among all correct predictors

**Example:**
- 10 spectators bet 1 MONAD each = 10 MONAD total pool
- Winner player receives: 1 MONAD (10% of pool)
- Prediction pool for correct predictors: 9 MONAD (90% of pool)
- If 3 spectators predicted correctly: Each gets 3 MONAD (9 ÷ 3)

## Smart Contract

**Contract Address:** `0xf9998a6092456a8e16c8dbc2034598fd68545935`

**Owner Address:** `0x1be1A3927fA3C29208891C226e340d2c92D39BBE`

### Key Functions

- `openPredictionPool(bytes32 gameId, address[] gamePlayers)` - Opens prediction pool after Q5
- `makePrediction(bytes32 gameId, address predictedPlayer)` - Makes a prediction (payable: 1 MONAD)
- `settlePredictions(bytes32 gameId, address actualWinner)` - Settles predictions after game ends
- `claimPredictionReward(bytes32 gameId, uint256 predictionIndex)` - Claims winnings

## Database Schema

### PredictionPool Model
- Tracks the prediction pool for each game
- Stores total pool amount, winner, settlement status
- Links to the game and predictions

### Prediction Model
- Records each individual prediction
- Tracks predictor, predicted player, amount
- Stores payout information and claim status

## API Endpoints

### Prediction Management

1. **POST /api/prediction/open**
   - Opens prediction pool for a game
   - Called automatically after question 5

2. **GET /api/prediction/status**
   - Get prediction pool status and active players
   - Query params: `room_code`

3. **POST /api/prediction/make**
   - Make a prediction on a player
   - Body: `{ room_code, predictor_user_id, predicted_player_id, blockchain_tx_hash }`

4. **POST /api/prediction/settle**
   - Settle predictions after game ends
   - Called automatically when game finishes
   - Body: `{ room_code, settlement_tx_hash }`

5. **POST /api/prediction/claim**
   - Claim prediction winnings
   - Body: `{ prediction_id, user_id, claim_tx_hash }`

## Frontend Integration

### Spectator Page
- **URL:** `/spectate/[roomCode]`
- Watch gameplay in real-time
- Place predictions when window opens
- View results after game ends

### Usage Flow

1. User navigates to `/spectate/ABCD1234`
2. Watches questions 1-5
3. After Q5, sees active players and can bet 1 MONAD
4. Selects a player and clicks "Place Bet"
5. MetaMask prompts for 1 MONAD payment
6. Transaction is recorded on-chain and in database
7. After game finishes, sees if prediction was correct
8. If correct, can claim winnings

## Backend Services

### PredictionService (`src/services/predictionService.ts`)
- Handles blockchain interactions for predictions
- Opens pools, makes predictions, settles, and claims
- Uses ethers.js to interact with the smart contract

### API Routes
- All prediction routes are in `src/app/api/prediction/`
- Automatic integration with game flow (Q5 opens pool, finish settles)

## Testing the Flow

### Prerequisites
1. Deployed prediction contract at: `0xf9998a6092456a8e16c8dbc2034598fd68545935`
2. Contract owner: `0x1be1A3927fA3C29208891C226e340d2c92D39BBE`
3. Database schema migrated with prediction tables
4. Environment variables set with contract address

### Test Steps

1. **Start a Game**
   - Create a game room
   - Have 2+ players join and fund

2. **As Spectator**
   - Navigate to `/spectate/[ROOM_CODE]`
   - Watch questions 1-5
   - After Q5, prediction window opens
   - Select a player and place 1 MONAD bet
   - Confirm transaction in MetaMask

3. **Continue Game**
   - Players answer questions 6-10
   - Game finishes, winner determined

4. **Check Results**
   - Spectator page shows if prediction was correct
   - If correct, displays payout amount
   - Winner receives 10% bonus from prediction pool
   - Correct predictors can claim their share (90% of pool divided equally)

## Important Notes

- Each spectator can only make ONE prediction per game
- Players cannot bet on their own game
- Prediction window opens automatically after question 5
- Predictions are settled automatically when game finishes
- All amounts are in MONAD tokens
- Bet amount is fixed at 1 MONAD per prediction

## Future Enhancements

Potential improvements:
- Dynamic bet amounts (not just 1 MONAD)
- Live prediction statistics during game
- Prediction history and leaderboards for spectators
- Multiple prediction options (winner, top 3, etc.)
- Real-time odds calculation based on player performance
