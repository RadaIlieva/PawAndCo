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

// ---------- ВХОД ----------
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

            sessionStorage.setItem("adminToken", data.token);

            loginSection.classList.add("hidden");
            adminPanel.classList.remove("hidden");

            // ✅ КЛЮЧОВО – директно отваряме продуктите
            showSection("productsSection");

        } catch (err) {
            loginMessage.textContent = "⚠️ " + err.message;
        }
    });
}

// ---------- ПРОВЕРКА НА ТОКЕН ----------
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/verify`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();

        loginSection.classList.add("hidden");
        adminPanel.classList.remove("hidden");

        // ✅ автоматично показваме продуктите
        showSection("productsSection");

    } catch {
        sessionStorage.removeItem("adminToken");
    }
});

// ---------- НАВИГАЦИЯ ----------
if (calendarBtn) calendarBtn.addEventListener("click", () => showSection("calendarSection"));
if (ordersBtn) ordersBtn.addEventListener("click", () => showSection("ordersSection"));
if (productsBtn) productsBtn.addEventListener("click", () => showSection("productsSection"));

function showSection(id) {
    [calendarSection, ordersSection, productsSection].forEach(s => s.classList.add("hidden"));
    [calendarBtn, ordersBtn, productsBtn].forEach(b => b.classList.remove("active"));

    document.getElementById(id).classList.remove("hidden");

    if (id === "calendarSection") calendarBtn.classList.add("active");
    if (id === "ordersSection") ordersBtn.classList.add("active");
    if (id === "productsSection") productsBtn.classList.add("active");

    // ✅ КЛЮЧОВО – зареждаме продуктите ВСЕКИ ПЪТ
    if (id === "productsSection" && typeof window.loadProducts === "function") {
        window.loadProducts();
    }
}