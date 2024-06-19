import { pool } from "../db/postgresConnection.mjs";

const usersModel = {
  // registers new user
  createUser: async (newUser) => {
    try {
      const { name, email, password, role = "user" } = newUser;

      const result = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, email, password, role]
      );
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  // We need to check in DB, if there is no similar emails to register new user.
  getUserByEmail: async ({ email }) => {
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  login: async ({ email }) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    console.log(result);
    if (result.rows.length === 0) {
      throw new Error("User not found");
    }
    const user = result.rows[0];
    return user;
  },

  getUserById: async (id) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  },

  // vieno user'io paslaugu gavimas
  getUserServices: async (userId) => {
    try {
      const query = `
      SELECT r.id AS registration_id, s.id AS service_id, s.title AS service_title, s.category, s.image, s.rating, 
      r.confirmation, r.name, r.date_time
      FROM registrations r
      JOIN services s ON r.service_id = s.id
      WHERE r.user_id = $1;
    `;
      const { rows } = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error(
        "Failed to get user's services from the database:",
        error
      );
      throw error;
    }
  },

  // updateVisitedServices: async (userId, serviceId) => {
  //   try {
     
  //     const user = await usersModel.getUserById(userId);

  //     if (!user) {
  //       throw new Error("User not found");
  //     }

  //     const updatedVisitedServices = [...user.visitedServices, serviceId];

  
  //     const result = await pool.query(
  //       "UPDATE users SET visitedEServices = $1 WHERE id = $2 RETURNING *",
  //       [updatedVisitedServices, userId]
  //     );

  //     return result.rows[0];
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // },

  cancelRegistration: async (registrationId) => {
    try {
      const query = `
        DELETE FROM registrations
        WHERE id = $1;
      `;
      await pool.query(query, [registrationId]);
    } catch (error) {
      console.error("Failed to cancel registration in the database:", error);
      throw error;
    }
  },




};

export default usersModel;
