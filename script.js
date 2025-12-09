// Основной объект игры, хранящий состояние
const game = {
    score: 0, // Текущее количество снежинок
    autoSnow: 0, // Количество автоматических снежинок в секунду
    multiplier: 1, // Мультипликатор очков за клик

    // Цены улучшений
    autoSnowCost: 10, // Стоимость первого уровня авто-снега
    multiplierCost: 50, // Стоимость первого уровня мультипликатора

    // Загрузка сохранённых данных из localStorage
    load: function () {
        const saved = localStorage.getItem("snow_clicker");
        if (saved) {
            const data = JSON.parse(saved);
            // Восстанавливаем состояние или используем значения по умолчанию
            this.score = data.score || 0;
            this.autoSnow = data.autoSnow || 0;
            this.multiplier = data.multiplier || 1;
            this.autoSnowCost = data.autoSnowCost || 10;
            this.multiplierCost = data.multiplierCost || 50;
        }
        this.updateButtons(); // Обновляем текст кнопок после загрузки
    },

    // Сохранение прогресса в localStorage
    save: function () {
        localStorage.setItem(
            "snow_clicker",
            JSON.stringify({
                score: this.score,
                autoSnow: this.autoSnow,
                multiplier: this.multiplier,
                autoSnowCost: this.autoSnowCost,
                multiplierCost: this.multiplierCost
            })
        );
    },

    // Создание анимированной снежинки
    createSnowflake: function () {
        const snowflake = document.createElement("div");
        snowflake.classList.add("snowflake"); // Применяем стили из CSS
        snowflake.textContent = "❄"; // Символ снежинки

        // Случайное горизонтальное положение (от 0 до 100% ширины экрана)
        snowflake.style.left = Math.random() * 100 + "vw";

        // Случайный размер (от 15px до 35px)
        snowflake.style.fontSize = 15 + Math.random() * 20 + "px";

        // Случайная прозрачность (от 0.7 до 1.0)
        snowflake.style.opacity = 0.7 + Math.random() * 0.3;

        // Случайная длительность падения (от 3 до 7 секунд)
        const duration = 3 + Math.random() * 4;
        snowflake.style.animationDuration = duration + "s";

        // Добавляем снежинку в контейнер
        document.getElementById("snow-container").appendChild(snowflake);

        // Автоматически удаляем снежинку после завершения анимации
        setTimeout(() => {
            snowflake.remove();
        }, duration * 1000);
    },

    // Обновление отображения счётчика
    updateUI: function () {
        document.getElementById("score").textContent = this.score;
    },

    // Обновление текста кнопок улучшений с актуальными ценами
    updateButtons: function () {
        document.getElementById("auto-snow").textContent = `Авто-снег (${this.autoSnow}) - ${this.autoSnowCost}❄️`;
        document.getElementById("multiplier").textContent = `×${this.multiplier} очки - ${this.multiplierCost}❄️`;
    }
};

// --- Инициализация игры ---
game.load(); // Загружаем сохранённые данные
game.updateUI(); // Обновляем интерфейс

// --- Обработчики событий ---
// Клик по игровой зоне
document.getElementById("click-area").addEventListener("click", () => {
    game.score += 1 * game.multiplier; // Увеличиваем счёт с учётом мультипликатора
    game.updateUI(); // Обновляем отображение
    game.createSnowflake(); // Создаём снежинку
    game.save(); // Сохраняем прогресс
});

// Автоматическое создание снежинок раз в секунду
setInterval(() => {
    if (game.autoSnow > 0) {
        // Добавляем очки за авто-снег с учётом мультипликатора
        game.score += game.autoSnow * game.multiplier;
        game.updateUI();
        game.save();

        // Создаём 1-3 снежинок с небольшой задержкой между ними
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
            setTimeout(() => game.createSnowflake(), i * 100);
        }
    }
}, 1000);

// --- Улучшения ---
// Покупка авто-снега
document.getElementById("auto-snow").addEventListener("click", () => {
    if (game.score >= game.autoSnowCost) {
        game.score -= game.autoSnowCost; // Списываем стоимость
        game.autoSnow++; // Увеличиваем уровень
        game.autoSnowCost = Math.round(game.autoSnowCost * 1.5); // Повышаем цену на 50%

        game.updateUI();
        game.updateButtons(); // Обновляем текст кнопки
        game.save();
    }
});

// Покупка мультипликатора
document.getElementById("multiplier").addEventListener("click", () => {
    if (game.score >= game.multiplierCost) {
        game.score -= game.multiplierCost;
        game.multiplier *= 2; // Удваиваем множитель
        game.multiplierCost = Math.round(game.multiplierCost * 2.5); // Повышаем цену в 2.5 раза

        game.updateUI();
        game.updateButtons();
        game.save();
    }
});

// --- Интеграция с Telegram ---
document.getElementById("save-btn").addEventListener("click", () => {
    if (Telegram.WebApp) {
        // Формируем данные для отправки в Telegram
        const data = JSON.stringify({
            score: game.score,
            autoSnow: game.autoSnow,
            multiplier: game.multiplier,
            autoSnowCost: game.autoSnowCost,
            multiplierCost: game.multiplierCost
        });

        // Отправляем данные через Telegram WebApp API
        Telegram.WebApp.sendData(data);
        alert("💾 Прогресс сохранен и отправлен в Telegram!");
    } else {
        alert("ℹ️ Эта функция работает только внутри Telegram Mini App");
    }
});
