function parsePagination(query) {
  const { page: rawPage, limit: rawLimit } = query;

  if (rawPage !== undefined) {
    if (!/^\d+$/.test(String(rawPage).trim()) || parseInt(rawPage, 10) <= 0) {
      return { error: "page and limit must be positive integers" };
    }
  }

  if (rawLimit !== undefined) {
    if (!/^\d+$/.test(String(rawLimit).trim()) || parseInt(rawLimit, 10) <= 0) {
      return { error: "page and limit must be positive integers" };
    }
  }

  const page = rawPage !== undefined ? parseInt(rawPage, 10) : 1;
  let limit = rawLimit !== undefined ? parseInt(rawLimit, 10) : 10;
  if (limit > 50) {
    limit = 50;
  }

  const skip = (page - 1) * limit;
  const take = limit;

  return { page, limit, skip, take };
}

function buildMeta(page, limit, total) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages
  };
}

module.exports = {
  parsePagination,
  buildMeta
};
