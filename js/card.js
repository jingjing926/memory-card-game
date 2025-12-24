/**
 * 卡牌管理模块
 * 负责卡牌生成、洗牌和 DOM 渲染
 */

const CardManager = (function() {
    // 道具配置
    const items = [
        { id: 0, name: 'hat', displayName: '帽子', image: 'assets/images/hat.png' },
        { id: 1, name: 'catfood', displayName: '猫粮', image: 'assets/images/catfood.png' },
        { id: 2, name: 'cola', displayName: '可乐', image: 'assets/images/cola.png' },
        { id: 3, name: 'carrot', displayName: '萝卜', image: 'assets/images/carrot.png' },
        { id: 4, name: 'headphone', displayName: '耳机', image: 'assets/images/headphone.png' },
        { id: 5, name: 'tissue', displayName: '纸巾', image: 'assets/images/tissue.png' },
        { id: 6, name: 'umbrella', displayName: '雨伞', image: 'assets/images/umbrella.png' },
        { id: 7, name: 'mouse', displayName: '鼠标', image: 'assets/images/mouse.png' },
        { id: 8, name: 'watch', displayName: '手表', image: 'assets/images/watch.png' },
        { id: 9, name: 'mickey', displayName: '米老鼠', image: 'assets/images/mickey.png' }
    ];

    let cards = [];

    /**
     * 生成卡牌数组
     * 根据关卡配置生成对应数量的卡牌
     */
    function generateCards(levelConfig = null) {
        cards = [];
        let cardId = 0;

        // 获取当前关卡配置
        const currentLevel = levelConfig || LevelManager.getCurrentLevel();
        
        // 根据关卡需求生成道具列表
        const levelItems = LevelManager.generateLevelItems(currentLevel, items);
        
        console.log(`🎮 生成关卡 ${currentLevel.id} 卡牌: ${levelItems.length} 对`);

        levelItems.forEach(item => {
            // 每个道具创建两张卡牌
            for (let i = 0; i < 2; i++) {
                cards.push({
                    id: cardId++,
                    itemId: item.id,
                    itemName: item.name,
                    displayName: item.displayName,
                    image: item.image,
                    isFlipped: false,
                    isMatched: false
                });
            }
        });

        return cards;
    }

    /**
     * Fisher-Yates 洗牌算法
     */
    function shuffleCards() {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        return cards;
    }

    /**
     * 渲染卡牌到 DOM
     * 根据关卡配置设置网格布局
     */
    function renderCards(container, onCardClick, levelConfig = null) {
        container.innerHTML = '';

        // 获取当前关卡配置
        const currentLevel = levelConfig || LevelManager.getCurrentLevel();
        
        // 设置网格布局
        const gridSize = currentLevel.gridSize;
        container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
        
        // 添加网格大小类名用于CSS样式
        container.className = `card-grid grid-${gridSize}x${gridSize}`;
        
        console.log(`🎨 渲染 ${gridSize}×${gridSize} 网格，共 ${cards.length} 张卡牌`);

        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.cardId = card.id;
            cardElement.dataset.itemId = card.itemId;

            cardElement.innerHTML = `
                <div class="card-face card-back"></div>
                <div class="card-face card-front">
                    <img src="${card.image}" alt="${card.displayName}" onerror="this.src='https://placehold.co/80x80/FFFFFF/FF6598?text=${encodeURIComponent(card.displayName)}'">
                </div>
            `;

            // 添加触摸事件支持
            function handleCardInteraction(e) {
                e.preventDefault();
                // 标记用户已交互，启用音效
                if (typeof AudioManager !== 'undefined') {
                    AudioManager.markUserInteraction();
                }
                if (onCardClick && !card.isFlipped && !card.isMatched) {
                    onCardClick(card, cardElement);
                }
            }

            cardElement.addEventListener('click', handleCardInteraction);
            cardElement.addEventListener('touchend', handleCardInteraction);

            // 防止移动端长按选择
            cardElement.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });

            container.appendChild(cardElement);
        });
    }

    /**
     * 翻转卡牌 - 优化版本
     */
    function flipCard(card, element, flipped) {
        // 防止重复操作
        if (card.isFlipped === flipped) {
            return;
        }

        card.isFlipped = flipped;
        
        // 使用 requestAnimationFrame 确保 DOM 更新的时机
        requestAnimationFrame(() => {
            if (flipped) {
                element.classList.add('flipped');
            } else {
                element.classList.remove('flipped');
            }
        });
    }

    /**
     * 标记卡牌为已配对 - 优化版本
     */
    function markAsMatched(card, element) {
        if (card.isMatched) {
            return;
        }

        card.isMatched = true;
        
        // 确保卡牌保持翻转状态
        requestAnimationFrame(() => {
            element.classList.add('matched');
            // 强制保持翻转状态
            if (!element.classList.contains('flipped')) {
                element.classList.add('flipped');
            }
        });
    }

    /**
     * 添加抖动动画 - 优化版本
     */
    function shakeCard(element) {
        // 防止重复添加动画
        if (element.classList.contains('shake')) {
            return;
        }

        element.classList.add('shake');
        
        // 使用 animationend 事件而不是 setTimeout
        const handleAnimationEnd = () => {
            element.classList.remove('shake');
            element.removeEventListener('animationend', handleAnimationEnd);
        };
        
        element.addEventListener('animationend', handleAnimationEnd);
        
        // 备用清理机制
        setTimeout(() => {
            element.classList.remove('shake');
            element.removeEventListener('animationend', handleAnimationEnd);
        }, 600);
    }

    /**
     * 获取卡牌数据
     */
    function getCard(cardId) {
        return cards.find(c => c.id === parseInt(cardId));
    }

    /**
     * 获取所有卡牌
     */
    function getAllCards() {
        return cards;
    }

    /**
     * 重置所有卡牌状态
     */
    function resetCards() {
        cards.forEach(card => {
            card.isFlipped = false;
            card.isMatched = false;
        });
    }

    return {
        generateCards,
        shuffleCards,
        renderCards,
        flipCard,
        markAsMatched,
        shakeCard,
        getCard,
        getAllCards,
        resetCards
    };
})();
