/**
 * SISTEA — Utilitaires
 */

import { PRIO } from './data.js';

export function priorityCol(p) {
    return p === 'critique' ? '#ef4444' : p === 'elevee' ? '#f97316' : '#06b6d4';
}

export function priorityBg(p) {
    return p === 'critique' ? '#fee2e2' : p === 'elevee' ? '#fff7ed' : '#ecfeff';
}

export function priorityCls(p) {
    return p === 'critique' ? 'red' : p === 'elevee' ? 'ora' : 'tel';
}

export function formatTime(date = new Date()) {
    return String(date.getHours()).padStart(2, '0') + ':' +
           String(date.getMinutes()).padStart(2, '0') + ':' +
           String(date.getSeconds()).padStart(2, '0');
}

export function slugify(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export function $(id) {
    return document.getElementById(id);
}

export function $$(selector) {
    return document.querySelectorAll(selector);
}
