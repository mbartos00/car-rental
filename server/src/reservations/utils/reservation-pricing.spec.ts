import { calculateReservationPrice, MS_PER_DAY } from './reservation-pricing';

describe('calculateReservationPrice', () => {
  const start = new Date('2026-08-01T10:00:00.000Z');

  it('should charge one day for less than 24 hours', () => {
    const end = new Date(start.getTime() + 10 * 60 * 60 * 1000);

    expect(calculateReservationPrice(80, start, end)).toEqual({
      days: 1,
      subtotal: 80,
      discountPercent: 0,
      totalPrice: 80,
    });
  });

  it('should round partial days up', () => {
    const end = new Date(start.getTime() + MS_PER_DAY + 60 * 60 * 1000);

    expect(calculateReservationPrice(80, start, end).days).toBe(2);
  });

  it('should charge exact full days without rounding up', () => {
    const end = new Date(start.getTime() + 3 * MS_PER_DAY);

    expect(calculateReservationPrice(80, start, end)).toEqual({
      days: 3,
      subtotal: 240,
      discountPercent: 0,
      totalPrice: 240,
    });
  });

  it('should apply a percentage discount to the total', () => {
    const end = new Date(start.getTime() + 2 * MS_PER_DAY);

    expect(calculateReservationPrice(100, start, end, 10)).toEqual({
      days: 2,
      subtotal: 200,
      discountPercent: 10,
      totalPrice: 180,
    });
  });

  it('should round prices to two decimals', () => {
    const end = new Date(start.getTime() + MS_PER_DAY);

    expect(calculateReservationPrice(99.99, start, end, 15).totalPrice).toBe(
      84.99,
    );
  });
});
