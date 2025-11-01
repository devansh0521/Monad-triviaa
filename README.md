# 🎮 MonadTrivia - Battle Royale Trivia with Prediction Markets

MonadTrivia is a multiplayer, real-time trivia game built on the Monad blockchain that combines intense quiz competition with a decentralized prediction market. Players compete in rapid-fire question rounds where one wrong answer means instant elimination, while spectators can earn rewards by predicting the game winner.

## 🌟 Key Features

### Core Trivia Mechanics

- **Instant Elimination**: Answer incorrectly and you're out immediately—no second chances, creating high-stakes gameplay that keeps players on edge.
- **Prize Pool System**: Entry fees from all players accumulate into a smart contract-managed prize pool that automatically transfers to the winner.
- **Real-Time Multiplayer**: Leveraging Monad's high-performance capabilities (10,000 TPS and 1-second block times) for seamless, lag-free gameplay.

### 🎰 Prediction Market System

- **Spectator Betting**: Non-playing users can bet 1 MON to predict which player will win the game—adding an extra layer of engagement and earning potential.
- **Post-Q5 Predictions**: Prediction market opens after question 5, allowing spectators to make informed predictions as they see more gameplay strategy.
- **Dual Reward Structure**:
  - 10% to Game Winner: Actual game winner receives 10% of the total prediction pool
  - 90% to Correct Predictors: Split equally among all spectators who predicted correctly
- **Individual Claims**: Correct predictors independently claim their winnings after settlement, ensuring transparency and control over rewards.
- **On-Chain Transparency**: All predictions, settlements, and payouts are recorded on-chain for verifiable fairness.

## 🏗️ Technical Architecture

- **Frontend (96.4% TypeScript)**: Built with Next.js for responsive, real-time UI showing game state and prediction markets.
- **Smart Contracts (2.5% Solidity)**:
  - Game logic and elimination tracking
  - Prediction pool management
  - Prize distribution with dual reward system
  - Settlement and claim mechanisms
- **Styling (1.1% CSS)**: Custom UI components for engaging gaming experience.

## 🚀 Getting Started

### Prerequisites

- Node.js v16 or higher
- MetaMask wallet configured for Monad testnet
- Monad testnet tokens (MON) for entry fees and predictions

### Installation

git clone https://github.com/devansh0521/Monad-triviaa.git
cd Monad-triviaa
npm


### Environment Setup

NEXT_PUBLIC_TRIVIA_CONTRACT=0x8957d86B15D194D6eaA1eEe82735B68908c5c8A1
NEXT_PUBLIC_PREDICTION_CONTRACT=0xf9998a6092456a8e16c8dbc2034598fd68545935


### Run Development Server

npm run dev


## 🎯 How to Play & Predict

### For Players

1. **Connect Wallet**: Link MetaMask to Monad testnet
2. **Enter Game**: Pay entry fee to join player lobby
3. **Answer Questions**: Respond to rapid-fire trivia questions
4. **Survive**: One wrong answer eliminates you
5. **Win**: Be the last player standing to claim main prize pool + 10% of prediction rewards

### For Spectators (Predictors)

1. **Watch Game**: Join as spectator after Q5 when prediction pool opens
2. **Place Prediction**: Bet exactly 1 MON on which player you think will win
3. **Monitor Game**: Watch remaining questions and eliminations
4. **Claim Rewards**: If your predicted player wins, claim your share of the 90% prediction reward pool
5. **Earn**: Payouts calculated as: `(Total Prediction Pool × 90%) / Number of Correct Predictions`

## 🔧 Smart Contract Functions

### Trivia Game Contract

joinGame() // Player entry with fee
submitAnswer() // Answer current question
eliminatePlayer() // Auto-eliminate on wrong answer
getGameState() // Query game status


## 📈 Game Flow with Predictions

Players join game lobby → Entry fees collected
Game starts → Questions 1-5 displayed
After Q5 → Prediction pool opens
Spectators place 1 MON bets → Predict winner
Questions 6+ continue → Players eliminated
Last player wins → Game ends
Owner settles predictions → Determines winner
10% to game winner
90% split among correct predictors
Payouts settle on-chain
Winners claim rewards → Individual transactions

