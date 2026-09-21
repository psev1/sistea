/**
 * SISTEA - Module Paramètres
 */

import { USERS, ZONES_SURV, SENSORS_CONF } from './data.js';
import { $ } from './utils.js';

let users = [...USERS];
let zones = [...ZONES_SURV];
let sensors = [...SENSORS_CONF];

export function initSettings() {
    // Afficher la section alertes par défaut
    showSettings('alerts', document.querySelector('.settings-item'));
}

export function showSettings(id, el) {
    document.querySelectorAll('.settings-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');

    document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
    $('settings-' + id).classList.add('active');

    if (id === 'users')   renderUsersList();
    if (id === 'zones')   renderZonesList();
    if (id === 'sensors') renderSensorsList();
}

function renderUsersList() {
    $('users-list').innerHTML = users.map(u => `
        <div class="list-item">
          <div class="list-item-info">
            <div class="list-item-name">${u.name}</div>
            <div class="list-item-meta">${u.email} · ${u.role}</div>
          </div>
          <div class="list-item-actions">
            <button data-action="edit" data-id="${u.id}" title="Modifier">✎</button>
            <button data-action="delete" data-id="${u.id}" title="Supprimer">✕</button>
          </div>
        </div>
    `).join('');

    $('users-list').onclick = (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = +btn.dataset.id;
        if (btn.dataset.action === 'edit') editUser(id);
        else if (btn.dataset.action === 'delete') deleteUser(id);
    };
}

function renderZonesList() {
    $('zones-list').innerHTML = zones.map(z => `
        <div class="list-item">
          <div class="list-item-info">
            <div class="list-item-name">${z.name}</div>
            <div class="list-item-meta">${z.area.toLocaleString()} ha · ${z.status}</div>
          </div>
          <div class="list-item-actions">
            <button data-action="edit" data-id="${z.id}" title="Modifier">✎</button>
            <button data-action="delete" data-id="${z.id}" title="Supprimer">✕</button>
          </div>
        </div>
    `).join('');

    $('zones-list').onclick = (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = +btn.dataset.id;
        if (btn.dataset.action === 'edit') editZone(id);
        else if (btn.dataset.action === 'delete') deleteZone(id);
    };
}

function renderSensorsList() {
    $('sensors-list').innerHTML = sensors.map(s => `
        <div class="list-item">
          <div class="list-item-info">
            <div class="list-item-name">${s.name}</div>
            <div class="list-item-meta">${s.location} · ${s.type} · ${s.status}</div>
          </div>
          <div class="list-item-actions">
            <button data-action="edit" data-id="${s.id}" title="Modifier">✎</button>
            <button data-action="delete" data-id="${s.id}" title="Supprimer">✕</button>
          </div>
        </div>
    `).join('');

    $('sensors-list').onclick = (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = +btn.dataset.id;
        if (btn.dataset.action === 'edit') editSensor(id);
        else if (btn.dataset.action === 'delete') deleteSensor(id);
    };
}

export function updateThreshold(type) {
    const value = $(type + '-threshold').value;
    $(type + '-value').textContent = value + '%';
}

export function saveSettings(section) {
    alert(`Paramètres ${section} sauvegardés avec succès!`);
}

function showUserModal()   { alert('Formulaire d\'ajout utilisateur - à implémenter'); }
function showZoneModal()   { alert('Formulaire d\'ajout zone - à implémenter'); }
function showSensorModal() { alert('Formulaire d\'ajout capteur - à implémenter'); }

function editUser(id) {
    const user = users.find(u => u.id === id);
    alert(`Édition utilisateur: ${user.name}`);
}

function deleteUser(id) {
    if (confirm('Supprimer cet utilisateur?')) {
        users = users.filter(u => u.id !== id);
        renderUsersList();
    }
}

function editZone(id) {
    const zone = zones.find(z => z.id === id);
    alert(`Édition zone: ${zone.name}`);
}

function deleteZone(id) {
    if (confirm('Supprimer cette zone?')) {
        zones = zones.filter(z => z.id !== id);
        renderZonesList();
    }
}

function editSensor(id) {
    const sensor = sensors.find(s => s.id === id);
    alert(`Édition capteur: ${sensor.name}`);
}

function deleteSensor(id) {
    if (confirm('Supprimer ce capteur?')) {
        sensors = sensors.filter(s => s.id !== id);
        renderSensorsList();
    }
}

// Exposer globalement
window.showSettings = showSettings;
window.updateThreshold = updateThreshold;
window.saveSettings = saveSettings;
window.showUserModal = showUserModal;
window.showZoneModal = showZoneModal;
window.showSensorModal = showSensorModal;
