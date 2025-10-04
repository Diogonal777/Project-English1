// Система сохранения и загрузки игры

class SaveSystem {
    static SAVE_SLOTS = 3;
    
    // Сохранить игру
    static saveGame(slot, gameData) {
        if (slot < 1 || slot > this.SAVE_SLOTS) {
            console.error('Неверный слот сохранения:', slot);
            return false;
        }
        
        const saveData = {
            ...gameData,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        try {
            localStorage.setItem(`samurai_save_${slot}`, JSON.stringify(saveData));
            this.updateAchievements(gameData.achievements);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            return false;
        }
    }
    
    // Загрузить игру
    static loadGame(slot) {
        if (slot < 1 || slot > this.SAVE_SLOTS) {
            console.error('Неверный слот загрузки:', slot);
            return null;
        }
        
        try {
            const saveData = localStorage.getItem(`samurai_save_${slot}`);
            if (!saveData) return null;
            
            const parsedData = JSON.parse(saveData);
            
            // Проверяем версию и мигрируем при необходимости
            if (!parsedData.version) {
                console.warn('Старая версия сохранения, выполняется миграция...');
                return this.migrateOldSave(parsedData);
            }
            
            return parsedData;
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            return null;
        }
    }
    
    // Миграция старых сохранений
    static migrateOldSave(saveData) {
        // Добавляем отсутствующие поля
        if (!saveData.visitedScenes) {
            saveData.visitedScenes = [saveData.currentScene];
        }
        
        if (!saveData.playerChoices) {
            saveData.playerChoices = {};
        }
        
        saveData.version = '1.0';
        return saveData;
    }
    
    // Загрузить игру в движок
    static loadIntoGame(slot) {
        const saveData = this.loadGame(slot);
        if (saveData && window.GameEngine) {
            window.GameEngine.loadSaveData(saveData);
            return true;
        }
        return false;
    }
    
    // Удалить сохранение
    static deleteSave(slot) {
        try {
            localStorage.removeItem(`samurai_save_${slot}`);
            return true;
        } catch (error) {
            console.error('Ошибка удаления:', error);
            return false;
        }
    }
    
    // Получить информацию о всех слотах
    static getSaveSlotsInfo() {
        const slotsInfo = [];
        
        for (let i = 1; i <= this.SAVE_SLOTS; i++) {
            const saveData = this.loadGame(i);
            slotsInfo.push({
                slot: i,
                exists: !!saveData,
                timestamp: saveData?.timestamp || null,
                currentScene: saveData?.currentScene || 'Новая игра',
                stats: saveData?.stats || null
            });
        }
        
        return slotsInfo;
    }
    
    // Обновить достижения
    static updateAchievements(newAchievements) {
        const currentAchievements = this.getAchievements();
        const updatedAchievements = {...currentAchievements};
        
        // Добавляем новые достижения
        Object.keys(newAchievements).forEach(achievementId => {
            if (newAchievements[achievementId] && !currentAchievements[achievementId]?.unlocked) {
                updatedAchievements[achievementId] = {
                    ...achievementsData[achievementId],
                    unlocked: true,
                    unlockedAt: Date.now()
                };
            }
        });
        
        // Сохраняем обновленные достижения
        try {
            localStorage.setItem('samurai_achievements', JSON.stringify(updatedAchievements));
        } catch (error) {
            console.error('Ошибка сохранения достижений:', error);
        }
        
        return updatedAchievements;
    }
    
    // Получить все достижения
    static getAchievements() {
        try {
            const saved = localStorage.getItem('samurai_achievements');
            if (!saved) {
                return this.initializeAchievements();
            }
            
            const achievements = JSON.parse(saved);
            
            // Добавляем недостающие достижения
            let hasChanges = false;
            Object.keys(achievementsData).forEach(id => {
                if (!achievements[id]) {
                    achievements[id] = {
                        ...achievementsData[id],
                        unlocked: false,
                        unlockedAt: null
                    };
                    hasChanges = true;
                }
            });
            
            if (hasChanges) {
                localStorage.setItem('samurai_achievements', JSON.stringify(achievements));
            }
            
            return achievements;
        } catch (error) {
            console.error('Ошибка загрузки достижений:', error);
            return this.initializeAchievements();
        }
    }
    
    // Инициализировать достижения
    static initializeAchievements() {
        const initialAchievements = {};
        Object.keys(achievementsData).forEach(id => {
            initialAchievements[id] = {
                ...achievementsData[id],
                unlocked: false,
                unlockedAt: null
            };
        });
        
        try {
            localStorage.setItem('samurai_achievements', JSON.stringify(initialAchievements));
        } catch (error) {
            console.error('Ошибка инициализации достижений:', error);
        }
        
        return initialAchievements;
    }
    
    // Очистить все данные
    static clearAllData() {
        try {
            // Удаляем все сохранения
            for (let i = 1; i <= this.SAVE_SLOTS; i++) {
                localStorage.removeItem(`samurai_save_${i}`);
            }
            
            // Удаляем достижения
            localStorage.removeItem('samurai_achievements');
            
            // Удаляем настройки
            localStorage.removeItem('samurai_settings');
            
            // Удаляем автосохранение
            localStorage.removeItem('samurai_autosave');
            
            return true;
        } catch (error) {
            console.error('Ошибка очистки данных:', error);
            return false;
        }
    }
    
    // Проверить наличие сохранений
    static hasAnySaves() {
        for (let i = 1; i <= this.SAVE_SLOTS; i++) {
            if (this.loadGame(i)) return true;
        }
        return false;
    }
    
    // Получить статистику игры
    static getGameStats() {
        const achievements = this.getAchievements();
        const unlockedCount = Object.values(achievements).filter(a => a.unlocked).length;
        const totalCount = Object.keys(achievements).length;
        
        return {
            unlockedAchievements: unlockedCount,
            totalAchievements: totalCount,
            completionPercentage: totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0
        };
    }
    
    // Система настроек
    static getSettings() {
        try {
            const settings = localStorage.getItem('samurai_settings');
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
            return this.getDefaultSettings();
        }
    }
    
    static saveSettings(settings) {
        try {
            localStorage.setItem('samurai_settings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
            return false;
        }
    }
    
    static getDefaultSettings() {
        return {
            musicVolume: 50,
            soundVolume: 70,
            textSpeed: 50,
            autoPlay: true,
            skipViewed: true,
            language: 'ru'
        };
    }
}

// Инициализация при загрузке
if (typeof window !== 'undefined') {
    window.SaveSystem = SaveSystem;
}