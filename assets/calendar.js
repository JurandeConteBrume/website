const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

let currentDate = new Date();
let eventsList = [];

// Configuration des chemins
const EVENTS_FILE = 'assets/events.txt';
const ICONS_PATH = 'assets/';

// Charge le fichier texte
async function loadEvents() {
    try {
        console.log('Chargement des événements depuis:', EVENTS_FILE);
        const response = await fetch(EVENTS_FILE);
        
        if (!response.ok) {
            console.error('Erreur chargement events.txt:', response.status);
            eventsList = []; // Valeurs par défaut vides
            return;
        }
        
        const text = await response.text();
        console.log('Contenu du fichier events.txt:', text);
        eventsList = parseEvents(text);
        console.log('Événements parsés:', eventsList);
    } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
        eventsList = [];
    }
}

function parseEvents(text) {
    return text.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
            const parts = line.split('|').map(part => part.trim());
            if (parts.length >= 4) {
                return {
                    date: parts[0],
                    heure: parts[1],
                    titre: parts[2],
                    type: parts[3]
                };
            }
            return null;
        })
        .filter(event => event !== null);
}

function getEventsForDay(year, month, day) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventsList.filter(event => event.date === dateKey);
}

function generateCalendar(year, month) {
    console.log('Génération du calendrier pour:', monthNames[month], year);
    
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Lundi = 0
    
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';
    
    let date = 1;
    let nextMonthDate = 1;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    // Générer les semaines
    for (let week = 0; week < 6; week++) {
        const row = document.createElement('tr');
        
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('td');
            let cellDate;
            let isCurrentMonth = true;
            let cellYear = year;
            let cellMonth = month;
            
            if (week === 0 && day < startingDayOfWeek) {
                // Jours du mois précédent
                cellDate = daysInPrevMonth - startingDayOfWeek + day + 1;
                isCurrentMonth = false;
                cellYear = prevYear;
                cellMonth = prevMonth;
                cell.style.opacity = '0.3';
            } else if (date > daysInMonth) {
                // Jours du mois suivant
                cellDate = nextMonthDate++;
                isCurrentMonth = false;
                cellYear = month === 11 ? year + 1 : year;
                cellMonth = month === 11 ? 0 : month + 1;
                cell.style.opacity = '0.3';
            } else {
                // Jours du mois actuel
                cellDate = date++;
            }
            
            const daySpan = document.createElement('span');
            daySpan.textContent = cellDate;
            cell.appendChild(daySpan);
            
            // Ajouter les événements pour le mois actuel uniquement
            if (isCurrentMonth) {
                const events = getEventsForDay(cellYear, cellMonth, cellDate);
                events.forEach(event => {
                    addEventToCell(cell, event);
                });
            }
            
            row.appendChild(cell);
        }
        
        calendarBody.appendChild(row);
        
        // Arrêter si on a affiché tous les jours du mois
        if (date > daysInMonth) break;
    }
    
    console.log('Calendrier généré avec', calendarBody.children.length, 'lignes');
}

function addEventToCell(cell, event) {
    const eventDiv = document.createElement('div');
    eventDiv.className = `event ${event.type}`;
    
    // Ajouter l'icône selon le type
    const iconSrc = getIconForType(event.type);
    if (iconSrc) {
        const icon = document.createElement('img');
        icon.src = iconSrc;
        icon.alt = event.type;
        icon.style.height = '16px';
        eventDiv.appendChild(icon);
    }
    
    const textSpan = document.createElement('span');
    textSpan.className = 'evt';
    textSpan.textContent = event.heure ? `${event.heure} - ${event.titre}` : event.titre;
    
    eventDiv.appendChild(textSpan);
    cell.appendChild(eventDiv);
}

function getIconForType(type) {
    const icons = {
        jeux: ICONS_PATH + 'icon-jeux-small.png',
        magic: ICONS_PATH + 'icon-magic-small.png',
        jdr: ICONS_PATH + 'icon-jdr-small.png',
        special: ICONS_PATH + 'icon-special-small.png'
    };
    return icons[type] || '';
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM chargé, initialisation du calendrier...');
    await loadEvents();
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});
