/**
 * 游戏状态管理模块
 * 负责游戏流程控制、配对判定和胜利检测
 */

const GameManager = (function() {
    // 游戏状态
    const state = {
        flippedCards: [],       // 当前翻开的卡牌 [{ card, element }]
        matchedPairs: 0,        // 已配对数量
        attempts: 0,            // 翻牌次数
        isLocked: false,        // 是否锁定交互
        currentLevel: 1,        // 当前关卡
        totalPairs: 8           // 当前关卡总配对数（动态更新）
    };

    // DOM 元素引用
    let attemptsDisplay = null;
    let matchedDisplay = null;
    let totalPairsDisplay = null;
    let levelDisplay = null;
    let levelNameDisplay = null;
    let finalAttemptsDisplay = null;
    let victoryModal = null;
    let cardGrid = null;

    /**
     * 初始化游戏
     */
    function init(elements) {
        attemptsDisplay = elements.attemptsDisplay;
        matchedDisplay = elements.matchedDisplay;
        totalPairsDisplay = elements.totalPairsDisplay;
        levelDisplay = elements.levelDisplay;
        levelNameDisplay = elements.levelNameDisplay;
        finalAttemptsDisplay = elements.finalAttemptsDisplay;
        victoryModal = elements.victoryModal;
        cardGrid = elements.cardGrid;

        // 初始化关卡系统
        initLevel();
        resetState();
    }

    /**
     * 初始化关卡系统
     */
    function initLevel() {
        const currentLevel = LevelManager.getCurrentLevel();
        state.currentLevel = currentLevel.id;
        state.totalPairs = currentLevel.totalPairs;
        
        console.log(`🎯 初始化关卡 ${currentLevel.id}: ${currentLevel.name}`);
    }

    /**
     * 重置游戏状态
     */
    function resetState() {
        state.flippedCards = [];
        state.matchedPairs = 0;
        state.attempts = 0;
        state.isLocked = false;

        // 更新当前关卡配置
        const currentLevel = LevelManager.getCurrentLevel();
        state.currentLevel = currentLevel.id;
        state.totalPairs = currentLevel.totalPairs;

        updateDisplay();
    }

    /**
     * 更新显示
     */
    function updateDisplay() {
        if (attemptsDisplay) {
            attemptsDisplay.textContent = state.attempts;
        }
        if (matchedDisplay) {
            matchedDisplay.textContent = state.matchedPairs;
        }
        if (totalPairsDisplay) {
            totalPairsDisplay.textContent = state.totalPairs;
        }
        
        // 更新关卡信息
        const currentLevel = LevelManager.getCurrentLevel();
        if (levelDisplay) {
            levelDisplay.textContent = currentLevel.id;
        }
        if (levelNameDisplay) {
            levelNameDisplay.textContent = currentLevel.name;
        }
    }

    /**
     * 处理卡牌点击
     */
    function handleCardClick(card, element) {
        // 如果锁定或卡牌已翻开/已配对，忽略点击
        if (state.isLocked || card.isFlipped || card.isMatched) {
            return;
        }

        // 如果已经翻开了两张卡牌，忽略
        if (state.flippedCards.length >= 2) {
            return;
        }

        // 翻开卡牌
        CardManager.flipCard(card, element, true);
        AudioManager.playFlip();

        // 添加到已翻开列表
        state.flippedCards.push({ card, element });

        // 如果翻开了两张卡牌，进行配对判定
        if (state.flippedCards.length === 2) {
            state.attempts++;
            updateDisplay();
            checkMatch();
        }
    }

    /**
     * 检查配对
     */
    function checkMatch() {
        const [first, second] = state.flippedCards;

        if (first.card.itemId === second.card.itemId) {
            // 配对成功
            handleMatchSuccess(first, second);
        } else {
            // 配对失败
            handleMatchFail(first, second);
        }
    }

    /**
     * 处理配对成功
     */
    function handleMatchSuccess(first, second) {
        // 标记为已配对
        CardManager.markAsMatched(first.card, first.element);
        CardManager.markAsMatched(second.card, second.element);

        // 播放成功音效
        AudioManager.playMatchSuccess();

        // 更新配对数
        state.matchedPairs++;
        updateDisplay();

        // 清空已翻开列表
        state.flippedCards = [];

        // 检查是否胜利
        if (state.matchedPairs === state.totalPairs) {
            setTimeout(() => {
                handleVictory();
            }, 500);
        }
    }

    /**
     * 处理配对失败
     */
    function handleMatchFail(first, second) {
        // 锁定交互
        state.isLocked = true;

        // 播放失败音效
        setTimeout(() => {
            AudioManager.playMatchFail();
        }, 300);

        // 添加抖动动画并翻回
        setTimeout(() => {
            CardManager.shakeCard(first.element);
            CardManager.shakeCard(second.element);

            setTimeout(() => {
                CardManager.flipCard(first.card, first.element, false);
                CardManager.flipCard(second.card, second.element, false);

                // 清空已翻开列表
                state.flippedCards = [];

                // 解锁交互
                state.isLocked = false;
            }, 500);
        }, 800);
    }

    /**
     * 处理游戏胜利
     */
    function handleVictory() {
        // 播放胜利音效
        AudioManager.playVictory();

        // 标记当前关卡完成
        LevelManager.completeLevel(state.currentLevel);

        // 显示胜利弹窗
        if (finalAttemptsDisplay) {
            finalAttemptsDisplay.textContent = state.attempts;
        }
        
        // 更新胜利弹窗内容
        updateVictoryModal();
        
        if (victoryModal) {
            victoryModal.classList.add('active');
        }
    }

    /**
     * 更新胜利弹窗内容
     */
    function updateVictoryModal() {
        const currentLevel = LevelManager.getCurrentLevel();
        const isLastLevel = LevelManager.isLastLevel();
        
        // 更新标题和内容
        const victoryTitle = victoryModal?.querySelector('.victory-title');
        const victoryStats = victoryModal?.querySelector('.victory-stats');
        const playAgainBtn = victoryModal?.querySelector('#play-again-btn');
        
        if (victoryTitle) {
            if (isLastLevel) {
                victoryTitle.textContent = '🎉 恭喜通关全部关卡！';
            } else {
                victoryTitle.textContent = `🎯 关卡 ${currentLevel.id} 完成！`;
            }
        }
        
        if (victoryStats) {
            let statsHtml = `<p>总翻牌次数：<span class="highlight">${state.attempts}</span> 次</p>`;
            statsHtml += `<p>关卡：<span class="highlight">${currentLevel.name}</span></p>`;
            
            if (!isLastLevel) {
                const nextLevel = LevelManager.getLevel(currentLevel.id + 1);
                statsHtml += `<p>下一关：<span class="highlight">${nextLevel.name}</span></p>`;
            }
            
            victoryStats.innerHTML = statsHtml;
        }
        
        if (playAgainBtn) {
            if (isLastLevel) {
                playAgainBtn.textContent = '重新开始';
            } else {
                playAgainBtn.textContent = '下一关';
            }
        }
    }

    /**
     * 隐藏胜利弹窗
     */
    function hideVictoryModal() {
        if (victoryModal) {
            victoryModal.classList.remove('active');
        }
    }

    /**
     * 开始新游戏
     */
    function startNewGame() {
        hideVictoryModal();
        resetState();

        // 重新生成和渲染卡牌（使用当前关卡配置）
        CardManager.generateCards();
        CardManager.shuffleCards();
        CardManager.renderCards(cardGrid, handleCardClick);
        
        console.log(`🎮 开始关卡 ${state.currentLevel}: ${LevelManager.getCurrentLevel().name}`);
    }

    /**
     * 进入下一关卡
     */
    function nextLevel() {
        if (LevelManager.nextLevel()) {
            startNewGame();
            return true;
        } else {
            // 已经是最后一关，重置到第一关
            LevelManager.resetToFirstLevel();
            startNewGame();
            return false;
        }
    }

    /**
     * 重置到第一关
     */
    function resetToFirstLevel() {
        LevelManager.resetToFirstLevel();
        startNewGame();
    }

    /**
     * 切换到指定关卡
     */
    function goToLevel(levelId) {
        if (LevelManager.setCurrentLevel(levelId)) {
            startNewGame();
            return true;
        }
        return false;
    }

    /**
     * 获取游戏状态
     */
    function getState() {
        return { ...state };
    }

    return {
        init,
        resetState,
        handleCardClick,
        startNewGame,
        nextLevel,
        resetToFirstLevel,
        goToLevel,
        hideVictoryModal,
        getState
    };
})();
