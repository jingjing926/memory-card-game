/**
 * 主入口文件
 * 负责初始化和事件绑定
 */

(function() {
    'use strict';

    // DOM 元素
    const elements = {
        // 页面
        startScreen: document.getElementById('start-screen'),
        gameScreen: document.getElementById('game-screen'),
        
        // 按钮
        startBtn: document.getElementById('start-btn'),
        restartBtn: document.getElementById('restart-btn'),
        soundBtn: document.getElementById('sound-btn'),
        homeBtn: document.getElementById('home-btn'),
        playAgainBtn: document.getElementById('play-again-btn'),
        backHomeBtn: document.getElementById('back-home-btn'),
        restartLevelBtn: document.getElementById('restart-level-btn'),
        
        // 音效图标
        soundOnIcon: document.getElementById('sound-on-icon'),
        soundOffIcon: document.getElementById('sound-off-icon'),
        soundText: document.getElementById('sound-text'),
        
        // 游戏区域
        cardGrid: document.getElementById('card-grid'),
        
        // 状态显示
        attemptsDisplay: document.getElementById('attempts'),
        matchedDisplay: document.getElementById('matched'),
        totalPairsDisplay: document.getElementById('total-pairs'),
        levelDisplay: document.getElementById('current-level'),
        levelNameDisplay: document.getElementById('level-name'),
        finalAttemptsDisplay: document.getElementById('final-attempts'),
        
        // 弹窗
        victoryModal: document.getElementById('victory-modal')
    };

    /**
     * 切换页面
     */
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    /**
     * 开始游戏
     */
    function startGame() {
        // 标记用户已交互，启用音效
        AudioManager.markUserInteraction();
        
        // 初始化音频（需要用户交互后）
        AudioManager.init();
        AudioManager.resumeContext();



        // 初始化游戏管理器
        GameManager.init({
            attemptsDisplay: elements.attemptsDisplay,
            matchedDisplay: elements.matchedDisplay,
            totalPairsDisplay: elements.totalPairsDisplay,
            levelDisplay: elements.levelDisplay,
            levelNameDisplay: elements.levelNameDisplay,
            finalAttemptsDisplay: elements.finalAttemptsDisplay,
            victoryModal: elements.victoryModal,
            cardGrid: elements.cardGrid
        });

        // 开始新游戏
        GameManager.startNewGame();

        // 切换到游戏页面
        showScreen('game-screen');
    }

    /**
     * 返回首页
     */
    function goHome() {
        GameManager.hideVictoryModal();
        showScreen('start-screen');
    }

    /**
     * 切换音效
     */
    function toggleSound() {
        const isMuted = AudioManager.toggleMute();
        
        if (isMuted) {
            elements.soundOnIcon.style.display = 'none';
            elements.soundOffIcon.style.display = 'block';
            elements.soundText.textContent = '音效关';
        } else {
            elements.soundOnIcon.style.display = 'block';
            elements.soundOffIcon.style.display = 'none';
            elements.soundText.textContent = '音效开';
        }
    }





    /**
     * 绑定事件
     */
    function bindEvents() {
        // 移动端触摸事件辅助函数
        function addTouchSupport(element, callback) {
            function handleInteraction(e) {
                // 标记用户已交互，启用音效
                AudioManager.markUserInteraction();
                callback(e);
            }
            
            element.addEventListener('click', handleInteraction);
            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleInteraction(e);
            });
        }

        // 开始游戏按钮
        addTouchSupport(elements.startBtn, startGame);

        // 重新开始按钮
        addTouchSupport(elements.restartBtn, () => {
            GameManager.startNewGame();
        });

        // 音效开关按钮
        addTouchSupport(elements.soundBtn, toggleSound);

        // 返回首页按钮
        addTouchSupport(elements.homeBtn, goHome);

        // 再玩一次按钮（现在是下一关按钮）
        addTouchSupport(elements.playAgainBtn, () => {
            const isLastLevel = LevelManager.isLastLevel();
            if (isLastLevel) {
                // 最后一关，重置到第一关
                GameManager.resetToFirstLevel();
            } else {
                // 进入下一关
                GameManager.nextLevel();
            }
        });

        // 返回首页按钮（胜利弹窗）
        addTouchSupport(elements.backHomeBtn, goHome);

        // 重玩本关按钮
        addTouchSupport(elements.restartLevelBtn, () => {
            GameManager.startNewGame();
        });

        // 点击弹窗遮罩关闭
        const modalOverlay = elements.victoryModal.querySelector('.modal-overlay');
        addTouchSupport(modalOverlay, () => {
            GameManager.hideVictoryModal();
        });

        // 防止移动端双击缩放
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });

        // 防止移动端长按选择
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // 移动端视口变化处理
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                // 强制重新计算视口高度
                document.body.style.height = window.innerHeight + 'px';
                setTimeout(() => {
                    document.body.style.height = '';
                }, 100);
            }, 100);
        });
    }

    /**
     * 初始化应用
     */
    function init() {
        bindEvents();
        
        // 预初始化音频管理器
        AudioManager.init();
    }

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
