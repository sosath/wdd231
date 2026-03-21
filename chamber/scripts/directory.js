document.getElementById('currentyear').textContent = new Date().getFullYear();
document.getElementById('lastModified').textContent = document.lastModified;

const menuBtn = document.getElementById('menu-btn');
const mobileNav = document.getElementById('mobile-nav');

menuBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    menuBtn.textContent = mobileNav.classList.contains('open') ? '✖' : '☰';
});

const darkModeBtn = document.getElementById('dark-mode-btn');
darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

const url = 'data/members.json';
const directoryContainer = document.getElementById('directory-container');

async function getMembersData() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMembers(data);
    } catch (error) {
        console.error('Error fetching member data:', error);
    }
}

const displayMembers = (members) => {
    directoryContainer.innerHTML = '';

    members.forEach((member) => {
        let card = document.createElement('section');
        card.classList.add('member-card');

        card.innerHTML = `
            <div class="card-header">
                <h3>${member.name}</h3>
                <p class="tagline">${member.info}</p>
            </div>
            <div class="card-body">
                <div class="card-img-container">
                    <img src="${member.image}" alt="Logo of ${member.name}" loading="lazy" width="100" height="100">
                </div>
                <div class="card-info">
                    <p><strong>ADDRESS:</strong> ${member.address}</p>
                    <p><strong>EMAIL:</strong> <a href="mailto:${member.email}">${member.email}</a></p>
                    <p><strong>PHONE:</strong> ${member.phone}</p>
                    <p><strong>URL:</strong> <a href="${member.website}" target="_blank">${member.website.replace('https://', '')}</a></p>
                </div>
            </div>
        `;

        directoryContainer.appendChild(card);
    });
};

const gridBtn = document.getElementById('grid-btn');
const listBtn = document.getElementById('list-btn');

gridBtn.addEventListener('click', () => {
    directoryContainer.classList.add('grid');
    directoryContainer.classList.remove('list');
});

listBtn.addEventListener('click', () => {
    directoryContainer.classList.add('list');
    directoryContainer.classList.remove('grid');
});

getMembersData();