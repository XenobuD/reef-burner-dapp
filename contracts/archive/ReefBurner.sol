// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title ReefBurner
 * @dev A decentralized token burn dApp with automated prize distribution
 *
 * Features:
 * - Gas-intensive burn mechanism to increase network fees
 * - Automated lottery system with fair winner selection
 * - Transparent prize pool management
 * - Emergency pause functionality
 * - No manual intervention required for prize distribution
 */
contract ReefBurner {

    // ============ State Variables ============

    address public owner;
    address public creatorWallet; // Creator wallet (8% total)

    uint256 public constant BURN_PERCENTAGE = 65; // 65% burned
    uint256 public constant PRIZE_PERCENTAGE = 27; // 27% goes to prize pool
    uint256 public constant CREATOR_PERCENTAGE = 8;   // 8% goes to creator

    uint256 public totalBurned;
    uint256 public prizePool;
    uint256 public roundNumber;
    uint256 public roundStartTime;
    // ⚠️ TESTING MODE: 1 hour, 5-8 REEF | PRODUCTION: 3 days, 950-1500 REEF
    uint256 public constant ROUND_DURATION = 1 hours; // For testing - change to "3 days" for production
    uint256 public constant LOTTERY_HOUR = 15; // 15:00 (3 PM) Brussels time
    uint256 public minBurnAmount = 5 ether; // TESTING: 5 REEF minimum | PRODUCTION: 950 ether
    uint256 public constant MAX_BURN_AMOUNT = 8 ether; // TESTING: 8 REEF maximum | PRODUCTION: 1500 ether

    // Statistics counters
    uint256 public totalParticipants; // Total unique participants (all-time)
    uint256 public totalWinners; // Total number of winners (all rounds)
    uint256 public totalReefBurned; // Total REEF burned (all-time)

    bool public paused;

    // Mapping to track participants in current round
    mapping(uint256 => address[]) public roundParticipants;
    mapping(uint256 => mapping(address => uint256)) public userBurnedInRound;

    // Track total burns per user (lifetime)
    mapping(address => uint256) public totalUserBurned;

    // Track if user has ever participated (for unique participant count)
    mapping(address => bool) public hasParticipated;

    // Winner history
    struct Winner {
        address winnerAddress;
        uint256 prizeAmount;
        uint256 roundNumber;
        uint256 timestamp;
    }

    Winner[] public winners;

    // ============ Events ============

    event Burned(
        address indexed burner,
        uint256 amount,
        uint256 burnedAmount,
        uint256 prizeAmount,
        uint256 creatorAmount,
        uint256 roundNumber
    );

    event WinnerSelected(
        address indexed winner,
        uint256 prizeAmount,
        uint256 roundNumber,
        uint256 timestamp
    );

    event RoundStarted(
        uint256 roundNumber,
        uint256 startTime
    );

    event EmergencyPause(bool paused);
    event MinBurnAmountUpdated(uint256 newAmount);
    event CreatorWalletUpdated(address newCreatorWallet);

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Contract is not paused");
        _;
    }

    // ============ Constructor ============

    constructor(address _creatorWallet) {
        require(_creatorWallet != address(0), "Invalid creator wallet");
        owner = msg.sender;
        creatorWallet = _creatorWallet;
        roundNumber = 1;
        roundStartTime = block.timestamp;

        emit RoundStarted(roundNumber, roundStartTime);
    }

    // ============ Main Functions ============

    /**
     * @dev Main burn function - users send REEF to burn gas and enter lottery
     * Automatically distributes funds: 70% burn, 20% prize pool, 10% dev
     */
    function burn() external payable whenNotPaused {
        require(msg.value >= minBurnAmount, "Amount below minimum");
        require(msg.value <= MAX_BURN_AMOUNT, "Amount exceeds maximum");

        // Check if round has ended and automatically select winner
        if (block.timestamp >= roundStartTime + ROUND_DURATION) {
            _selectWinnerAndStartNewRound();
        }

        uint256 burnAmount = (msg.value * BURN_PERCENTAGE) / 100;
        uint256 prizeAmount = (msg.value * PRIZE_PERCENTAGE) / 100;
        uint256 creatorAmount = (msg.value * CREATOR_PERCENTAGE) / 100;

        // Perform gas-intensive operations to burn more gas
        _performGasIntensiveOperations();

        // Update state
        totalBurned += burnAmount;
        prizePool += prizeAmount;
        totalReefBurned += burnAmount; // Track total REEF burned all-time

        // Add user to current round if not already participating
        if (userBurnedInRound[roundNumber][msg.sender] == 0) {
            roundParticipants[roundNumber].push(msg.sender);
        }

        // Track unique participants
        if (!hasParticipated[msg.sender]) {
            hasParticipated[msg.sender] = true;
            totalParticipants++;
        }

        userBurnedInRound[roundNumber][msg.sender] += msg.value;
        totalUserBurned[msg.sender] += msg.value;

        // Send creator percentage
        (bool success, ) = creatorWallet.call{value: creatorAmount}("");
        require(success, "Creator transfer failed");

        // Burn the burn amount by sending to address(0) or using selfdestruct-like pattern
        // Note: In modern Solidity, we can't actually destroy tokens, so we send to dead address
        (bool burnSuccess, ) = address(0x000000000000000000000000000000000000dEaD).call{value: burnAmount}("");
        require(burnSuccess, "Burn transfer failed");

        emit Burned(
            msg.sender,
            msg.value,
            burnAmount,
            prizeAmount,
            creatorAmount,
            roundNumber
        );
    }

    /**
     * @dev Gas-intensive operations to increase burn
     * This function performs unnecessary computations to consume more gas
     */
    function _performGasIntensiveOperations() private {
        uint256 tempValue = 0;

        // Multiple loops with calculations
        for (uint256 i = 0; i < 50; i++) {
            tempValue += i ** 2;
            tempValue = tempValue % 1000;

            // Nested loop for more gas consumption
            for (uint256 j = 0; j < 10; j++) {
                tempValue += (i * j) % 100;
            }
        }

        // Store and delete to consume more gas
        uint256[10] memory tempArray;
        for (uint256 k = 0; k < 10; k++) {
            tempArray[k] = tempValue + k;
        }
    }

    /**
     * @dev Automatically select winner and start new round with weighted lottery
     * Called automatically when round duration has passed
     * Higher burn amounts give better odds:
     * TESTING MODE:
     * - 8 REEF: +3% bonus tickets
     * - 7 REEF: +2% bonus tickets
     * - 6 REEF: +1% bonus tickets
     * - 5 REEF: base tickets (no bonus)
     */
    function _selectWinnerAndStartNewRound() private {
        uint256 currentRound = roundNumber;
        address[] memory participants = roundParticipants[currentRound];

        // Only select winner if there are participants
        if (participants.length > 0 && prizePool > 0) {
            // Build weighted lottery system
            uint256 totalTickets = 0;
            uint256[] memory cumulativeTickets = new uint256[](participants.length);

            for (uint256 i = 0; i < participants.length; i++) {
                uint256 userBurned = userBurnedInRound[currentRound][participants[i]];
                uint256 tickets = _calculateTickets(userBurned);
                totalTickets += tickets;
                cumulativeTickets[i] = totalTickets;
            }

            // Generate random number
            uint256 randomNumber = _generateRandomNumber(totalTickets);

            // Find winner based on weighted tickets
            address winner;
            for (uint256 i = 0; i < participants.length; i++) {
                if (randomNumber < cumulativeTickets[i]) {
                    winner = participants[i];
                    break;
                }
            }

            uint256 prize = prizePool;

            // Reset prize pool
            prizePool = 0;

            // Record winner
            winners.push(Winner({
                winnerAddress: winner,
                prizeAmount: prize,
                roundNumber: currentRound,
                timestamp: block.timestamp
            }));

            // Increment winners counter
            totalWinners++;

            // Transfer prize to winner
            (bool success, ) = winner.call{value: prize}("");
            require(success, "Prize transfer failed");

            emit WinnerSelected(winner, prize, currentRound, block.timestamp);
        }

        // Start new round
        roundNumber++;
        roundStartTime = block.timestamp;

        emit RoundStarted(roundNumber, roundStartTime);
    }

    /**
     * @dev Calculate lottery tickets based on burn amount
     * Higher amounts get bonus tickets for better odds
     * TESTING: 5-8 REEF | PRODUCTION: 950-1500 REEF
     */
    function _calculateTickets(uint256 amount) private pure returns (uint256) {
        // Base tickets = 100
        uint256 tickets = 100;

        // TESTING MODE: Add bonus tickets for 5-8 REEF
        if (amount >= 8 ether) {
            tickets += 3; // +3% bonus for 8 REEF
        } else if (amount >= 7 ether) {
            tickets += 2; // +2% bonus for 7 REEF
        } else if (amount >= 6 ether) {
            tickets += 1; // +1% bonus for 6 REEF
        }
        // 5 REEF gets base 100 tickets (no bonus)

        // PRODUCTION MODE (commented for now):
        // if (amount >= 1500 ether) {
        //     tickets += 3; // +3% bonus for 1500 REEF
        // } else if (amount >= 1200 ether) {
        //     tickets += 2; // +2% bonus for 1200 REEF
        // } else if (amount >= 1050 ether) {
        //     tickets += 1; // +1% bonus for 1050 REEF
        // }

        return tickets;
    }

    /**
     * @dev Generate pseudo-random number
     * WARNING: This is NOT cryptographically secure randomness
     * For production, integrate Chainlink VRF or similar oracle
     */
    function _generateRandomNumber(uint256 max) private view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.difficulty,
                    msg.sender,
                    roundNumber,
                    totalBurned
                )
            )
        ) % max;
    }

    /**
     * @dev Manual trigger to end round and select winner
     * Anyone can call this if round duration has passed
     */
    function triggerRoundEnd() external whenNotPaused {
        require(
            block.timestamp >= roundStartTime + ROUND_DURATION,
            "Round not finished yet"
        );

        _selectWinnerAndStartNewRound();
    }

    // ============ View Functions ============

    /**
     * @dev Get current round participants
     */
    function getCurrentRoundParticipants() external view returns (address[] memory) {
        return roundParticipants[roundNumber];
    }

    /**
     * @dev Get participants for a specific round
     */
    function getRoundParticipants(uint256 _roundNumber) external view returns (address[] memory) {
        return roundParticipants[_roundNumber];
    }

    /**
     * @dev Get time remaining in current round
     */
    function getTimeRemainingInRound() external view returns (uint256) {
        uint256 endTime = roundStartTime + ROUND_DURATION;
        if (block.timestamp >= endTime) {
            return 0;
        }
        return endTime - block.timestamp;
    }

    /**
     * @dev Get total number of winners
     */
    function getWinnersCount() external view returns (uint256) {
        return winners.length;
    }

    /**
     * @dev Get winner details by index
     */
    function getWinner(uint256 index) external view returns (
        address winnerAddress,
        uint256 prizeAmount,
        uint256 roundNum,
        uint256 timestamp
    ) {
        require(index < winners.length, "Invalid index");
        Winner memory w = winners[index];
        return (w.winnerAddress, w.prizeAmount, w.roundNumber, w.timestamp);
    }

    /**
     * @dev Get user's burn amount in current round
     */
    function getUserBurnInCurrentRound(address user) external view returns (uint256) {
        return userBurnedInRound[roundNumber][user];
    }

    /**
     * @dev Check if round should end
     */
    function shouldEndRound() external view returns (bool) {
        return block.timestamp >= roundStartTime + ROUND_DURATION;
    }

    /**
     * @dev Get all statistics for frontend display
     * Returns: totalParticipants, totalWinners, totalReefBurned, prizePool, currentRoundParticipants
     */
    function getStatistics() external view returns (
        uint256 participants,
        uint256 winnersCount,
        uint256 reefBurned,
        uint256 currentPrize,
        uint256 currentRoundParticipantsCount
    ) {
        return (
            totalParticipants,
            totalWinners,
            totalReefBurned,
            prizePool,
            roundParticipants[roundNumber].length
        );
    }

    /**
     * @dev Calculate what user would burn and win if they participate with given amount
     * Returns: burnedAmount (70%), prizeContribution (20%), devAmount (10%)
     */
    function calculateBurnDistribution(uint256 amount) external pure returns (
        uint256 burnedAmount,
        uint256 prizeContribution,
        uint256 creatorAmount
    ) {
        require(amount > 0, "Amount must be greater than 0");
        return (
            (amount * 65) / 100,  // 65% burned
            (amount * 27) / 100,  // 27% to prize pool
            (amount * 8) / 100    // 8% to creator
        );
    }

    // ============ Admin Functions ============

    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner whenNotPaused {
        paused = true;
        emit EmergencyPause(true);
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner whenPaused {
        paused = false;
        emit EmergencyPause(false);
    }

    /**
     * @dev Update minimum burn amount
     */
    function setMinBurnAmount(uint256 _newAmount) external onlyOwner {
        require(_newAmount > 0, "Amount must be greater than 0");
        minBurnAmount = _newAmount;
        emit MinBurnAmountUpdated(_newAmount);
    }

    /**
     * @dev Update creator wallet address
     */
    function setCreatorWallet(address _newCreatorWallet) external onlyOwner {
        require(_newCreatorWallet != address(0), "Invalid address");
        creatorWallet = _newCreatorWallet;
        emit CreatorWalletUpdated(_newCreatorWallet);
    }

    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    /**
     * @dev Emergency withdraw - only callable when paused
     * Allows owner to recover stuck funds in case of emergency
     */
    function emergencyWithdraw() external onlyOwner whenPaused {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdraw failed");
    }

    // ============ View Functions (Additional) ============

    /**
     * @dev Get contract REEF balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Fallback function to accept REEF
     */
    receive() external payable {
        // Accept direct transfers but don't add to prize pool
        // Users must use burn() function to participate
    }
}
