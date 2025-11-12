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

    // ✅ Запазваме токена в sessionStorage (по-сигурно от localStorage)
    sessionStorage.setItem("adminToken", data.token);

    loginMessage.textContent = "";
    loginSection.classList.add("hidden");
    adminPanel.classList.remove("hidden");

    // Зареждаме нужните данни
    if (typeof loadAdminBookings === "function") loadAdminBookings();
    if (typeof loadOrders === "function") loadOrders();
    if (typeof loadProducts === "function") loadProducts();
  } catch (err) {
    loginMessage.textContent = "⚠️ " + err.message;
  }
});

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
  } catch {
    sessionStorage.removeItem("adminToken");
    loginSection.classList.remove("hidden");
    adminPanel.classList.add("hidden");
  }
});

window.logoutAdmin = function () {
  sessionStorage.removeItem("adminToken");
  window.location.reload();
};

calendarBtn.addEventListener("click", () => showSection("calendarSection"));
ordersBtn.addEventListener("click", () => showSection("ordersSection"));
productsBtn.addEventListener("click", () => showSection("productsSection"));

function showSection(id) {
  [calendarSection, ordersSection, productsSection].forEach((s) =>
    s.classList.add("hidden")
  );
  calendarSection.classList.toggle("hidden", id !== "calendarSection");
  ordersSection.classList.toggle("hidden", id !== "ordersSection");
  productsSection.classList.toggle("hidden", id !== "productsSection");
}
