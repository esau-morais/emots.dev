import { z } from "zod";

export const contactSchema = z.object({
	email: z
		.string()
		.min(1, { message: "please enter your email" })
		.email({ message: "please provide a valid email" })
		.trim(),
	subject: z.string().min(1, { message: "please enter a subject" }).trim(),
	message: z.string().min(1, { message: "please enter a message" }).trim(),
	_gotcha: z
		.string()
		.max(0, { message: "gotcha! why are you trying to fill this field?" })
		.optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;
