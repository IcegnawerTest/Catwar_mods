// ==UserScript==
// @name        All_energy_visible
// @namespace    http://tampermonkey.net/
// @version      v4
// @description  В боережиме выводит показатель процентов энергии стрелы на модельки игроков
// @author       Основа кода - Громохват 1673040, улучшено Крутой Яр 1689423.
// @match        https://catwar.su/cw3/
// @match        https://catwar.net/cw3/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=catwar.su
// @require      https://github.com/IcegnawerTest/Catwar_mods/All_energy_visible.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let app = null;

    function getVueApp() {
        if (app && app.field && app.field.cats) {
            return app;
        }

        app = document.querySelector('#app')?.__vue__ || null;
        return app;
    }


    // ============================================
    // Создание индикатора
    // ============================================

    window.createtag = function(cat) {
        let div = document.createElement('div');

        div.className = 'arrow_show';

        div.style.cssText = `
            position: absolute;
            bottom: -22px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            pointer-events: none;
        `;

        cat.style.position = 'relative';
        cat.append(div);

        return div;
    };


    // ============================================
    // Цвет энергии
    // ============================================

    window.getEnergyColor = function(percent) {

        if (percent === 0)
            return '#DC143C';

        if (percent < 25)
            return '#FF6B6B';

        if (percent < 50)
            return '#FFA500';

        if (percent < 75)
            return '#FFD93D';

        return '#6BCF7F';
    };


    // ============================================
    // Главный цикл
    // ============================================

    window.mainLoop = function() {

        const vue = getVueApp();

        if (!vue?.field?.cats)
            return;


        // Все существующие DOM-стрелки.
        const arrows = document.getElementsByClassName('arrow_green');


        // Индикаторы, которые уже существуют
        const allCatsWithIndicators =
            document.querySelectorAll('.arrow_show');

        const activeCats = new Set();


        // ============================================
        // Обрабатываем стрелки
        // ============================================

        for (let arrow of arrows) {

            try {

                // Находим DOM-элемент кота
                let cat =
                    arrow.parentNode
                        ?.parentNode
                        ?.parentNode
                        ?.parentNode
                        ?.parentNode
                        ?.parentNode;

                if (!cat)
                    continue;


                // ========================================
                // Получаем ID кота из его arrow
                // ========================================

                const arrowElement =
                    arrow.parentNode
                        ?.parentNode
                        ?.parentNode;

                if (!arrowElement)
                    continue;


                const arrowContainer =
                    arrowElement.parentNode;

                if (!arrowContainer)
                    continue;

                const arrowRoot =
                    arrow.closest('[id^="arrow"]');

                if (!arrowRoot)
                    continue;


                const idString =
                    arrowRoot.id.replace('arrow', '');

                const catId =
                    Number(idString);


                if (!Number.isFinite(catId))
                    continue;

                const catData =
                    vue.field.cats[catId];


                if (!catData)
                    continue;

                const energy =
                    Number(catData.energy);


                if (!Number.isFinite(energy))
                    continue;

                // 1.00 = 100%
                // 0.75 = 75%
                // 0.37 = 37%
                // 0.01 = 1%

                let percent =
                    Math.round(
                        Math.max(
                            0,
                            Math.min(100, energy * 100)
                        ) * 100
                    ) / 100;


                activeCats.add(cat);


                // ========================================
                // Создаём / получаем индикатор
                // ========================================

                let div =
                    cat.querySelector('.arrow_show');

                if (!div) {
                    div = createtag(cat);
                }


                // ========================================
                // Цвет
                // ========================================

                const color =
                    getEnergyColor(percent);


                // ========================================
                // Вывод
                // ========================================

                div.innerHTML = `
                    <div style='
                        background: linear-gradient(
                            135deg,
                            ${color}30 0%,
                            ${color}30 100%
                        );

                        color: #FFFFFF;
                        text-align: center;
                        padding: 0px 0px;
                        position: relative;
                        margin-bottom: 45pt;
                        z-index: 10;
                        font-size: 8px;
                        font-weight: bold;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                        border: 1px solid rgba(255,255,255,0.3);
                        white-space: nowrap;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                        min-width: 30px;
                        opacity: 0.9;
                    '>
                        ${percent === 0 ? '💀' : '⚡'} ${percent}%
                    </div>
                `;


                // ========================================
                // Анимация нулевой энергии
                // ========================================

                if (percent === 0) {

                    div.firstElementChild.style.animation =
                        'pulse-zero 0.8s ease-in-out infinite';

                } else {

                    div.firstElementChild.style.animation = '';

                }

            } catch (e) {

                // Игнорируем ошибки конкретного кота
                continue;

            }
        }


        // ============================================
        // Удаляем индикаторы котов,
        // которые больше не находятся в боережиме
        // ============================================

        allCatsWithIndicators.forEach(indicator => {

            const cat = indicator.parentNode;

            if (!activeCats.has(cat)) {
                indicator.remove();
            }

        });
    };


    // ============================================
    // CSS
    // ============================================

    let style = document.createElement('style');

    style.textContent = `

        @keyframes pulse-zero {

            0%, 100% {
                transform: scale(1);
                box-shadow:
                    0 0 15px rgba(220,20,60,0.8);
                filter: brightness(1);
            }

            50% {
                transform: scale(1.15);
                box-shadow:
                    0 0 25px rgba(255,215,0,1),
                    0 0 35px rgba(220,20,60,0.9);
                filter: brightness(1.3);
            }

        }

    `;

    document.head.appendChild(style);


    // ============================================
    // Запуск
    // ============================================

    function loop() {

        mainLoop();

        requestAnimationFrame(loop);

    }

    loop();

})();
