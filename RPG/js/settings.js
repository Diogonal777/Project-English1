// Система настроек игры

class SettingsManager {
    constructor() {
        this.settings = SaveSystem.getSettings();
        this.isModalOpen = false;
    }

    // Инициализация настроек
    init() {
        this.applySettings();
        this.setupEventListeners();
    }

    // Применить настройки
    applySettings() {
        // Применяем настройки звука
        this.updateAudioVolumes();
        
        // Применяем настройки интерфейса
        this.updateInterfaceSettings();
    }

    // Обновление громкости аудио
    updateAudioVolumes() {
        // Здесь можно добавить управление аудио элементами
        console.log('Музыка:', this.settings.musicVolume + '%');
        console.log('Звуки:', this.settings.soundVolume + '%');
    }

    // Обновление настроек интерфейса
    updateInterfaceSettings() {
        // Скорость текста
        const dialogueText = document.getElementById('dialogue-text');
        if (dialogueText) {
            const speed = this.settings.textSpeed / 100;
            dialogueText.style.animationDuration = `${2 - speed * 1.5}s`;
        }
    }

    // Показать модальное окно настроек
    showSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;

        this.isModalOpen = true;
        this.populateSettingsForm();
        modal.classList.remove('hidden');

        // Обработчики закрытия
        const closeBtn = document.getElementById('close-settings');
        const saveBtn = document.getElementById('save-settings');
        const resetBtn = document.getElementById('reset-settings');

        closeBtn.onclick = () => this.hideSettingsModal();
        saveBtn.onclick = () => this.saveSettings();
        resetBtn.onclick = () => this.resetSettings();

        // Закрытие по клику вне окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideSettingsModal();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.hideSettingsModal();
            }
        });
    }

    // Скрыть модальное окно настроек
    hideSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.isModalOpen = false;
    }

    // Заполнить форму настроек
    populateSettingsForm() {
        const form = document.getElementById('settings-form');
        if (!form) return;

        // Заполняем значения
        Object.keys(this.settings).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = this.settings[key];
                } else {
                    input.value = this.settings[key];
                }
                
                // Обновляем значение для range inputs
                const valueDisplay = input.nextElementSibling;
                if (valueDisplay && valueDisplay.classList.contains('range-value')) {
                    valueDisplay.textContent = input.value + (input.type === 'range' ? '%' : '');
                }
            }
        });
    }

    // Сохранить настройки
    saveSettings() {
        const form = document.getElementById('settings-form');
        if (!form) return;

        const formData = new FormData(form);
        const newSettings = {};

        for (let [key, value] of formData.entries()) {
            if (key === 'musicVolume' || key === 'soundVolume' || key === 'textSpeed') {
                newSettings[key] = parseInt(value);
            } else if (key === 'autoPlay' || key === 'skipViewed') {
                newSettings[key] = value === 'on';
            } else {
                newSettings[key] = value;
            }
        }

        this.settings = { ...this.settings, ...newSettings };
        
        if (SaveSystem.saveSettings(this.settings)) {
            this.applySettings();
            this.hideSettingsModal();
            
            if (window.GameEngine) {
                window.GameEngine.showNotification('✅ Настройки сохранены!');
            }
        }
    }

    // Сбросить настройки
    resetSettings() {
        if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
            this.settings = SaveSystem.getDefaultSettings();
            SaveSystem.saveSettings(this.settings);
            this.applySettings();
            this.populateSettingsForm();
            
            if (window.GameEngine) {
                window.GameEngine.showNotification('✅ Настройки сброшены!');
            }
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработчики для range inputs
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const valueDisplay = e.target.nextElementSibling;
                if (valueDisplay && valueDisplay.classList.contains('range-value')) {
                    valueDisplay.textContent = e.target.value + '%';
                }
            });
        });

        // Обработчик для кнопки очистки данных
        const clearDataBtn = document.getElementById('clear-data');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                if (confirm('ВНИМАНИЕ! Это удалит все сохранения, достижения и историю. Продолжить?')) {
                    if (SaveSystem.clearAllData()) {
                        localStorage.removeItem('samurai_autosave');
                        if (window.GameEngine) {
                            window.GameEngine.showNotification('✅ Все данные очищены!');
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
                    }
                }
            });
        }
    }

    // Получить текущие настройки
    getSettings() {
        return this.settings;
    }
}

// Глобальный экземпляр менеджера настроек
window.SettingsManager = new SettingsManager();

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.SettingsManager.init();
});