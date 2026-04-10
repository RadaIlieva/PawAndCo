// ---------- ГЛОБАЛНИ ----------
window.API_BASE_URL = window.API_BASE_URL || window.location.origin;

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

// ---------- LOGIN ----------
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = username.value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch(`${window.API_BASE_URL}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            sessionStorage.setItem("adminToken", data.token);

            loginSection.classList.add("hidden");
            adminPanel.classList.remove("hidden");

            loadAllAdminData();

        } catch (err) {
            loginMessage.textContent = err.message;
        }
    });
}

// ---------- TOKEN ----------
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) return;

    try {
        const res = await fetch(`${window.API_BASE_URL}/api/admin/verify`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();

        loginSection.classList.add("hidden");
        adminPanel.classList.remove("hidden");

        loadAllAdminData();

    } catch {
        sessionStorage.removeItem("adminToken");
    }
});

// ---------- LOAD ----------
function loadAllAdminData() {
    if (window.loadAdminBookings) window.loadAdminBookings();
    if (window.loadOrders) window.loadOrders();
    if (window.loadProducts) window.loadProducts();
}

// ---------- NAV ----------
calendarBtn.onclick = () => showSection("calendarSection");
ordersBtn.onclick = () => showSection("ordersSection");
productsBtn.onclick = () => showSection("productsSection");

function showSection(id) {
    [calendarSection, ordersSection, productsSection].forEach(s => s.classList.add("hidden"));

    document.getElementById(id).classList.remove("hidden");

    if (id === "productsSection") window.loadProducts();
}