/**
 * SISTEA — Module Alertes
 */

import { SITES, CAT, PRIO } from './data.js';
import { priorityCol, priorityBg, priorityCls, $ } from './utils.js';

export function initAlerts() {
    const html = '<div style="display:flex;flex-direction:column;gap:12px">' +
        SITES.map(s => {
            const col = priorityCol(s.prio);
            const bg  = priorityBg(s.prio);
            return `
                <div class="alert-full">
                  <div class="af-head">
                    <div class="af-icon" style="background:${bg};color:${col}">${CAT[s.cat].ic}</div>
                    <div class="af-info">
                      <div class="af-title">${CAT[s.cat].label} — ${s.name}</div>
                      <div class="af-meta">${s.superficie} ha · ${s.date} · Confiance ${s.conf}%</div>
                    </div>
                    <div class="af-badge" style="background:${bg};color:${col}">${PRIO[s.prio].label.toUpperCase()}</div>
                  </div>
                  <div class="af-body">
                    <div class="af-kpi"><div class="af-kpi-val">${s.superficie}</div><div class="af-kpi-lbl">hectares</div></div>
                    <div class="af-kpi"><div class="af-kpi-val">${s.dval}</div><div class="af-kpi-lbl">${s.detail.toLowerCase()}</div></div>
                    <div class="af-kpi"><div class="af-kpi-val">${s.conf}%</div><div class="af-kpi-lbl">confiance IA</div></div>
                    <div class="af-kpi"><div class="af-kpi-val">${s.seuil}%</div><div class="af-kpi-lbl">du seuil d'alerte</div></div>
                  </div>
                  <div class="af-footer">
                    <div class="af-tag" style="background:${bg};color:${col}">${CAT[s.cat].label}</div>
                    <div class="af-tag" style="background:var(--gl);color:#16a34a">Satellite + Drone</div>
                  </div>
                </div>`;
        }).join('') + '</div>';

    $('alerts-list').innerHTML = html;
}
