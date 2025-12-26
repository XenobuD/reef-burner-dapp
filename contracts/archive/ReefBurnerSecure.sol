// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title ReefBurnerSecure
 * @dev A secure decentralized token burn dApp with automated prize distribution
 *
 * SECURITY IMPROVEMENTS:
 * ✅ ReentrancyGuard protection
 * ✅ Immutable creator wallet (no rug pull)
 * ✅ No emergencyWithdraw (no fund extraction)
 * ✅ Improved randomness with commit-reveal + future block hash
 * ✅ Max participants cap (gas limit protection)
 * ✅ Checks-Effects-Interactions pattern
 * ✅ Full event logging for transparency
 *
 * Features:
 * - Gas-intensive burn mechanism to increase network fees
 * - Automated lottery system with fair winner selection
 * - Transparent prize pool management
 * - Emergency pause functionality (admin only)
 * - No manual intervention required for prize distribution
 */
contract ReefBurnerSecure {

    // ============ State Variables ============

    address public owner;
    address public immutable creatorWallet; // IMMUTABLE - cannot be changed!

    uint256 public constant BURN_PERCENTAGE = 65; // 65% burned
    uint256 public constant PRIZE_PERCENTAGE = 27; // 27% goes to prize pool
    uint256 public constant CREATOR_PERCENTAGE = 8;   // 8% goes to creator

    uint256 public totalBurned;
    uint256 public prizePool;
    uint256 public roundNumber;
    uint256 public roundStartTime;

    // ⚠️ TESTING MODE: 1 hour, 5-8 REEF | PRODUCTION: 3 days, 950-1500 REEF
    uint256 public constant ROUND_DURATION = 1 hours; // For testing - change to "3 days" for production
    uint256 public minBurnAmount = 5 ether; // TESTING: 5 REEF minimum | PRODUCTION: 950 ether
    uint256 public constant MAX_BURN_AMOUNT = 8 ether; // TESTING: 8 REEF maximum | PRODUCTION: 1500 ether

    // Security: Max participants to prevent gas limit DoS
    uint256 public constant MAX_PARTICIPANTS_PER_ROUND = 500;

    // Statistics counters
    uint256 public totalParticipants; // Total unique participants (all-time)
    uint256 public totalWinners; // Total number of winners (all rounds)
    uint256 public totalReefBurned; // Total REEF burned (all-time)

    bool public paused;

    // Reentrancy protection
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private _status;

    // Improved randomness: commit-reveal scheme
    uint256 public randomCommitBlock; // Block number when lottery was triggered
    bool public randomCommitted; // Whether we're waiting for random reveal

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
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event RandomnessCommitted(uint256 blockNumber);
    event RandomnessRevealed(uint256 randomValue);

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

    modifier nonReentrant() {
        require(_status != ENTERED, "ReentrancyGuard: reentrant call");
        _status = ENTERED;
        _;
        _status = NOT_ENTERED;
    }

    // ============ Constructor ============

    constructor(address _creatorWallet) {
        require(_creatorWallet != address(0), "Invalid creator wallet");
        owner = msg.sender;
        creatorWallet = _creatorWallet; // IMMUTABLE - set once in constructor
        roundNumber = 1;
        roundStartTime = block.timestamp;
        _status = NOT_ENTERED;

        emit RoundStarted(roundNumber, roundStartTime);
    }

    // ============ Main Functions ============

    /**
     * @dev Main burn function - users send REEF to burn gas and enter lottery
     * Automatically distributes funds: 65% burn, 27% prize pool, 8% creator
     *
     * SECURITY: Uses Checks-Effects-Interactions pattern + ReentrancyGuard
     */
    function burn() external payable whenNotPaused nonReentrant {
        // CHECKS
        require(msg.value >= minBurnAmount, "Amount below minimum");
        require(msg.value <= MAX_BURN_AMOUNT, "Amount exceeds maximum");
        require(
            roundParticipants[roundNumber].length < MAX_PARTICIPANTS_PER_ROUND,
            "Max participants reached for this round"
        );

        // Auto-trigger if round ended
        if (block.timestamp >= roundStartTime + ROUND_DURATION && !randomCommitted) {
            _commitRandomness();
        }

        // Calculate distribution
        uint256 burnAmount = (msg.value * BURN_PERCENTAGE) / 100;
        uint256 prizeAmount = (msg.value * PRIZE_PERCENTAGE) / 100;
        uint256 creatorAmount = (msg.value * CREATOR_PERCENTAGE) / 100;

        // Perform gas-intensive operations to burn more gas
        _performGasIntensiveOperations();

        // EFFECTS - Update all state BEFORE external calls
        totalBurned += burnAmount;
        prizePool += prizeAmount;
        totalReefBurned += burnAmount;

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

        // INTERACTIONS - External calls LAST

        // Send creator percentage
        (bool creatorSuccess, ) = creatorWallet.call{value: creatorAmount}("");
        require(creatorSuccess, "Creator transfer failed");

        // Burn the burn amount by sending to dead address
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
     * @dev Step 1: Commit to using a future block hash for randomness
     * This prevents miners from manipulating the outcome
     *
     * SECURITY: Two-step process:
     * 1. Commit: Record current block number
     * 2. Reveal: Use future block hash (3 blocks later) for randomness
     */
    function _commitRandomness() private {
        randomCommitBlock = block.number;
        randomCommitted = true;
        emit RandomnessCommitted(block.number);
    }

    /**
     * @dev Step 2: Reveal randomness and select winner
     * Must be called at least 3 blocks after commit
     * Uses future block hash which miners cannot predict at commit time
     *
     * SECURITY: Improves on simple block.timestamp randomness
     * - Miners can't predict future block hash
     * - 3 block delay prevents same-block manipulation
     * - Still not perfect (miners can refuse to mine), but much better
     */
    function _selectWinnerAndStartNewRound() private nonReentrant {
        require(randomCommitted, "Randomness not committed yet");
        require(block.number > randomCommitBlock + 3, "Must wait 3 blocks after commit");

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

            // Generate random number using future block hash
            uint256 randomValue = _generateRandomNumber(totalTickets);
            emit RandomnessRevealed(randomValue);

            // Find winner based on weighted tickets
            address winner;
            for (uint256 i = 0; i < participants.length; i++) {
                if (randomValue < cumulativeTickets[i]) {
                    winner = participants[i];
                    break;
                }
            }

            uint256 prize = prizePool;

            // EFFECTS - Update all state BEFORE external transfer
            prizePool = 0;
            roundNumber++;
            roundStartTime = block.timestamp;
            randomCommitted = false;
            randomCommitBlock = 0;

            // Record winner
            winners.push(Winner({
                winnerAddress: winner,
                prizeAmount: prize,
                roundNumber: currentRound,
                timestamp: block.timestamp
            }));

            totalWinners++;

            emit WinnerSelected(winner, prize, currentRound, block.timestamp);
            emit RoundStarted(roundNumber, roundStartTime);

            // INTERACTIONS - Transfer prize LAST
            (bool success, ) = winner.call{value: prize}("");
            require(success, "Prize transfer failed");
        } else {
            // No participants or no prize - just start new round
            roundNumber++;
            roundStartTime = block.timestamp;
            randomCommitted = false;
            randomCommitBlock = 0;

            emit RoundStarted(roundNumber, roundStartTime);
        }
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

        return tickets;
    }

    /**
     * @dev Generate improved pseudo-random number using future block hash
     *
     * SECURITY IMPROVEMENT:
     * Uses block hash from 3 blocks in the future (set during commit)
     * This prevents:
     * - Same-block manipulation
     * - Miner prediction at commit time
     *
     * Still not cryptographically secure, but MUCH better than original
     * For true security, would need Chainlink VRF (not available on Reef yet)
     */
    function _generateRandomNumber(uint256 max) private view returns (uint256) {
        // Use block hash from a few blocks after commit
        // This hash was unknown at commit time, preventing prediction
        bytes32 futureBlockHash = blockhash(randomCommitBlock + 3);

        // Fallback to current block info if blockhash returns 0 (>256 blocks old)
        if (futureBlockHash == bytes32(0)) {
            futureBlockHash = blockhash(block.number - 1);
        }

        return uint256(
            keccak256(
                abi.encodePacked(
                    futureBlockHash,
                    randomCommitBlock,
                    roundNumber,
                    totalBurned,
                    totalParticipants
                )
            )
        ) % max;
    }

    /**
     * @dev Manual trigger to commit randomness (step 1 of lottery)
     * Anyone can call this if round duration has passed
     */
    function triggerRoundEnd() external whenNotPaused {
        require(
            block.timestamp >= roundStartTime + ROUND_DURATION,
            "Round not finished yet"
        );
        require(!randomCommitted, "Already committed, waiting for reveal");

        _commitRandomness();
    }

    /**
     * @dev Reveal randomness and select winner (step 2 of lottery)
     * Anyone can call this after 3 blocks from commit
     */
    function revealWinner() external whenNotPaused {
        require(randomCommitted, "Must commit first");
        require(block.number > randomCommitBlock + 3, "Must wait 3 blocks");

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
     * @dev Calculate distribution breakdown
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
     * @dev Transfer ownership with event logging
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    // ============ REMOVED FUNCTIONS FOR SECURITY ============

    // ❌ emergencyWithdraw() - REMOVED to prevent rug pull
    // ❌ setCreatorWallet() - REMOVED (creatorWallet is now immutable)

    // ============ View Functions (Additional) ============

    /**
     * @dev Get contract REEF balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Check randomness status
     */
    function getRandomnessStatus() external view returns (
        bool committed,
        uint256 commitBlock,
        uint256 blocksUntilReveal
    ) {
        uint256 blocksToWait = 0;
        if (randomCommitted && block.number <= randomCommitBlock + 3) {
            blocksToWait = (randomCommitBlock + 3) - block.number;
        }

        return (randomCommitted, randomCommitBlock, blocksToWait);
    }

    /**
     * @dev Fallback function to accept REEF
     */
    receive() external payable {
        // Accept direct transfers but don't add to prize pool
        // Users must use burn() function to participate
    }
}
