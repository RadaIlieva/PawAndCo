let bookings = {
  '2025-10-22': [9, 12, 15],
  '2025-10-23': [10, 13, 17]
};

const calendarContainer = document.querySelector('.calendar-container');
const calendar = document.getElementById('calendar');
const showCalendarBtn = document.getElementById('showCalendar');
const selectedHour = document.getElementById('selectedHour');
const prevWeekBtn = document.getElementById('prevWeek');
const nextWeekBtn = document.getElementById('nextWeek');

let selectedDate = '';
let selectedTime = '';
let weekStart = new Date();

// Показване/скриване на календара
showCalendarBtn.addEventListener('click', () => {
  calendarContainer.style.display =
    calendarContainer.style.display === 'grid' || calendarContainer.style.display === 'block'
      ? 'none'
      : 'block';
  if (calendarContainer.style.display === 'block') renderCalendar();
});

// Навигация по седмици
prevWeekBtn.addEventListener('click', () => {
  weekStart.setDate(weekStart.getDate() - 7);
  renderCalendar();
});

nextWeekBtn.addEventListener('click', () => {
  weekStart.setDate(weekStart.getDate() + 7);
  renderCalendar();
});

// Функция за рендериране на календара
function renderCalendar() {
  calendar.innerHTML = '';
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    week.push(d);
  }

  week.forEach(day => {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    dayDiv.innerHTML = `<h4>${day.toLocaleDateString('bg-BG', options)}</h4>`;

    for (let hour = 9; hour <= 18; hour++) {
      const hourDiv = document.createElement('div');
      hourDiv.classList.add('hour');
      hourDiv.textContent = `${hour}:00`;
      const dateStr = day.toISOString().split('T')[0];

      if (bookings[dateStr] && bookings[dateStr].includes(hour)) {
        hourDiv.classList.add('booked');
      } else {
        hourDiv.addEventListener('click', () => {
          selectedDate = dateStr;
          selectedTime = hour;
          selectedHour.textContent = `Избрахте ${selectedDate} в ${selectedTime}:00`;
        });
      }
      dayDiv.appendChild(hourDiv);
    }
    calendar.appendChild(dayDiv);
  });
}

// Обработка на формата
document.getElementById('bookingForm').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!selectedDate || !selectedTime) {
    alert('Моля, изберете ден и час!');
    return;
  }

  const owner = document.getElementById('ownerName').value;
  const dog = document.getElementById('dogName').value;
  const breed = document.getElementById('breed').value;
  const phone = document.getElementById('phone').value;

  if (!bookings[selectedDate]) bookings[selectedDate] = [];
  bookings[selectedDate].push(selectedTime);

  alert(`Резервацията е успешна!\n${owner}, ${dog}, ${breed}, ${phone}\nДата: ${selectedDate}, Час: ${selectedTime}:00`);

  selectedHour.textContent = '';
  this.reset();
  renderCalendar();
});
