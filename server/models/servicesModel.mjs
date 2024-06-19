import { pool } from "../db/postgresConnection.mjs";
import registrationsModel from "./registrationsModel.mjs";

const servicesModel = {
  getServices: async () => {
    try {
      const services = await pool.query(`
      SELECT * FROM services
        `);
      return services.rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  searchServices: async (searchQuery) => {
    try {
      const query = `
        SELECT * FROM services
        WHERE title ILIKE $1
        OR date_time::date = $2::date
      `;
      const services = await pool.query(query, [
        `%${searchQuery}%`,
        searchQuery,
      ]);
      return services.rows;
    } catch (error) {
      console.error("Error searching services:", error);
      throw error;
    }
  },

  getServiceById: async (id) => {
    try {
      const query = "SELECT * FROM services WHERE id = $1";
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  createService: async (title, image, category) => {
    
    try {
      const result = await pool.query(
        "INSERT INTO services (title, image, category, rating) VALUES ($1, $2, $3, '0') RETURNING *",
        [title, image, category]
      );
  
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteService: async (id) => {
    try {
      const query = "DELETE FROM services WHERE id = $1";
      const result = await pool.query(query, [id]);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateService: async (id, updatedService) => {
    try {
      // Convert ID to integer to ensure it's valid for PostgreSQL queries
      const serviceId = parseInt(id, 10);
      if (isNaN(serviceId)) {
        throw new Error("Invalid service ID");
      }

      // Validate the updated fields to avoid updating with empty or invalid data
      if (
        !updatedService ||
        typeof updatedService !== "object" ||
        Object.keys(updatedService).length === 0
      ) {
        throw new Error("Invalid updated fields");
      }

      // Create the query's set fields and values
      const setFields = Object.keys(updatedService)
        .map((key, i) => `${key} = $${i + 1}`)
        .join(", ");

      const values = [...Object.values(updatedService), serviceId]; // Correct order of values

      // Execute the query with parameterized inputs
      const result = await pool.query(
        `UPDATE services SET ${setFields} WHERE id = $${values.length} RETURNING *`,
        values
      );

      if (result.rowCount === 0) {
        // No service found with the given ID
        throw new Error("Service not found");
      }

      return result.rows[0]; // Return the updated service
    } catch (error) {
      console.error("Error in updatedService:", error.message); // Log the error message
      throw error; // Re-throw the error to handle it elsewhere
    }
  },

  // prieinamu datu ir laiku gavimas pagal paslaugos id (netrinti!)
  getScheduleByServiceId: async (id) => {
    try {
      const schedule = await pool.query(
        "SELECT * FROM schedule WHERE service_id = $1",
        [id]
      );
      return schedule.rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // schedule atnaujinimas (netrinti!)
  updateSchedule: async (id, dateTimes) => {
    try {
      // Patikriname ar yra registraciju
      const registrationsQuery =
        "SELECT COUNT(*) FROM registrations WHERE service_id = $1";
      const registrationsResult = await pool.query(registrationsQuery, [id]);
      const registrationsCount = parseInt(registrationsResult.rows[0].count);
      // Jei yra registracijų, netrinam
      if (registrationsCount > 0) {
        throw new Error("Cannot delete schedule because registrations exist");
      }

      // Jei registracijų nėra, ištriname senus įrašus
      await pool.query("DELETE FROM schedule WHERE service_id = $1", [id]);

      // Idedame naujus irasus
      const insertPromises = dateTimes.map((dateTime) =>
        pool.query(
          "INSERT INTO schedule (service_id, date_time) VALUES ($1, $2)",
          [id, dateTime]
        )
      );
      await Promise.all(insertPromises);

      // Gauname atnaujinta tvarkarasti
      const result = await pool.query(
        "SELECT date_time FROM schedule WHERE service_id = $1",
        [id]
      );
      const updatedSchedule = result.rows.map((row) => row.date_time);

      return updatedSchedule; // Graziname paprasta datu masyva
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
// atsiliepimo sukurimas, netrinti
  createReview: async (rating, user_id, service_id) => {
    try {
      const result = await pool.query(
        "INSERT INTO ratings (rating, user_id, service_id) VALUES ($1, $2, $3) RETURNING *",
        [rating, user_id, service_id]
      );

      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getReviewByUserAndService: async (user_id, service_id) => {
    try {
      const query = 'SELECT * FROM ratings WHERE user_id = $1 AND service_id = $2';
      const values = [user_id, service_id];
  
      const { rows } = await pool.query(query, values);
  
      // Grąžinti pirmą rastą atsiliepimą arba null, jei atsiliepimas nerastas
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in getReviewByUserAndService:', error.message);
      throw error;
    }
  },



  //salinam reitingus (netrinti)
  deleteRatingsByServiceId: async (serviceId) => {
    try {
      const query = "DELETE FROM ratings WHERE service_id = $1";
      await pool.query(query, [serviceId]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // reitingo vidurkio gavimas
  getAverageRatingForService: async (serviceId) => {
    try {
      const result = await pool.query(
        "SELECT AVG(rating) AS rating FROM ratings WHERE service_id = $1",
        [serviceId]
      );

      // Jeigu nera ivertinimu siai paslaugai, grazinti null
      if (result.rows.length === 0 || result.rows[0].rating === null) {
        return null;
      }

      // Suapvalinti vidurki iki 2 skaiciu po kablelio
      const averageRating = parseFloat(result.rows[0].rating).toFixed(
        2
      );

      return averageRating;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
// netrinti
  updateAverageRating: async (service_id) => {
    try {
      const result = await pool.query(
        "UPDATE services SET rating = (SELECT AVG(rating) FROM ratings WHERE service_id = $1) WHERE id = $1 RETURNING *",
        [service_id]
      );

      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Paslaugos datos ir laiko atnaujinimas
  // upsertServiceTimeSlot: async (service_id, date_time) => {
  //   try {
  //     const existingSlot = await pool.query(
  //       "SELECT * FROM schedule WHERE service_id = $1 AND date_time = $2",
  //       [service_id, date_time]
  //     );

  //     if (existingSlot.rows.length > 0) {
  //       const result = await pool.query(
  //         "UPDATE schedule SET date_time = $1 WHERE service_id = $2 AND date_time = $3 RETURNING *",
  //         [date_time, service_id, existingSlot.rows[0].date_time]
  //       );
  //       return result.rows[0];
  //     } else {
  //       const result = await pool.query(
  //         "INSERT INTO schedule (service_id, date_time) VALUES ($1, $2) RETURNING *",
  //         [service_id, date_time]
  //       );
  //       return result.rows[0];
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // },

  // registracijis sukurimas , netrinti
  createRegistration: async (user_id, service_id, name, date_time) => {
    try {
      // Tikrinama, ar vartotojas jau užsiregistravęs šiai paslaugai
      const isRegistered = await registrationsModel.isUserRegistered(
        user_id,
        service_id
      );
      if (isRegistered) {
        throw new Error("The user is already registered for this service");
      }

      const query = `
        INSERT INTO registrations (user_id, service_id, name, date_time)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const values = [user_id, service_id, name, date_time];

      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Error creating registration:", error);
      throw error;
    }
  },

  // vartotojo registravimas i paslauga
  // createRegistration: async (user_id, service_id, name, date_time) => {
  //   try {
  //     const result = await pool.query(
  //       "INSERT INTO registrations (user_id, service_id, name, date_time, confirmation) VALUES ($1, $2, $3, $4, 'false') RETURNING *",
  //       [user_id, service_id, name, date_time]
  //     );
  //     return result.rows[0];
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // },

};

export default servicesModel;
