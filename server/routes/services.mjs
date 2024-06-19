import express from "express";
import dotenv from "dotenv";
import servicesController from "../controller/servicesController.mjs";
import { validate } from "../middleware/schemaValidator.mjs";
import { servicesValidationSchema } from "../validators/serviceValidator.mjs";
import scheduleModel from "../models/scheduleModel.mjs";
import registrationsController from "../controller/registrationsController.mjs";
import servicesModel from "../models/servicesModel.mjs";
import registrationsModel from "../models/registrationsModel.mjs";

dotenv.config();

const router = express.Router();

// visu paslaugu gavimas
router.get("/", servicesController.getServices);

// vienos paslaugos pagal id gavimas
router.get("/:id", servicesController.getServiceById);

// paslaugos istrynimas
router.delete("/:id", servicesController.deleteService);

// paslaugos sukurimas
router.post(
  "/",
  validate(servicesValidationSchema),
  servicesController.createService
);

// paslaugos redagavimas
router.patch(
  "/:id",
  validate(servicesValidationSchema),
  servicesController.updateService
);

// atsiliepimo sukurimas
router.post("/:id/addreview", servicesController.createReview);

// vidurkio gavimas
router.get(
  "/:id/average-rating",
  servicesController.getAverageRatingForService
);

// paslaugos schedule gavimas (netrinti!)
router.get("/:id/schedule", servicesController.getServiceSchedule);

// paslaugos schedule atnaujinimas (netrinti!)
router.patch("/:id/schedule", servicesController.updateServiceSchedule);

// registracijos i paslauga sukurimas
router.post("/:id/register", servicesController.createRegistration);

// patikrinti, ar uzregistruotas
router.get(
  "/registrationStatus",
  registrationsController.checkRegistrationStatus
);

//netrinti, bandau
router.patch(
  "/:id/register-edit/:registrationId",
  servicesController.updateRegistrationDateTime
);

export default router;
