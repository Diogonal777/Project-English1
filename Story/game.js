class StoryGame {
    constructor(storyId) {
        this.storyId = storyId;
        this.storyData = null;
        this.currentScene = 'start';
        this.visitedScenes = new Set();
        this.inventory = new Set();
        this.achievements = new Set();
        this.currentTheme = 'default';
        this.gameConfig = null;
    }

    async init() {
        //
        await this.loadgameConfig();
        
        // Загружаем историю из JSON
        await this.loadStory();
        
        // Восстанавливаем прогресс из localStorage
        this.loadProgress();
        
        // Показываем первую сцену
        this.showScene(this.currentScene);
        
        // Сохраняем прогресс при закрытии страницы
        window.addEventListener('beforeunload', () => this.saveProgress());
    }

    async loadgameConfig() {
        try {
            const response = await fetch('assets/gameConfig.json');
            this.gameConfig = await response.json();
        } catch (error) {
            console.error('Ошибка загрузки конфига:', error);
            // Запасной конфиг на случай ошибки
            this.gameConfig = {
                conditionMessages: {},
                effectMessages: {},
                itemDisplayNames: {}
            };
        }
    }

    async loadStory() {
        try {
            const response = await fetch(`assets/stories/${this.storyId}.json`);
            const data = await response.json();
            
            this.storyName = data.storyName;
            delete data.storyName;
            this.storyData = data;
            
            this.validateStory();
            
            console.log('История загружена:', this.storyName);
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
            document.getElementById('scene-text').innerHTML = 
                '<p>Ошибка загрузки истории.</p>';
        }
    }

    showScene(sceneId) {
        if (sceneId === 'menu') {
            this.returnToMenu();
            return;
        }
        if (!this.storyData || !this.storyData[sceneId]) {
            console.error('Сцена не найдена:', sceneId);
            return;
        }

        const scene = this.storyData[sceneId];
        console.log('Текущая сцена:', sceneId);
        this.currentScene = sceneId;
        this.visitedScenes.add(sceneId);
        this.updateUI(scene);
        this.saveProgress();
        window.scrollTo(0, 0);
    }

    returnToMenu() {
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('story-selection').classList.add('active');
        
        this.currentScene = 'start';
        this.visitedScenes.clear();
        this.inventory.clear();
        this.saveProgress();
    }

    updateUI(scene) {
        const theme = scene.theme || (scene.ending ? 'neutral' : 'default');
        this.setTheme(theme);
        
        document.getElementById('scene-title').textContent = scene.title || 'Интерактивная история';
        document.getElementById('scene-text').innerHTML = `<p>${scene.text}</p>`;
        
        const sceneImage = document.getElementById('scene-image');
        if (scene.image) {
            sceneImage.src = `assets/images/${this.storyId}/${scene.image}`;
            sceneImage.style.display = 'block';
        } else {
            sceneImage.style.display = 'none';
        }
        
        this.renderChoices(scene);
        this.updateStats();
        this.updateHistory();
        
        if (scene.ending) {
            this.showEndingEffects(scene);
        }
    }

    validateStory() {
        const errors = [];
        const sceneIds = Object.keys(this.storyData);
        
        sceneIds.forEach(sceneId => {
            const scene = this.storyData[sceneId];
            
            if (scene.choices) {
                scene.choices.forEach((choice, index) => {
                    if (choice.next !== 'menu' && !this.storyData[choice.next]) {
                        errors.push(`В сцене "${sceneId}" выбор ${index + 1} ведет на несуществующую сцену: "${choice.next}"`);
                    }
                });
            }
        });
        
        if (errors.length > 0) {
            console.error('Ошибки в структуре истории:');
            errors.forEach(error => console.error('-', error));
            return false;
        }
        
        console.log('Проверка истории завершена успешно');
        return true;
    }

    setTheme(theme) {
        this.currentTheme = theme;
        
        document.body.className = '';
        document.body.classList.add(`theme-${theme}`);
        
        this.saveProgress();
    }
    
    showEndingEffects(scene) {
        const theme = scene.theme || 'neutral';
        
        switch(theme) {
            case 'good':
                break;
            case 'bad':
                break;
            case 'secret':
                break;
        }
        
        if (scene.achievement && !this.achievements.has(scene.achievement)) {
            this.achievements.add(scene.achievement);
            this.showAchievement(scene.achievement);
        }
        
        this.playEndingSound(theme);
    }
    
    playEndingSound(theme) {
        // Здесь можно добавить звуковые эффекты
        console.log(`Воспроизведение звука для темы: ${theme}`);
        // На практике можно использовать:
        const audio = new Audio(`assets/sounds/${theme}_ending.mp3`);
        audio.play();
    }
    
    renderChoices(scene) {
        const container = document.getElementById('choices-container');
        container.innerHTML = '';
        
        scene.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.innerHTML = choice.text;
            
            if (choice.hint) {
                button.title = choice.hint;
            }
            
            button.addEventListener('click', () => {
                if (choice.condition && !this.checkCondition(choice.condition)) {
                    this.showConditionMessage(choice.condition);
                    return;
                }
                
                if (choice.effect) {
                    this.applyEffect(choice.effect);
                }
                this.showScene(choice.next);
            });
            
            container.appendChild(button);
        });
    }

checkCondition(condition) {
    if (!condition) return true;
    return this.inventory.has(condition);
}

showConditionMessage(condition) {
    const message = this.gameConfig.conditionMessages[condition] || 'Не выполнено условие!';
    this.showMessage(message);
}

applyEffect(effect) {
    if (!effect) return;
    
    const effectData = this.gameConfig.effectMessages[effect];
    if (effectData) {
        const [item, message] = effectData;
        
        if (effect.startsWith('add_')) {
            this.inventory.add(item);
        } else if (effect.startsWith('remove_')) {
            this.inventory.delete(item);
        }
        
        this.showMessage(message);
    }
}

updateStats() {
    const inventoryList = Array.from(this.inventory)
        .map(item => this.gameConfig.itemDisplayNames[item] || item)
        .join(', ');
    
    const inventoryText = inventoryList ? `Инвентарь: ${inventoryList}` : 'Инвентарь: пусто';
    document.getElementById('inventory').textContent = inventoryText;
    
    document.getElementById('visited-count').textContent = 
        `Посещено: ${this.visitedScenes.size} мест`;
}

    updateHistory() {
        const historyContainer = document.getElementById('visited-scenes');
        historyContainer.innerHTML = '';
        
        Array.from(this.visitedScenes).slice(-10).forEach(sceneId => {
            const scene = this.storyData[sceneId];
            if (scene) {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.textContent = scene.title || sceneId;
                if (sceneId === this.currentScene) {
                    div.classList.add('current');
                }
                historyContainer.appendChild(div);
            }
        });
    }

    showAchievement(achievement) {
        const message = document.createElement('div');
        message.className = 'achievement-message';
        message.innerHTML = `🏆 Достижение получено: <strong>${achievement}</strong>!`;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

showMessage(text) {
    // Удаляем предыдущие сообщения
    const existingMessages = document.querySelectorAll('.game-message');
    existingMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = 'game-message';
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

saveProgress() {
    const progress = {
        storyId: this.storyId,
        currentScene: this.currentScene,
        visitedScenes: Array.from(this.visitedScenes),
        inventory: Array.from(this.inventory),
        achievements: Array.from(this.achievements),
        currentTheme: this.currentTheme
    };
    localStorage.setItem('storyGameProgress', JSON.stringify(progress));
}

loadProgress() {
    const saved = localStorage.getItem('storyGameProgress');
    if (saved) {
        try {
            const progress = JSON.parse(saved);
            if (progress.storyId === this.storyId) {
                this.currentScene = progress.currentScene || 'start';
                this.visitedScenes = new Set(progress.visitedScenes || []);
                this.inventory = new Set(progress.inventory || []);
                this.achievements = new Set(progress.achievements || []);
                this.currentTheme = progress.currentTheme || 'default';
            }
        } catch (e) {
            console.error('Ошибка загрузки прогресса:', e);
        }
    }
}

    // Метод для отладки - сброс прогресса
    resetProgress() {
        localStorage.removeItem('storyGameProgress');
        this.currentScene = 'start';
        this.visitedScenes.clear();
        this.inventory.clear();
        this.achievements.clear();
        this.showScene('start');
    }
}

// Запускаем игру когда страница загрузится
document.addEventListener('DOMContentLoaded', () => {
    const storyButtons = document.querySelectorAll('.story-btn');
    
    storyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const storyId = button.getAttribute('data-story');
            
            document.getElementById('story-selection').classList.remove('active');
            document.getElementById('game-container').classList.remove('hidden');
            
            window.storyGame = new StoryGame(storyId);
            await window.storyGame.init();
        });
    });
    
    if (window.storyGame) {
        window.storyGame.setupButtonInteractions();
    }
    
    // Для отладки - добавляем сброс прогресса по двойному клику на заголовок
    document.getElementById('scene-title').addEventListener('dblclick', () => {
        if (confirm('Сбросить весь прогресс?')) {
            window.storyGame.resetProgress();
        }
    });
});