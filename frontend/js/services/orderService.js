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
