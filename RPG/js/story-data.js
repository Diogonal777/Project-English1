// Данные для визуальной новеллы "Путь Самурая"

const storyData = {
    // Начальная сцена
    "start": {
        id: "start",
        title: "Начало пути",
        background: "linear-gradient(135deg, #2c3e50, #4a235a)",
        character: "Рассказчик",
        text: "Вы - молодой самурай по имени Такеши. Ваш господин, даймё Кагеши, был вероломно убит в собственном замке. Теперь вам предстоит выбрать свой путь в этом мире, полном опасностей и интриг.",
        choices: [
            {
                text: "Поклясться отомстить убийцам",
                nextScene: "revenge_path",
                effects: {
                    honor: 10,
                    strength: 5,
                    karma: -5
                },
                requirement: null
            },
            {
                text: "Искать истинных виновников заговора",
                nextScene: "investigation_path", 
                effects: {
                    wisdom: 10,
                    honor: -3
                },
                requirement: null
            },
            {
                text: "Взять на себя защиту семьи даймё",
                nextScene: "protection_path",
                effects: {
                    honor: 15,
                    charm: 5
                },
                requirement: null
            }
        ]
    },

    // Путь мести
    "revenge_path": {
        id: "revenge_path",
        title: "Путь мести",
        background: "linear-gradient(135deg, #c0392b, #e74c3c)",
        character: "Такеши",
        text: "Вы дали клятву отомстить. С мечом в руках вы отправляетесь по следам убийц. В деревне у подножия гор вы находите первого свидетеля - старого крестьянина, который боится говорить.",
        choices: [
            {
                text: "Угрожать крестьянину, чтобы он рассказал правду",
                nextScene: "threaten_peasant",
                effects: {
                    strength: 5,
                    honor: -10,
                    karma: -10
                }
            },
            {
                text: "Предложить деньги за информацию",
                nextScene: "bribe_peasant", 
                effects: {
                    charm: 8,
                    wisdom: 3
                }
            },
            {
                text: "Уважительно попросить о помощи",
                nextScene: "respect_peasant",
                effects: {
                    honor: 8,
                    charm: 5,
                    karma: 5
                },
                requirement: {
                    charm: 20
                }
            }
        ]
    },

    "threaten_peasant": {
        id: "threaten_peasant",
        title: "Угрозы",
        background: "linear-gradient(135deg, #8B0000, #FF0000)",
        character: "Крестьянин",
        text: "Испуганный крестьянин рассказывает, что видел группу ниндзя, направлявшихся к старому храму в горах. 'Пожалуйста, не убивайте меня! Я всего лишь старый человек!'",
        choices: [
            {
                text: "Отправиться к храму немедленно",
                nextScene: "mountain_temple",
                effects: {
                    strength: 5
                }
            },
            {
                text: "Отдать крестьянину немного денег за помощь",
                nextScene: "compensate_peasant",
                effects: {
                    honor: 5,
                    karma: 3
                }
            }
        ]
    },

    // Путь расследования
    "investigation_path": {
        id: "investigation_path", 
        title: "Путь расследования",
        background: "linear-gradient(135deg, #3498db, #2980b9)",
        character: "Такеши",
        text: "Вы решаете действовать осторожно. В замке вы находите дневник даймё с упоминаниями о растущем влиянии клана Шадоу. Возможно, убийство было частью большего заговора.",
        choices: [
            {
                text: "Изучить дневник более внимательно",
                nextScene: "study_diary",
                effects: {
                    wisdom: 10
                },
                requirement: {
                    wisdom: 25
                }
            },
            {
                text: "Опросить слуг и стражу",
                nextScene: "question_servants",
                effects: {
                    charm: 8
                }
            },
            {
                text: "Осмотреть место убийства",
                nextScene: "crime_scene",
                effects: {
                    wisdom: 5,
                    strength: 3
                }
            }
        ]
    },

    "study_diary": {
        id: "study_diary",
        title: "Тайны дневника",
        background: "linear-gradient(135deg, #2c3e50, #34495e)", 
        character: "Такеши",
        text: "В дневнике вы находите зашифрованные записи о встрече с таинственным 'Советом Теней'. Даймё подозревал, что его собственный советник может быть предателем.",
        choices: [
            {
                text: "Конфронтация с советником",
                nextScene: "confront_adviser",
                effects: {
                    strength: 8,
                    honor: 5
                },
                requirement: {
                    strength: 30
                }
            },
            {
                text: "Тайно следить за советником",
                nextScene: "spy_adviser",
                effects: {
                    wisdom: 10,
                    charm: 5
                }
            }
        ]
    },

    // Путь защиты
    "protection_path": {
        id: "protection_path",
        title: "Путь защиты", 
        background: "linear-gradient(135deg, #27ae60, #2ecc71)",
        character: "Такеши",
        text: "Вы принимаете решение защитить вдову и детей даймё. В замке царит паника, многие слуги разбежались. Вам нужно организовать защиту и успокоить семью.",
        choices: [
            {
                text: "Организовать охрану замка",
                nextScene: "organize_guard",
                effects: {
                    strength: 10,
                    honor: 5
                }
            },
            {
                text: "Утешить и поддержать семью даймё",
                nextScene: "comfort_family",
                effects: {
                    charm: 10,
                    honor: 3,
                    karma: 5
                }
            },
            {
                text: "Найти союзников среди других самураев",
                nextScene: "find_allies",
                effects: {
                    charm: 8,
                    wisdom: 5
                },
                requirement: {
                    honor: 25
                }
            }
        ]
    },

    // Общие сцены
    "mountain_temple": {
        id: "mountain_temple",
        title: "Горный храм",
        background: "linear-gradient(135deg, #8B4513, #A0522D)",
        character: "Такеши", 
        text: "Вы достигаете старого храма в горах. Храм выглядит заброшенным, но вы замечаете свежие следы. Внутри вас ждет засада!",
        choices: [
            {
                text: "Атаковать первым",
                nextScene: "temple_combat",
                effects: {
                    strength: 10
                }
            },
            {
                text: "Попытаться договориться",
                nextScene: "temple_negotiate",
                effects: {
                    charm: 8,
                    wisdom: 5
                },
                requirement: {
                    charm: 25
                }
            },
            {
                text: "Отступить и вернуться с подкреплением",
                nextScene: "retreat_reinforce",
                effects: {
                    wisdom: 10,
                    honor: -5
                }
            }
        ]
    },

    // Концовки
    "honorable_end": {
        id: "honorable_end",
        title: "Путь Чести",
        background: "linear-gradient(135deg, #f39c12, #e67e22)",
        character: "Рассказчик",
        text: "Вы прошли путь истинного самурая, сохранив честь и достоинство. Правда восторжествовала, а справедливость была восстановлена. Ваше имя будет помнить история как пример верности и чести.",
        choices: [
            {
                text: "Начать заново",
                nextScene: "start",
                effects: {
                    honor: 0,
                    wisdom: 0,
                    strength: 0,
                    charm: 0,
                    karma: 0
                }
            }
        ],
        isEnding: true,
        achievement: "honorable_warrior"
    },

    "wise_ruler_end": {
        id: "wise_ruler_end", 
        title: "Мудрый Правитель",
        background: "linear-gradient(135deg, #3498db, #2980b9)",
        character: "Рассказчик",
        text: "Благодаря своей мудрости и дипломатии, вы не только раскрыли заговор, но и стали новым лидером, способным объединить враждующие кланы. Ваше правление принесло мир и процветание.",
        choices: [
            {
                text: "Начать заново", 
                nextScene: "start",
                effects: {
                    honor: 0,
                    wisdom: 0, 
                    strength: 0,
                    charm: 0,
                    karma: 0
                }
            }
        ],
        isEnding: true,
        achievement: "wise_ruler"
    },

    "dark_lord_end": {
        id: "dark_lord_end",
        title: "Темный Владыка", 
        background: "linear-gradient(135deg, #2c3e50, #34495e)",
        character: "Рассказчик",
        text: "Сила и хитрость привели вас к вершине власти. Вы уничтожили всех врагов, но цена была велика - ваша душа погрузилась во тьму. Теперь вы правите через страх, а не уважение.",
        choices: [
            {
                text: "Начать заново",
                nextScene: "start", 
                effects: {
                    honor: 0,
                    wisdom: 0,
                    strength: 0,
                    charm: 0, 
                    karma: 0
                }
            }
        ],
        isEnding: true,
        achievement: "dark_lord"
    }
};

// Достижения
const achievementsData = {
    "honorable_warrior": {
        name: "Воин Чести",
        description: "Завершить игру, сохранив высокую честь",
        hidden: false
    },
    "wise_ruler": {
        name: "Мудрый Правитель", 
        description: "Достичь конца через мудрость и дипломатию",
        hidden: false
    },
    "dark_lord": {
        name: "Темный Владыка",
        description: "Прийти к власти через силу и страх", 
        hidden: true
    },
    "first_steps": {
        name: "Первые шаги",
        description: "Начать свое приключение",
        hidden: false
    },
    "skilled_diplomat": {
        name: "Искусный Дипломат",
        description: "Достичь 50 очков харизмы",
        hidden: false
    },
    "master_warrior": {
        name: "Мастер-Воин",
        description: "Достичь 70 очков силы", 
        hidden: false
    },
    "wise_sage": {
        name: "Мудрый Мудрец",
        description: "Достичь 80 очков мудрости",
        hidden: false
    },
    "perfect_balance": {
        name: "Идеальный Баланс",
        description: "Иметь все характеристики выше 40",
        hidden: true
    }
};

// Начальные характеристики игрока
const initialStats = {
    honor: 50,
    wisdom: 50, 
    strength: 50,
    charm: 50,
    karma: 0
};

// Функции для работы с историей
const StoryManager = {
    // Получить сцену по ID
    getScene: (sceneId) => {
        return storyData[sceneId] || storyData["start"];
    },

    // Проверить доступность выбора
    isChoiceAvailable: (choice, stats) => {
        if (!choice.requirement) return true;
        
        for (const [stat, value] of Object.entries(choice.requirement)) {
            if (stats[stat] < value) return false;
        }
        return true;
    },

    // Применить эффекты выбора
    applyEffects: (effects, currentStats) => {
        const newStats = {...currentStats};
        for (const [stat, value] of Object.entries(effects)) {
            newStats[stat] = Math.max(0, Math.min(100, newStats[stat] + value));
        }
        return newStats;
    },

    // Получить все возможные концовки
    getEndings: () => {
        return Object.values(storyData).filter(scene => scene.isEnding);
    }
};