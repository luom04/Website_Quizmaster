export type UserRole = "user" | "admin";

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export type UpdateMeRequest = {
  name?: string;
};
