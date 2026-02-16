const { price } = require('../rentalPrice');

const toTimestamp = (date) => Date.parse(`${date}T12:00:00Z`);

describe('rental price calculation', () => {
  test('rejects underage drivers', () => {
    const result = price('Tallinn', 'Tartu', toTimestamp('2024-01-01'), toTimestamp('2024-01-01'), 'Compact', 17, 2);

    expect(result).toBe('Driver too young - cannot quote the price');
  });

  test('rejects drivers with a license held for less than a year', () => {
    const result = price('Tallinn', 'Tartu', toTimestamp('2024-01-02'), toTimestamp('2024-01-02'), 'Compact', 30, 0.5);

    expect(result).toBe('Driver license held for less than 1 year - cannot rent');
  });

  test('rejects young drivers renting non-compact cars', () => {
    const result = price('Tallinn', 'Tartu', toTimestamp('2024-01-03'), toTimestamp('2024-01-03'), 'Electric', 21, 2);

    expect(result).toBe('Drivers 21 y/o or less can only rent Compact vehicles');
  });

  test('charges regular weekday pricing during low season', () => {
    const result = price('Tallinn', 'Tartu', toTimestamp('2024-01-01'), toTimestamp('2024-01-03'), 'Compact', 50, 10);

    expect(result).toBe('$150');
  });

  test('adds a weekend premium for weekend days', () => {
    const result = price('Tallinn', 'Tartu', toTimestamp('2024-01-04'), toTimestamp('2024-01-06'), 'Compact', 50, 10);

    expect(result).toBe('$152.5');
  });

  test('handles reversed pickup and dropoff dates', () => {
    const result = price('Tallinn', 'Tartu', toTimestamp('2024-01-10'), toTimestamp('2024-01-08'), 'Compact', 40, 5);

    expect(result).toBe('$120');
  });

  test('applies racer surcharge and seasonal pricing for young racer drivers', () => {
    const result = price('Tallinn', 'Tartu', toTimestamp('2024-06-03'), toTimestamp('2024-06-04'), 'Racer', 25, 5);

    expect(result).toBe('$86.25');
  });

  test('applies inexperienced driver surcharges during high season', () => {
    const result = price('Tallinn', 'Tartu', toTimestamp('2024-05-06'), toTimestamp('2024-05-07'), 'Compact', 30, 1);

    expect(result).toBe('$124.2');
  });

  test('adds the novice high-season surcharge without the experience multiplier', () => {
    const result = price('Tallinn', 'Tartu', toTimestamp('2024-05-06'), toTimestamp('2024-05-07'), 'Compact', 40, 2.5);

    expect(result).toBe('$126.5');
  });

  test('applies long rental discounts during low season', () => {
    const result = price('Tallinn', 'Tartu', toTimestamp('2024-02-05'), toTimestamp('2024-02-15'), 'Cabrio', 30, 5);

    expect(result).toBe('$299.7');
  });

  test('handles unknown vehicle types with default pricing', () => {
    const result = price('Tallinn', 'Tartu', toTimestamp('2024-02-05'), toTimestamp('2024-02-05'), 'Truck', 40, 5);

    expect(result).toBe('$40');
  });

  test('handles missing vehicle types gracefully', () => {
    const result = price('Tallinn', 'Tartu', toTimestamp('2024-11-06'), toTimestamp('2024-11-06'), '', 30, 5);

    expect(result).toBe('$30');
  });
});
