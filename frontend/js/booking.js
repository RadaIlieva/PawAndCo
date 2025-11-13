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

    data.forEach(b => {
      if (!bookings[b.date]) bookings[b.date] = [];
      bookings[b.date].push(b.hour);
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

    // ✅ Проверяваме дали часът е зает
    if (
      bookings[dateStr] && (
        bookings[dateStr].includes(hour) ||
        bookings[dateStr].includes(`${hour}:00`) ||
        bookings[dateStr].includes(`${hour}`)
      )
    ) {
      hourDiv.classList.add('booked');
      hourDiv.textContent = `${hour}:00 (заето)`;
    } 
    // ✅ Ако часът е свободен — можем да го изберем
    else {
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

  console.log("📤 Изпращам резервация:", bookingData);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    });

    const result = await res.json();
    console.log("📥 Отговор:", result);

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

loadBookings();
