import express from "express";
import scheduleController from "../controller/scheduleController.mjs";

const router = express.Router();

router.get("/:id", scheduleController.getServiceSchedule);

// Naujos datos ir laiko paslaugai pridejimas (netrinti)
router.post("/:id/addTimeSlot", scheduleController.addServiceTimeSlot);



// router.put('/:id/updateTimeSlot/:timeSlotId', scheduleController.updateServiceTimeSlot);
router.delete(
  "/:id/deleteTimeSlot/:timeSlotId",
  scheduleController.deleteServiceTimeSlot
);

export default router;
