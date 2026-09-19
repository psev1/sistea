/**
 * SISTEA — Module Page Données
 */

import { SITES, SENSORS, DRONES } from './data.js';
import { $ } from './utils.js';

export function initDataPage() {
    const countEl = $('data-alert-count');
    if (countEl) countEl.textContent = String(SITES.length);

    $('data-sensors').innerHTML = SENSORS.map(s => `
        <div class="sensor-row">
          <div class="sensor-name">${s.label}</div>
          <div class="sensor-bar-wrap">
            <div class="sensor-bar-track">
              <div class="sensor-bar-fill" style="width:${s.pct || Math.min(100, s.val * 2)}%"></div>
            </div>
          </div>
          <div class="sensor-val">${s.val} ${s.unit}</div>
        </div>
    `).join('');

    $('data-drones').innerHTML = DRONES.map(d => `
        <div class="drone-line">
          <div class="dstatus" style="background:${d.col}"></div>
          <div class="drone-name">${d.name}</div>
          <div class="drone-info">${d.label} · ${d.zone}</div>
        </div>
    `).join('');
}
