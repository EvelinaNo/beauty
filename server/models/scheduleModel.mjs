import { pool } from "../db/postgresConnection.mjs";

const scheduleModel = {
  getServiceSchedule: async (serviceId) => {
    try {
      const schedule = await pool.query(
        "SELECT * FROM schedule WHERE service_id = $1",
        [serviceId]
      );
      console.log("getServiceSchedule:", schedule.rows);
      return schedule.rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Naujos datos ir laiko paslaugai pridejimas (netrinti)
  addServiceTimeSlot: async (service_id, date_time) => {
    try {
      const result = await pool.query(
        "INSERT INTO schedule (service_id, date_time) VALUES ($1, $2) RETURNING *",
        [service_id, date_time]
      );
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Paslaugos datos ir laiko pasalinimas (netrinti)
  deleteServiceTimeSlot: async (id) => {
    try {
      const result = await pool.query(
        "DELETE FROM schedule WHERE service_id = $1 RETURNING *",
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};

export default scheduleModel;
