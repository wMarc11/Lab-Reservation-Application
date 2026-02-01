
// a form asking which labs/rooms they want to reserve
// it will go 
// > which building
// > which floor
// > which room/lab

// looking at the slot availability
// > slot object has availability and a unique slot no that identifies where it is
// > reservation has a slot id attached to it and contains other details like who reserved it etc

const info_container = document.querySelector('.information-section');
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