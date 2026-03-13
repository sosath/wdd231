const courses = [
    { subject: 'CSE', number: 110, title: 'Intro to Programming', credits: 2, completed: true },
    { subject: 'WDD', number: 130, title: 'Web Fundamentals', credits: 2, completed: true },
    { subject: 'CSE', number: 111, title: 'Programming with Functions', credits: 2, completed: true },
    { subject: 'WDD', number: 131, title: 'Dynamic Web Fundamentals', credits: 2, completed: true },
    { subject: 'CSE', number: 210, title: 'Programming with Classes', credits: 2, completed: true },
    { subject: 'WDD', number: 231, title: 'Web Frontend Development II', credits: 2, completed: false }
];

const container = document.querySelector("#course-container");
const creditDisplay = document.querySelector("#total-credits");

function displayCourses(filteredCourses) {
    container.innerHTML = "";
    filteredCourses.forEach(course => {
        const div = document.createElement("div");
        div.classList.add("course-card");
        if (course.completed) div.classList.add("completed");

        div.innerHTML = `<h3>${course.subject} ${course.number}</h3>`;
        container.appendChild(div);
    });

    const total = filteredCourses.reduce((sum, course) => sum + course.credits, 0);
    creditDisplay.textContent = total;
}

document.querySelector("#all-btn").addEventListener("click", () => displayCourses(courses));
document.querySelector("#cse-btn").addEventListener("click", () => displayCourses(courses.filter(c => c.subject === 'CSE')));
document.querySelector("#wdd-btn").addEventListener("click", () => displayCourses(courses.filter(c => c.subject === 'WDD')));

displayCourses(courses);