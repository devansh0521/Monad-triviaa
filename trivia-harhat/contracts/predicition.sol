// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MonadTriviaPredictionMarket {
    address public owner;
    uint256 public constant PREDICTION_AMOUNT = 1 ether; // 1 MON
    uint256 public constant WINNER_REWARD_PERCENTAGE = 10; // 10% to winner

    struct PredictionPool {
        bytes32 gameId;
        address winnerPlayer;
        uint256 totalPool;
        uint256 totalCorrectPredictors;
        bool settled;
    }

   struct Prediction {
    address predictor;
    address predictedPlayer;
    uint256 amount;
    bool isCorrect;
    bool claimed;
    uint256 payout;  // <-- Add this line
}


    mapping(bytes32 => PredictionPool) public pools;
    mapping(bytes32 => Prediction[]) public predictions; // poolId => Prediction[]

    event PredictionPoolOpened(bytes32 indexed gameId, uint256 timestamp);
    event PredictionMade(bytes32 indexed gameId, address predictor, address predictedPlayer);
    event PredictionPoolSettled(bytes32 indexed gameId, address winner, uint256 totalPool);
    event PredictionClaimed(bytes32 indexed gameId, address predictor, uint256 payout);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Open prediction market after Q5
    function openPredictionPool(bytes32 gameId, address[] calldata gamePlayers) external {
        require(pools[gameId].totalPool == 0, "Pool exists");
        pools[gameId].gameId = gameId;
        // Store game players for validation
        emit PredictionPoolOpened(gameId, block.timestamp);
    }

    // Non-player makes a prediction bet
    function makePrediction(bytes32 gameId, address predictedPlayer) external payable {
        require(msg.value == PREDICTION_AMOUNT, "Bet amount must be 1 MON");
        require(pools[gameId].gameId != bytes32(0), "Pool not open");
        require(!pools[gameId].settled, "Pool settled");

        pools[gameId].totalPool += msg.value;

        Prediction memory pred = Prediction({
            predictor: msg.sender,
            predictedPlayer: predictedPlayer,
            amount: msg.value,
            isCorrect: false,
            claimed: false,
            payout: 0
        });

        predictions[gameId].push(pred);
        emit PredictionMade(gameId, msg.sender, predictedPlayer);
    }

    // Admin/contract settles predictions after game ends
    function settlePredictions(bytes32 gameId, address actualWinner) external onlyOwner {
        require(!pools[gameId].settled, "Already settled");
        require(pools[gameId].totalPool > 0, "No pool");

        pools[gameId].winnerPlayer = actualWinner;
        pools[gameId].settled = true;

        // Count correct predictions
        uint256 correctCount = 0;
        for (uint i = 0; i < predictions[gameId].length; i++) {
            if (predictions[gameId][i].predictedPlayer == actualWinner) {
                predictions[gameId][i].isCorrect = true;
                correctCount++;
            }
        }

        require(correctCount > 0, "No correct predictions");

        // Calculate payouts
        uint256 winnerReward = (pools[gameId].totalPool * WINNER_REWARD_PERCENTAGE) / 100;
        uint256 predictionRewardPool = pools[gameId].totalPool - winnerReward;
        uint256 payoutPerCorrectPredictor = predictionRewardPool / correctCount;

        // Set payout for each correct predictor
        for (uint i = 0; i < predictions[gameId].length; i++) {
            if (predictions[gameId][i].isCorrect) {
                predictions[gameId][i].payout = payoutPerCorrectPredictor;
            }
        }

        // Transfer reward to winner player
        (bool sent, ) = actualWinner.call{value: winnerReward}("");
        require(sent, "Transfer failed");

        emit PredictionPoolSettled(gameId, actualWinner, pools[gameId].totalPool);
    }

    // Correct predictors claim their winnings
    function claimPredictionReward(bytes32 gameId, uint256 predictionIndex) external {
        require(pools[gameId].settled, "Pool not settled");
        Prediction storage pred = predictions[gameId][predictionIndex];
        require(pred.predictor == msg.sender, "Not predictor");
        require(pred.isCorrect, "Prediction incorrect");
        require(!pred.claimed, "Already claimed");

        pred.claimed = true;
        (bool sent, ) = msg.sender.call{value: pred.payout}("");
        require(sent, "Payout failed");

        emit PredictionClaimed(gameId, msg.sender, pred.payout);
    }
}