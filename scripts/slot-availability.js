
const info_container = document.querySelector('.availability-section');
const heading = info_container.querySelector('h1');

const today = new Date();
const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
};

const formattedDate = today.toLocaleDateString('en-US', options);
heading.innerText = formattedDate;