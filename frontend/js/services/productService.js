// Глобални променливи
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

// Зареждане на продуктите
async function loadProducts() {
    try {
        const res = await fetch("http://localhost:5000/api/products");
        if (!res.ok) throw new Error(`Грешка при извличане на продуктите: ${res.statusText}`);

        products = await res.json();
        renderProducts();
    } catch (err) {
        console.error("Грешка при зареждане на продуктите:", err);
        alert(`Грешка при зареждане: ${err.message}`);
    }
}

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
            ${p.image ? `<img src="http://localhost:5000${p.image}" alt="${p.name}">` : ""}
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

// Редакция на продукт
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

// Изтриване на продукт
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

// Зареждане на продуктите при стартиране на страницата
document.addEventListener("DOMContentLoaded", loadProducts);
