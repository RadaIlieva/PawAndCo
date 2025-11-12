import cron from "node-cron";
import Booking from "../models/Booking.js";


async function deleteOldBookings() {
  try {
    const now = new Date();

    // Текущата неделя (00:00 часа)
    const currentSunday = new Date(now);
    currentSunday.setHours(0, 0, 0, 0);

    // Миналата неделя
    const prevSunday = new Date(currentSunday);
    prevSunday.setDate(prevSunday.getDate() - 7);

    // Неделята преди миналата (2 седмици назад)
    const weekBeforePrev = new Date(prevSunday);
    weekBeforePrev.setDate(weekBeforePrev.getDate() - 7);

    // Изтриваме резервациите, създадени между weekBeforePrev и prevSunday
    const result = await Booking.deleteMany({
      createdAt: { $gte: weekBeforePrev, $lt: prevSunday },
    });

    console.log(
      `🧹 Изтрити са ${result.deletedCount} резервации от предходната седмица (${weekBeforePrev.toDateString()} - ${prevSunday.toDateString()})`
    );
  } catch (err) {
    console.error("⚠️ Грешка при автоматично изтриване:", err.message);
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
