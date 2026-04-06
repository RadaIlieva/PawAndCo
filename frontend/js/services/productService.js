let products = [];
const list = document.getElementById("adminProducts");
const form = document.getElementById("productForm");
const nameInput = document.getElementById("name");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const imageInput = document.getElementById("image");
const editIdInput = document.getElementById("editId");
const eurPrice = document.getElementById("eurPrice");
const API_BASE_URL = window.location.origin;

// ---------- СЪЗДАВАНЕ / РЕДАКЦИЯ НА ПРОДУКТ ----------
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Вземаме евро от инпута и го превръщаме в лева за базата
    const priceInEUR = parseFloat(priceInput.value);
    const priceInBGN = (priceInEUR * 1.96).toFixed(2);

    const formData = new FormData();
    formData.append("name", nameInput.value);
    formData.append("description", descriptionInput.value);
    formData.append("category", categoryInput.value);
    formData.append("priceBGN", priceInBGN);

    if (imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
    }

    const id = editIdInput.value;
    const url = id ? `${API_BASE_URL}/api/products/${id}` : `${API_BASE_URL}/api/products`;
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error(await res.text());

      alert(id ? "✅ Продуктът е редактиран успешно!" : "✅ Продуктът е добавен успешно!");
      
      form.reset();
      if (eurPrice) eurPrice.textContent = ""; 
      editIdInput.value = "";
      loadProducts();
    } catch (err) {
      console.error("Грешка:", err);
      alert("⚠️ " + err.message);
    }
  });
}

// Помощна функция: Показва левовата равностойност в реално време, докато админът пише
if (priceInput) {
    priceInput.addEventListener("input", () => {
        const val = parseFloat(priceInput.value);
        if (!isNaN(val) && eurPrice) {
            eurPrice.textContent = `≈ ${(val * 1.96).toFixed(2)} лв.`;
        } else if (eurPrice) {
            eurPrice.textContent = "";
        }
    });
}

// ---------- ЗАРЕЖДАНЕ НА ПРОДУКТИ ----------
async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    if (!res.ok) throw new Error("Неуспешно зареждане");
    products = await res.json();
    renderProducts();
  } catch (err) {
    if (list) list.innerHTML = "<p>⚠️ Неуспешно зареждане на продуктите.</p>";
  }
}

// ---------- РЕНДИРАНЕ НА ПРОДУКТИ (ADMIN LIST) ----------
function renderProducts() {
  if (!list) return;
  list.innerHTML = "";

  if (products.length === 0) {
    list.innerHTML = "<p>Няма добавени продукти.</p>";
    return;
  }

  products.forEach((p) => {
    const eur = (p.priceBGN / 1.96).toFixed(2);
    const card = document.createElement("div");
    card.classList.add("product-card");
    
    const imgUrl = p.image?.startsWith("http") ? p.image : `${API_BASE_URL}${p.image}`;

    card.innerHTML = `
      ${p.image ? `<img src="${imgUrl}" alt="${p.name}">` : ""}
      <h3>${p.name}</h3>
      <p>${p.description || "Без описание"}</p>
      <p><b>${eur} €</b> (${p.priceBGN} лв)</p>
      <p><i>${p.category || "Без категория"}</i></p>
      <div class="btn-group">
        <button onclick="editProduct('${p._id}')">✏️</button>
        <button onclick="deleteProduct('${p._id}')" class="delete-btn">🗑️</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// ---------- ПОДГОТОВКА ЗА РЕДАКЦИЯ ----------
window.editProduct = function (id) {
  const p = products.find((p) => p._id === id);
  if (!p) return;

  const priceInEUR = (p.priceBGN / 1.96).toFixed(2);

  nameInput.value = p.name;
  descriptionInput.value = p.description;
  categoryInput.value = p.category;
  priceInput.value = priceInEUR; // Слагаме евро в полето за редактиране
  editIdInput.value = p._id;

  if (eurPrice) eurPrice.textContent = `≈ ${p.priceBGN} лв.`;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// ---------- ИЗТРИВАНЕ НА ПРОДУКТ ----------
window.deleteProduct = async function (id) {
  if (!confirm("Сигурни ли сте?")) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Грешка при триене");
    alert("✅ Продуктът е изтрит!");
    loadProducts();
  } catch (err) {
    alert("⚠️ " + err.message);
  }
};

document.addEventListener("DOMContentLoaded", loadProducts);