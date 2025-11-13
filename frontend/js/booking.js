const API_BASE_URL = window.location.origin;
const API_URL = `${API_BASE_URL}/api/bookings`;

let bookings = {};
let selectedDate = "";
let selectedTime = "";
let weekStart = new Date();

const calendarContainer = document.querySelector('.calendar-container');
const calendar = document.getElementById('calendar');
const showCalendarBtn = document.getElementById('showCalendar');
const selectedHour = document.getElementById('selectedHour');
const prevWeekBtn = document.getElementById('prevWeek');
const nextWeekBtn = document.getElementById('nextWeek');

// Показване/скриване на календара
showCalendarBtn.addEventListener('click', () => {
  calendarContainer.style.display =
    calendarContainer.style.display === 'block' ? 'none' : 'block';
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

// Зареждане на резервации
async function loadBookings() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    bookings = {};

    // Запазваме цялата резервация за по-добра проверка
    data.forEach(b => {
      if (!bookings[b.date]) bookings[b.date] = [];
      bookings[b.date].push(b); 
    });

    renderCalendar();
  } catch (err) {
    console.error("❌ Грешка при зареждане на резервации:", err);
  }
}

// Рендериране на календара
function renderCalendar() {
  calendar.innerHTML = "";
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

    for (let hour = 9; hour <= 18; hour += 2) {
      const hourDiv = document.createElement('div');
      hourDiv.classList.add('hour');
      hourDiv.textContent = `${hour}:00`;

      const dateStr = day.toISOString().split('T')[0];
      const bookingsForDay = bookings[dateStr] || [];

      // Проверка дали часът е зает
      const booked = bookingsForDay.find(b => {
        const bookedHour = typeof b.hour === "number" ? b.hour : parseInt(b.hour);
        return bookedHour === hour;
      });

      if (booked) {
        hourDiv.classList.add('booked'); // червен фон
        hourDiv.textContent = `${hour}:00 (заето)`;
        // Опционално tooltip с име на собственик и куче
        hourDiv.title = `${booked.ownerName} - ${booked.dogName}`;
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

// Изпращане на резервация
document.getElementById('bookingForm').addEventListener('submit', async e => {
  e.preventDefault();

  if (!selectedDate || !selectedTime) {
    alert("Моля, изберете ден и час!");
    return;
  }

  const bookingData = {
    ownerName: document.getElementById('ownerName').value,
    dogName: document.getElementById('dogName').value,
    breed: document.getElementById('breed').value,
    phone: document.getElementById('phone').value,
    date: selectedDate,
    hour: selectedTime
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    });

    const result = await res.json();
    if (!res.ok) {
      alert(result.message || "⚠️ Грешка при създаване на резервация");
      return;
    }

    alert("✅ Резервацията е успешна!");
    e.target.reset();
    selectedHour.textContent = '';
    await loadBookings();
  } catch (err) {
    console.error("❌ Грешка при запис:", err);
    alert("⚠️ Проблем със свързването към сървъра!");
  }
});

// Добавяме CSS за червени заети часове
const style = document.createElement('style');
style.innerHTML = `
  .hour.booked {
    background-color: #f8d7da;
    color: #721c24;
    cursor: not-allowed;
    font-weight: bold;
    border: 1px solid #f5c2c7;
    border-radius: 6px;
    text-align: center;
    transition: transform 0.2s;
  }
  .hour.booked:hover {
    transform: none;
  }
`;
document.head.appendChild(style);

loadBookings();
