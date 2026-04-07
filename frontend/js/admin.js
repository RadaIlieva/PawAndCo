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

const API_BASE_URL = window.location.origin;

// ---------- ВХОД В СИСТЕМАТА ----------
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Грешка при вход");

            // Запазваме токена
            sessionStorage.setItem("adminToken", data.token);

            loginMessage.textContent = "";
            loginSection.classList.add("hidden");
            adminPanel.classList.remove("hidden");

            // ✅ Първоначално зареждане на всички данни след логване
            loadAllAdminData();

        } catch (err) {
            loginMessage.textContent = "⚠️ " + err.message;
        }
    });
}

// ---------- ПРОВЕРКА НА ТОКЕН ПРИ ЗАРЕЖДАНЕ ----------
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
        loginSection.classList.remove("hidden");
        adminPanel.classList.add("hidden");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/verify`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();

        loginSection.classList.add("hidden");
        adminPanel.classList.remove("hidden");

        // ✅ Автоматично зареждаме данните, ако вече сме логнати
        loadAllAdminData();

    } catch (err) {
        sessionStorage.removeItem("adminToken");
        loginSection.classList.remove("hidden");
        adminPanel.classList.add("hidden");
    }
});

// ---------- ГЛОБАЛНО ЗАРЕЖДАНЕ ----------
function loadAllAdminData() {
    // Проверяваме дали функциите съществуват (от другите файлове) и ги викаме
    if (typeof window.loadAdminBookings === "function") window.loadAdminBookings();
    if (typeof window.loadOrders === "function") window.loadOrders();
    if (window.loadProducts) window.loadProducts();
}

// ---------- ИЗХОД ----------
window.logoutAdmin = function () {
    sessionStorage.removeItem("adminToken");
    window.location.reload();
};

// ---------- НАВИГАЦИЯ МЕЖДУ ТАБОВЕТЕ ----------
if (calendarBtn) calendarBtn.addEventListener("click", () => showSection("calendarSection"));
if (ordersBtn) ordersBtn.addEventListener("click", () => showSection("ordersSection"));
if (productsBtn) productsBtn.addEventListener("click", () => showSection("productsSection"));

function showSection(id) {
    // 1. Скриваме всички секции и махаме активния клас от бутоните
    [calendarSection, ordersSection, productsSection].forEach(s => s.classList.add("hidden"));
    [calendarBtn, ordersBtn, productsBtn].forEach(b => b.classList.remove("active"));

    // 2. Показваме избраната секция
    const targetSection = document.getElementById(id);
    if (targetSection) targetSection.classList.remove("hidden");

    // 3. Слагаме активен клас на съответния бутон
    if (id === "calendarSection") calendarBtn.classList.add("active");
    if (id === "ordersSection") ordersBtn.classList.add("active");
    if (id === "productsSection") productsBtn.classList.add("active");

    // 4. ✅ КЛЮЧОВО: Презареждаме данните за конкретната секция при клик
    if (id === "calendarSection" && typeof window.loadAdminBookings === "function") window.loadAdminBookings();
    if (id === "ordersSection" && typeof window.loadOrders === "function") window.loadOrders();
    if (id === "productsSection" && typeof window.loadProducts === "function") window.loadProducts();
}