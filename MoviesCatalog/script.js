class SecureMovieCatalog {
    constructor() {
        this.currentCategory = 'movies';
        this.userId = this.getUserId();
        this.init();
    }

    getUserId() {
        let userId = localStorage.getItem('movieCatalogUserId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('movieCatalogUserId', userId);
        }
        return userId;
    }

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCategory(e.target.dataset.category);
            });
        });
        document.getElementById('showFormBtn').addEventListener('click', () => {
            this.toggleForm(true);
        });
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.toggleForm(false);
        });
        document.getElementById('itemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveItem();
        });
        document.getElementById('sortSelect').addEventListener('change', () => {
            this.render();
        });
        document.getElementById('dateInput').valueAsDate = new Date();
        
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e);
        });
    }

    switchCategory(category) {
        this.currentCategory = category;
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        const categoryNames = {
            'movies': '🎭 Фильмы',
            'cartoons': '🐰 Мультфильмы', 
            'series': '📺 Сериалы'
        };
        document.getElementById('currentCategory').textContent = categoryNames[category];
        
        this.render();
    }

    toggleForm(show) {
        document.getElementById('addForm').classList.toggle('hidden', !show);
    }

    saveItem() {
        const formData = {
            title: document.getElementById('titleInput').value.trim(),
            type: document.getElementById('typeSelect').value,
            rating: parseFloat(document.getElementById('ratingInput').value),
            date: document.getElementById('dateInput').value || new Date().toISOString().split('T')[0],
            comment: document.getElementById('commentInput').value.trim(),
            id: Date.now(),
            userId: this.userId
        };

        if (!this.validateForm(formData)) {
            return;
        }

        if (!this.data[formData.type]) {
            this.data[formData.type] = [];
        }
        this.data[formData.type].push(formData);

        this.saveToStorage();
        this.render();
        this.resetForm();
        this.toggleForm(false);

        this.showNotification('✅ Запись успешно добавлена!');
    }

    validateForm(data) {
        if (!data.title) {
            this.showNotification('❌ Введите название');
            return false;
        }
        if (!data.type) {
            this.showNotification('❌ Выберите тип');
            return false;
        }
        if (data.rating < 0 || data.rating > 10 || isNaN(data.rating)) {
            this.showNotification('❌ Оценка должна быть от 0 до 10');
            return false;
        }
        return true;
    }

    resetForm() {
        document.getElementById('itemForm').reset();
        document.getElementById('dateInput').valueAsDate = new Date();
    }

    deleteItem(id, category) {
        if (confirm('Удалить эту запись?')) {
            this.data[category] = this.data[category].filter(item => item.id !== id);
            this.saveToStorage();
            this.render();
            this.showNotification('✅ Запись удалена');
        }
    }

    loadFromStorage() {
        const stored = localStorage.getItem(`movieCatalog_${this.userId}`);
        this.data = stored ? JSON.parse(stored) : {
            movies: [],
            cartoons: [],
            series: []
        };
    }

    saveToStorage() {
        localStorage.setItem(`movieCatalog_${this.userId}`, JSON.stringify(this.data));
    }

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `movie-catalog-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('✅ Данные экспортированы!');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (this.isValidData(importedData)) {
                    if (confirm('Заменить текущие данные импортированными?')) {
                        this.data = importedData;
                        this.saveToStorage();
                        this.render();
                        this.showNotification('✅ Данные успешно импортированы!');
                    }
                } else {
                    this.showNotification('❌ Неверный формат файла');
                }
            } catch (error) {
                this.showNotification('❌ Ошибка при импорте файла');
            }
        };
        reader.readAsText(file);
        
        event.target.value = '';
    }

    isValidData(data) {
        return (
            data &&
            typeof data === 'object' &&
            Array.isArray(data.movies) &&
            Array.isArray(data.cartoons) && 
            Array.isArray(data.series)
        );
    }

    render() {
        const items = this.data[this.currentCategory] || [];
        const sortedItems = this.sortItems(items);
        const container = document.getElementById('itemsList');
        
        if (sortedItems.length === 0) {
            container.innerHTML = '<div class="empty-state">📝 Пока ничего нет. Добавьте первую запись!</div>';
            return;
        }

        container.innerHTML = sortedItems.map(item => `
            <div class="item-row">
                <div class="col-title">${this.escapeHtml(item.title)}</div>
                <div class="col-rating">${item.rating}/10</div>
                <div class="col-date">${this.formatDate(item.date)}</div>
                <div class="col-comment">${this.escapeHtml(item.comment) || '-'}</div>
                <div class="col-actions">
                    <button class="delete-btn" onclick="catalog.deleteItem(${item.id}, '${this.currentCategory}')">
                        Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    sortItems(items) {
        const sortBy = document.getElementById('sortSelect').value;
        
        return [...items].sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'rating-desc':
                    return b.rating - a.rating;
                case 'rating-asc':
                    return a.rating - b.rating;
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'custom-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.catalog = new SecureMovieCatalog();
});