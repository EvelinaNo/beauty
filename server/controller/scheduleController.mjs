import scheduleModel from "../models/scheduleModel.mjs";

const scheduleController = {
  getServiceSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const schedule = await scheduleModel.getServiceSchedule(id);
      res.status(200).json(schedule);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Naujos datos ir laiko paslaugai pridejimas (netrinti)
  addServiceTimeSlot: async (req, res) => {
    try {
      const { service_id, date_time } = req.body;
      const newTimeSlot = await scheduleModel.addServiceTimeSlot(
        service_id,
        date_time
      );

      res.status(201).json(newTimeSlot);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while adding time slot" });
    }
  },
// paslaugos schedule trinimas (netrinti)
  deleteServiceTimeSlot: async (req, res) => {
    try {
      const { id } = req.params;
      await scheduleModel.deleteServiceTimeSlot(id);
      res.status(200).json({ message: "Time slot deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while deleting time slot" });
    }
  },
};

export default scheduleController;
