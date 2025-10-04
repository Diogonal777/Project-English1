// Система истории и прогресса

class HistorySystem {
    constructor() {
        this.history = [];
        this.unlockedEndings = new Set();
    }

    // Добавить запись в историю
    addHistoryEntry(scene, choice) {
        const entry = {
            timestamp: Date.now(),
            scene: scene,
            choice: choice,
            stats: {...window.GameEngine?.stats || {}}
        };
        
        this.history.push(entry);
        
        // Сохраняем историю
        this.saveHistory();
    }

    // Получить всю историю
    getHistory() {
        return this.history;
    }

    // Получить статистику по истории
    getHistoryStats() {
        const stats = {
            totalChoices: this.history.length,
            uniqueScenes: new Set(this.history.map(entry => entry.scene.id)).size,
            favoritePath: this.getFavoritePath(),
            playTime: this.calculatePlayTime(),
            endingsUnlocked: this.unlockedEndings.size
        };
        
        return stats;
    }

    // Получить самый частый путь
    getFavoritePath() {
        if (this.history.length === 0) return 'Недостаточно данных';
        
        const pathCounts = {};
        let maxCount = 0;
        let favoritePath = '';
        
        for (let i = 0; i < this.history.length - 1; i++) {
            const path = `${this.history[i].scene.id} -> ${this.history[i + 1].scene.id}`;
            pathCounts[path] = (pathCounts[path] || 0) + 1;
            
            if (pathCounts[path] > maxCount) {
                maxCount = pathCounts[path];
                favoritePath = path;
            }
        }
        
        return favoritePath || 'Неопределен';
    }

    // Рассчитать время игры
    calculatePlayTime() {
        if (this.history.length < 2) return '0 минут';
        
        const startTime = this.history[0].timestamp;
        const endTime = this.history[this.history.length - 1].timestamp;
        const totalMinutes = Math.floor((endTime - startTime) / 60000);
        
        if (totalMinutes < 60) {
            return `${totalMinutes} минут`;
        } else {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours} часов ${minutes} минут`;
        }
    }

    // Добавить разблокированную концовку
    addUnlockedEnding(endingId) {
        this.unlockedEndings.add(endingId);
        this.saveHistory();
    }

    // Сохранить историю
    saveHistory() {
        try {
            const historyData = {
                entries: this.history,
                unlockedEndings: Array.from(this.unlockedEndings),
                lastUpdate: Date.now()
            };
            localStorage.setItem('samurai_history', JSON.stringify(historyData));
        } catch (error) {
            console.error('Ошибка сохранения истории:', error);
        }
    }

    // Загрузить историю
    loadHistory() {
        try {
            const historyData = localStorage.getItem('samurai_history');
            if (historyData) {
                const parsed = JSON.parse(historyData);
                this.history = parsed.entries || [];
                this.unlockedEndings = new Set(parsed.unlockedEndings || []);
                return true;
            }
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
        }
        return false;
    }

    // Очистить историю
    clearHistory() {
        this.history = [];
        this.unlockedEndings = new Set();
        localStorage.removeItem('samurai_history');
    }

    // Экспорт истории
    exportHistory() {
        const exportData = {
            history: this.history,
            stats: this.getHistoryStats(),
            unlockedEndings: Array.from(this.unlockedEndings),
            exportDate: new Date().toISOString()
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    // Генерация отчета
    generateReport() {
        const stats = this.getHistoryStats();
        const achievements = SaveSystem.getGameStats();
        
        let report = `=== ОТЧЕТ О ПРОХОЖДЕНИИ ===\n\n`;
        report += `Общее время: ${stats.playTime}\n`;
        report += `Принято решений: ${stats.totalChoices}\n`;
        report += `Посещено локаций: ${stats.uniqueScenes}\n`;
        report += `Открыто концовок: ${stats.endingsUnlocked}\n`;
        report += `Любимый путь: ${stats.favoritePath}\n\n`;
        
        report += `=== ДОСТИЖЕНИЯ ===\n`;
        report += `Получено: ${achievements.unlockedAchievements}/${achievements.totalAchievements}\n`;
        report += `Прогресс: ${achievements.completionPercentage}%\n\n`;
        
        report += `=== ПОСЛЕДНИЕ ДЕЙСТВИЯ ===\n`;
        const recentActions = this.history.slice(-5).reverse();
        recentActions.forEach((action, index) => {
            report += `${index + 1}. ${action.scene.title}: ${action.choice.text}\n`;
        });
        
        return report;
    }
}

// Глобальный экземпляр системы истории
window.HistorySystem = new HistorySystem();

// Загрузка истории при инициализации
document.addEventListener('DOMContentLoaded', () => {
    window.HistorySystem.loadHistory();
});