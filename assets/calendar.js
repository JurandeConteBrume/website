const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

let currentDate = new Date();
let eventsList = [];

async function loadEvents() {
    try {
        console.log('📅 Chargement des événements...');
        const response = await fetch('./assets/events.txt');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('📄 Fichier chargé, contenu:', text.substring(0, 100) + '...');
        
        eventsList = parseEvents(text);
        console.log('✅ Événements parsés:', eventsList.length, 'événements trouvés');
        console.log('📋 Premier événement:', eventsList[0]);
        
        return eventsList;
    } catch (error) {
        console.error('❌ Erreur chargement événements:', error);
        eventsList = [];
        return [];
    }
}

function parseEvents(text) {
    const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
    
    console.log('📝 Lignes trouvées:', lines);
    
    const events = lines.map((line, index) => {
        const parts = line.split('|').map(part => part.trim());
        
        if (parts.length < 4) {
            console.warn(`⚠️ Ligne ${index + 1} ignorée (format incorrect):`, line);
            return null;
        }
        
        return {
            date: parts[0],
            heure: parts[1],
            titre: parts[2],
            type: parts[3]
        };
    }).filter(event => event !== null);
    
    return events;
}

function getEventsForDay(year, month, day) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = eventsList.filter(event => event.date === dateKey);
    
    if (dayEvents.length > 0) {
        console.log(`📅 ${dateKey}: ${dayEvents.length} événement(s)`, dayEvents);
    }
    
    return dayEvents;
}

function generateCalendar(year, month) {
    console.log(`🗓️ Génération calendrier: ${monthNames[month]} ${year}`);
    
    // Mise à jour du titre
    const monthElement = document.getElementById('currentMonth');
    if (monthElement) {
        monthElement.textContent = `${monthNames[month]} ${year}`;
    }
    
    // Calculs du calendrier
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Lundi = 0
    
    const calendarBody = document.getElementById('calendarBody');
    if (!calendarBody) {
        console.error('❌ Element #calendarBody non trouvé !');
        return;
    }
    
    calendarBody.innerHTML = '';
    
    let date = 1;
    let eventsDisplayed = 0;
    
    // Génération des semaines
    for (let week = 0; week < 6; week++) {
        const row = document.createElement('tr');
        
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('td');
            
            if (week === 0 && day < startingDayOfWeek) {
                // Jours du mois précédent (vides)
                cell.innerHTML = '';
            } else if (date > daysInMonth) {
                // Jours du mois suivant (vides)
                cell.innerHTML = '';
            } else {
                // Jours du mois actuel
                const daySpan = document.createElement('span');
                daySpan.textContent = date;
                cell.appendChild(daySpan);
                
                // Ajouter les événements
                const events = getEventsForDay(year, month, date);
                events.forEach(event => {
                    addEventToCell(cell, event);
                    eventsDisplayed++;
                });
                
                date++;
            }
            
            row.appendChild(cell);
        }
        
        calendarBody.appendChild(row);
        
        if (date > daysInMonth) break;
    }
    
    console.log(`✅ Calendrier généré: ${eventsDisplayed} événements affichés`);
}

function addEventToCell(cell, event) {
    const eventDiv = document.createElement('div');
    eventDiv.className = `event ${event.type}`;
    
    const textSpan = document.createElement('span');
    textSpan.className = 'evt';
    textSpan.textContent = event.heure ? `${event.heure} - ${event.titre}` : event.titre;
    
    eventDiv.appendChild(textSpan);
    cell.appendChild(eventDiv);
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initialisation du calendrier...');
    
    // Vérification des éléments DOM
    const monthElement = document.getElementById('currentMonth');
    const bodyElement = document.getElementById('calendarBody');
    
    if (!monthElement || !bodyElement) {
        console.error('❌ Éléments DOM manquants:', {
            currentMonth: !!monthElement,
            calendarBody: !!bodyElement
        });
        return;
    }
    
    // Chargement des événements et génération
    await loadEvents();
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
});
