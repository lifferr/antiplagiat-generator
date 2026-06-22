// ===================== СОСТОЯНИЕ =====================
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
        { percent: 0.89, name: 'Разработка веб-сервиса для циф...', module: 'Кольцо вузов' },
        { percent: 0.51, name: 'Инф.технологии', module: 'Кольцо вузов' },
        { percent: 0.48, name: 'Разработка веб-платформы для ц...', module: 'Кольцо вузов' },
        { percent: 0.75, name: 'terehina_p_s_razrabotka-veb-igry...', module: 'Кольцо вузов' },
        { percent: 0.70, name: 'ВКР Широков Н.В 6596(v7)', module: 'Кольцо вузов' },
        { percent: 1.09, name: 'Шаблонные фразы', module: 'Шаблонные фразы' },
        { percent: 0.55, name: 'Учебник по clean architecture...', module: 'Интернет' }
    ]
};

// ===================== ИНИЦИАЛИЗАЦИЯ =====================
document.addEventListener('DOMContentLoaded', () => {
    bindInputs();
    bindPercentSliders();
    bindSources();
    bindActions();
    renderSourcesTable();
});

// ===================== МЕТАДАННЫЕ =====================
function bindInputs() {
    const fields = ['author','reviewer','docTitle','organization','docNumber','docType',
                    'pages','words','chars','sentences','checkedPercent','excludedPercent'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', e => {
            state[id] = el.type === 'number' ? parseFloat(el.value) || 0 : el.value;
        });
    });
}

// ===================== ПРОЦЕНТЫ =====================
function bindPercentSliders() {
    const keys = ['originality','matches','citations','selfCitations','aiContent'];
    keys.forEach(key => {
        const slider = document.getElementById(key);
        const num = document.getElementById(key + 'Num');
        
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

// Нормализация: при изменении одного значения остальные подстраиваются
function normalizePercentages(changedKey) {
    const keys = ['originality','matches','citations','selfCitations','aiContent'];
    const currentVal = state[changedKey];
    const others = keys.filter(k => k !== changedKey);
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
    // Корректировка последнего для точной суммы 100
    const total = keys.reduce((s, k) => s + state[k], 0);
    if (Math.abs(total - 100) > 0.001 && others.length > 0) {
        const last = others[others.length - 1];
        state[last] = parseFloat((state[last] + (100 - total)).toFixed(2));
        document.getElementById(last).value = state[last];
        document.getElementById(last + 'Num').value = state[last];
    }
}

function updateSum() {
    const keys = ['originality','matches','citations','selfCitations','aiContent'];
    const sum = keys.reduce((s, k) => s + state[k], 0);
    document.getElementById('totalSum').textContent = sum.toFixed(2);
    const status = document.getElementById('sumStatus');
    if (Math.abs(sum - 100) < 0.01) {
        status.textContent = '✓ Корректно';
        status.className = 'status-ok';
    } else {
        status.textContent = '✗ Сумма ≠ 100%';
        status.className = 'status-error';
    }
}

// ===================== ИСТОЧНИКИ =====================
function bindSources() {
    document.getElementById('addSource').addEventListener('click', () => {
        state.sources.push({ percent: 0.5, name: 'Новый источник', module: 'Интернет' });
        renderSourcesTable();
    });
}

function renderSourcesTable() {
    const tbody = document.getElementById('sourcesBody');
    tbody.innerHTML = '';
    state.sources.forEach((src, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td><input type="number" step="0.01" value="${src.percent}" data-i="${i}" data-f="percent"></td>
            <td><input type="text" value="${src.name}" data-i="${i}" data-f="name"></td>
            <td>
                <select data-i="${i}" data-f="module">
                    <option ${src.module==='Кольцо вузов'?'selected':''}>Кольцо вузов</option>
                    <option ${src.module==='Интернет'?'selected':''}>Интернет</option>
                    <option ${src.module==='Интернет Плюс'?'selected':''}>Интернет Плюс</option>
                    <option ${src.module==='Шаблонные фразы'?'selected':''}>Шаблонные фразы</option>
                    <option ${src.module==='Публикации eLIBRARY'?'selected':''}>Публикации eLIBRARY</option>
                    <option ${src.module==='Сводная коллекция ЭБС'?'selected':''}>Сводная коллекция ЭБС</option>
                    <option ${src.module==='Публикации РГБ'?'selected':''}>Публикации РГБ</option>
                    <option ${src.module==='IEEE'?'selected':''}>IEEE</option>
                </select>
            </td>
            <td><button class="btn-delete" data-del="${i}">🗑️</button></td>
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
            state.sources.splice(+e.target.dataset.del, 1);
            renderSourcesTable();
        });
    });
}

// ===================== ДЕЙСТВИЯ =====================
function bindActions() {
    document.getElementById('generateReport').addEventListener('click', generateReport);
    document.getElementById('downloadPdf').addEventListener('click', downloadPdf);
    document.getElementById('resetForm').addEventListener('click', () => location.reload());
}

// ===================== ГЕНЕРАЦИЯ ОТЧЁТА =====================
function generateReport() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU');
    const timeStr = now.toLocaleTimeString('ru-RU');

    const sortedSources = [...state.sources].sort((a, b) => b.percent - a.percent);
    const sourcesRows = sortedSources.map((s, i) => `
        <tr>
            <td>[${String(i+1).padStart(2,'0')}]</td>
            <td>${s.percent.toFixed(2)}%</td>
            <td>${s.name}</td>
            <td>${s.module}</td>
        </tr>
    `).join('');

    const pieChart = buildPieChart();

    const html = `
        <div class="report-header">
            <div style="font-size:12px; color:#777;">Отчет предоставлен сервисом «Антиплагиат» — http://vsu-by.antiplagiat.ru</div>
            <h1>Отчет о проверке</h1>
        </div>

        <div class="report-section">
            <table style="width:100%; font-size:13px;">
                <tr><td><b>Автор:</b></td><td>${state.author}</td></tr>
                <tr><td><b>Проверяющий:</b></td><td>${state.reviewer}</td></tr>
                <tr><td><b>Название документа:</b></td><td>${state.docTitle}</td></tr>
                <tr><td><b>Организация:</b></td><td>${state.organization}</td></tr>
            </table>
        </div>

        <div class="report-section">
            <h3>ИНФОРМАЦИЯ О ДОКУМЕНТЕ</h3>
            <table style="width:100%; font-size:13px;">
                <tr><td>Номер документа: <b>${state.docNumber}</b></td><td>Тип документа: <b>${state.docType}</b></td></tr>
                <tr><td>Количество страниц: <b>${state.pages}</b></td><td>Символов в тексте: <b>${state.chars}</b></td></tr>
                <tr><td>Слов в тексте: <b>${state.words}</b></td><td>Число предложений: <b>${state.sentences}</b></td></tr>
                <tr><td>Дата проверки: <b>${dateStr} ${timeStr}</b></td><td></td></tr>
            </table>
        </div>

        <div class="report-section">
            <h3>РЕЗУЛЬТАТЫ ПРОВЕРКИ</h3>
            <div class="pie-chart">
                ${pieChart.svg}
                <div class="legend">
                    <div class="legend-item"><div class="legend-color" style="background:#4caf50"></div>Оригинальность: <b>${state.originality.toFixed(2)}%</b></div>
                    <div class="legend-item"><div class="legend-color" style="background:#ff9800"></div>Совпадения: <b>${state.matches.toFixed(2)}%</b></div>
                    <div class="legend-item"><div class="legend-color" style="background:#2196f3"></div>Цитирования: <b>${state.citations.toFixed(2)}%</b></div>
                    <div class="legend-item"><div class="legend-color" style="background:#9c27b0"></div>Самоцитирования: <b>${state.selfCitations.toFixed(2)}%</b></div>
                    <div class="legend-item"><div class="legend-color" style="background:#f44336"></div>ИИ-контент: <b>${state.aiContent.toFixed(2)}%</b></div>
                </div>
            </div>
            <p style="font-size:13px; text-align:center; margin-top:10px;">
                Проверено: <b>${state.checkedPercent}%</b> текста документа, 
                исключено из проверки: <b>${state.excludedPercent}%</b> текста документа.
            </p>
        </div>

        <div class="report-section">
            <h3>ИСТОЧНИКИ (${sortedSources.length} шт.)</h3>
            <table style="width:100%; border-collapse:collapse; font-size:12px;">
                <thead>
                    <tr style="background:#1e3c72; color:white;">
                        <th style="padding:8px;">№</th>
                        <th style="padding:8px;">Доля в тексте</th>
                        <th style="padding:8px;">Источник</th>
                        <th style="padding:8px;">Модуль поиска</th>
                    </tr>
                </thead>
                <tbody>${sourcesRows}</tbody>
            </table>
        </div>

        <div style="text-align:center; margin-top:30px; font-size:11px; color:#999; border-top:1px solid #ddd; padding-top:10px;">
            Дата формирования отчёта: ${dateStr} ${timeStr} · http://vsu-by.antiplagiat.ru
        </div>
    `;

    document.getElementById('reportContent').innerHTML = html;
    document.getElementById('reportPreview').scrollIntoView({ behavior: 'smooth' });
}

// ===================== КРУГОВАЯ ДИАГРАММА =====================
function buildPieChart() {
    const data = [
        { value: state.originality, color: '#4caf50', label: 'Оригинальность' },
        { value: state.matches, color: '#ff9800', label: 'Совпадения' },
        { value: state.citations, color: '#2196f3', label: 'Цитирования' },
        { value: state.selfCitations, color: '#9c27b0', label: 'Самоцитирования' },
        { value: state.aiContent, color: '#f44336', label: 'ИИ-контент' }
    ].filter(d => d.value > 0);

    const cx = 110, cy = 110, r = 90;
    let paths = '';
    let startAngle = -Math.PI / 2;

    if (data.length === 1) {
        paths = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${data[0].color}"/>`;
    } else {
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

    return {
        svg: `<svg class="pie-svg" viewBox="0 0 220 220">${paths}<circle cx="${cx}" cy="${cy}" r="35" fill="white"/><text x="${cx}" y="${cy-5}" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e3c72">${state.originality.toFixed(1)}%</text><text x="${cx}" y="${cy+12}" text-anchor="middle" font-size="9" fill="#777">оригинальность</text></svg>`
    };
}

// ===================== ЭКСПОРТ В PDF =====================
function downloadPdf() {
    const content = document.getElementById('reportContent');
    if (!content.innerHTML.trim()) {
        alert('Сначала сформируйте отчёт!');
        return;
    }
    const opt = {
        margin: 10,
        filename: `Antiplagiat_Report_${state.docNumber}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(content).save();
}
