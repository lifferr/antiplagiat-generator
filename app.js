/* =========================================
   СОСТОЯНИЕ ПРИЛОЖЕНИЯ
   ========================================= */
const state = {
    author: 'Цырулик Андрей Сергеевич',
    reviewer: 'Бревнова Анастасия Андреевна',
    docTitle: 'РАЗРАБОТКА ВЕБ-САЙТА ТУРАГЕНТСТВО',
    organization: 'Учреждение образования «Витебский государственный университет имени П.М. Машерова»',
    docNumber: 3712,
    docType: 'Дипломная работа',
    pages: 38,
    words: 6901,
    chars: 60256,
    sentences: 1989,
    originality: 89.39,
    matches: 9.52,
    citations: 0,
    selfCitations: 1.09,
    aiContent: 0,
    checkedPercent: 88.79,
    excludedPercent: 11.21,
    sources: [
        { percent: 2.45, name: 'ВКР_Ишумбаева Велера', module: 'Кольцо вузов' },
        { percent: 0.89, name: 'Разработка веб-сервиса для цифровизации бизнеса', module: 'Кольцо вузов' },
        { percent: 0.51, name: 'Инф.технологии', module: 'Кольцо вузов' },
        { percent: 0.48, name: 'Разработка веб-платформы для цифровизации', module: 'Кольцо вузов' },
        { percent: 0.75, name: 'terehina_p_s_razrabotka-veb-igry', module: 'Кольцо вузов' },
        { percent: 0.70, name: 'ВКР Широков Н.В 6596(v7)', module: 'Кольцо вузов' },
        { percent: 1.09, name: 'Шаблонные фразы', module: 'Шаблонные фразы' },
        { percent: 0.55, name: 'Учебник по clean architecture programming', module: 'Интернет' }
    ]
};

const PERCENT_KEYS = ['originality', 'matches', 'citations', 'selfCitations', 'aiContent'];
const COLOR_MAP = {
    originality: '#34C759',
    matches: '#FF9500',
    citations: '#007AFF',
    selfCitations: '#AF52DE',
    aiContent: '#FF3B30'
};
const LABEL_MAP = {
    originality: 'Оригинальность',
    matches: 'Совпадения',
    citations: 'Цитирования',
    selfCitations: 'Самоцитирования',
    aiContent: 'ИИ-контент'
};

/* =========================================
   ИНИЦИАЛИЗАЦИЯ
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    bindInputs();
    bindPercentSliders();
    bindSources();
    bindActions();
    renderSourcesTable();
    updateSum();
});

/* =========================================
   ПРИВЯЗКА ПОЛЕЙ ВВОДА
   ========================================= */
function bindInputs() {
    const textFields = ['author', 'reviewer', 'docTitle', 'organization', 'docType'];
    const numberFields = ['docNumber', 'pages', 'words', 'chars', 'sentences', 'checkedPercent', 'excludedPercent'];

    textFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => { state[id] = el.value; });
        }
    });

    numberFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                state[id] = parseFloat(el.value) || 0;
            });
        }
    });
}

/* =========================================
   ПРИВЯЗКА СЛАЙДЕРОВ ПРОЦЕНТОВ
   ========================================= */
function bindPercentSliders() {
    PERCENT_KEYS.forEach(key => {
        const slider = document.getElementById(key);
        const num = document.getElementById(key + 'Num');
        if (!slider || !num) return;

        slider.addEventListener('input', () => {
            state[key] = parseFloat(slider.value);
            num.value = slider.value;
            normalizePercentages(key);
            updateSum();
        });

        num.addEventListener('input', () => {
            state[key] = parseFloat(num.value) || 0;
            slider.value = num.value;
            normalizePercentages(key);
            updateSum();
        });
    });
}

function normalizePercentages(changedKey) {
    const currentVal = state[changedKey];
    const others = PERCENT_KEYS.filter(k => k !== changedKey);
    const othersSum = others.reduce((s, k) => s + state[k], 0);
    const targetOthersSum = 100 - currentVal;

    if (othersSum > 0 && targetOthersSum >= 0) {
        const ratio = targetOthersSum / othersSum;
        others.forEach(k => {
            state[k] = parseFloat((state[k] * ratio).toFixed(2));
            document.getElementById(k).value = state[k];
            document.getElementById(k + 'Num').value = state[k];
        });
    } else if (targetOthersSum === 0) {
        others.forEach(k => {
            state[k] = 0;
            document.getElementById(k).value = 0;
            document.getElementById(k + 'Num').value = 0;
        });
    }

    // Точная подгонка последнего значения
    const total = PERCENT_KEYS.reduce((s, k) => s + state[k], 0);
    if (Math.abs(total - 100) > 0.001 && others.length > 0) {
        const last = others[others.length - 1];
        state[last] = parseFloat((state[last] + (100 - total)).toFixed(2));
        document.getElementById(last).value = state[last];
        document.getElementById(last + 'Num').value = state[last];
    }
}

function updateSum() {
    const sum = PERCENT_KEYS.reduce((s, k) => s + state[k], 0);
    const sumEl = document.getElementById('totalSum');
    const statusEl = document.getElementById('sumStatus');
    if (sumEl) sumEl.textContent = sum.toFixed(2);
    if (statusEl) {
        if (Math.abs(sum - 100) < 0.01) {
            statusEl.textContent = 'Корректно';
            statusEl.className = 'sum-status status-ok';
        } else {
            statusEl.textContent = 'Сумма ≠ 100%';
            statusEl.className = 'sum-status status-error';
        }
    }
}

/* =========================================
   ИСТОЧНИКИ
   ========================================= */
function bindSources() {
    document.getElementById('addSource').addEventListener('click', () => {
        state.sources.push({ percent: 0.5, name: 'Новый источник', module: 'Интернет' });
        renderSourcesTable();
    });
}

function renderSourcesTable() {
    const tbody = document.getElementById('sourcesBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    state.sources.forEach((src, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td><input type="number" step="0.01" value="${src.percent}" data-i="${i}" data-f="percent"></td>
            <td><input type="text" value="${escapeHtml(src.name)}" data-i="${i}" data-f="name"></td>
            <td>
                <select data-i="${i}" data-f="module">
                    ${['Кольцо вузов', 'Интернет', 'Интернет Плюс', 'Шаблонные фразы', 'Публикации eLIBRARY', 'Сводная коллекция ЭБС', 'Публикации РГБ', 'IEEE'].map(m =>
                        `<option ${src.module === m ? 'selected' : ''}>${m}</option>`
                    ).join('')}
                </select>
            </td>
            <td><button class="btn btn-danger btn-small" data-del="${i}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button></td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', e => {
            const i = +e.target.dataset.i;
            const f = e.target.dataset.f;
            state.sources[i][f] = f === 'percent' ? parseFloat(e.target.value) || 0 : e.target.value;
        });
    });

    tbody.querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', e => {
            const target = e.target.closest('button');
            state.sources.splice(+target.dataset.del, 1);
            renderSourcesTable();
        });
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/* =========================================
   ДЕЙСТВИЯ
   ========================================= */
function bindActions() {
    document.getElementById('generateReport').addEventListener('click', generateReport);
    document.getElementById('downloadPdf').addEventListener('click', downloadPdf);
    document.getElementById('resetForm').addEventListener('click', () => location.reload());
}

/* =========================================
   ГЕНЕРАЦИЯ ОТЧЁТА
   ========================================= */
function generateReport() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU');
    const timeStr = now.toLocaleTimeString('ru-RU');

    const sortedSources = [...state.sources].sort((a, b) => b.percent - a.percent);
    const sourcesRows = sortedSources.map((s, i) => `
        <tr>
            <td class="num">[${String(i + 1).padStart(2, '0')}]</td>
            <td class="percent">${s.percent.toFixed(2)}%</td>
            <td>${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.module)}</td>
        </tr>
    `).join('');

    const pieChart = buildPieChart();

    const html = `
        <div class="report-header">
            <div class="report-service">Отчёт предоставлен сервисом «Антиплагиат» — <a href="http://vsu-by.antiplagiat.ru" target="_blank">http://vsu-by.antiplagiat.ru</a></div>
            <h1>Отчёт о проверке</h1>
        </div>

        <div class="report-section">
            <h3 class="section-title">Общая информация</h3>
            <div class="report-grid">
                <div class="report-row"><span class="report-label">Автор</span><span class="report-value">${escapeHtml(state.author)}</span></div>
                <div class="report-row"><span class="report-label">Проверяющий</span><span class="report-value">${escapeHtml(state.reviewer)}</span></div>
                <div class="report-row report-row-full"><span class="report-label">Название документа</span><span class="report-value">${escapeHtml(state.docTitle)}</span></div>
                <div class="report-row report-row-full"><span class="report-label">Организация</span><span class="report-value">${escapeHtml(state.organization)}</span></div>
            </div>
        </div>

        <div class="report-section">
            <h3 class="section-title">Информация о документе</h3>
            <div class="report-grid">
                <div class="report-row"><span class="report-label">Номер документа</span><span class="report-value"><b>${state.docNumber}</b></span></div>
                <div class="report-row"><span class="report-label">Тип документа</span><span class="report-value"><b>${escapeHtml(state.docType)}</b></span></div>
                <div class="report-row"><span class="report-label">Количество страниц</span><span class="report-value"><b>${state.pages}</b></span></div>
                <div class="report-row"><span class="report-label">Символов в тексте</span><span class="report-value"><b>${state.chars.toLocaleString('ru-RU')}</b></span></div>
                <div class="report-row"><span class="report-label">Слов в тексте</span><span class="report-value"><b>${state.words.toLocaleString('ru-RU')}</b></span></div>
                <div class="report-row"><span class="report-label">Число предложений</span><span class="report-value"><b>${state.sentences.toLocaleString('ru-RU')}</b></span></div>
                <div class="report-row"><span class="report-label">Дата проверки</span><span class="report-value"><b>${dateStr} ${timeStr}</b></span></div>
            </div>
        </div>

        <div class="report-section">
            <h3 class="section-title">Результаты проверки</h3>
            <div class="report-results">
                ${pieChart.svgWrap}
                <div class="report-legend">
                    ${PERCENT_KEYS.map(k => `
                        <div class="report-legend-item">
                            <span class="legend-color" style="background:${COLOR_MAP[k]}"></span>
                            <span class="legend-label">${LABEL_MAP[k]}</span>
                            <span class="legend-value">${state[k].toFixed(2)}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="report-checked">
                <div>Проверено: <b>${state.checkedPercent}%</b> текста документа, исключено из проверки: <b>${state.excludedPercent}%</b> текста документа.</div>
            </div>
        </div>

        <div class="report-section">
            <h3 class="section-title">Источники совпадений (${sortedSources.length} шт.)</h3>
            <div class="report-table-wrap">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th style="width:50px">№</th>
                            <th style="width:110px">Доля в тексте</th>
                            <th>Источник</th>
                            <th>Модуль поиска</th>
                        </tr>
                    </thead>
                    <tbody>${sourcesRows}</tbody>
                </table>
            </div>
        </div>

        <div class="report-section">
            <h3 class="section-title">Параметры проверки</h3>
            <ul class="report-params">
                <li>Выполнена проверка с учетом редактирования: <b>Да</b></li>
                <li>Выполнено распознавание текста (OCR): <b>Нет</b></li>
                <li>Выполнена проверка с учетом структуры: <b>Да</b></li>
                <li>Разделы и элементы, отключенные пользователем: <b>Приложение, Таблицы</b></li>
            </ul>
        </div>

        <div class="report-section">
            <h3 class="section-title">Пояснения к показателям</h3>
            <div class="report-terms">
                <p><b>Совпадения</b> — фрагменты проверяемого текста, полностью или частично сходные с найденными источниками, за исключением фрагментов, которые система отнесла к цитированию или самоцитированию.</p>
                <p><b>Самоцитирования</b> — фрагменты проверяемого текста, совпадающие или почти совпадающие с фрагментом текста источника, автором или соавтором которого является автор проверяемого документа.</p>
                <p><b>Цитирования</b> — фрагменты проверяемого текста, которые не являются авторскими, но которые система отнесла к корректно оформленным.</p>
                <p><b>Оригинальный текст</b> — фрагменты проверяемого текста, не обнаруженные ни в одном источнике и не отмеченные ни одним из модулей поиска.</p>
            </div>
            <div class="report-disclaimer">
                Обращаем Ваше внимание, что система находит текстовые совпадения проверяемого документа с проиндексированными в системе источниками. При этом система является вспомогательным инструментом — определение корректности и правомерности совпадений или цитирований, а также авторства текстовых фрагментов проверяемого документа остаётся в компетенции проверяющего.
            </div>
        </div>

        <div class="report-footer">
            <div>Дата формирования отчёта: <b>${dateStr} ${timeStr}</b></div>
            <div>Сервис «Антиплагиат» · http://vsu-by.antiplagiat.ru</div>
            <div>Номер документа: ${state.docNumber}</div>
        </div>
    `;

    const canvas = document.getElementById('reportContent');
    canvas.innerHTML = html;
    document.getElementById('reportPreview').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* =========================================
   ПОСТРОЕНИЕ КРУГОВОЙ ДИАГРАММЫ
   ========================================= */
function buildPieChart() {
    const data = PERCENT_KEYS.map(k => ({
        key: k,
        value: state[k],
        color: COLOR_MAP[k],
        label: LABEL_MAP[k]
    })).filter(d => d.value > 0);

    const cx = 130, cy = 130, r = 110;
    let paths = '';
    let startAngle = -Math.PI / 2;

    if (data.length === 1) {
        paths = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${data[0].color}"/>`;
    } else if (data.length > 1) {
        data.forEach(d => {
            const angle = (d.value / 100) * 2 * Math.PI;
            const endAngle = startAngle + angle;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const largeArc = angle > Math.PI ? 1 : 0;
            paths += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${d.color}" stroke="white" stroke-width="2"/>`;
            startAngle = endAngle;
        });
    }

    const svg = `
        <div class="report-pie-wrap">
            <svg class="report-pie" viewBox="0 0 260 260">
                ${paths}
                <circle cx="${cx}" cy="${cy}" r="60" fill="white"/>
            </svg>
            <div class="report-pie-center">
                <div class="big">${state.originality.toFixed(2)}%</div>
                <div class="small">оригинальность</div>
            </div>
        </div>
    `;

    return { svgWrap: svg };
}

/* =========================================
   ЭКСПОРТ В PDF (ИСПРАВЛЕННАЯ ВЕРСИЯ)
   ========================================= */
async function downloadPdf() {
    const content = document.getElementById('reportContent');
    if (!content || !content.innerHTML.trim()) {
        alert('Сначала сформируйте отчёт!');
        return;
    }

    // Создаём клон для экспорта
    const clone = content.cloneNode(true);
    clone.classList.add('pdf-export');
    clone.style.position = 'fixed';
    clone.style.left = '-10000px';
    clone.style.top = '0';
    clone.style.width = '800px';
    clone.style.background = '#ffffff';
    clone.style.color = '#1D1D1F';
    clone.style.padding = '40px';
    clone.style.fontFamily = "'Times New Roman', Georgia, serif";
    clone.style.fontSize = '14px';
    clone.style.lineHeight = '1.6';
    clone.style.zIndex = '-1';
    clone.style.opacity = '1';
    clone.style.visibility = 'visible';

    // Заменяем все стеклянные эффекты на сплошные цвета
    clone.querySelectorAll('*').forEach(el => {
        const computed = window.getComputedStyle(el);
        el.style.backdropFilter = 'none';
        el.style.webkitBackdropFilter = 'none';
        // Сохраняем читаемость фона
        if (computed.backgroundColor && computed.backgroundColor.includes('rgba')) {
            // Оставляем как есть — pdf-export класс обработает
        }
    });

    document.body.appendChild(clone);

    // Ждём рендеринг
    await new Promise(resolve => setTimeout(resolve, 100));

    const opt = {
        margin: 10,
        filename: `Antiplagiat_Report_${state.docNumber}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: 800,
            onclone: function(clonedDoc) {
                // Дополнительная очистка в клоне html2canvas
                clonedDoc.querySelectorAll('.pdf-export, .pdf-export *').forEach(el => {
                    if (el.style) {
                        el.style.backdropFilter = 'none';
                        el.style.webkitBackdropFilter = 'none';
                    }
                });
            }
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        }
    };

    try {
        await html2pdf().set(opt).from(clone).save();
    } catch (err) {
        console.error('PDF export error:', err);
        alert('Ошибка при экспорте PDF. Попробуйте ещё раз.');
    } finally {
        document.body.removeChild(clone);
    }
}
