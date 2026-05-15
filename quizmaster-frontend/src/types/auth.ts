import type { User } from "@/types/user";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
};

export type ResetPasswordRequest = {
  email: string;
  recoveryCode: string;
  newPassword: string;
};

export type AuthTokenData = {
  access_token: string;
};
export type RegisterAuthData = {
  recoveryCode: string;
};

export type ResetPasswordData = {
  message: string;
  recoveryCode: string;
};

export type AuthUser = User;
