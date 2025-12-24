/**
 * 音效状态监控模块
 * 提供音效加载状态的可视化反馈
 */

const AudioMonitor = (function() {
    let monitorElement = null;
    let isVisible = false;

    // 创建监控界面
    function createMonitor() {
        if (monitorElement) return;

        monitorElement = document.createElement('div');
        monitorElement.id = 'audio-monitor';
        monitorElement.innerHTML = `
            <div class="monitor-header">
                <span class="monitor-title">🎵 音效状态</span>
                <button class="monitor-close" onclick="AudioMonitor.hide()">×</button>
            </div>
            <div class="monitor-content">
                <div class="status-item">
                    <span class="status-label">加载状态:</span>
                    <span id="load-status" class="status-value">检测中...</span>
                </div>
                <div class="status-item">
                    <span class="status-label">当前源:</span>
                    <span id="current-source" class="status-value">-</span>
                </div>
                <div class="status-item">
                    <span class="status-label">总源数:</span>
                    <span id="total-sources" class="status-value">-</span>
                </div>
                <div class="status-item">
                    <span class="status-label">音效URL:</span>
                    <span id="current-url" class="status-value url">-</span>
                </div>
                <div class="monitor-actions">
                    <button id="reload-audio" class="monitor-btn">重新加载</button>
                    <button id="test-audio" class="monitor-btn">测试播放</button>
                </div>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            #audio-monitor {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 300px;
                background: rgba(255, 255, 255, 0.95);
                border: 2px solid #ff6b9d;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                backdrop-filter: blur(10px);
                display: none;
            }
            
            .monitor-header {
                background: linear-gradient(135deg, #ff6b9d, #c44569);
                color: white;
                padding: 8px 12px;
                border-radius: 10px 10px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .monitor-title {
                font-weight: bold;
                font-size: 13px;
            }
            
            .monitor-close {
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .monitor-content {
                padding: 12px;
            }
            
            .status-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                align-items: flex-start;
            }
            
            .status-label {
                font-weight: bold;
                color: #333;
                min-width: 70px;
            }
            
            .status-value {
                color: #666;
                text-align: right;
                flex: 1;
                margin-left: 8px;
            }
            
            .status-value.url {
                word-break: break-all;
                font-size: 10px;
                max-width: 180px;
            }
            
            .monitor-actions {
                margin-top: 12px;
                display: flex;
                gap: 8px;
            }
            
            .monitor-btn {
                flex: 1;
                padding: 6px 8px;
                border: 1px solid #ff6b9d;
                background: white;
                color: #ff6b9d;
                border-radius: 6px;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s;
            }
            
            .monitor-btn:hover {
                background: #ff6b9d;
                color: white;
            }
            
            .status-loading { color: #f39c12; }
            .status-loaded { color: #27ae60; }
            .status-failed { color: #e74c3c; }
            
            @media (max-width: 768px) {
                #audio-monitor {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    width: auto;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(monitorElement);

        // 绑定事件
        document.getElementById('reload-audio').addEventListener('click', () => {
            if (typeof AudioManager !== 'undefined' && AudioManager.reloadAudio) {
                AudioManager.reloadAudio();
                updateStatus();
            }
        });

        document.getElementById('test-audio').addEventListener('click', () => {
            if (typeof AudioManager !== 'undefined' && AudioManager.playMatchSuccess) {
                AudioManager.playMatchSuccess();
            }
        });
    }

    // 显示监控界面
    function show() {
        createMonitor();
        monitorElement.style.display = 'block';
        isVisible = true;
        updateStatus();
        
        // 定期更新状态
        const updateInterval = setInterval(() => {
            if (!isVisible) {
                clearInterval(updateInterval);
                return;
            }
            updateStatus();
        }, 1000);
    }

    // 隐藏监控界面
    function hide() {
        if (monitorElement) {
            monitorElement.style.display = 'none';
        }
        isVisible = false;
    }

    // 切换显示状态
    function toggle() {
        if (isVisible) {
            hide();
        } else {
            show();
        }
    }

    // 更新状态显示
    function updateStatus() {
        if (!monitorElement || !isVisible) return;

        try {
            if (typeof AudioManager !== 'undefined' && AudioManager.getAudioLoadState) {
                const state = AudioManager.getAudioLoadState();
                
                // 更新加载状态
                const loadStatus = document.getElementById('load-status');
                if (loadStatus) {
                    loadStatus.textContent = getStatusText(state.state);
                    loadStatus.className = `status-value status-${state.state}`;
                }
                
                // 更新当前源
                const currentSource = document.getElementById('current-source');
                if (currentSource) {
                    currentSource.textContent = `${state.currentSource + 1}`;
                }
                
                // 更新总源数
                const totalSources = document.getElementById('total-sources');
                if (totalSources) {
                    totalSources.textContent = state.totalSources;
                }
                
                // 更新当前URL
                const currentUrl = document.getElementById('current-url');
                if (currentUrl) {
                    currentUrl.textContent = state.currentUrl || '无';
                    currentUrl.title = state.currentUrl || '';
                }
            }
        } catch (e) {
            console.warn('更新音效监控状态失败:', e);
        }
    }

    // 获取状态文本
    function getStatusText(state) {
        switch (state) {
            case 'loading': return '加载中...';
            case 'loaded': return '已加载';
            case 'failed': return '加载失败';
            default: return '未知状态';
        }
    }

    // 在控制台添加快捷命令
    if (typeof window !== 'undefined') {
        window.showAudioMonitor = show;
        window.hideAudioMonitor = hide;
        window.toggleAudioMonitor = toggle;
    }

    return {
        show,
        hide,
        toggle,
        updateStatus
    };
})();

// 添加键盘快捷键（Ctrl+Shift+A）
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        AudioMonitor.toggle();
    }
});

// 在开发环境中自动显示（可选）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // 延迟显示，等待音效系统初始化
    setTimeout(() => {
        console.log('开发环境：按 Ctrl+Shift+A 显示音效监控面板');
    }, 2000);
}