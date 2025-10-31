// ---------- КАЛЕНДАР НА РЕЗЕРВАЦИИТЕ ----------

const calendarContainer = document.getElementById("calendar");
const bookingDetails = document.createElement("div");
bookingDetails.id = "bookingDetails";
if (calendarContainer) calendarContainer.after(bookingDetails);

let adminBookings = {};
let adminWeekStart = new Date();

window.deleteBooking = async function (id) {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази резервация?")) return;
    try {
        const res = await fetch(`http://localhost:5000/api/bookings/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Грешка при изтриване.");
        alert("🗑️ Резервацията е изтрита успешно!");
        loadAdminBookings();
        bookingDetails.innerHTML = "";
    } catch (err) {
        alert(err.message);
    }
};

async function loadAdminBookings() {
    try {
        const res = await fetch("http://localhost:5000/api/bookings");
        if (!res.ok) throw new Error("Неуспешно зареждане на резервации");
        const data = await res.json();
        adminBookings = {};
        data.forEach(b => {
            if (!adminBookings[b.date]) adminBookings[b.date] = [];
            adminBookings[b.date].push(b);
        });
        renderAdminCalendar();
    } catch (err) {
        console.error(err);
        calendarContainer.innerHTML = "<p>Грешка при зареждане на календара.</p>";
    }
}

function renderAdminCalendar() {
    if (!calendarContainer) return;
    calendarContainer.innerHTML = "";

    const navDiv = document.createElement("div");
    navDiv.classList.add("calendar-nav");
    navDiv.innerHTML = `
        <span class="nav-arrow" id="prevWeek">&#8592;</span>
        <span>Седмица</span>
        <span class="nav-arrow" id="nextWeek">&#8594;</span>
    `;
    calendarContainer.appendChild(navDiv);

    const week = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(adminWeekStart);
        d.setDate(adminWeekStart.getDate() + i);
        week.push(d);
    }

    const grid = document.createElement("div");
    grid.classList.add("calendar-grid");

    week.forEach(day => {
        const dateStr = day.toISOString().split("T")[0];
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        const options = { weekday: "short", day: "numeric", month: "short" };
        dayDiv.innerHTML = `<h4>${day.toLocaleDateString("bg-BG", options)}</h4>`;

        for (let hour = 9; hour <= 18; hour++) {
            const hourDiv = document.createElement("div");
            hourDiv.classList.add("hour");
            hourDiv.textContent = `${hour}:00`;
            const bookings = adminBookings[dateStr] || [];
            const booking = bookings.find(b => b.hour === hour);
            if (booking) {
                hourDiv.classList.add("booked");
                hourDiv.addEventListener("click", () => showBookingDetails(booking));
            } else {
                hourDiv.addEventListener("click", () => showAddBookingForm(dateStr, hour));
            }
            dayDiv.appendChild(hourDiv);
        }
        grid.appendChild(dayDiv);
    });

    calendarContainer.appendChild(grid);
    const addBtn = document.createElement("button");
    addBtn.textContent = "➕ Добави нов час";
    addBtn.classList.add("add-booking-btn");
    addBtn.addEventListener("click", () => showAddBookingForm());
    calendarContainer.appendChild(addBtn);

    document.getElementById("prevWeek").addEventListener("click", () => {
        adminWeekStart.setDate(adminWeekStart.getDate() - 7);
        renderAdminCalendar();
    });
    document.getElementById("nextWeek").addEventListener("click", () => {
        adminWeekStart.setDate(adminWeekStart.getDate() + 7);
        renderAdminCalendar();
    });
}

function showBookingDetails(booking) {
    bookingDetails.innerHTML = `
        <div class="booking-info">
            <h3>📋 Детайли за резервацията</h3>
            <p><b>Дата:</b> ${booking.date}</p>
            <p><b>Час:</b> ${booking.hour}:00</p>
            <p><b>Собственик:</b> ${booking.ownerName}</p>
            <p><b>Куче:</b> ${booking.dogName}</p>
            <p><b>Порода:</b> ${booking.breed}</p>
            <p><b>Телефон:</b> ${booking.phone}</p>
            <div class="btn-group">
                <button onclick="editBooking('${booking._id}')">✏️ Редактирай</button>
                <button onclick="deleteBooking('${booking._id}')" class="delete-btn">🗑️ Изтрий</button>
            </div>
        </div>
    `;
}

function showAddBookingForm(date = "", hour = "") {
    const today = new Date().toISOString().split("T")[0];
    bookingDetails.innerHTML = `
      <div class="booking-add-form">
          <h3>➕ Добавяне на нов час</h3>
          <label>Дата:</label>
          <input type="date" id="newDate" value="${date || today}">
          <label>Час:</label>
          <input type="number" id="newHour" value="${hour || 9}" min="9" max="18">
          <label>Име на собственик:</label>
          <input type="text" id="newOwner" required>
          <label>Куче:</label>
          <input type="text" id="newDog" required>
          <label>Порода:</label>
          <input type="text" id="newBreed" required>
          <label>Телефон:</label>
          <input type="text" id="newPhone" required>
          <div class="btn-group">
              <button id="saveNewBooking">💾 Запази</button>
              <button onclick="loadAdminBookings()">❌ Отказ</button>
          </div>
      </div>
    `;

    document.getElementById("saveNewBooking").addEventListener("click", async () => {
        const newBooking = {
            date: document.getElementById("newDate").value,
            hour: Number(document.getElementById("newHour").value),
            ownerName: document.getElementById("newOwner").value,
            dogName: document.getElementById("newDog").value,
            breed: document.getElementById("newBreed").value,
            phone: document.getElementById("newPhone").value
        };

        try {
            const res = await fetch("http://localhost:5000/api/bookings/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newBooking)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Грешка при създаване на резервация.");

            alert("✅ Новият час е добавен успешно!");
            loadAdminBookings();
        } catch (err) {
            alert("⚠️ " + err.message);
        }
    });
}

window.editBooking = function (id) {
    const booking = Object.values(adminBookings).flat().find(b => b._id === id);
    if (!booking) return alert("❌ Резервацията не е намерена.");

    bookingDetails.innerHTML = `
        <div class="booking-edit-form">
            <h3>✏️ Промяна на ден и час</h3>
            <label>Дата:</label>
            <input type="date" id="editDate" value="${booking.date}" required>

            <label>Час:</label>
            <input type="number" id="editHour" value="${booking.hour}" min="9" max="18" required>

            <div class="btn-group">
                <button id="saveEditBooking">💾 Запази</button>
                <button onclick="loadAdminBookings()">❌ Отказ</button>
            </div>
        </div>
    `;

    document.getElementById("saveEditBooking").addEventListener("click", async () => {
        const newDate = document.getElementById("editDate").value;
        const newHour = Number(document.getElementById("editHour").value);

        if (!newDate || !newHour) {
            alert("⚠️ Моля, попълнете дата и час.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/bookings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: newDate, hour: newHour })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Грешка при обновяване.");

            alert("✅ Резервацията е променена успешно!");
            loadAdminBookings();
            bookingDetails.innerHTML = "";
        } catch (err) {
            alert("⚠️ " + err.message);
        }
    });
};
