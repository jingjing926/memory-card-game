/**
 * 音效管理模块
 * 使用 Web Audio API 生成翻牌、失败、胜利音效
 * 匹配成功音效支持多个在线源和本地备份
 * 优化移动端兼容性和跨域问题处理
 */

const AudioManager = (function() {
    let audioContext = null;
    let isMuted = false;
    let matchSuccessAudio = null;
    let isInitialized = false;
    let audioLoadState = 'loading'; // loading, loaded, failed
    let currentAudioSource = 0;
    let loadTimeout = null;
    let retryCount = 0;

    // 获取音效配置（如果配置文件存在）
    const config = window.AudioConfig || {
        matchSuccess: {
            sources: [
                'assets/audio/match-success.mp3',
                'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
                'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2+LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBTOH0fPTgjMGHm7A7+OZURE='
            ],
            volume: 0.7,
            maxRetries: 3,
            retryDelay: 500,
            loadTimeout: 5000
        }
    };

    // 音效源配置
    const audioSources = config.matchSuccess.sources;

    // 初始化音频上下文
    function init() {
        if (isInitialized) return;
        
        try {
            // 创建音频上下文
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 尝试加载音效文件
            loadMatchSuccessAudio();
            
            isInitialized = true;
            console.log('🎵 音效管理器初始化完成');
        } catch (e) {
            console.warn('❌ Web Audio API 不支持:', e);
            audioLoadState = 'failed';
        }
    }

    // 加载匹配成功音效（支持多源回退）
    function loadMatchSuccessAudio() {
        // 清除之前的超时
        if (loadTimeout) {
            clearTimeout(loadTimeout);
        }

        if (currentAudioSource >= audioSources.length) {
            console.warn('所有音效源都加载失败，使用备用音效');
            audioLoadState = 'failed';
            return;
        }

        const audioUrl = audioSources[currentAudioSource];
        console.log(`尝试加载音效源 ${currentAudioSource + 1}/${audioSources.length}: ${audioUrl}`);
        
        matchSuccessAudio = new Audio();
        matchSuccessAudio.preload = 'auto';
        matchSuccessAudio.volume = config.matchSuccess.volume;
        
        // 跨域设置
        if (!audioUrl.startsWith('data:')) {
            matchSuccessAudio.crossOrigin = 'anonymous';
        }
        
        // 设置加载超时
        loadTimeout = setTimeout(() => {
            console.warn(`音效源 ${currentAudioSource + 1} 加载超时: ${audioUrl}`);
            handleLoadError();
        }, config.matchSuccess.loadTimeout);
        
        // 成功加载事件
        matchSuccessAudio.addEventListener('canplaythrough', () => {
            console.log(`音效源 ${currentAudioSource + 1} 加载成功: ${audioUrl}`);
            audioLoadState = 'loaded';
            retryCount = 0;
            if (loadTimeout) {
                clearTimeout(loadTimeout);
                loadTimeout = null;
            }
        }, { once: true });
        
        // 加载失败事件
        matchSuccessAudio.addEventListener('error', (e) => {
            console.warn(`音效源 ${currentAudioSource + 1} 加载失败: ${audioUrl}`, e);
            handleLoadError();
        }, { once: true });
        
        // 开始加载
        matchSuccessAudio.src = audioUrl;
    }

    // 处理音效加载错误
    function handleLoadError() {
        if (loadTimeout) {
            clearTimeout(loadTimeout);
            loadTimeout = null;
        }
        
        currentAudioSource++;
        retryCount++;
        
        if (currentAudioSource < audioSources.length && retryCount <= config.matchSuccess.maxRetries) {
            console.log(`尝试下一个音效源...`);
            setTimeout(() => {
                loadMatchSuccessAudio();
            }, config.matchSuccess.retryDelay);
        } else {
            console.warn('所有音效源都加载失败，将使用Web Audio API生成音效');
            audioLoadState = 'failed';
        }
    }

    // 恢复音频上下文（移动端需要）
    function resumeContext() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('音频上下文已恢复');
            }).catch(e => {
                console.warn('恢复音频上下文失败:', e);
            });
        }
    }

    // 获取音效加载状态
    function getAudioLoadState() {
        return audioLoadState;
    }

    // 重新加载音效
    function reloadAudio() {
        currentAudioSource = 0;
        retryCount = 0;
        audioLoadState = 'loading';
        loadMatchSuccessAudio();
    }

    // 播放翻牌音效 - 使用 Web Audio API 生成
    function playFlip() {
        if (isMuted || !audioContext) return;
        
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.warn('播放翻牌音效失败:', e);
        }
    }

    // 播放匹配成功音效
    function playMatchSuccess() {
        if (isMuted) return;
        
        // 优先使用加载的音效文件
        if (matchSuccessAudio && audioLoadState === 'loaded') {
            try {
                matchSuccessAudio.currentTime = 0;
                const promise = matchSuccessAudio.play();
                if (promise) {
                    promise.catch(e => {
                        console.warn('播放匹配成功音效失败，使用备用音效:', e);
                        playMatchSuccessFallback();
                    });
                }
                return;
            } catch (e) {
                console.warn('播放匹配成功音效失败，使用备用音效:', e);
            }
        }
        
        // 使用备用音效
        playMatchSuccessFallback();
    }

    // 备用匹配成功音效 - 使用 Web Audio API 生成
    function playMatchSuccessFallback() {
        if (isMuted || !audioContext) return;
        
        try {
            // 播放一个愉快的音符序列
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            
            notes.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);

                gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.1);
                gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + index * 0.1 + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.15);

                oscillator.start(audioContext.currentTime + index * 0.1);
                oscillator.stop(audioContext.currentTime + index * 0.1 + 0.15);
            });
        } catch (e) {
            console.warn('播放备用匹配成功音效失败:', e);
        }
    }

    // 播放匹配失败音效 - 使用 Web Audio API 生成
    function playMatchFail() {
        if (isMuted || !audioContext) return;
        
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.warn('播放匹配失败音效失败:', e);
        }
    }

    // 播放游戏胜利音效 - 欢快的旋律
    function playVictory() {
        if (isMuted || !audioContext) return;
        
        try {
            // 胜利旋律音符序列
            const melody = [
                { freq: 523.25, time: 0, duration: 0.15 },     // C5
                { freq: 659.25, time: 0.15, duration: 0.15 },  // E5
                { freq: 783.99, time: 0.3, duration: 0.15 },   // G5
                { freq: 1046.50, time: 0.45, duration: 0.15 }, // C6
                { freq: 783.99, time: 0.6, duration: 0.15 },   // G5
                { freq: 1046.50, time: 0.75, duration: 0.2 },  // C6
                { freq: 1174.66, time: 0.95, duration: 0.15 }, // D6
                { freq: 1318.51, time: 1.1, duration: 0.15 },  // E6
                { freq: 1567.98, time: 1.25, duration: 0.3 },  // G6
                { freq: 1046.50, time: 1.55, duration: 0.4 },  // C6
            ];

            melody.forEach(note => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.time);

                gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.time);
                gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + note.time + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.time + note.duration);

                oscillator.start(audioContext.currentTime + note.time);
                oscillator.stop(audioContext.currentTime + note.time + note.duration);
            });
        } catch (e) {
            console.warn('播放胜利音效失败:', e);
        }
    }

    // 切换静音状态
    function toggleMute() {
        isMuted = !isMuted;
        console.log('音效状态:', isMuted ? '关闭' : '开启');
        
        return isMuted;
    }

    // 设置静音状态
    function setMute(muted) {
        isMuted = muted;
    }

    // 获取静音状态
    function getMuteState() {
        return isMuted;
    }

    // 标记用户已交互
    function markUserInteraction() {
        resumeContext();
    }

    return {
        init,
        resumeContext,
        playFlip,
        playMatchSuccess,
        playMatchFail,
        playVictory,
        toggleMute,
        setMute,
        getMuteState,
        markUserInteraction,
        getAudioLoadState,
        reloadAudio
    };
})();