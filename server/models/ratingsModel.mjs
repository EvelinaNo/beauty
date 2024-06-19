import { pool } from "../db/postgresConnection.mjs";

const ratingsModel = {
  // getRatingsForService: async (serviceId) => {
  //   try {
  //     const result = await pool.query(
  //       "SELECT * FROM ratings WHERE service_id = $1",
  //       [serviceId]
  //     );
  
  //     return result.rows;
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // },

// paslaugos reitingu pasalinimas
  deleteRatingsByServiceId: async (serviceId) => {
    try {
      const query = "DELETE FROM ratings WHERE service_id = $1";
      await pool.query(query, [serviceId]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  
};

export default ratingsModel;