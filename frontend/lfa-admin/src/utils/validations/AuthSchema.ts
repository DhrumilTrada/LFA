import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "This field is required." })
    .refine(
      (value) => {
        const isEmail = z.string().email().safeParse(value).success;
        return isEmail;
      },
      {
        message: "Must be a valid email address",
      }
    ),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});
