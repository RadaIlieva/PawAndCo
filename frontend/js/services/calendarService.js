
const API_BASE_URL = window.location.origin;

const calendarContainer = document.getElementById("calendar");
const bookingDetails = document.createElement("div");
bookingDetails.id = "bookingDetails";
if (calendarContainer) calendarContainer.after(bookingDetails);

let adminBookings = {};
let adminWeekStart = new Date();

// ----------- ИЗТРИВАНЕ НА РЕЗЕРВАЦИЯ -----------
window.deleteBooking = async function (id) {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази резервация?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, { 
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
            }
        });
        
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Грешка при изтриване.");
        }
        
        alert("🗑️ Резервацията е изтрита успешно!");
        await loadAdminBookings();
        bookingDetails.innerHTML = "";
    } catch (err) {
        console.error("Delete error:", err);
        alert("⚠️ " + err.message);
    }
};

// ----------- ЗАРЕЖДАНЕ НА РЕЗЕРВАЦИИ -----------
async function loadAdminBookings() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/bookings`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
            }
        });
        
        if (!res.ok) throw new Error("Неуспешно зареждане на резервации");
        
        const data = await res.json();
        adminBookings = {};
        data.forEach(b => {
            if (!adminBookings[b.date]) adminBookings[b.date] = [];
            adminBookings[b.date].push(b);
        });
        renderAdminCalendar();
    } catch (err) {
        console.error("Load error:", err);
        calendarContainer.innerHTML = "<p>Грешка при зареждане на календара.</p>";
    }
}

// ----------- РЕНДЕР НА КАЛЕНДАРА -----------
function renderAdminCalendar() {
    if (!calendarContainer) return;
    calendarContainer.innerHTML = "";

    // Навигация
    const navDiv = document.createElement("div");
    navDiv.classList.add("calendar-nav");
    navDiv.innerHTML = `
        <span class="nav-arrow" id="prevWeek">&#8592;</span>
        <span>Седмица</span>
        <span class="nav-arrow" id="nextWeek">&#8594;</span>
    `;
    calendarContainer.appendChild(navDiv);

    // Седмица
    const week = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(adminWeekStart);
        d.setDate(adminWeekStart.getDate() + i);
        week.push(d);
    }

    // Създаване на grid
    const grid = document.createElement("div");
    grid.classList.add("calendar-grid");

    week.forEach(day => {
        const dateStr = day.toISOString().split("T")[0];
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        const options = { weekday: "short", day: "numeric", month: "short" };
        dayDiv.innerHTML = `<h4>${day.toLocaleDateString("bg-BG", options)}</h4>`;

        for (let hour = 9; hour <= 18; hour+=2) {
            const hourDiv = document.createElement("div");
            hourDiv.classList.add("hour");
            hourDiv.textContent = `${hour}:00`;
            const bookings = adminBookings[dateStr] || [];
            const booking = bookings.find(b => b.hour === hour);
            if (booking) {
                hourDiv.classList.add("booked");
                hourDiv.addEventListener("click", () => showBookingDetails(booking));
            } else {
                hourDiv.addEventListener("click", () => handleHourClick(dateStr, hour));
            }
            dayDiv.appendChild(hourDiv);
        }
        grid.appendChild(dayDiv);
    });

    calendarContainer.appendChild(grid);

    // Бутон за добавяне
    const addBtn = document.createElement("button");
    addBtn.textContent = "➕ Добави нов час";
    addBtn.classList.add("add-booking-btn");
    addBtn.addEventListener("click", () => showAddBookingForm());
    calendarContainer.appendChild(addBtn);

    // Навигация седмици
    document.getElementById("prevWeek").addEventListener("click", () => {
        adminWeekStart.setDate(adminWeekStart.getDate() - 7);
        renderAdminCalendar();
    });
    document.getElementById("nextWeek").addEventListener("click", () => {
        adminWeekStart.setDate(adminWeekStart.getDate() + 7);
        renderAdminCalendar();
    });
}

// ----------- ПОКАЗВАНЕ НА ДЕТАЙЛИ -----------
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

// ----------- ДОБАВЯНЕ НА РЕЗЕРВАЦИЯ -----------
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

        if (!newBooking.ownerName || !newBooking.dogName || !newBooking.breed || !newBooking.phone) {
            alert("⚠️ Моля, попълнете всички полета.");
            return;
        }

         try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/admin`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(newBooking)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Грешка при създаване на резервация.");

            alert("✅ Новият час е добавен успешно!");
            await loadAdminBookings();
            bookingDetails.innerHTML = "";
        } catch (err) {
            console.error("Add booking error:", err);
            alert("⚠️ " + err.message);
        }
    });
}

// ----------- РЕДАКТИРАНЕ НА РЕЗЕРВАЦИЯ -----------
let currentEditingBooking = null;

window.editBooking = function (id) {
    const booking = Object.values(adminBookings).flat().find(b => b._id === id);
    if (!booking) return alert("❌ Резервацията не е намерена.");

    currentEditingBooking = booking;

    bookingDetails.innerHTML = `
        <div class="booking-edit-info">
            <h3>✏️ Редактиране на резервация</h3>
            <p><b>Собственик:</b> ${booking.ownerName}</p>
            <p><b>Куче:</b> ${booking.dogName}</p>
            <p><b>Порода:</b> ${booking.breed}</p>
            <p><b>Телефон:</b> ${booking.phone}</p>
            <p>📅 Изберете нов ден и час от календара.</p>
            <button onclick="cancelEdit()">❌ Отказ</button>
        </div>
    `;

    alert("Изберете нов свободен час от календара, за да преместите резервацията.");
};

// ----------- КЛИК ВЪРХУ ЧАС (използва се и при редактиране) -----------
async function handleHourClick(date, hour) {
    if (currentEditingBooking) {
        // редактиране на вече съществуваща резервация
       try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/${currentEditingBooking._id}`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ date, hour })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Грешка при обновяване.");

            alert("✅ Резервацията беше преместена успешно!");
            currentEditingBooking = null;
            await loadAdminBookings();
            bookingDetails.innerHTML = "";
        } catch (err) {
            console.error("Update booking error:", err);
            alert("⚠️ " + err.message);
        }
    } else {
        // добавяне на нова резервация
        showAddBookingForm(date, hour);
    }
}

window.cancelEdit = function () {
    currentEditingBooking = null;
    bookingDetails.innerHTML = "";
};

// ----------- ЗАРЕЖДАНЕ НА ПЪРВОНАЧАЛНИ РЕЗЕРВАЦИИ -----------
loadAdminBookings();
