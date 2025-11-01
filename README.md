#🎮 MonadTrivia - Battle Royale Trivia with Prediction Markets
MonadTrivia is a multiplayer, real-time trivia game built on the Monad blockchain that combines intense quiz competition with a decentralized prediction market. Players compete in rapid-fire question rounds where one wrong answer means instant elimination, while spectators can earn rewards by predicting the game winner.​

🌟 Key Features
Core Trivia Mechanics
Instant Elimination: Answer incorrectly and you're out immediately—no second chances, creating high-stakes gameplay that keeps players on edge.​

Prize Pool System: Entry fees from all players accumulate into a smart contract-managed prize pool that automatically transfers to the winner.​

Real-Time Multiplayer: Leveraging Monad's high-performance capabilities (10,000 TPS and 1-second block times) for seamless, lag-free gameplay.​

🎰 Prediction Market System
Spectator Betting: Non-playing users can bet 1 MON to predict which player will win the game—adding an extra layer of engagement and earning potential.

Post-Q5 Predictions: Prediction market opens after question 5, allowing spectators to make informed predictions as they see more gameplay strategy.

Dual Reward Structure:

10% to Game Winner: Actual game winner receives 10% of the total prediction pool

90% to Correct Predictors: Split equally among all spectators who predicted correctly

Individual Claims: Correct predictors independently claim their winnings after settlement, ensuring transparency and control over rewards.

On-Chain Transparency: All predictions, settlements, and payouts are recorded on-chain for verifiable fairness.

🏗️ Technical Architecture
Frontend (96.4% TypeScript): Built with Next.js for responsive, real-time UI showing game state and prediction markets.​

Smart Contracts (2.5% Solidity):

Game logic and elimination tracking

Prediction pool management

Prize distribution with dual reward system

Settlement and claim mechanisms

Styling (1.1% CSS): Custom UI components for engaging gaming experience.​

🚀 Getting Started
Prerequisites:

Node.js v16 or higher

MetaMask wallet configured for Monad testnet

Monad testnet tokens (MON) for entry fees and predictions

Installation:

bash
git clone https://github.com/devansh0521/Monad-triviaa.git
cd Monad-triviaa
npm install
Environment Setup:

text
NEXT_PUBLIC_RPC_URL=<Monad_Testnet_RPC>
NEXT_PUBLIC_TRIVIA_CONTRACT=<Game_Contract_Address>
NEXT_PUBLIC_PREDICTION_CONTRACT=<Prediction_Contract_Address>
Run Development Server:

bash
npm run dev
🎯 How to Play & Predict
For Players
Connect Wallet: Link MetaMask to Monad testnet

Enter Game: Pay entry fee to join player lobby

Answer Questions: Respond to rapid-fire trivia questions

Survive: One wrong answer eliminates you

Win: Be the last player standing to claim main prize pool + 10% of prediction rewards

For Spectators (Predictors)
Watch Game: Join as spectator after Q5 when prediction pool opens

Place Prediction: Bet exactly 1 MON on which player you think will win

Monitor Game: Watch remaining questions and eliminations

Claim Rewards: If your predicted player wins, claim your share of the 90% prediction reward pool

Earn: Payouts calculated as: (Total Prediction Pool × 90%) / Number of Correct Predictions

🔧 Smart Contract Functions
Trivia Game Contract
text
joinGame()              // Player entry with fee
submitAnswer()          // Answer current question
eliminatePlayer()       // Auto-eliminate on wrong answer
getGameState()          // Query game status
MonadTriviaPredictionMarket Contract
Pool Management:

text
openPredictionPool(gameId, gamePlayers)
// Opens prediction market after Q5
Making Predictions:

text
makePrediction(gameId, predictedPlayer) 
// Spectator bets 1 MON on a player
Settlement:

text
settlePredictions(gameId, actualWinner)
// Owner settles after game ends
// Distributes 10% to winner, splits 90% among correct predictors
Claiming Rewards:

text
claimPredictionReward(gameId, predictionIndex)
// Correct predictor claims their winnings
📊 Prediction Pool Mechanics
Payout Structure
Component	Percentage	Recipient
Winner Reward	10%	Actual Game Winner
Predictor Pool	90%	Correct Predictors (split equally)
Example Calculation
Scenario:

Total prediction pool: 100 MON

Number of correct predictors: 5

Predicted player (Alice) wins the game

Distribution:

Alice receives: 100 × 10% = 10 MON

Predictor reward pool: 100 × 90% = 90 MON

Per correct predictor: 90 ÷ 5 = 18 MON each

🔐 Smart Contract Security Features
Immutable Prediction Recording: All predictions stored on-chain as structs with predictor, predicted player, amount, and payout.

Settlement Lock: Prevents claim attempts before pool is settled (pools[gameId].settled == true).

Individual Claim Tracking: Each prediction has isCorrect and claimed flags to prevent double-claiming.

Owner-Only Settlement: Only contract owner can settle predictions, ensuring controlled distribution.

Atomic Transfers: Uses low-level call pattern for safe MON transfers:

text
(bool sent, ) = recipient.call{value: amount}("");
require(sent, "Transfer failed");
📈 Game Flow with Predictions
text
1. Players join game lobby → Entry fees collected
2. Game starts → Questions 1-5 displayed
3. After Q5 → Prediction pool opens
4. Spectators place 1 MON bets → Predict winner
5. Questions 6+ continue → Players eliminated
6. Last player wins → Game ends
7. Owner settles predictions → Determines winner
   • 10% to game winner
   • 90% split among correct predictors
8. Payouts settle on-chain
9. Winners claim rewards → Individual transactions
🎨 Data Structures
PredictionPool
text
struct PredictionPool {
    bytes32 gameId;          // Unique game identifier
    address winnerPlayer;    // Game winner
    uint256 totalPool;       // Sum of all prediction bets
    uint256 totalCorrectPredictors; // Count of correct bets
    bool settled;            // Settlement status
}
Prediction
text
struct Prediction {
    address predictor;       // Spectator who placed bet
    address predictedPlayer; // Player they bet on
    uint256 amount;          // Always 1 MON
    bool isCorrect;          // Resolved after game ends
    bool claimed;            // Claimed status for rewards
    uint256 payout;          // Individual reward amount
}
📱 User Roles
Players
Pay entry fee to join game

Answer trivia questions

Get eliminated on wrong answer

Win main pool if they're last standing

Receive 10% of prediction pool if they win

Spectators/Predictors
Watch game without playing

Predict game winner after Q5

Pay fixed 1 MON bet per prediction

Earn share of 90% prediction pool if correct

Independently claim rewards

Owner/Admin
Deploy contracts

Open prediction pools

Settle predictions after games end

Manage game state transitions

🔗 Contract Constants
text
PREDICTION_AMOUNT = 1 ether (1 MON)
WINNER_REWARD_PERCENTAGE = 10 (%)
PREDICTION_REWARD_PERCENTAGE = 90 (%)

🎲 Revenue Model
Revenue Stream	Source	Usage
Player Entry Fees	Main prize pool	Distributed to game winner
Prediction Bets	90% prediction pool	Shared among correct predictors
Platform Fee	10% prediction pool	Transferred to game winner
🚀 Deployment Guide
Compile Contracts:

bash
npx hardhat compile
Deploy to Monad Testnet:

bash
npx hardhat run scripts/deploy.js --network monad-testnet
Verify Contracts:

bash
npx hardhat verify --network monad-testnet <CONTRACT_ADDRESS>
🏆 Monad Blockchain Advantages
Ultra-High Throughput: 10,000 TPS handles massive simultaneous players and predictions.​

1-Second Block Times: Instant prediction settlement and game state updates.​

Single-Slot Finality: Immediate transaction finality prevents game manipulation.​

Minimal Gas Costs: Affordable entry fees and prediction amounts encourage participation.​

EVM Compatible: Deploy Solidity contracts without modification.​

🛠️ Future Enhancements
Leaderboard System: Track prediction accuracy per spectator

Difficulty Tiers: Different entry fees, different reward multipliers

Tournament Mode: Multi-round brackets with accumulating pools

NFT Badges: "Prediction Master" badges for high-accuracy predictors

Category Selection: Predict by quiz category (History, Science, Movies)

Dynamic Odds: Adjust reward multipliers based on prediction distribution

Mobile App: Native iOS/Android for easier participation

Cross-Chain Integration: Support multiple networks beyond Monad

🤝 Contributing
Contributions welcome! Please fork the repository and submit pull requests for improvements.​

📄 License
MIT License

👥 Built By
Developed during Monad Blitz Delhi hackathon—a 1-day intensive event exploring high-performance blockchain consumer applications.​
