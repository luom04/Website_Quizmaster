type EnvConfig = {
  API_BASE_URL: string;
  APP_NAME: string;
};

export const env: EnvConfig = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  APP_NAME: import.meta.env.VITE_APP_NAME || "Quizmaster",
};
