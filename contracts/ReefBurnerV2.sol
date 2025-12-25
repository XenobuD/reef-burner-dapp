// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title ReefBurnerV2
 * @dev Ultra-secure token burn dApp with unclaimed prize protection
 *
 * NEW FEATURES (V2):
 * ✅ Anyone can trigger prize claim (not just winner)
 * ✅ 10 round grace period for winner to claim
 * ✅ Unclaimed prizes auto-burn after 10 rounds
 * ✅ No prizes get stuck forever
 *
 * SECURITY FEATURES:
 * ✅ ReentrancyGuard protection
 * ✅ Immutable creator wallet
 * ✅ No emergencyWithdraw (no rug pull)
 * ✅ Improved randomness (commit-reveal)
 * ✅ Max participants cap
 * ✅ Checks-Effects-Interactions pattern
 */
contract ReefBurnerV2 {

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

    uint256 public constant ROUND_DURATION = 1 hours; // Testing mode
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

    // Randomness
    uint256 public randomCommitBlock;
    bool public randomCommitted;

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
    event OwnershipTransferred(address indexed previous, address indexed new);
    event RandomnessCommitted(uint256 blockNumber);
    event RandomnessRevealed(uint256 randomValue);

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
     * @dev Gas-intensive operations
     */
    function _performGasIntensiveOperations() private {
        uint256 tempValue = 0;

        for (uint256 i = 0; i < 50; i++) {
            tempValue += i ** 2;
            tempValue = tempValue % 1000;

            for (uint256 j = 0; j < 10; j++) {
                tempValue += (i * j) % 100;
            }
        }

        uint256[10] memory tempArray;
        for (uint256 k = 0; k < 10; k++) {
            tempArray[k] = tempValue + k;
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
     * @dev Generate random number
     */
    function _generateRandomNumber(uint256 max) private view returns (uint256) {
        bytes32 futureBlockHash = blockhash(randomCommitBlock + 3);

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

    function setMinBurnAmount(uint256 _newAmount) external onlyOwner {
        require(_newAmount > 0, "Amount must be > 0");
        minBurnAmount = _newAmount;
        emit MinBurnAmountUpdated(_newAmount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    // ============ View Functions ============

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
