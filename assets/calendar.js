const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

let currentDate = new Date();
let eventsList = [];

async function loadEvents() {
    try {
        const response = await fetch('./assets/events.txt');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        
        eventsList = parseEvents(text);
        
        return eventsList;
    } catch (error) {
        eventsList = [];
        return [];
    }
}

function parseEvents(text) {
    const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
    
    
    const events = lines.map((line, index) => {
        const parts = line.split('|').map(part => part.trim());
        
        if (parts.length < 4) {
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
  
    return dayEvents;
}

function generateCalendar(year, month) {

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
    

}

function addEventToCell(cell, event) {
    const eventDiv = document.createElement('div');
    eventDiv.className = `event ${event.type}`;
    
    // Ajouter l'icône selon le type d'événement
    const icon = document.createElement('img');
    icon.className = 'event-icon';
    
    switch(event.type) {
        case 'jeux':
            icon.src = 'images/icon-jeux-small.png';
            icon.alt = 'Jeux';
            break;
        case 'magic':
            icon.src = 'images/icon-magic-small.png';
            icon.alt = 'Magic';
            break;
        case 'jdr':
            icon.src = 'images/icon-jdr-small.png';
            icon.alt = 'JdR';
            break;
        case 'special':
            icon.src = 'images/icon-special-small.png';
            icon.alt = 'Spécial';
            break;
        default:
            icon.src = 'images/icon-default-small.png';
            icon.alt = 'Événement';
    }
    
    const textSpan = document.createElement('span');
    textSpan.className = 'evt';
    textSpan.textContent = event.heure ? `${event.heure} - ${event.titre}` : event.titre;
    
    // Ajouter l'icône et le texte à l'événement
    eventDiv.appendChild(icon);
    eventDiv.appendChild(textSpan);
    cell.appendChild(eventDiv);
}


function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    
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
