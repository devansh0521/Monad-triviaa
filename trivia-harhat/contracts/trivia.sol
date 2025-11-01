// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MonadTriviaFlexiblePool {
    address public owner;               // Super admin/platform owner
    mapping(bytes32 => Game) public games;

    enum GameStatus { Pending, Funded, Active, Finished }

    struct Game {
        address host;
        address[] players;
        mapping(address => bool) funded;
        uint256 playerCount;
        uint256 entryAmount;
        uint256 platformFee;            // Fee in wei/ether/MON per game (NOT per player)
        address winner;
        GameStatus status;
        uint256 fundedCount;
    }

    event GameCreated(bytes32 indexed gameId, address host, uint256 playerCount, uint256 entryAmount, uint256 platformFee);
    event PlayerJoined(bytes32 indexed gameId, address player);
    event PoolFunded(bytes32 indexed gameId, address by);
    event GameStarted(bytes32 indexed gameId);
    event WinnerPaid(bytes32 indexed gameId, address winner, uint256 prize, uint256 fee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not super admin");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createGame(
        bytes32 gameId,
        uint256 playerCount,
        uint256 entryAmount,
        uint256 platformFee
    ) external {
        require(games[gameId].host == address(0), "Game exists");
        require(playerCount >= 2 && playerCount <= 20, "Players out of range");
        require(entryAmount > 0, "Entry amount required");

        Game storage game = games[gameId];
        game.host = msg.sender;
        game.players.push(msg.sender);
        game.playerCount = playerCount;
        game.entryAmount = entryAmount;
        game.platformFee = platformFee;
        game.status = GameStatus.Pending;

        emit GameCreated(gameId, msg.sender, playerCount, entryAmount, platformFee);
    }

    function joinGame(bytes32 gameId) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Pending, "Not open");
        require(game.players.length < game.playerCount, "Room full");
        for (uint i = 0; i < game.players.length; i++) {
            require(game.players[i] != msg.sender, "Already joined");
        }
        game.players.push(msg.sender);
        emit PlayerJoined(gameId, msg.sender);
    }

    function fundPool(bytes32 gameId) external payable {
        Game storage game = games[gameId];
        require(game.players.length == game.playerCount, "Not enough players yet");
        require(game.status == GameStatus.Pending, "Not pending");
        require(msg.value == game.entryAmount, "Wrong entry");
        bool isPlayer = false;
        for (uint i = 0; i < game.players.length; i++) {
            if (game.players[i] == msg.sender) isPlayer = true;
        }
        require(isPlayer, "Not a player");
        require(!game.funded[msg.sender], "Already funded");
        game.funded[msg.sender] = true;
        game.fundedCount += 1;
        emit PoolFunded(gameId, msg.sender);
        if (game.fundedCount == game.playerCount) {
            game.status = GameStatus.Funded;
        }
    }

    function startGame(bytes32 gameId) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Funded, "Not funded");
        require(msg.sender == game.host, "Only host");
        game.status = GameStatus.Active;
        emit GameStarted(gameId);
    }

    // Anyone can call setWinner (could restrict to host or admin for more safety)
    function setWinner(bytes32 gameId, address winner) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Active, "Not active");
        bool isPlayer = false;
        for (uint i = 0; i < game.players.length; i++) {
            if (game.players[i] == winner) isPlayer = true;
        }
        require(isPlayer, "Winner not a player");
        game.status = GameStatus.Finished;
        game.winner = winner;

        uint256 pool = game.entryAmount * game.playerCount;
        require(pool > game.platformFee, "Fee too high");
        uint256 winnerAmount = pool - game.platformFee;

        (bool sentToWinner, ) = winner.call{value: winnerAmount}("");
        (bool sentToOwner, ) = owner.call{value: game.platformFee}("");
        require(sentToWinner && sentToOwner, "Payout fail");

        emit WinnerPaid(gameId, winner, winnerAmount, game.platformFee);
    }

    function collect() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Helper function for UI
    function getGamePlayers(bytes32 gameId) external view returns (address[] memory) {
        return games[gameId].players;
    }
}


