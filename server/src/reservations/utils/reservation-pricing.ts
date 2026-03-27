export const MS_PER_DAY = 86_400_000;

export const calculateReservationPrice = (
  pricePerDay: number,
  startDate: Date,
  endDate: Date,
  discountPercent = 0,
) => {
  const days = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / MS_PER_DAY),
  );
  const subtotal = Math.round(days * pricePerDay * 100) / 100;
  const totalPrice =
    Math.round(subtotal * (1 - discountPercent / 100) * 100) / 100;

  return { days, subtotal, discountPercent, totalPrice };
};
