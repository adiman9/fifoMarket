import TinyQueue from 'tinyqueue';
import Order, {buyComparator, sellComparator} from '../src/Market/Order';

describe('testing comparators different price', () => {
  let orderA;
  let orderB;
  beforeEach(() => {
    orderA = new Order(100, 100, 'sell', 'limit');
    orderB = new Order(101, 100, 'sell', 'limit');
  });

  test('buy comparator different prices', () => {
    const resOne = buyComparator(orderA, orderB);
    const resTwo = buyComparator(orderB, orderA);

    expect(resOne).toBe(1);
    expect(resTwo).toBe(-1);
  });

  test('sell comparator different prices', () => {
    const resOne = sellComparator(orderA, orderB);
    const resTwo = sellComparator(orderB, orderA);

    expect(resOne).toBe(-1);
    expect(resTwo).toBe(1);
  });

  test('sorting using buy comparator', () => {
    const arr = [orderB, orderA];
    const q = new TinyQueue(arr, buyComparator);
    expect(q.pop()).toBe(orderB);
  });

  test('sorting using sell comparator', () => {
    const arr = [orderB, orderA];
    const q = new TinyQueue(arr, sellComparator);
    expect(q.pop()).toBe(orderA);
  });
});

describe('testing comparators same price', () => {
  let orderA;
  let orderB;
  beforeEach(() => {
    orderA = new Order(100, 100, 'sell', 'limit');
    orderA.createdTime = 100;
    orderB = new Order(100, 100, 'sell', 'limit');
    orderB.createdTime = 99;
  });

  test('buy comparator same prices', () => {
    const resOne = buyComparator(orderA, orderB);
    const resTwo = buyComparator(orderB, orderA);

    expect(resOne).toBe(1);
    expect(resTwo).toBe(-1);
  });

  test('sell comparator same prices', () => {
    const resOne = sellComparator(orderA, orderB);
    const resTwo = sellComparator(orderB, orderA);

    expect(resOne).toBe(1);
    expect(resTwo).toBe(-1);
  });

  test('sorting using buy comparator', () => {
    const arr = [orderB, orderA];
    const q = new TinyQueue(arr, buyComparator);
    expect(q.pop()).toBe(orderB);
  });

  test('sorting using sell comparator', () => {
    const arr = [orderB, orderA];
    const q = new TinyQueue(arr, sellComparator);
    expect(q.pop()).toBe(orderB);
  });
});

// TODO tests for validating orders Thu 10 Jan 23:33:02 2019
// test for isFilled
// test for leftToFill
// test for attemptFill
