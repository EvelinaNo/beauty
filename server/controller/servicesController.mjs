import servicesModel from "../models/servicesModel.mjs";
// import ratingsModel from "../models/ratingsModel.mjs";
import registrationsModel from "../models/registrationsModel.mjs";
import scheduleModel from "../models/scheduleModel.mjs";

const servicesController = {
  // Visu paslaugu gavimas
  getServices: async (req, res) => {
    try {
      const services = await servicesModel.getServices(req.query);
      // iskonsoliname, kad paziureti kokias paslaugas gavome
      console.log("Services data:", services);
      res.status(200).json(services);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getServicesWithRegistrations: async (req, res) => {
    const { userId } = req.query;

    try {
      const services = await getServices();
      const userRegistrations = await getUserRegistrations(userId);

      res.json({ services, userRegistrations });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Error." });
    }
  },

  // paslaugu paieska
  searchServices: async (req, res) => {
    const { searchQuery } = req.query;
    try {
      const services = await servicesModel.searchServices(searchQuery);
      res.status(200).json(services);
    } catch (error) {
      console.error("Error searching services:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // naujos paslaugos sukurimas
  createService: async (req, res) => {
    try {
      const { title, image, category } = req.body;
      const newService = await servicesModel.createService(
        title,
        image,
        category,
      );

      res.status(201).json(newService);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while creating the service" });
    }
  },

  // Info gavimas apie konkrecia paslauga pagal id
  getServiceById: async (req, res) => {
    try {
      const serviceId = req.params.id;
      const service = await servicesModel.getServiceById(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.status(200).json(service);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // info atnaujinimas apie konkrecia paaslauga pagal id
  updateService: async (req, res) => {
    try {
      const id = req.params.id;
      const updatedService = req.body;
      const service = await servicesModel.updateService(
        id,
        updatedService
      );
      if (!service) {
        res.status(404).json({ message: "Service not found" });
        return;
      }

      res.status(200).json(service);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "An error occurred while updating the service" });
    }
  },

  // Paslaugos pasalinimas pagal id
  deleteService: async (req, res) => {
    try {
      const id = req.params.id;

      // Is pradziu trinam reitingus, tvarkarasti, registracijas
      await servicesModel.deleteRatingsByServiceId(id);
      await scheduleModel.deleteServiceTimeSlot(id);
      await registrationsModel.deleteRegistration(id);

      // Tada trinam pacia paslauga

      const deletedService = await servicesModel.deleteService(id);
      if (!deletedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      res
        .status(200)
        .json({ message: "Service deleted successfully", deletedService });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // atsliepimo sukurimas, netrinti
  createReview: async (req, res) => {
    try {
      const { rating, user_id, service_id } = req.body;

      // Tikriname, ar vartotojas uzsiregistraves paslaugai
      const userRegistered = await registrationsModel.isUserRegistered(
        user_id,
        service_id
      );
      if (!userRegistered) {
        return res
          .status(403)
          .json({ message: "User is not registered for this service" });
      }

      // Tikriname, ar vartotojas dar nepaliko atsiliepimo
      // const existingReview = await servicesModel.getReviewByUserAndService(
      //   user_id,
      //   service_id
      // );
      // if (existingReview) {
      //   return res.status(403).json({
      //     message: "User has already left a review for this service",
      //   });
      // }

      // Sukuriame atsiliepima ir susiejame ji su paslauga
      // const newRating = await servicesModel.createReview(
      //   rating,
      //   user_id,
      //   service_id
      // );

      // Atnaujiname vidurki
      await servicesModel.updateAverageRating(service_id);

      res.status(201).json(newRating);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while creating the review" });
    }
  },

  // Vidurkio gavimas konkreciai paslaugai
  getAverageRatingForService: async (req, res) => {
    try {
      const serviceId = req.params.serviceId;
      const averageRating = await servicesModel.getAverageRatingForService(
        serviceId
      );

      if (averageRating === null) {
        res.status(404).json({ message: "No ratings for this service yet" });
        return;
      }

      res.status(200).json({ rating: averageRating });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Vidurkio atnaujinimas konkreciai paslauagi
  // updateAverageRatingForService: async (req, res) => {
  //   try {
  //     const serviceId = req.params.serviceId;

  //     const updatedService =
  //       await ratingsModel.updateAverageRatingForService(serviceId);

  //     res.status(200).json(updatedService);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: "Internal Server Error" });
  //   }
  // },

  // Paslaugu datu ir laiku gavimas (netrinti!)
  getServiceSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const schedule = await servicesModel.getScheduleByServiceId(id);
      res.status(200).json(schedule);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Paslaugos datos ir laiko atnaujinimas (netrinti!)
  updateServiceSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const { date_times } = req.body;

      const updatedTimeSlots = await servicesModel.updateSchedule(
        id,
        date_times
      );

      res.status(200).json(updatedTimeSlots);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while updating time slots" });
    }
  },

  // Registracijos i paslauga sukurimas, netrinti
  createRegistration: async (req, res) => {
    try {
      const { user_id, service_id, name, date_time } = req.body;

      // Gauname informaciją apie paslauga
      const service = await servicesModel.getServiceById(service_id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

    
      // sukuriame registracija
      const newRegistration = await servicesModel.createRegistration(
        user_id,
        service_id,
        name,
        date_time
      );
      res.status(201).json(newRegistration);
    } catch (error) {
      console.error(error);
      if (
        error.message === "The user is already registered for this service"
      ) {
        res.status(400).json({
          message: "The user is already registered for this service",
        });
      } else {
        res.status(500).json({ message: "Error creating registration" });
      }
    }
  },

  // netrinti, bandau
  updateRegistrationDateTime: async (req, res) => {
    const { date_time } = req.body;
    const { registration_id } = req.params;

    try {
      const updatedRegistration =
        await registrationsModel.updateRegistrationDateTime(
          date_time,
          registration_id
        );

      if (!updatedRegistration) {
        return res.status(404).json({ message: "Registration not found" });
      }

      res.json(updatedRegistration);
    } catch (error) {
      console.error("Error updating registration date:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  },
};
export default servicesController;
