export type UserRole = "user" | "admin";

export type User = {
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

export type AdminUser = User & {
  deletedAt: string | null;
  _count?: {
    quizzes: number;
    attempts: number;
  };
};

export type AdminUsersQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  includeDeleted?: boolean;
};

export type AdminUpdateUserRequest = {
  name?: string;
  avatarUrl?: string | null;
  role?: UserRole;
  isActive?: boolean;
};
