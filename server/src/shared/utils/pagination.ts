export const buildPagination = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};

export const buildSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
  return { [sortBy]: sortOrder };
};

export const buildPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
