type EnvConfig = {
  API_BASE_URL: string;
  APP_NAME: string;
  ENABLE_AGENTATION: boolean;
};

export const env: EnvConfig = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  APP_NAME: import.meta.env.VITE_APP_NAME || "Quizmaster",
  ENABLE_AGENTATION: import.meta.env.VITE_ENABLE_AGENTATION === "true",
};
