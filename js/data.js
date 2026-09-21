/**
 * SISTEA - Données et constantes
 * Toutes les données simulées + configurations statiques
 */

export const PRIO = {
    critique: { col: 'var(--re)', bg: 'var(--rl)', cls: 'red', label: 'Critique' },
    elevee:   { col: 'var(--or)', bg: 'var(--ol)', cls: 'ora', label: 'Élevée' },
    moyenne:  { col: 'var(--te)', bg: 'var(--tl)', cls: 'tel', label: 'Moyenne' }
};

export const CAT = {
    defor:   { label: 'Déforestation', ic: '✂' },
    inond:   { label: 'Inondation',    ic: '≈' },
    secher:  { label: 'Sécheresse',    ic: '☀' },
    vegetat: { label: 'Stress hydrique', ic: '⚠' }
};

/**
 * Zones d’alerte - délimitations géographiques réalistes (Côte d’Ivoire).
 * Chaque zone couvre un bassin / massif / plaine et les localités associées
 * (pas uniquement un point isolé). Les polygones sont définis explicitement
 * pour coller au terrain ; `ll` reste le centroïde pour les marqueurs.
 *
 * superficie = surface réellement touchée par l’anomalie (ha)
 * poly       = contour de la zone de surveillance / impact (lat, lng)
 */
export const SITES = [
    {
        name: 'Forêt classée de Duékoué',
        cities: 'Duékoué, Bangolo, Guiglo',
        ll: [6.78, -7.28],
        cat: 'defor', prio: 'critique', superficie: 42, seuil: 78, conf: 91,
        date: '05/09/2026', detail: 'Couverture perdue', dval: '-18%',
        poly: [
            [6.92, -7.48], [6.95, -7.22], [6.88, -7.05], [6.72, -6.98],
            [6.58, -7.12], [6.55, -7.35], [6.62, -7.52], [6.78, -7.55]
        ]
    },
    {
        name: 'Bassin de la Sassandra - Soubré',
        cities: 'Soubré, Méagui, Buyo, Sassandra amont',
        ll: [5.82, -6.62],
        cat: 'inond', prio: 'critique', superficie: 210, seuil: 96, conf: 87,
        date: '08/09/2026', detail: "Niveau d'eau", dval: '+1.8 m',
        poly: [
            [6.05, -6.95], [6.12, -6.55], [6.00, -6.28], [5.78, -6.20],
            [5.55, -6.35], [5.48, -6.70], [5.60, -6.98], [5.85, -7.05]
        ]
    },
    {
        name: 'Plaine agricole de Katiola',
        cities: 'Katiola, Niakara, Tafiré',
        ll: [8.15, -5.12],
        cat: 'secher', prio: 'moyenne', superficie: 340, seuil: 52, conf: 79,
        date: '07/09/2026', detail: 'Déficit pluviométrique', dval: '-62%',
        poly: [
            [8.42, -5.45], [8.48, -4.95], [8.35, -4.75], [8.05, -4.72],
            [7.88, -4.95], [7.85, -5.30], [8.00, -5.50], [8.25, -5.52]
        ]
    },
    {
        name: 'Parcelles de Bouaké',
        cities: 'Bouaké, Brobo, Djébonoua',
        ll: [7.70, -5.03],
        cat: 'vegetat', prio: 'elevee', superficie: 58, seuil: 70, conf: 84,
        date: '06/09/2026', detail: 'Indice NDVI', dval: '-0.21',
        poly: [
            [7.88, -5.22], [7.92, -4.88], [7.80, -4.75], [7.58, -4.80],
            [7.50, -5.05], [7.55, -5.25], [7.70, -5.30]
        ]
    },
    {
        name: "Réserve de N'Zo - Taï",
        cities: "Taï, Buyo, zone N'Zo",
        ll: [5.95, -7.35],
        cat: 'defor', prio: 'moyenne', superficie: 19, seuil: 38, conf: 73,
        date: '04/09/2026', detail: 'Couverture perdue', dval: '-6%',
        poly: [
            [6.18, -7.55], [6.22, -7.15], [6.05, -6.95], [5.82, -7.05],
            [5.72, -7.35], [5.80, -7.60], [6.00, -7.65]
        ]
    },
    {
        name: 'Plaine de Tiébissou - Bandama',
        cities: 'Tiébissou, Toumodi, Yamoussoukro nord',
        ll: [7.15, -5.28],
        cat: 'inond', prio: 'elevee', superficie: 76, seuil: 64, conf: 88,
        date: '08/09/2026', detail: "Niveau d'eau", dval: '+0.9 m',
        poly: [
            [7.35, -5.55], [7.42, -5.15], [7.28, -4.95], [7.05, -4.98],
            [6.92, -5.20], [6.95, -5.48], [7.12, -5.60]
        ]
    },
    {
        name: 'Zone pastorale de Ferkessédougou',
        cities: 'Ferkessédougou, Ouangolodougou, Kong',
        ll: [9.55, -5.15],
        cat: 'secher', prio: 'critique', superficie: 512, seuil: 98, conf: 93,
        date: '03/09/2026', detail: 'Déficit pluviométrique', dval: '-81%',
        poly: [
            [9.95, -5.55], [10.02, -4.85], [9.75, -4.55], [9.35, -4.65],
            [9.15, -5.05], [9.22, -5.55], [9.55, -5.70], [9.85, -5.65]
        ]
    },
    // ── Zones supplémentaires : couverture élargie du territoire ──
    {
        name: 'Massif forestier de Man - Tonkpi',
        cities: 'Man, Danané, Biankouma, Sipilou',
        ll: [7.40, -7.55],
        cat: 'defor', prio: 'elevee', superficie: 95, seuil: 68, conf: 86,
        date: '06/09/2026', detail: 'Couverture perdue', dval: '-11%',
        poly: [
            [7.75, -7.85], [7.82, -7.35], [7.60, -7.10], [7.25, -7.15],
            [7.05, -7.45], [7.10, -7.80], [7.40, -7.95], [7.65, -7.90]
        ]
    },
    {
        name: 'Périphérie agricole de Korhogo',
        cities: 'Korhogo, Sinématiali, M’Bengué',
        ll: [9.42, -5.62],
        cat: 'secher', prio: 'elevee', superficie: 280, seuil: 71, conf: 82,
        date: '04/09/2026', detail: 'Déficit pluviométrique', dval: '-54%',
        poly: [
            [9.70, -5.95], [9.75, -5.35], [9.55, -5.15], [9.25, -5.25],
            [9.10, -5.55], [9.18, -5.90], [9.45, -6.00]
        ]
    },
    {
        name: 'Bassin côtier de San-Pédro',
        cities: 'San-Pédro, Sassandra, Grand-Béréby',
        ll: [4.78, -6.65],
        cat: 'inond', prio: 'moyenne', superficie: 125, seuil: 55, conf: 80,
        date: '07/09/2026', detail: "Niveau d'eau", dval: '+0.6 m',
        poly: [
            [5.05, -6.95], [5.10, -6.40], [4.95, -6.20], [4.65, -6.25],
            [4.50, -6.55], [4.55, -6.90], [4.80, -7.05]
        ]
    },
    {
        name: 'Zone cacaoyère de Daloa',
        cities: 'Daloa, Issia, Vavoua, Zoukougbeu',
        ll: [6.90, -6.45],
        cat: 'vegetat', prio: 'moyenne', superficie: 145, seuil: 48, conf: 77,
        date: '05/09/2026', detail: 'Indice NDVI', dval: '-0.14',
        poly: [
            [7.20, -6.80], [7.28, -6.20], [7.05, -5.95], [6.70, -6.05],
            [6.55, -6.40], [6.65, -6.75], [6.95, -6.85]
        ]
    },
    {
        name: 'Corridor Est - Abengourou / Bondoukou',
        cities: 'Abengourou, Agnibilékrou, Bondoukou, Tanda',
        ll: [7.20, -3.50],
        cat: 'vegetat', prio: 'elevee', superficie: 88, seuil: 63, conf: 81,
        date: '06/09/2026', detail: 'Indice NDVI', dval: '-0.18',
        poly: [
            [7.85, -3.95], [7.90, -3.15], [7.45, -2.85], [6.85, -3.00],
            [6.65, -3.45], [6.80, -3.90], [7.25, -4.05], [7.65, -4.00]
        ]
    },
];

export const SENSORS = [
    { label: 'Humidité du sol - Duékoué',   val: 38, unit: '%',  pct: 38 },
    { label: 'Température - Soubré',        val: 29, unit: '°C', pct: 58 },
    { label: 'Pluviométrie 24h - Katiola',  val: 2,  unit: 'mm', pct: 8  },
    { label: "Niveau d'eau - Sassandra",    val: 1.8, unit: 'm', pct: 72 },
];

export const DRONES = [
    { name: 'DE12-1', status: 'mission', label: 'En mission',  zone: 'Bassin de la Sassandra · autonomie 71%', col: 'var(--te)' },
    { name: 'DE12-2', status: 'charge',  label: 'En charge',   zone: 'Base - zone pilote · 34%',               col: 'var(--or)' },
    { name: 'DE12-3', status: 'dispo',   label: 'Disponible',  zone: 'Base - zone pilote · 100%',              col: 'var(--gr)' },
];

/**
 * Couches satellitaires simulées.
 * Même imagerie de base (Esri World Imagery) pour toutes les couches :
 * la géographie reste cohérente, seuls les traitements "spectraux" changent.
 * Les filtres CSS simulent l’apparence d’indices (NDVI / SWIR / thermique)
 * en attendant l’intégration de vraies tuiles Sentinel / Landsat.
 */
export const LAYERS = {
    rgb: {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        subdomains: '',
        filter: 'contrast(1.15) brightness(1.05) saturate(1.2)',
        name: 'RGB',
        sub: 'Imagerie optique · fond cartographique OSM',
        grad: ['#1a1a1a', '#4a5568', '#a0aec0', '#e2e8f0', '#ffffff'],
        minLabel: 'Ombre',
        maxLabel: 'Clair',
        legend: 'Composition naturelle (Red-Green-Blue) - observation visuelle du terrain'
    },
    ndvi: {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        subdomains: '',
        filter: 'hue-rotate(72deg) saturate(2.1) contrast(1.45) brightness(1.05)',
        name: 'NDVI',
        sub: 'Indice de végétation normalisé · bande rouge / NIR',
        grad: ['#8B4513', '#CD853F', '#F0E68C', '#9ACD32', '#006400'],
        minLabel: 'Sol nu',
        maxLabel: 'Dense',
        legend: 'Marron = sol exposé · Jaune = faible couverture · Vert foncé = végétation dense'
    },
    swir: {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        subdomains: '',
        filter: 'hue-rotate(195deg) saturate(2.4) contrast(1.5) brightness(0.92)',
        name: 'SWIR',
        sub: 'Infrarouge ondes courtes · humidité & sols',
        grad: ['#0a0a6e', '#1e90ff', '#00ced1', '#ffd700', '#ff4500'],
        minLabel: 'Humide',
        maxLabel: 'Sec',
        legend: 'Bleu = eau / humidité · Cyan = sols humides · Jaune-Rouge = stress hydrique'
    },
    therm: {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        subdomains: '',
        filter: 'sepia(0.3) hue-rotate(310deg) saturate(2) brightness(0.98) contrast(1.2)',
        name: 'THERM',
        sub: 'Infrarouge thermique (8-14µm)',
        grad: ['#000033', '#0033aa', '#ff00ff', '#ff6600', '#ffff00'],
        minLabel: 'Froid',
        maxLabel: 'Chaud',
        legend: 'Bleu = zones froides, Rose = modéré, Orange/Jaune = chaud'
    }
};

export const CMD_FLOW = [
    'Sélection de la zone géographique',
    'Récupération des données satellitaires',
    'Comparaison avec l\'historique',
    'Détection IA des anomalies',
    'Survol drone & capteurs terrestres',
    'Carte, alerte et rapport générés'
];

export const DRONE_SPECS = [
    ['Configuration', 'Voilure fixe, longue portée / longue endurance'],
    ['Envergure', '≈ 20 m'],
    ['Longueur fuselage', '≈ 11 m'],
    ['Empennage', 'En V'],
    ['Propulsion', 'Moteur arrière, hélice poussante'],
    ["Train d'atterrissage", 'Rétractable'],
    ['Liaison', 'Antenne satellite (dôme avant)'],
    ['Nacelles', 'Haute résolution / multispectrale / thermique'],
    ['Capacité de couverture', '1 000 ha/h (≈ 10 km²/h)']
];

export const PAYLOADS = [
    { key: 'hd',    label: 'Haute résolution', desc: 'Imagerie fine pour la cartographie détaillée de la zone.' },
    { key: 'multi', label: 'Multispectrale',   desc: "Évalue l'état de la végétation et le stress hydrique des cultures." },
    { key: 'therm', label: 'Thermique',        desc: "Détecte les écarts de température des sols, plantes et points d'eau." }
];

export const REPORTS = [
    {
        id: 1,
        name: 'Rapport mensuel - Septembre 2026',
        status: 'published',
        date: '30/09/2026',
        zone: 'defor',
        type: 'Périodique',
        sites: 7,
        size: '2.4 MB',
        objective: 'Suivi mensuel de la déforestation et des zones à risque dans les massifs forestiers.',
        summary: 'Le mois de septembre montre une hausse de 12 % des surfaces déboisées comparé au mois précédent, avec un renforcement des activités illicites dans les corridors forestiers.',
        kpis: { surface: '184 ha', progression: '+12%', confiance: '92%', intervention: '3 missions planifiées' },
        highlights: [
            'Accroissement principal observé autour de Duékoué et de la réserve de N’Zo.',
            '96 % des zones détectées correspondent à des cibles de déforestation active.',
            'Le niveau d’alerte critique reste soutenu sur 2 sites prioritaires.'
        ],
        recommendations: [
            'Renforcer la surveillance aérienne sur les 3 corridors forestiers les plus exposés.',
            'Valider les zones détectées avec les services de terrain dans les 72 h.',
            'Mettre à jour le plan d’intervention et les mesures de protection locale.'
        ]
    },
    {
        id: 2,
        name: 'Surveillance bassin Sassandra',
        status: 'published',
        date: '29/09/2026',
        zone: 'inond',
        type: 'Spécial',
        sites: 2,
        size: '1.8 MB',
        objective: 'Évaluation des risques d’inondation sur le bassin versant de la Sassandra.',
        summary: 'Les niveaux d’eau demeurent élevés après la pluies des dernières 72 heures, avec un risque de submersion sur les zones basses et les cultures riveraines.',
        kpis: { surface: '210 ha', progression: '+1,8 m', confiance: '87%', intervention: '2 campagnes de terrain' },
        highlights: [
            'Le niveau d’eau a dépassé le seuil historique local sur la zone de Soubré.',
            'Les villages de la plaine montrent une vulnérabilité modérée à élevée.',
            'Les cartes d’humidité du sol confirment une saturation du bassin.'
        ],
        recommendations: [
            'Mettre en place une alerte locale sur les zones de faible altitude.',
            'Préparer les équipes de secours pour les zones à forte vulnérabilité.',
            'Contrôler les barrages et les cours d’eau secondaires avant la prochaine pluie.'
        ]
    },
    {
        id: 3,
        name: 'État des cultures - Katiola',
        status: 'draft',
        date: '28/09/2026',
        zone: 'vegetat',
        type: 'Sectoriel',
        sites: 1,
        size: '890 KB',
        objective: 'Analyse de l’état hydrique des cultures et des parcelles agricoles de la zone de Katiola.',
        summary: 'Le stress hydrique des cultures reste élevé en raison d’un déficit pluviométrique persistant sur la zone étudiée.',
        kpis: { surface: '340 ha', progression: '-62%', confiance: '79%', intervention: '1 mission d’actualité' },
        highlights: [
            'La couverture végétale est réduite de 21 % sur les zones les plus exposées.',
            'Les champs de maïs et de coton présentent un stress hydrique accru.',
            'Le niveau de précipitations est en dessous des seuils attendus pour cette période.'
        ],
        recommendations: [
            'Orienter les services agricoles vers les parcelles les plus touchées.',
            'Mettre en place des zones de vigilance et des alertes agronomiques.',
            'Évaluer la possibilité de soutien hydrique et de semences de culture de résilience.'
        ]
    },
    {
        id: 4,
        name: 'Rapport hebdomadaire #39',
        status: 'published',
        date: '25/09/2026',
        zone: 'secher',
        type: 'Périodique',
        sites: 4,
        size: '3.1 MB',
        objective: 'Bilan hebdomadaire des sécheresses et zones de stress climatique dans le territoire pilote.',
        summary: 'La sécheresse s’étend progressivement vers le nord du pays, avec un accent sur les zones pastorales et agricoles déjà vulnérables.',
        kpis: { surface: '512 ha', progression: '-81%', confiance: '93%', intervention: '4 plans de suivi actifs' },
        highlights: [
            'Les zones pastorales sont les plus touchées par la diminution du couvert végétal.',
            'Le seuil critique est dépassé sur 4 localités identifiées.',
            'L’évolution montre une aggravation continue sur 3 semaines.'
        ],
        recommendations: [
            'Poursuivre le suivi des parcours et des points d’eau.',
            'Mettre en place une stratégie d’assistance aux communautés rurales concernées.',
            'Diffuser les alertes aux partenaires humanitaires et agricoles.'
        ]
    },
    {
        id: 5,
        name: 'Synthèse Août 2026',
        status: 'archived',
        date: '31/08/2026',
        zone: 'defor',
        type: 'Périodique',
        sites: 7,
        size: '2.7 MB',
        objective: 'Synthèse mensuelle des évolutions environnementales et de la surveillance multi-sites.',
        summary: 'La synthèse juillet-août révèle une légère baisse des alertes sur les zones forestières, mais un risque persistant sur les secteurs de faible couverture végétale.',
        kpis: { surface: '176 ha', progression: '-9%', confiance: '88%', intervention: '5 missions complétées' },
        highlights: [
            'Les interventions de terrain ont réduit le nombre d’alertes critiques.',
            'Le suivi par satellite reste stable et fiable sur les 7 sites surveillés.',
            'Les zones urbaines périphériques restent les plus actives en termes de pression environnementale.'
        ],
        recommendations: [
            'Maintenir la veille sur les zones forestières à forte pression.',
            'Contrôler les activités d’exploitation dans les périphéries urbaines.',
            'Préparer la synthèse du prochain trimestre sur la base des données de septembre.'
        ]
    },
    {
        id: 6,
        name: 'Alerte déforestation Duékoué',
        status: 'published',
        date: '05/09/2026',
        zone: 'defor',
        type: 'Alerte',
        sites: 1,
        size: '1.2 MB',
        objective: 'Évaluation rapide d’une alerte de déforestation sur une zone prioritaire à forte sensibilité écologique.',
        summary: 'L’alerte détectée près de Duékoué correspond à une perte de couverture forestière quasi continue sur plusieurs jours, avec forte probabilité d’activité humaine.',
        kpis: { surface: '42 ha', progression: '+18%', confiance: '91%', intervention: '1 équipe mobilisée' },
        highlights: [
            'La zone concernée montre une dégradation immédiate du couvert arboré.',
            'La structure de la végétation suggère une coupe récente sans reconstitution.',
            'Le niveau de confiance de l’IA sur cette alerte dépasse le seuil d’intervention.'
        ],
        recommendations: [
            'Déclencher un contrôle de terrain dès que possible.',
            'Vérifier les autorisations d’exploitation sur les parcelles adjacentes.',
            'Publier une note de vigilance pour les autorités de gestion forestière.'
        ]
    }
];

export const AUTO_REPORTS = [
    { id: 1, name: 'Rapport mensuel',     schedule: 'Dernier jour du mois',       enabled: true  },
    { id: 2, name: 'Rapport hebdomadaire', schedule: 'Chaque lundi 08:00 UTC',    enabled: true  },
    { id: 3, name: 'Alertes critiques',   schedule: 'En temps réel',              enabled: true  },
    { id: 4, name: 'Synthèse IA',         schedule: '1er jour du mois',           enabled: false },
    { id: 5, name: 'Bilan semestriel',    schedule: '1er jour du trimestre',      enabled: true  },
];

export const USERS = [
    { id: 1, name: 'Admin Principal', email: 'admin@sistea.ci',   role: 'Administrateur', status: 'Actif' },
    { id: 2, name: 'Opérateur 1',     email: 'op1@sistea.ci',     role: 'Opérateur',      status: 'Actif' },
    { id: 3, name: 'Analyste SIG',    email: 'analyst@sistea.ci', role: 'Analyste',       status: 'Actif' },
];

export const ZONES_SURV = [
    { id: 1, name: 'Forêt classée de Duékoué', area: 42000,  status: 'Actif' },
    { id: 2, name: 'Bassin de la Sassandra',   area: 210000, status: 'Actif' },
    { id: 3, name: 'Plaine agricole de Katiola', area: 340000, status: 'Actif' },
];

export const SENSORS_CONF = [
    { id: 1, name: 'Capteur humidité #1',   location: 'Duékoué', type: 'Hygrométrique',  status: 'En ligne' },
    { id: 2, name: 'Capteur température #2', location: 'Soubré',  type: 'Thermométrique', status: 'En ligne' },
    { id: 3, name: 'Pluviomètre #3',        location: 'Katiola', type: 'Pluviométrique', status: 'En ligne' },
];
