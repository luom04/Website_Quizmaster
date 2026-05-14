export type Category = {
  id: string;
  name: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    quizzes: number;
  };
};

export type CategoryQueryParams = {
  search?: string;
  includeDeleted?: boolean;
};

export type CreateCategoryRequest = {
  name: string;
};

export type UpdateCategoryRequest = {
  name: string;
};
