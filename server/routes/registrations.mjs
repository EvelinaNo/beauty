import express from "express";
import dotenv from "dotenv";
import registrationsController from "../controller/registrationsController.mjs";
import servicesController from "../controller/servicesController.mjs";

dotenv.config();

const router = express.Router();
// netrinti
router.get("/admin/services", registrationsController.getAllRegistrations);
// netrinti
router.put(
  "/admin/confirm/:registrationId",
  registrationsController.confirmRegistration
);

// router.get("/", registrationsController.getRegistrationsDetails);

export default router;
