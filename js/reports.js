/**
 * SISTEA — Module Rapports
 */

import { REPORTS, AUTO_REPORTS } from './data.js';
import { $, slugify } from './utils.js';

// On travaille sur des copies mutables
let reports = [...REPORTS];
let autoReports = [...AUTO_REPORTS];

export function initReports() {
    renderReportsList();
    renderAutoReports();
    updateReportStats();
}

function renderReportsList(filtered = null) {
    const list = filtered || reports;
    $('reports-list').innerHTML = list.map(r => {
        const statusLabel = r.status === 'published' ? 'Publié' : r.status === 'draft' ? 'Brouillon' : 'Archivé';
        return `
            <div class="report-item" data-id="${r.id}">
              <div class="report-icon">📄</div>
              <div class="report-content">
                <div class="report-name">${r.name}</div>
                <div class="report-meta">${r.sites} sites · ${r.size} · ${r.date}</div>
              </div>
              <div class="report-actions">
                <div class="report-badge">${statusLabel}</div>
                <button class="mini-btn" data-action="preview" data-id="${r.id}" title="Aperçu détaillé">Aperçu</button>
                <button class="download-btn" data-action="csv" data-id="${r.id}" title="Télécharger CSV">CSV</button>
                <button class="pdf-btn" data-action="pdf" data-id="${r.id}" title="Exporter en PDF">PDF</button>
              </div>
            </div>
        `;
    }).join('');

    // Délégation d'événements
    $('reports-list').onclick = (e) => {
        const btn = e.target.closest('button[data-action]');
        const item = e.target.closest('.report-item');
        if (btn) {
            e.stopPropagation();
            const id = +btn.dataset.id;
            if (btn.dataset.action === 'preview') showReportPreview(id);
            else if (btn.dataset.action === 'csv') downloadReport(id, 'csv');
            else if (btn.dataset.action === 'pdf') downloadReportPdf(id);
        } else if (item) {
            viewReport(+item.dataset.id);
        }
    };
}

function renderAutoReports() {
    $('auto-reports').innerHTML = autoReports.map(r => `
        <div class="auto-report-item">
          <div class="auto-report-toggle ${r.enabled ? 'active' : ''}" data-id="${r.id}"></div>
          <div class="auto-report-info">
            <div class="auto-report-name">${r.name}</div>
            <div class="auto-report-schedule">${r.schedule}</div>
          </div>
          <div class="auto-report-actions">
            <button data-action="edit" data-id="${r.id}" title="Modifier">✎</button>
            <button data-action="delete" data-id="${r.id}" title="Supprimer">✕</button>
          </div>
        </div>
    `).join('');

    $('auto-reports').onclick = (e) => {
        const toggle = e.target.closest('.auto-report-toggle');
        const btn = e.target.closest('button[data-action]');
        if (toggle) {
            toggleAutoReport(+toggle.dataset.id);
        } else if (btn) {
            const id = +btn.dataset.id;
            if (btn.dataset.action === 'edit') editAutoReport(id);
            else if (btn.dataset.action === 'delete') deleteAutoReport(id);
        }
    };
}

function updateReportStats() {
    $('stat-total').textContent = reports.length;
    $('stat-published').textContent = reports.filter(r => r.status === 'published').length;
    $('stat-draft').textContent = reports.filter(r => r.status === 'draft').length;
    $('stat-automated').textContent = autoReports.filter(r => r.enabled).length;
}

export function applyReportFilters() {
    const zone   = $('filter-zone').value;
    const status = $('filter-status').value;

    let filtered = [...reports];
    if (zone)   filtered = filtered.filter(r => r.zone === zone);
    if (status) filtered = filtered.filter(r => r.status === status);

    renderReportsList(filtered);
}

function buildReportPreview(report) {
    return `
        <div class="report-preview-header">
          <div>
            <div class="report-preview-tag">${report.type}</div>
            <h2>${report.name}</h2>
          </div>
          <button class="close-preview" data-action="close">✕</button>
        </div>
        <div class="report-preview-summary">
          <strong>Objectif :</strong> ${report.objective}
        </div>
        <div class="report-preview-grid">
          <div class="preview-stat"><span>Surface</span><strong>${report.kpis.surface}</strong></div>
          <div class="preview-stat"><span>Progression</span><strong>${report.kpis.progression}</strong></div>
          <div class="preview-stat"><span>Confiance IA</span><strong>${report.kpis.confiance}</strong></div>
          <div class="preview-stat"><span>Intervention</span><strong>${report.kpis.intervention}</strong></div>
        </div>
        <div class="preview-section">
          <h3>Résumé</h3>
          <p>${report.summary}</p>
        </div>
        <div class="preview-section">
          <h3>Points clés</h3>
          <ul>${report.highlights.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
        <div class="preview-section">
          <h3>Recommandations</h3>
          <ul>${report.recommendations.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
        <div class="preview-footer">
          <button class="download-btn" data-action="csv" data-id="${report.id}">Télécharger CSV</button>
          <button class="pdf-btn" data-action="pdf" data-id="${report.id}">Exporter PDF</button>
        </div>
    `;
}

function showReportPreview(id) {
    const report = reports.find(r => r.id === id);
    if (!report) return;

    let modal = $('report-preview-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'report-preview-modal';
        modal.className = 'report-preview-modal hidden';
        modal.innerHTML = '<div class="report-preview-backdrop" data-action="close"></div><div class="report-preview-content"></div>';
        document.body.appendChild(modal);
    }

    const content = modal.querySelector('.report-preview-content');
    content.innerHTML = buildReportPreview(report);

    content.onclick = (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        if (btn.dataset.action === 'close') closeReportPreview();
        else if (btn.dataset.action === 'csv') downloadReport(+btn.dataset.id, 'csv');
        else if (btn.dataset.action === 'pdf') downloadReportPdf(+btn.dataset.id);
    };

    modal.querySelector('.report-preview-backdrop').onclick = closeReportPreview;
    modal.classList.remove('hidden');
}

function closeReportPreview() {
    const modal = $('report-preview-modal');
    if (modal) modal.classList.add('hidden');
}

function downloadReportPdf(id) {
    const report = reports.find(r => r.id === id);
    if (!report) return;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
        alert('Le navigateur a bloqué la fenêtre d’impression. Veuillez autoriser les popups pour exporter en PDF.');
        return;
    }

    const html = `
      <html>
        <head>
          <title>${report.name}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
            h1 { font-size: 26px; margin-bottom: 10px; }
            .meta { color: #4b5563; margin-bottom: 20px; }
            .kpis { display: grid; grid-template-columns: repeat(2, minmax(160px, 1fr)); gap: 12px; margin: 20px 0; }
            .kpi { border: 1px solid #d1d5db; border-radius: 10px; padding: 12px; background: #f9fafb; }
            .kpi span { display: block; color: #6b7280; font-size: 12px; margin-bottom: 4px; }
            .kpi strong { font-size: 18px; }
            ul { padding-left: 18px; }
            li { margin: 8px 0; }
            .section { margin-top: 22px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>${report.name}</h1>
          <div class="meta">Type: ${report.type} · Date: ${report.date} · Sites: ${report.sites}</div>
          <div class="section"><strong>Objectif :</strong> ${report.objective}</div>
          <div class="kpis">
            ${Object.entries(report.kpis).map(([key, value]) => `
              <div class="kpi"><span>${key}</span><strong>${value}</strong></div>
            `).join('')}
          </div>
          <div class="section"><strong>Résumé :</strong><p>${report.summary}</p></div>
          <div class="section"><strong>Points clés</strong><ul>${report.highlights.map(item => `<li>${item}</li>`).join('')}</ul></div>
          <div class="section"><strong>Recommandations</strong><ul>${report.recommendations.map(item => `<li>${item}</li>`).join('')}</ul></div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
}

function downloadReport(id, format = 'csv') {
    const report = reports.find(r => r.id === id);
    if (!report) return;

    const safeName = slugify(report.name);
    const extension = format === 'json' ? 'json' : format === 'txt' ? 'txt' : 'csv';
    const mimeType = format === 'json' ? 'application/json' : format === 'txt' ? 'text/plain;charset=utf-8' : 'text/csv;charset=utf-8';

    let content = '';
    if (format === 'json') {
        content = JSON.stringify({ ...report, generatedAt: new Date().toISOString() }, null, 2);
    } else if (format === 'txt') {
        content = [
            'Rapport SISTEA',
            '===========================',
            `Nom: ${report.name}`,
            `Statut: ${report.status}`,
            `Date: ${report.date}`,
            `Zone: ${report.zone}`,
            `Type: ${report.type}`,
            `Sites: ${report.sites}`,
            `Taille: ${report.size}`,
            '',
            `Objectif: ${report.objective}`,
            `Résumé: ${report.summary}`,
            '',
            'Points clés:',
            ...report.highlights.map((item, idx) => `${idx + 1}. ${item}`),
            '',
            'Recommandations:',
            ...report.recommendations.map((item, idx) => `${idx + 1}. ${item}`),
            '',
            `KPI: ${JSON.stringify(report.kpis, null, 2)}`
        ].join('\n');
    } else {
        const rows = [
            ['Nom du rapport', 'Statut', 'Date', 'Zone', 'Type', 'Sites', 'Taille', 'Objectif', 'Résumé', 'KPI principal', 'Suivi', 'Confiance IA', 'Recommandation 1', 'Recommandation 2', 'Recommandation 3'],
            [
                report.name, report.status, report.date, report.zone, report.type,
                report.sites, report.size, report.objective, report.summary,
                report.kpis.surface || '', report.kpis.intervention || '', report.kpis.confiance || '',
                report.recommendations[0] || '', report.recommendations[1] || '', report.recommendations[2] || ''
            ]
        ];
        content = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function viewReport(id) {
    const report = reports.find(r => r.id === id);
    if (!report) return;

    const details = [
        `Rapport: ${report.name}`,
        `Type: ${report.type} · ${report.date}`,
        `Objectif: ${report.objective}`,
        '',
        `Résumé: ${report.summary}`,
        '',
        'Points clés:',
        ...report.highlights.map(item => `• ${item}`),
        '',
        'KPI:',
        ...Object.entries(report.kpis).map(([key, value]) => `- ${key}: ${value}`),
        '',
        'Recommandations:',
        ...report.recommendations.map(item => `• ${item}`)
    ].join('\n');

    alert(details);
}

function toggleAutoReport(id) {
    const report = autoReports.find(r => r.id === id);
    if (report) {
        report.enabled = !report.enabled;
        renderAutoReports();
        updateReportStats();
    }
}

function editAutoReport(id) {
    alert('Édition du rapport automatisé #' + id);
}

function deleteAutoReport(id) {
    if (confirm('Supprimer ce rapport automatisé?')) {
        autoReports = autoReports.filter(r => r.id !== id);
        renderAutoReports();
        updateReportStats();
    }
}

export function showReportModal() {
    alert('Génération d\'un nouveau rapport — fonction complète à développer');
}

export function addAutoReport() {
    alert('Ajouter un rapport automatisé — formulaire à implémenter');
}

// Exposer globalement pour les onclick du HTML
window.applyReportFilters = applyReportFilters;
window.showReportModal = showReportModal;
window.addAutoReport = addAutoReport;
