import { checkSchema } from "express-validator";

export const servicesValidationSchema = checkSchema({
  title: {
    trim: true,
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: "Title must be between 2 and 50 characters",
    },
    isString: {
      errorMessage: "Title must be a string",
    },
  },
  image: {
    optional: true,
    trim: true,
    isURL: {
      errorMessage: "Image must be a valid URL",
    },
  },
});