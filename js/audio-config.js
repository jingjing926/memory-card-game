/**
 * 音效配置文件
 * 定义各种音效的在线资源和备用方案
 */

const AudioConfig = {
    // 匹配成功音效配置
    matchSuccess: {
        // 主要音效源（按优先级排序）
        sources: [
            // 本地文件备份（如果存在）
            'assets/audio/match-success.mp3',
            
            // 可靠的在线音效资源
            'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
            
            // 备用在线音效 - 成功提示音
            'https://opengameart.org/sites/default/files/Pickup_Coin15.wav',
            
            // Base64 编码的成功音效（内置备用）
            'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2+LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBTOH0fPTgjMGHm7A7+OZURE=',
            
            // 紧急备用 - 简单提示音
            'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
        ],
        
        // 音效属性
        volume: 0.8,
        preload: true,
        crossOrigin: 'anonymous',
        
        // 重试配置
        maxRetries: 1,
        retryDelay: 300,
        
        // 超时配置
        loadTimeout: 3000
    },
    
    // 网络检测配置
    network: {
        // 测试连接的简单音效
        testUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
        testTimeout: 2000
    },
    
    // 备用音效生成参数
    fallback: {
        matchSuccess: {
            notes: [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6
            duration: 0.12,
            volume: 0.4,
            type: 'sine',
            interval: 0.06
        }
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioConfig;
} else if (typeof window !== 'undefined') {
    window.AudioConfig = AudioConfig;
}