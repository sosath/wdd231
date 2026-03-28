// --- OpenWeatherMap API Logic ---
const apiKey = '30a9dfddb2c492bf530731c99f1eb415';
const lat = -17.7833; // Santa Cruz de la Sierra latitude
const lon = -63.1821; // Santa Cruz de la Sierra longitude

const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

async function fetchWeather() {
    try {
        // Fetch current weather
        const weatherResponse = await fetch(weatherUrl);
        if (weatherResponse.ok) {
            const weatherData = await weatherResponse.json();
            displayCurrentWeather(weatherData);
        } else {
            throw Error(await weatherResponse.text());
        }

        // Fetch 3-day forecast
        const forecastResponse = await fetch(forecastUrl);
        if (forecastResponse.ok) {
            const forecastData = await forecastResponse.json();
            displayForecast(forecastData);
        } else {
            throw Error(await forecastResponse.text());
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function displayCurrentWeather(data) {
    const weatherContainer = document.getElementById('current-weather');
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Capitalize each word in description
    const formattedDesc = description.replace(/\b\w/g, c => c.toUpperCase());

    weatherContainer.innerHTML = `
        <img src="${iconUrl}" alt="${formattedDesc} icon" width="50" height="50">
        <strong>${temp}&deg;C</strong> - ${formattedDesc}
    `;
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('weather-forecast');
    forecastContainer.innerHTML = ''; // Clear previous data

    // The API returns data every 3 hours. We filter to grab data for around 12:00 PM each day.
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    // Display the next 3 days
    for (let i = 0; i < 3; i++) {
        if (dailyForecasts[i]) {
            const date = new Date(dailyForecasts[i].dt_txt);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const temp = Math.round(dailyForecasts[i].main.temp);
            const iconCode = dailyForecasts[i].weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

            forecastContainer.innerHTML += `
                <div>
                    <p><strong>${dayName}</strong></p>
                    <img src="${iconUrl}" alt="Forecast icon" width="40" height="40">
                    <p>${temp}&deg;C</p>
                </div>
            `;
        }
    }
}

// --- Member Spotlights Logic ---
const membersUrl = 'data/members.json'; // Ensure this matches your JSON path

async function fetchSpotlights() {
    try {
        const response = await fetch(membersUrl);
        if (response.ok) {
            const membersData = await response.json();
            displaySpotlights(membersData);
        } else {
            throw Error(await response.text());
        }
    } catch (error) {
        console.error('Error fetching member data:', error);
    }
}

function displaySpotlights(members) {
    const container = document.getElementById('spotlights-container');
    container.innerHTML = '';

    // Filter for Gold and Silver members only
    const qualifiedMembers = members.filter(member =>
        member.membershipLevel === 3 || member.membershipLevel === 2
    );

    // Shuffle array to randomize selection
    for (let i = qualifiedMembers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qualifiedMembers[i], qualifiedMembers[j]] = [qualifiedMembers[j], qualifiedMembers[i]];
    }

    // Pick 2 to 3 members (let's set it to 3 for a full display)
    const selectedMembers = qualifiedMembers.slice(0, 3);

    selectedMembers.forEach(member => {
        const card = document.createElement('div');
        card.classList.add('member-card', 'card');

        let levelName = "";
        if (member.membershipLevel === 3) {
            levelName = "Gold";
        } else if (member.membershipLevel === 2) {
            levelName = "Silver";
        }

        card.innerHTML = `
            <div class="card-header">
                <h3>${member.name}</h3>
                <span class="tagline">${levelName} Member</span>
            </div>
            <div class="card-body">
                <div class="card-img-container">
                    <img src="${member.image}" alt="${member.name} Logo" loading="lazy">
                </div>
                <div class="card-info">
                    <p><strong>Phone:</strong> ${member.phone}</p>
                    <p><strong>Address:</strong> ${member.address}</p>
                    <a href="${member.website}" target="_blank" rel="noopener noreferrer">Visit Website</a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Initialize functions
fetchWeather();
fetchSpotlights();