// Игровой движок для визуальной новеллы

class GameEngine {
    constructor() {
        this.currentScene = null;
        this.stats = {...initialStats};
        this.visitedScenes = new Set();
        this.achievements = {};
        this.playerChoices = {};
        this.isInitialized = false;
        this.currentSaveSlot = null;
    }

    // Инициализация игры
    init() {
        if (this.isInitialized) return;

        console.log('Инициализация игрового движка...');

        // Загружаем сохранение или начинаем новую игру
        const urlParams = new URLSearchParams(window.location.search);
        const loadSlot = urlParams.get('load');
        
        if (loadSlot) {
            this.loadGame(parseInt(loadSlot));
        } else {
            // Проверяем автосохранение
            if (!this.loadAutoSave()) {
                this.startNewGame();
            }
        }

        this.setupEventListeners();
        this.isInitialized = true;
        
        console.log('Игровой движок инициализирован');
    }

    // Начать новую игру
    startNewGame() {
        console.log('Начало новой игры');
        this.stats = {...initialStats};
        this.visitedScenes = new Set();
        this.achievements = SaveSystem.getAchievements();
        this.playerChoices = {};
        this.currentSaveSlot = null;
        
        this.loadScene('start');
        this.unlockAchievement('first_steps');
    }

    // Загрузить сцену
    loadScene(sceneId) {
        const scene = StoryManager.getScene(sceneId);
        if (!scene) {
            console.error('Сцена не найдена:', sceneId);
            return;
        }

        this.currentScene = scene;
        this.visitedScenes.add(sceneId);
        
        this.updateUI();
        this.saveAutoProgress();
        
        // Проверяем концовку
        if (scene.isEnding) {
            this.handleEnding(scene);
        }
    }

    // Обновление интерфейса
    updateUI() {
        if (!this.currentScene) return;

        // Обновляем текст сцены
        const dialogueText = document.getElementById('dialogue-text');
        const characterName = document.getElementById('character-name');
        const sceneBackground = document.getElementById('scene-background');
        
        if (dialogueText) {
            dialogueText.textContent = this.currentScene.text;
            dialogueText.classList.remove('scene-enter');
            void dialogueText.offsetWidth; // Trigger reflow
            dialogueText.classList.add('scene-enter');
        }
        
        if (characterName) {
            characterName.textContent = this.currentScene.character;
        }
        
        if (sceneBackground) {
            sceneBackground.style.background = this.currentScene.background;
        }

        // Обновляем выборы
        this.updateChoices();
        
        // Обновляем статистику
        this.updateStatsDisplay();
    }

    // Обновление вариантов выбора
    updateChoices() {
        const choicesContainer = document.getElementById('choices-container');
        if (!choicesContainer) return;

        choicesContainer.innerHTML = '';
        
        this.currentScene.choices.forEach((choice, index) => {
            const isAvailable = StoryManager.isChoiceAvailable(choice, this.stats);
            
            const choiceButton = document.createElement('button');
            choiceButton.className = `choice-btn ${isAvailable ? '' : 'disabled'}`;
            choiceButton.textContent = choice.text;
            choiceButton.disabled = !isAvailable;
            
            if (isAvailable) {
                choiceButton.addEventListener('click', () => this.makeChoice(index));
            } else {
                choiceButton.title = 'Требования не выполнены';
            }
            
            choicesContainer.appendChild(choiceButton);
        });
    }

    // Обработка выбора игрока
    makeChoice(choiceIndex) {
        const choice = this.currentScene.choices[choiceIndex];
        if (!choice || !StoryManager.isChoiceAvailable(choice, this.stats)) return;

        console.log('Выбор сделан:', choice.text);

        // Применяем эффекты выбора
        this.stats = StoryManager.applyEffects(choice.effects, this.stats);
        
        // Сохраняем выбор
        this.playerChoices[this.currentScene.id] = choiceIndex;
        
        // Проверяем достижения
        this.checkAchievements();
        
        // Загружаем следующую сцену
        this.loadScene(choice.nextScene);
    }

    // Обновление отображения статистики
    updateStatsDisplay() {
        const stats = ['honor', 'wisdom', 'strength', 'charm'];
        
        stats.forEach(stat => {
            const bar = document.getElementById(`${stat}-bar`);
            const value = document.getElementById(`${stat}-value`);
            
            if (bar) {
                bar.style.width = `${this.stats[stat]}%`;
            }
            
            if (value) {
                value.textContent = this.stats[stat];
                value.classList.add('stat-change');
                setTimeout(() => value.classList.remove('stat-change'), 600);
            }
        });
        
        // Обновляем карму
        const karmaValue = document.getElementById('karma-value');
        if (karmaValue) {
            karmaValue.textContent = this.stats.karma;
            karmaValue.style.color = this.stats.karma >= 0 ? '#27ae60' : '#e74c3c';
        }
    }

    // Проверка достижений
    checkAchievements() {
        const newAchievements = {};
        
        // Проверяем достижения по характеристикам
        if (this.stats.charm >= 50 && !this.achievements.skilled_diplomat?.unlocked) {
            newAchievements.skilled_diplomat = true;
        }
        
        if (this.stats.strength >= 70 && !this.achievements.master_warrior?.unlocked) {
            newAchievements.master_warrior = true;
        }
        
        if (this.stats.wisdom >= 80 && !this.achievements.wise_sage?.unlocked) {
            newAchievements.wise_sage = true;
        }
        
        if (this.stats.honor > 40 && this.stats.wisdom > 40 && 
            this.stats.strength > 40 && this.stats.charm > 40 &&
            !this.achievements.perfect_balance?.unlocked) {
            newAchievements.perfect_balance = true;
        }
        
        // Сохраняем новые достижения
        if (Object.keys(newAchievements).length > 0) {
            Object.keys(newAchievements).forEach(ach => {
                this.unlockAchievement(ach);
            });
        }
    }

    // Разблокировка достижения
    unlockAchievement(achievementId) {
        const achievement = {[achievementId]: true};
        SaveSystem.updateAchievements(achievement);
        this.achievements = SaveSystem.getAchievements();
        this.showNotification(`🏆 Получено достижение: ${achievementsData[achievementId]?.name || achievementId}`);
    }

    // Обработка концовки
    handleEnding(scene) {
        if (scene.achievement) {
            this.unlockAchievement(scene.achievement);
        }
        
        this.showNotification(`🎉 Достигнута концовка: ${scene.title}`);
        
        // Показываем кнопку возврата в меню
        const choicesContainer = document.getElementById('choices-container');
        if (choicesContainer) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'choice-btn';
            menuBtn.textContent = 'В главное меню';
            menuBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
            choicesContainer.appendChild(menuBtn);
        }
    }

    // Показать уведомление
    showNotification(message) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(243, 156, 18, 0.95);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 300px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }

    // Сохранение игры
    saveGame(slot) {
        const saveData = {
            currentScene: this.currentScene.id,
            stats: this.stats,
            visitedScenes: Array.from(this.visitedScenes),
            achievements: this.achievements,
            playerChoices: this.playerChoices,
            timestamp: Date.now()
        };
        
        if (SaveSystem.saveGame(slot, saveData)) {
            this.currentSaveSlot = slot;
            this.showNotification(`✅ Игра сохранена в слот ${slot}!`);
            return true;
        } else {
            this.showNotification('❌ Ошибка сохранения!');
            return false;
        }
    }

    // Загрузка игры
    loadGame(slot) {
        const saveData = SaveSystem.loadGame(slot);
        if (saveData) {
            this.loadSaveData(saveData);
            this.currentSaveSlot = slot;
            this.showNotification(`✅ Игра загружена из слота ${slot}!`);
            return true;
        } else {
            this.showNotification('❌ Файл сохранения не найден!');
            return false;
        }
    }

    // Загрузка данных сохранения
    loadSaveData(saveData) {
        this.currentScene = StoryManager.getScene(saveData.currentScene);
        this.stats = saveData.stats;
        this.visitedScenes = new Set(saveData.visitedScenes);
        this.achievements = saveData.achievements;
        this.playerChoices = saveData.playerChoices;
        
        this.updateUI();
    }

    // Автосохранение
    saveAutoProgress() {
        const saveData = {
            currentScene: this.currentScene.id,
            stats: this.stats,
            visitedScenes: Array.from(this.visitedScenes),
            achievements: this.achievements,
            playerChoices: this.playerChoices,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('samurai_autosave', JSON.stringify(saveData));
        } catch (error) {
            console.error('Ошибка автосохранения:', error);
        }
    }

    // Загрузка автосохранения
    loadAutoSave() {
        try {
            const saveData = localStorage.getItem('samurai_autosave');
            if (saveData) {
                this.loadSaveData(JSON.parse(saveData));
                this.showNotification('✅ Загружено автосохранение');
                return true;
            }
        } catch (error) {
            console.error('Ошибка загрузки автосохранения:', error);
        }
        return false;
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Кнопка сохранения
        const saveBtn = document.getElementById('save-game');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.showSaveModal());
        }
        
        // Кнопка загрузки
        const loadBtn = document.getElementById('load-game');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.showLoadModal());
        }
        
        // Кнопка главного меню
        const menuBtn = document.getElementById('main-menu');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                if (confirm('Вернуться в главное меню? Несохраненный прогресс будет потерян.')) {
                    window.location.href = 'index.html';
                }
            });
        }
        
        // Кнопка переключения статистики
        const toggleStatsBtn = document.getElementById('toggle-stats');
        if (toggleStatsBtn) {
            toggleStatsBtn.addEventListener('click', () => {
                const statsPanel = document.querySelector('.stats-panel');
                if (statsPanel) {
                    statsPanel.classList.toggle('hidden');
                    this.showNotification(statsPanel.classList.contains('hidden') ? 
                        '📊 Статистика скрыта' : '📊 Статистика показана');
                }
            });
        }

        // Быстрое сохранение по Ctrl+S
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (this.currentSaveSlot) {
                    this.saveGame(this.currentSaveSlot);
                } else {
                    this.showSaveModal();
                }
            }
        });
    }

    // Показать модальное окно сохранения
    showSaveModal() {
        const modal = document.getElementById('save-modal');
        if (!modal) return;

        // Обновляем информацию о слотах
        this.updateSaveSlotsInfo();
        
        modal.classList.remove('hidden');
        
        // Обработчики для выбора слота
        const slots = modal.querySelectorAll('.save-slot-modal');
        let selectedSlot = null;
        
        slots.forEach(slot => {
            slot.classList.remove('selected');
            slot.addEventListener('click', () => {
                slots.forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                selectedSlot = parseInt(slot.getAttribute('data-slot'));
            });
        });
        
        // Кнопка подтверждения сохранения
        const confirmBtn = document.getElementById('confirm-save');
        const cancelBtn = document.getElementById('cancel-save');
        
        const confirmHandler = () => {
            if (selectedSlot) {
                this.saveGame(selectedSlot);
                modal.classList.add('hidden');
            } else {
                this.showNotification('❌ Выберите слот для сохранения!');
            }
        };
        
        const cancelHandler = () => {
            modal.classList.add('hidden');
        };
        
        confirmBtn.onclick = confirmHandler;
        cancelBtn.onclick = cancelHandler;
        
        // Закрытие по клику вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // Показать модальное окно загрузки
    showLoadModal() {
        const modal = document.getElementById('load-modal');
        if (!modal) return;

        // Обновляем информацию о слотах
        this.updateSaveSlotsInfo();
        
        modal.classList.remove('hidden');
        
        // Обработчики для выбора слота
        const slots = modal.querySelectorAll('.save-slot-modal');
        let selectedSlot = null;
        
        slots.forEach(slot => {
            slot.classList.remove('selected');
            slot.addEventListener('click', () => {
                slots.forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                selectedSlot = parseInt(slot.getAttribute('data-slot'));
            });
        });
        
        // Кнопки
        const confirmBtn = document.getElementById('confirm-load');
        const cancelBtn = document.getElementById('cancel-load');
        const deleteBtn = document.getElementById('delete-save');
        
        const confirmHandler = () => {
            if (selectedSlot) {
                this.loadGame(selectedSlot);
                modal.classList.add('hidden');
            } else {
                this.showNotification('❌ Выберите слот для загрузки!');
            }
        };
        
        const cancelHandler = () => {
            modal.classList.add('hidden');
        };
        
        const deleteHandler = () => {
            if (selectedSlot && confirm('Удалить это сохранение?')) {
                if (SaveSystem.deleteSave(selectedSlot)) {
                    this.showNotification('✅ Сохранение удалено!');
                    this.updateSaveSlotsInfo();
                    if (this.currentSaveSlot === selectedSlot) {
                        this.currentSaveSlot = null;
                    }
                } else {
                    this.showNotification('❌ Ошибка удаления!');
                }
            }
        };
        
        confirmBtn.onclick = confirmHandler;
        cancelBtn.onclick = cancelHandler;
        deleteBtn.onclick = deleteHandler;
        
        // Закрытие по клику вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // Обновить информацию о слотах сохранения
    updateSaveSlotsInfo() {
        const slotsInfo = SaveSystem.getSaveSlotsInfo();
        
        slotsInfo.forEach(slotInfo => {
            const slotElement = document.querySelector(`.save-slot-modal[data-slot="${slotInfo.slot}"]`);
            if (slotElement) {
                const infoElement = slotElement.querySelector('.slot-info');
                if (slotInfo.exists) {
                    const date = new Date(slotInfo.timestamp).toLocaleDateString('ru-RU');
                    const time = new Date(slotInfo.timestamp).toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    infoElement.textContent = `${slotInfo.currentScene} | ${date} ${time}`;
                    slotElement.classList.add('has-save');
                } else {
                    infoElement.textContent = 'Пусто';
                    slotElement.classList.remove('has-save');
                }
            }
        });
    }

    // Получить текущий прогресс
    getProgress() {
        return {
            currentScene: this.currentScene,
            stats: this.stats,
            visitedCount: this.visitedScenes.size,
            achievements: Object.values(this.achievements).filter(a => a.unlocked).length
        };
    }
}

// Создаем глобальный экземпляр движка
window.GameEngine = new GameEngine();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.GameEngine.init();
});