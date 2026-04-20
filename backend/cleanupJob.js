import cron from "node-cron";
import Booking from "./models/Booking.js";


async function deleteOldBookings() {
  try {
    const now = new Date();

    // намираме текущата неделя
    const currentSunday = new Date(now);
    currentSunday.setHours(0, 0, 0, 0);

    const dayOfWeek = currentSunday.getDay(); // 0 = Sunday
    currentSunday.setDate(currentSunday.getDate() - dayOfWeek);

    // намираме предишната неделя
    const prevSunday = new Date(currentSunday);
    prevSunday.setDate(prevSunday.getDate() - 7);

    // 🔥 ИЗТРИВАМЕ ВСИЧКО ПРЕДИ ПРЕДИШНАТА НЕДЕЛЯ
    const result = await Booking.deleteMany({
      date: { $lt: prevSunday }
    });

    console.log(
      `🧹 Изтрити ${result.deletedCount} резервации преди ${prevSunday.toDateString()}`
    );

  } catch (err) {
    console.error("⚠️ Грешка при изтриване:", err.message);
  }
}

//Настройваме задачата да се изпълнява всяка неделя в 20:00 (8 вечерта
export function startCleanupJob() {
  cron.schedule("0 20 * * 0", () => {
    console.log("🕗 Стартира почистване на стари резервации...");
    deleteOldBookings();
  });

  console.log("✅ Планирано почистване: всяка неделя в 20:00.");
}
