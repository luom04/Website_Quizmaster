export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  statusCode: number;
  message: string | string[] | Record<string, unknown>;
  path?: string;
  timestamp?: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T>;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedData<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type BackendPaginatedData<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage?: number;
    totalPages?: number;
  };
};

export function normalizePaginatedData<T>(
  payload: BackendPaginatedData<T>,
): PaginatedData<T> {
  return {
    items: payload.data,
    meta: {
      total: payload.meta.total,
      page: payload.meta.page,
      limit: payload.meta.limit,
      totalPages: payload.meta.totalPages ?? payload.meta.lastPage ?? 1,
    },
  };
}
