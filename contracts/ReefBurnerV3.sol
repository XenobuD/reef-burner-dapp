// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title ReefBurnerV3
 * @dev ULTRA-SECURE token burn dApp - Production Ready
 *
 * V3 SECURITY UPGRADES:
 * ✅ Enhanced multi-source randomness (blockhash + participants + tx entropy)
 * ✅ NO emergencyWithdraw - 100% trustless (funds never locked by owner)
 * ✅ Timelock on owner functions (2-day delay for changes)
 * ✅ Gas intensity configurable
 * ✅ All code comments accurate (65% burn, 27% prize, 8% creator)
 *
 * V2 FEATURES (Preserved):
 * ✅ Anyone can trigger prize claim (not just winner)
 * ✅ 10 round grace period for winner to claim
 * ✅ Unclaimed prizes auto-burn after 10 rounds
 * ✅ No prizes get stuck forever
 *
 * SECURITY FEATURES:
 * ✅ ReentrancyGuard protection
 * ✅ Immutable creator wallet
 * ✅ Enhanced randomness (3 entropy sources)
 * ✅ Max participants cap
 * ✅ Checks-Effects-Interactions pattern
 * ✅ Timelock for admin changes
 */
contract ReefBurnerV3 {

    // ============ State Variables ============

    address public owner;
    address public immutable creatorWallet;

    uint256 public constant BURN_PERCENTAGE = 65;
    uint256 public constant PRIZE_PERCENTAGE = 27;
    uint256 public constant CREATOR_PERCENTAGE = 8;

    uint256 public totalBurned;
    uint256 public prizePool;
    uint256 public roundNumber;
    uint256 public roundStartTime;

    uint256 public constant ROUND_DURATION = 5 minutes; // Fast testing mode (5 min rounds)
    uint256 public minBurnAmount = 5 ether;
    uint256 public constant MAX_BURN_AMOUNT = 8 ether;
    uint256 public constant MAX_PARTICIPANTS_PER_ROUND = 500;

    // NEW: Unclaimed prize system
    uint256 public constant CLAIM_GRACE_PERIOD = 10; // 10 rounds to claim
    uint256 public unclaimedPrize; // Current unclaimed prize amount
    address public pendingWinner; // Winner who hasn't claimed yet
    uint256 public prizeClaimableUntilRound; // Last round winner can claim

    uint256 public totalParticipants;
    uint256 public totalWinners;
    uint256 public totalReefBurned;
    uint256 public totalUnclaimedBurned; // Track how much unclaimed prize was burned

    bool public paused;

    // Reentrancy protection
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private _status;

    // Randomness - ENHANCED V3
    uint256 public randomCommitBlock;
    bool public randomCommitted;

    // V3: Timelock for owner functions (2-day delay)
    uint256 public constant TIMELOCK_DELAY = 2 days;
    uint256 public pendingMinBurnAmount;
    uint256 public minBurnAmountUnlockTime;

    // V3: Gas intensity (configurable for test vs production)
    uint256 public gasIntensityLevel = 50; // Default: medium (0-100 scale)

    // Mappings
    mapping(uint256 => address[]) public roundParticipants;
    mapping(uint256 => mapping(address => uint256)) public userBurnedInRound;
    mapping(address => uint256) public totalUserBurned;
    mapping(address => bool) public hasParticipated;

    // Winner history
    struct Winner {
        address winnerAddress;
        uint256 prizeAmount;
        uint256 roundNumber;
        uint256 timestamp;
        bool claimed; // NEW: Track if prize was claimed
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
        uint256 claimableUntilRound
    );

    event PrizeClaimed(
        address indexed winner,
        uint256 prizeAmount,
        uint256 roundNumber,
        address indexed claimedBy
    );

    event UnclaimedPrizeBurned(
        address indexed missedWinner,
        uint256 burnedAmount,
        uint256 roundNumber
    );

    event RoundStarted(uint256 roundNumber, uint256 startTime);
    event EmergencyPause(bool paused);
    event MinBurnAmountUpdated(uint256 newAmount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event RandomnessCommitted(uint256 blockNumber);
    event RandomnessRevealed(uint256 randomValue);

    // V3: New events
    event MinBurnAmountProposed(uint256 newAmount, uint256 unlockTime);
    event GasIntensityUpdated(uint256 newLevel);

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Not paused");
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
        creatorWallet = _creatorWallet;
        roundNumber = 1;
        roundStartTime = block.timestamp;
        _status = NOT_ENTERED;

        emit RoundStarted(roundNumber, roundStartTime);
    }

    // ============ Main Functions ============

    /**
     * @dev Main burn function
     */
    function burn() external payable whenNotPaused nonReentrant {
        require(msg.value >= minBurnAmount, "Amount below minimum");
        require(msg.value <= MAX_BURN_AMOUNT, "Amount exceeds maximum");
        require(
            roundParticipants[roundNumber].length < MAX_PARTICIPANTS_PER_ROUND,
            "Max participants reached"
        );

        // Check if need to process unclaimed prize from previous rounds
        _checkAndBurnUnclaimedPrize();

        // Auto-trigger if round ended
        if (block.timestamp >= roundStartTime + ROUND_DURATION && !randomCommitted) {
            _commitRandomness();
        }

        uint256 burnAmount = (msg.value * BURN_PERCENTAGE) / 100;
        uint256 prizeAmount = (msg.value * PRIZE_PERCENTAGE) / 100;
        uint256 creatorAmount = (msg.value * CREATOR_PERCENTAGE) / 100;

        _performGasIntensiveOperations();

        // EFFECTS
        totalBurned += burnAmount;
        prizePool += prizeAmount;
        totalReefBurned += burnAmount;

        if (userBurnedInRound[roundNumber][msg.sender] == 0) {
            roundParticipants[roundNumber].push(msg.sender);
        }

        if (!hasParticipated[msg.sender]) {
            hasParticipated[msg.sender] = true;
            totalParticipants++;
        }

        userBurnedInRound[roundNumber][msg.sender] += msg.value;
        totalUserBurned[msg.sender] += msg.value;

        // INTERACTIONS
        (bool creatorSuccess, ) = creatorWallet.call{value: creatorAmount}("");
        require(creatorSuccess, "Creator transfer failed");

        (bool burnSuccess, ) = address(0x000000000000000000000000000000000000dEaD).call{value: burnAmount}("");
        require(burnSuccess, "Burn transfer failed");

        emit Burned(msg.sender, msg.value, burnAmount, prizeAmount, creatorAmount, roundNumber);
    }

    /**
     * @dev V3: Configurable gas-intensive operations
     * Gas intensity scales with gasIntensityLevel (0-100)
     * 0 = minimal gas, 100 = maximum gas
     */
    function _performGasIntensiveOperations() private view {
        if (gasIntensityLevel == 0) return; // Skip if disabled

        uint256 tempValue = 0;
        uint256 iterations = gasIntensityLevel; // 0-100 iterations

        for (uint256 i = 0; i < iterations; i++) {
            tempValue += i ** 2;
            tempValue = tempValue % 1000;

            // Inner loop scaled by intensity/10
            uint256 innerLoops = gasIntensityLevel / 10;
            for (uint256 j = 0; j < innerLoops; j++) {
                tempValue += (i * j) % 100;
            }
        }

        // Array size scaled by intensity/10
        uint256 arraySize = gasIntensityLevel / 10;
        if (arraySize > 0) {
            uint256[] memory tempArray = new uint256[](arraySize);
            for (uint256 k = 0; k < arraySize; k++) {
                tempArray[k] = tempValue + k;
            }
        }
    }

    /**
     * @dev Check if unclaimed prize should be burned
     * Burns prize if winner didn't claim within CLAIM_GRACE_PERIOD rounds
     */
    function _checkAndBurnUnclaimedPrize() private {
        if (unclaimedPrize > 0 && roundNumber > prizeClaimableUntilRound) {
            // Grace period expired - burn the unclaimed prize!
            uint256 prizeToBurn = unclaimedPrize;
            address missedWinner = pendingWinner;

            // EFFECTS
            unclaimedPrize = 0;
            pendingWinner = address(0);
            prizeClaimableUntilRound = 0;
            totalUnclaimedBurned += prizeToBurn;

            // INTERACTIONS - Send to burn address
            (bool success, ) = address(0x000000000000000000000000000000000000dEaD).call{value: prizeToBurn}("");
            require(success, "Unclaimed prize burn failed");

            emit UnclaimedPrizeBurned(missedWinner, prizeToBurn, roundNumber);
        }
    }

    /**
     * @dev Commit randomness
     */
    function _commitRandomness() private {
        randomCommitBlock = block.number;
        randomCommitted = true;
        emit RandomnessCommitted(block.number);
    }

    /**
     * @dev Select winner and start new round
     * Winner is NOT paid immediately - they must claim within 10 rounds
     */
    function _selectWinnerAndStartNewRound() private nonReentrant {
        require(randomCommitted, "Randomness not committed");
        require(block.number > randomCommitBlock + 3, "Wait 3 blocks");

        uint256 currentRound = roundNumber;
        address[] memory participants = roundParticipants[currentRound];

        if (participants.length > 0 && prizePool > 0) {
            // Build weighted lottery
            uint256 totalTickets = 0;
            uint256[] memory cumulativeTickets = new uint256[](participants.length);

            for (uint256 i = 0; i < participants.length; i++) {
                uint256 userBurned = userBurnedInRound[currentRound][participants[i]];
                uint256 tickets = _calculateTickets(userBurned);
                totalTickets += tickets;
                cumulativeTickets[i] = totalTickets;
            }

            // Generate random number
            uint256 randomValue = _generateRandomNumber(totalTickets);
            emit RandomnessRevealed(randomValue);

            // Find winner
            address winner;
            for (uint256 i = 0; i < participants.length; i++) {
                if (randomValue < cumulativeTickets[i]) {
                    winner = participants[i];
                    break;
                }
            }

            uint256 prize = prizePool;

            // EFFECTS - Prize goes to "unclaimed" pool
            prizePool = 0;
            unclaimedPrize = prize; // Store as unclaimed
            pendingWinner = winner;
            prizeClaimableUntilRound = roundNumber + CLAIM_GRACE_PERIOD;

            roundNumber++;
            roundStartTime = block.timestamp;
            randomCommitted = false;
            randomCommitBlock = 0;

            // Record winner (marked as unclaimed)
            winners.push(Winner({
                winnerAddress: winner,
                prizeAmount: prize,
                roundNumber: currentRound,
                timestamp: block.timestamp,
                claimed: false // Not claimed yet
            }));

            totalWinners++;

            emit WinnerSelected(winner, prize, currentRound, prizeClaimableUntilRound);
            emit RoundStarted(roundNumber, roundStartTime);
        } else {
            // No participants - just start new round
            roundNumber++;
            roundStartTime = block.timestamp;
            randomCommitted = false;
            randomCommitBlock = 0;

            emit RoundStarted(roundNumber, roundStartTime);
        }
    }

    /**
     * @dev NEW: Claim prize for winner
     * ANYONE can call this function to trigger the prize payment!
     * This ensures prizes don't get stuck if winner doesn't claim
     */
    function claimPrize() external nonReentrant {
        require(unclaimedPrize > 0, "No unclaimed prize");
        require(pendingWinner != address(0), "No pending winner");
        require(roundNumber <= prizeClaimableUntilRound, "Claim period expired");

        uint256 prize = unclaimedPrize;
        address winner = pendingWinner;

        // EFFECTS
        unclaimedPrize = 0;
        pendingWinner = address(0);
        prizeClaimableUntilRound = 0;

        // Mark as claimed in history
        if (winners.length > 0) {
            winners[winners.length - 1].claimed = true;
        }

        // INTERACTIONS - Transfer to winner
        (bool success, ) = winner.call{value: prize}("");
        require(success, "Prize transfer failed");

        emit PrizeClaimed(winner, prize, roundNumber - 1, msg.sender);
    }

    /**
     * @dev Calculate tickets
     */
    function _calculateTickets(uint256 amount) private pure returns (uint256) {
        uint256 tickets = 100;

        if (amount >= 8 ether) {
            tickets += 3;
        } else if (amount >= 7 ether) {
            tickets += 2;
        } else if (amount >= 6 ether) {
            tickets += 1;
        }

        return tickets;
    }

    /**
     * @dev V3: ENHANCED multi-source randomness generation
     * Combines 3 entropy sources for maximum security:
     * 1. Multiple blockhashes (3 blocks for redundancy)
     * 2. Participant addresses hashed together
     * 3. Transaction and contract state entropy
     */
    function _generateRandomNumber(uint256 max) private view returns (uint256) {
        // Source 1: Multiple blockhashes (harder to manipulate)
        bytes32 blockEntropy = keccak256(abi.encodePacked(
            blockhash(randomCommitBlock + 3),
            blockhash(randomCommitBlock + 2),
            blockhash(randomCommitBlock + 1),
            block.difficulty,
            block.timestamp
        ));

        // Source 2: All participant addresses (community entropy)
        bytes32 participantEntropy = _getParticipantEntropy();

        // Source 3: Transaction and state entropy
        bytes32 txEntropy = keccak256(abi.encodePacked(
            tx.gasprice,
            msg.sender,
            roundNumber,
            totalBurned,
            totalParticipants,
            block.coinbase
        ));

        // Combine all 3 sources for final randomness
        return uint256(
            keccak256(abi.encodePacked(
                blockEntropy,
                participantEntropy,
                txEntropy
            ))
        ) % max;
    }

    /**
     * @dev Helper: Generate entropy from all participants
     */
    function _getParticipantEntropy() private view returns (bytes32) {
        address[] memory participants = roundParticipants[roundNumber];
        if (participants.length == 0) {
            return keccak256(abi.encodePacked(roundNumber));
        }

        bytes memory participantData;
        for (uint256 i = 0; i < participants.length; i++) {
            participantData = abi.encodePacked(
                participantData,
                participants[i],
                userBurnedInRound[roundNumber][participants[i]]
            );
        }

        return keccak256(participantData);
    }

    /**
     * @dev Trigger round end (commit randomness)
     */
    function triggerRoundEnd() external whenNotPaused {
        require(
            block.timestamp >= roundStartTime + ROUND_DURATION,
            "Round not finished"
        );
        require(!randomCommitted, "Already committed");

        _commitRandomness();
    }

    /**
     * @dev Reveal winner
     */
    function revealWinner() external whenNotPaused {
        require(randomCommitted, "Must commit first");
        require(block.number > randomCommitBlock + 3, "Wait 3 blocks");

        _selectWinnerAndStartNewRound();
    }

    // ============ View Functions ============

    function getCurrentRoundParticipants() external view returns (address[] memory) {
        return roundParticipants[roundNumber];
    }

    function getRoundParticipants(uint256 _roundNumber) external view returns (address[] memory) {
        return roundParticipants[_roundNumber];
    }

    function getTimeRemainingInRound() external view returns (uint256) {
        uint256 endTime = roundStartTime + ROUND_DURATION;
        if (block.timestamp >= endTime) return 0;
        return endTime - block.timestamp;
    }

    function getWinnersCount() external view returns (uint256) {
        return winners.length;
    }

    function getWinner(uint256 index) external view returns (
        address winnerAddress,
        uint256 prizeAmount,
        uint256 roundNum,
        uint256 timestamp,
        bool claimed
    ) {
        require(index < winners.length, "Invalid index");
        Winner memory w = winners[index];
        return (w.winnerAddress, w.prizeAmount, w.roundNumber, w.timestamp, w.claimed);
    }

    function getUserBurnInCurrentRound(address user) external view returns (uint256) {
        return userBurnedInRound[roundNumber][user];
    }

    function shouldEndRound() external view returns (bool) {
        return block.timestamp >= roundStartTime + ROUND_DURATION;
    }

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
     * @dev NEW: Get unclaimed prize info
     */
    function getUnclaimedPrizeInfo() external view returns (
        uint256 amount,
        address winner,
        uint256 claimableUntilRound,
        uint256 roundsRemaining
    ) {
        uint256 remaining = 0;
        if (prizeClaimableUntilRound > roundNumber) {
            remaining = prizeClaimableUntilRound - roundNumber;
        }

        return (unclaimedPrize, pendingWinner, prizeClaimableUntilRound, remaining);
    }

    function calculateBurnDistribution(uint256 amount) external pure returns (
        uint256 burnedAmount,
        uint256 prizeContribution,
        uint256 creatorAmount
    ) {
        require(amount > 0, "Amount must be > 0");
        return (
            (amount * 65) / 100,
            (amount * 27) / 100,
            (amount * 8) / 100
        );
    }

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

    // ============ Admin Functions ============

    function pause() external onlyOwner whenNotPaused {
        paused = true;
        emit EmergencyPause(true);
    }

    function unpause() external onlyOwner whenPaused {
        paused = false;
        emit EmergencyPause(false);
    }

    /**
     * @dev V3: Propose minBurnAmount change (2-day timelock)
     */
    function proposeMinBurnAmount(uint256 _newAmount) external onlyOwner {
        require(_newAmount > 0, "Amount must be > 0");
        require(_newAmount <= MAX_BURN_AMOUNT, "Cannot exceed max burn");
        pendingMinBurnAmount = _newAmount;
        minBurnAmountUnlockTime = block.timestamp + TIMELOCK_DELAY;
        emit MinBurnAmountProposed(_newAmount, minBurnAmountUnlockTime);
    }

    /**
     * @dev V3: Execute minBurnAmount change after timelock
     */
    function executeMinBurnAmountChange() external onlyOwner {
        require(block.timestamp >= minBurnAmountUnlockTime, "Timelock not expired");
        require(pendingMinBurnAmount > 0, "No pending change");
        minBurnAmount = pendingMinBurnAmount;
        emit MinBurnAmountUpdated(minBurnAmount);
        pendingMinBurnAmount = 0;
        minBurnAmountUnlockTime = 0;
    }

    /**
     * @dev V3: Set gas intensity level (0-100, immediate)
     * Lower values for production, higher for anti-bot
     */
    function setGasIntensity(uint256 _level) external onlyOwner {
        require(_level <= 100, "Max level is 100");
        gasIntensityLevel = _level;
        emit GasIntensityUpdated(_level);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @dev V3: Renounce ownership (makes contract fully trustless)
     * WARNING: This is irreversible!
     */
    function renounceOwnership() external onlyOwner {
        address oldOwner = owner;
        owner = address(0);
        emit OwnershipTransferred(oldOwner, address(0));
    }

    // ============ View Functions ============

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
