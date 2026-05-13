import { z } from "zod";

export const quizPasswordSchema = z.object({
  password: z.string().min(1, "Vui lòng nhập mật khẩu quiz"),
});

export type QuizPasswordFormValues = z.infer<typeof quizPasswordSchema>;
