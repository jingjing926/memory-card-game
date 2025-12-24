/**
 * 关卡管理模块
 * 负责关卡配置、进度管理和难度控制
 */

const LevelManager = (function() {
    // 关卡配置
    const levels = [
        {
            id: 1,
            name: "初级挑战",
            description: "2×2 网格，2对卡牌",
            gridSize: 2,
            totalPairs: 2,
            requiredItems: 2,
            difficulty: "简单"
        },
        {
            id: 2,
            name: "进阶挑战",
            description: "4×4 网格，8对卡牌",
            gridSize: 4,
            totalPairs: 8,
            requiredItems: 8,
            difficulty: "中等"
        },
        {
            id: 3,
            name: "高级挑战",
            description: "6×6 网格，18对卡牌",
            gridSize: 6,
            totalPairs: 18,
            requiredItems: 10, // 使用全部10个道具，随机重复8个
            difficulty: "困难"
        },
        {
            id: 4,
            name: "专家挑战",
            description: "8×8 网格，32对卡牌",
            gridSize: 8,
            totalPairs: 32,
            requiredItems: 10, // 使用全部10个道具，随机重复22个
            difficulty: "专家"
        },
        {
            id: 5,
            name: "大师挑战",
            description: "10×10 网格，50对卡牌",
            gridSize: 10,
            totalPairs: 50,
            requiredItems: 10, // 使用全部10个道具，随机重复40个
            difficulty: "大师"
        }
    ];

    let currentLevel = 1;
    let completedLevels = [];

    /**
     * 获取当前关卡配置
     */
    function getCurrentLevel() {
        return levels.find(level => level.id === currentLevel) || levels[0];
    }

    /**
     * 获取指定关卡配置
     */
    function getLevel(levelId) {
        return levels.find(level => level.id === levelId);
    }

    /**
     * 获取所有关卡
     */
    function getAllLevels() {
        return [...levels];
    }

    /**
     * 设置当前关卡
     */
    function setCurrentLevel(levelId) {
        const level = getLevel(levelId);
        if (level) {
            currentLevel = levelId;
            console.log(`🎯 切换到关卡 ${levelId}: ${level.name}`);
            return true;
        }
        return false;
    }

    /**
     * 进入下一关卡
     */
    function nextLevel() {
        if (currentLevel < levels.length) {
            currentLevel++;
            console.log(`🎯 进入下一关卡: ${getCurrentLevel().name}`);
            return true;
        }
        return false; // 已经是最后一关
    }

    /**
     * 重置到第一关
     */
    function resetToFirstLevel() {
        currentLevel = 1;
        completedLevels = [];
        console.log('🔄 重置到第一关');
    }

    /**
     * 标记关卡完成
     */
    function completeLevel(levelId) {
        if (!completedLevels.includes(levelId)) {
            completedLevels.push(levelId);
            console.log(`✅ 完成关卡 ${levelId}`);
        }
    }

    /**
     * 检查关卡是否完成
     */
    function isLevelCompleted(levelId) {
        return completedLevels.includes(levelId);
    }

    /**
     * 获取关卡进度
     */
    function getProgress() {
        return {
            currentLevel,
            totalLevels: levels.length,
            completedLevels: [...completedLevels],
            completionRate: Math.round((completedLevels.length / levels.length) * 100)
        };
    }

    /**
     * 检查是否为最后一关
     */
    function isLastLevel() {
        return currentLevel === levels.length;
    }

    /**
     * 检查是否为第一关
     */
    function isFirstLevel() {
        return currentLevel === 1;
    }

    /**
     * 获取关卡统计信息
     */
    function getLevelStats(levelId = currentLevel) {
        const level = getLevel(levelId);
        if (!level) return null;

        return {
            ...level,
            totalCards: level.totalPairs * 2,
            isCompleted: isLevelCompleted(levelId),
            isCurrent: levelId === currentLevel
        };
    }

    /**
     * 生成关卡所需的道具配置
     * 根据关卡需求随机选择和重复道具
     */
    function generateLevelItems(levelConfig, availableItems) {
        const { requiredItems, totalPairs } = levelConfig;
        
        // 如果需要的道具数量不超过可用道具，直接使用前N个
        if (totalPairs <= availableItems.length) {
            return availableItems.slice(0, totalPairs);
        }

        // 如果需要更多道具，需要重复使用
        const selectedItems = [];
        const itemPool = [...availableItems];
        
        // 先添加所有可用道具
        selectedItems.push(...itemPool);
        
        // 计算还需要多少个道具
        const remainingNeeded = totalPairs - itemPool.length;
        
        // 随机重复添加道具直到满足需求
        for (let i = 0; i < remainingNeeded; i++) {
            const randomIndex = Math.floor(Math.random() * itemPool.length);
            selectedItems.push(itemPool[randomIndex]);
        }
        
        return selectedItems;
    }

    return {
        getCurrentLevel,
        getLevel,
        getAllLevels,
        setCurrentLevel,
        nextLevel,
        resetToFirstLevel,
        completeLevel,
        isLevelCompleted,
        getProgress,
        isLastLevel,
        isFirstLevel,
        getLevelStats,
        generateLevelItems
    };
})();