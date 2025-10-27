// admin.js (Оптимизиран код)

// ---------- СЕКЦИИ ----------

const calendarBtn = document.getElementById("calendarBtn");
const ordersBtn = document.getElementById("ordersBtn");
const productsBtn = document.getElementById("productsBtn");

const calendarSection = document.getElementById("calendarSection");
const ordersSection = document.getElementById("ordersSection");
const productsSection = document.getElementById("productsSection");

function showSection(section) {
    calendarSection.classList.add("hidden");
    ordersSection.classList.add("hidden");
    productsSection.classList.add("hidden");
    calendarBtn.classList.remove("active");
    ordersBtn.classList.remove("active");
    productsBtn.classList.remove("active");

    if (section === "calendar") {
        calendarSection.classList.remove("hidden");
        calendarBtn.classList.add("active");
        loadAdminBookings(); // Презареждаме календара
    } else if (section === "orders") {
        ordersSection.classList.remove("hidden");
        ordersBtn.classList.add("active");
        loadOrders(); 
    } else if (section === "products") {
        productsSection.classList.remove("hidden");
        productsBtn.classList.add("active");
        loadProducts(); 
    }
}

calendarBtn.addEventListener("click", () => showSection("calendar"));
ordersBtn.addEventListener("click", () => showSection("orders"));
productsBtn.addEventListener("click", () => showSection("products"));

// ---------- ПРОДУКТИ (CRUD) - БЕЗ ПРОМЕНИ ----------

let products = [];

const form = document.getElementById("productForm");
const list = document.getElementById("adminProducts");
const eurPrice = document.getElementById("eurPrice");

const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const imageInput = document.getElementById("image");
const editIdInput = document.getElementById("editId");

// Конвертиране на лв в евро
if (priceInput) priceInput.addEventListener("input", () => {
    const eur = (priceInput.value / 1.96).toFixed(2);
    eurPrice.textContent = `≈ ${eur} €`;
});

// Зареждане на продуктите
async function loadProducts() {
    try {
        const res = await fetch("http://localhost:5000/api/products");
        if (!res.ok) throw new Error("Неуспешно зареждане на продуктите");
        products = await res.json();
        renderProducts();
    } catch (err) {
        console.error("Грешка при зареждане на продукти:", err);
        if (list) list.innerHTML = "<p>Неуспешно зареждане на продуктите.</p>";
    }
}

// Добавяне / редакция на продукт
if (form) form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", nameInput.value);
    formData.append("description", descriptionInput.value);
    formData.append("category", categoryInput.value);
    formData.append("priceBGN", priceInput.value);
    if (imageInput.files[0]) formData.append("image", imageInput.files[0]);

    const url = editIdInput.value
        ? `http://localhost:5000/api/products/${editIdInput.value}`
        : "http://localhost:5000/api/products";
    const method = editIdInput.value ? "PUT" : "POST";

    try {
        const res = await fetch(url, { method, body: formData });
        if (!res.ok) throw new Error("Грешка при запис на продукта");

        form.reset();
        eurPrice.textContent = "";
        editIdInput.value = "";
        loadProducts();
    } catch (err) {
        alert(err.message);
    }
});

// Рендиране на продуктите
function renderProducts() {
    if (!list) return;
    list.innerHTML = "";
    products.forEach((p) => {
        const eur = (p.priceBGN / 1.96).toFixed(2);
        const card = document.createElement("div");
        card.classList.add("product-card");
        card.dataset.id = p._id;
        card.innerHTML = `
            <img src="http://localhost:5000${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <p><b>${p.priceBGN} лв</b> (${eur} €)</p>
            <p><i>${p.category}</i></p>
            <div class="btn-group">
                <button onclick="editProduct('${p._id}')">✏️</button>
                <button onclick="deleteProduct('${p._id}')" class="delete-btn">🗑️</button>
            </div>
        `;
        list.appendChild(card);
    });
}

window.editProduct = function (id) {
    const p = products.find((p) => p._id === id);
    if (!p) return;
    nameInput.value = p.name;
    descriptionInput.value = p.description;
    categoryInput.value = p.category;
    priceInput.value = p.priceBGN;
    editIdInput.value = p._id;
    eurPrice.textContent = `≈ ${(p.priceBGN / 1.96).toFixed(2)} €`;
};

// Изтриване на продукт по Mongo _id 
window.deleteProduct = async function (id) {
    if (!confirm("Сигурни ли сте, че искате да изтриете продукта?")) return;

    try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Грешка при изтриване на продукта");
        loadProducts();
    } catch (err) {
        alert(err.message);
    }
};

// ---------- ПОРЪЧКИ (CRUD) - ОПРОСТЕНИ МЕТОДИ ----------

const ordersList = document.getElementById("ordersList");
const deleteOrderIdInput = document.getElementById("deleteOrderIdInput");
const deleteOrderByIdBtn = document.getElementById("deleteOrderByIdBtn");
const deleteMessage = document.getElementById("deleteMessage");


window.deleteOrder = async function (id) {
  if (!confirm("Сигурни ли сте, че искате да изтриете поръчката?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Грешка при изтриване на поръчката");

    alert("Поръчката е изтрита успешно!");
    loadOrders();
  } catch (err) {
    alert(err.message);
  }
};
// ✏️ Най-лесен метод: Промяна на статус на поръчка
window.updateOrderStatus = async function (selectElement, id) {
    const newStatus = selectElement.value;
    
    if (!confirm(`Сигурни ли сте, че искате да промените статуса на поръчка ${id} на '${newStatus}'?`)) {
        selectElement.value = selectElement.dataset.currentStatus; // Връща предишния статус
        return;
    }

    try {
        // Използваме orderId/Mongo _id за идентификация
        const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Грешка при промяна на статус. Статус: ${res.status}`;
            try {
                const errorData = JSON.parse(errorText);
                if (errorData.message) errorMessage = errorData.message;
            } catch (e) { /* ignore */ }
            throw new Error(errorMessage);
        }

        alert(`Статусът на поръчка ${id} е успешно променен на '${newStatus}'.`);
        loadOrders(); // Презареждаме, за да обновим класовете
        
    } catch (err) {
        console.error("Грешка при промяна на статус:", err);
        alert(`Грешка: ${err.message}`);
        selectElement.value = selectElement.dataset.currentStatus; // Връща предишния статус
    }
};


async function loadOrders() {
    try {
        const res = await fetch("http://localhost:5000/api/orders");
        if (!res.ok) throw new Error("Неуспешно зареждане на поръчките");

        const orders = await res.json();
        
        // 💡 Скриваме полето за ръчно изтриване, тъй като добавяме бутон до всяка поръчка.
        const deleteByIdContainer = document.querySelector('.delete-by-id-container');
        if (deleteByIdContainer) deleteByIdContainer.classList.add('hidden'); 
        if (deleteMessage) deleteMessage.textContent = "";

        if (!ordersList) return;
        ordersList.innerHTML = "";

        if (orders.length === 0) {
            ordersList.innerHTML = "<p>Няма направени поръчки.</p>";
            if (deleteByIdContainer) deleteByIdContainer.classList.remove('hidden'); 
            return;
        }

        orders.forEach((order) => {
            const div = document.createElement("div");
            const currentStatus = order.status || 'изчакване'; 
            div.classList.add("order-item", `status-${currentStatus}`); 

            const idForOperation = order.orderId || order._id; // Използваме OrderId или Mongo _id

            const statusOptions = ['изчакване', 'в процес', 'изпратена', 'завършена', 'отказана'];
            const statusSelectHTML = `
                <select 
                    onchange="updateOrderStatus(this, '${idForOperation}')" 
                    data-current-status="${currentStatus}"
                    aria-label="Промени статус"
                >
                    ${statusOptions.map(s => `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>`).join("")}
                </select>
            `;

            div.innerHTML = `
                <p><b>Номер на поръчка (ID):</b> ${idForOperation}</p>
                <p><b>Дата и час на поръчка:</b> ${new Date(order.createdAt).toLocaleString("bg-BG")}</p>
                <p><b>Клиент:</b> ${order.customerName}</p>
                <p><b>Телефон:</b> ${order.customerPhone}</p>
                <p><b>Имейл:</b> ${order.customerEmail}</p>
                <p><b>Адрес/Офис:</b> ${order.customerAddress}</p>
                <p><b>Общо:</b> ${order.totalPrice} лв</p>
                <ul>
                    ${order.products.map(p => `<li>${p.name} (${p.quantity} бр. × ${p.priceBGN} лв)</li>`).join("")}
                </ul>
                <div class="order-actions">
                    <p><b>Статус:</b> ${statusSelectHTML}</p>
                    <button onclick="deleteOrder('${order._id}')" class="delete-btn">🗑️ Изтрий поръчката</button>
                </div>
            `;
            ordersList.appendChild(div);
        });
    } catch (err) {
        console.error("Грешка при зареждане на поръчки:", err);
        if (ordersList) ordersList.innerHTML = "<p>Неуспешно зареждане на поръчките.</p>";
    }
}


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



// ---------- СТАРТИРАНЕ ----------
document.addEventListener("DOMContentLoaded", () => {
    showSection("products");
});