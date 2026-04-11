import { attractions } from '../data/discover.mjs';

// --- Visitor Tracking with localStorage ---
function handleVisitorMessage() {
    const messageContainer = document.getElementById('visit-message');
    const lastVisitTime = localStorage.getItem('lastVisit');
    const currentDate = Date.now();

    if (!lastVisitTime) {
        // First visit
        messageContainer.innerHTML = '<p class="visit-info welcome">Welcome! Let us know if you have any questions.</p>';
    } else {
        const lastDate = parseInt(lastVisitTime);
        const timeDifference = currentDate - lastDate;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        if (daysDifference === 0) {
            // Less than a day
            messageContainer.innerHTML = '<p class="visit-info recent">Back so soon! Awesome!</p>';
        } else {
            // More than a day
            const dayText = daysDifference === 1 ? 'day' : 'days';
            messageContainer.innerHTML = `<p class="visit-info">You last visited ${daysDifference} ${dayText} ago.</p>`;
        }
    }

    // Update localStorage with current visit
    localStorage.setItem('lastVisit', currentDate.toString());
}

// --- Display Attractions ---
function displayAttractions() {
    const container = document.getElementById('attractions-container');
    container.innerHTML = '';

    // Create grid areas dynamically
    let gridTemplate = 'grid-template-areas: ';
    const rows = Math.ceil(attractions.length / 4);

    attractions.forEach((attraction, index) => {
        const card = document.createElement('article');
        card.className = 'attraction-card';
        card.setAttribute('data-area', `item${index + 1}`);

        card.innerHTML = `
            <h2>${attraction.name}</h2>
            <figure>
                <img src="${attraction.image}" alt="${attraction.name}" width="300" height="200" loading="lazy">
            </figure>
            <address>${attraction.address}</address>
            <p>${attraction.description}</p>
            <button class="learn-more-btn" aria-label="Learn more about ${attraction.name}">Learn More</button>
        `;

        container.appendChild(card);
    });
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    handleVisitorMessage();
    displayAttractions();

    // Handle dark mode toggle
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        });
    }

    // Handle mobile menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
        });
    }

    // Set current year and last modified date in footer
    const currentYear = new Date().getFullYear();
    const lastModified = document.lastModified;

    const currentYearSpan = document.getElementById('currentyear');
    const lastModifiedSpan = document.getElementById('lastModified');

    if (currentYearSpan) {
        currentYearSpan.textContent = currentYear;
    }

    if (lastModifiedSpan) {
        lastModifiedSpan.textContent = lastModified;
    }
});
