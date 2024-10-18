export const calculatePaginationData = (countItems, perPage, page) => {
    const totalPages = Math.ceil(countItems / perPage);
    const hasNextPage = Boolean(totalPages - page);
    const hasPreviousPage = page !== 1;

    return {
        page,
        perPage,
        totalItems: countItems,
        totalPages,
        hasPreviousPage,
        hasNextPage,
    };
};
