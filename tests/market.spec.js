import Market from '../src';
import Order from '../src/Order';

let market;
beforeEach(() => {
  market = new Market();
});

test('return false when adding nonsense order', () => {
  const order = new Order(100, 100, 'nonsense');
  const res = market.addOrder(order);
  expect(res).toBe(false);
});

test('return true when adding buy', () => {
  const order = new Order(100, 100, 'buy');
  const res = market.addOrder(order);
  expect(res).toBe(true);
});

test('return true when adding sell', () => {
  const order = new Order(100, 100, 'sell');
  const res = market.addOrder(order);
  expect(res).toBe(true);
});

test('fill market buy', () => {
  const sellOrder = new Order(100, 100, 'sell');
  market.addOrder(sellOrder);
  const amount = 10;
  const filled = market.fillAtMarket(amount, 'buy');
  expect(filled).toBe(amount);
});

test('fill market sell', () => {
  const buyOrder = new Order(100, 100, 'buy');
  market.addOrder(buyOrder);
  const amount = 10;
  const filled = market.fillAtMarket(amount, 'sell');
  expect(filled).toBe(amount);
});

test('return 0 when no orders to fill against for market buy', () => {
  const filled = market.fillAtMarket(10, 'buy');
  expect(filled).toBe(0);
});

test('return 0 when no orders to fill against for market sell', () => {
  const filled = market.fillAtMarket(10, 'sell');
  expect(filled).toBe(0);
});

test('partial fill market buy', () => {
  const orderAmount = 100;
  const sellOrder = new Order(100, orderAmount, 'sell');
  market.addOrder(sellOrder);
  const filled = market.fillAtMarket(150, 'buy');
  expect(filled).toBe(orderAmount);
});

test('partial fill market sell', () => {
  const orderAmount = 100;
  const buyOrder = new Order(100, orderAmount, 'buy');
  market.addOrder(buyOrder);
  const filled = market.fillAtMarket(150, 'sell');
  expect(filled).toBe(orderAmount);
});

test('market price is correct after small market buy', () => {
  const sellOrderOne = new Order(110, 100, 'sell');
  const sellOrderTwo = new Order(100, 100, 'sell');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);
  market.fillAtMarket(10, 'buy');
  expect(market.marketPrice).toBe(100);
});

test('market price is correct after large market buy', () => {
  const sellOrderOne = new Order(110, 100, 'sell');
  const sellOrderTwo = new Order(100, 100, 'sell');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);
  market.fillAtMarket(150, 'buy');
  expect(market.marketPrice).toBe(110);
});

test('market price is correct after small market sell', () => {
  const sellOrderOne = new Order(110, 100, 'buy');
  const sellOrderTwo = new Order(100, 100, 'buy');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);
  market.fillAtMarket(10, 'sell');
  expect(market.marketPrice).toBe(110);
});

test('market price is correct after large market sell', () => {
  const sellOrderOne = new Order(110, 100, 'buy');
  const sellOrderTwo = new Order(100, 100, 'buy');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);
  market.fillAtMarket(150, 'sell');
  expect(market.marketPrice).toBe(100);
});
