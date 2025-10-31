const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginSection = document.getElementById("loginSection");
const adminPanel = document.getElementById("adminPanel");

const calendarBtn = document.getElementById("calendarBtn");
const ordersBtn = document.getElementById("ordersBtn");
const productsBtn = document.getElementById("productsBtn");

const calendarSection = document.getElementById("calendarSection");
const ordersSection = document.getElementById("ordersSection");
const productsSection = document.getElementById("productsSection");


// АУТЕНТИКАЦИЯ НА АДМИН
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("http://localhost:5000/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Грешка при вход");

        // Запазваме токена в localStorage
        localStorage.setItem("adminToken", data.token);

        loginMessage.textContent = "";
        loginSection.classList.add("hidden");
        adminPanel.classList.remove("hidden");

        // Зареждаме данните от другите файлове
        if (typeof loadAdminBookings === "function") loadAdminBookings();
        if (typeof loadOrders === "function") loadOrders();
        if (typeof loadProducts === "function") loadProducts();

    } catch (err) {
        loginMessage.textContent = "⚠️ " + err.message;
    }
});

// ПРОВЕРКА НА ТОКЕН ПРИ ЗАРЕЖДАНЕ
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("adminToken");
    if (token) {
        loginSection.classList.add("hidden");
        adminPanel.classList.remove("hidden");

        if (typeof loadAdminBookings === "function") loadAdminBookings();
        if (typeof loadOrders === "function") loadOrders();
        if (typeof loadProducts === "function") loadProducts();
    }
});


// ТАБОВЕ: Календар / Поръчки / Продукти
calendarBtn.addEventListener("click", () => showSection("calendarSection"));
ordersBtn.addEventListener("click", () => showSection("ordersSection"));
productsBtn.addEventListener("click", () => showSection("productsSection"));

function showSection(id) {
    [calendarSection, ordersSection, productsSection].forEach(s => s.classList.add("hidden"));
    const activeBtn = [calendarBtn, ordersBtn, productsBtn].find(btn => btn.dataset.target === id);
    
    calendarSection.classList.toggle("hidden", id !== "calendarSection");
    ordersSection.classList.toggle("hidden", id !== "ordersSection");
    productsSection.classList.toggle("hidden", id !== "productsSection");

    calendarBtn.classList.toggle("active", id === "calendarSection");
    ordersBtn.classList.toggle("active", id === "ordersSection");
    productsBtn.classList.toggle("active", id === "productsSection");
}

// ========================
// ФУНКЦИИ ЗА LOGOUT (по избор)
// ========================
window.logoutAdmin = function () {
    localStorage.removeItem("adminToken");
    adminPanel.classList.add("hidden");
    loginSection.classList.remove("hidden");
};
