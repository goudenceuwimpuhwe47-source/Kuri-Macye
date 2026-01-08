export const formatPrice = (price) => {
    if (price === undefined || price === null) return '';
    return `${Number(price).toLocaleString()} Rwf`;
};
