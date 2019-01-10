import Market from '../src';
import Order from '../src/Order';

let market;
beforeEach(() => {
  market = new Market();
});

test('return false when adding nonsense order', () => {
  const order = new Order(100, 100, 'nonsense', 'limit');
  const res = market.addOrder(order);
  expect(res).toBe(false);
});

test('return true when adding buy', () => {
  const order = new Order(100, 100, 'buy', 'limit');
  const res = market.addOrder(order);
  expect(res).toBe(true);
});

test('return true when adding sell', () => {
  const order = new Order(100, 100, 'sell', 'limit');
  const res = market.addOrder(order);
  expect(res).toBe(true);
});

test('fill market buy', () => {
  const sellOrder = new Order(100, 100, 'sell', 'limit');
  market.addOrder(sellOrder);
  const amount = 10;
  const marketOrder = new Order(null, amount, 'buy', 'market');
  const filled = market.fillAtMarket(marketOrder);
  expect(filled).toBe(marketOrder);
  expect(marketOrder.filled).toBe(amount);
});

test('fill market sell', () => {
  const buyOrder = new Order(100, 100, 'buy', 'limit');
  market.addOrder(buyOrder);
  const amount = 10;
  const marketOrder = new Order(null, amount, 'sell', 'market');
  const filled = market.fillAtMarket(marketOrder);
  expect(filled).toBe(marketOrder);
  expect(marketOrder.filled).toBe(amount);
});

test('return 0 when no orders to fill against for market buy', () => {
  const marketOrder = new Order(null, 10, 'buy', 'market');
  const filled = market.fillAtMarket(marketOrder);
  expect(filled).toBe(marketOrder);
  expect(marketOrder.filled).toBe(0);
});

test('return 0 when no orders to fill against for market sell', () => {
  const marketOrder = new Order(null, 10, 'sell', 'market');
  const filled = market.fillAtMarket(marketOrder);
  expect(filled).toBe(marketOrder);
  expect(marketOrder.filled).toBe(0);
});

test('partial fill market buy', () => {
  const orderAmount = 100;
  const sellOrder = new Order(100, orderAmount, 'sell', 'limit');
  market.addOrder(sellOrder);
  const marketOrder = new Order(null, 150, 'buy', 'market');
  const filled = market.fillAtMarket(marketOrder);
  expect(filled).toBe(marketOrder);
  expect(marketOrder.filled).toBe(orderAmount);
});

test('partial fill market sell', () => {
  const orderAmount = 100;
  const buyOrder = new Order(100, orderAmount, 'buy', 'limit');
  market.addOrder(buyOrder);
  const marketOrder = new Order(null, 150, 'sell', 'market');
  const filled = market.fillAtMarket(marketOrder);
  expect(filled).toBe(marketOrder);
  expect(marketOrder.filled).toBe(orderAmount);
});

test('market price is correct after small market buy', () => {
  const sellOrderOne = new Order(110, 100, 'sell', 'limit');
  const sellOrderTwo = new Order(100, 100, 'sell', 'limit');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);
  const marketOrder = new Order(null, 10, 'buy', 'market');
  market.fillAtMarket(marketOrder);
  expect(market.marketPrice).toBe(100);
  expect(marketOrder.filled).toBe(10);
});

test('market price is correct after large market buy', () => {
  const sellOrderOne = new Order(110, 100, 'sell', 'limit');
  const sellOrderTwo = new Order(100, 100, 'sell', 'limit');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);
  const marketOrder = new Order(null, 150, 'buy', 'market');
  market.fillAtMarket(marketOrder);
  expect(market.marketPrice).toBe(110);
  expect(marketOrder.filled).toBe(150);
});

test('market price is correct after small market sell', () => {
  const sellOrderOne = new Order(110, 100, 'buy', 'limit');
  const sellOrderTwo = new Order(100, 100, 'buy', 'limit');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);
  const marketOrder = new Order(null, 10, 'sell', 'market');
  market.fillAtMarket(marketOrder);
  expect(market.marketPrice).toBe(110);
  expect(marketOrder.filled).toBe(10);
});

test('market price is correct after large market sell', () => {
  const sellOrderOne = new Order(110, 100, 'buy', 'limit');
  const sellOrderTwo = new Order(100, 100, 'buy', 'limit');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);
  const marketOrder = new Order(null, 150, 'sell', 'market');
  market.fillAtMarket(marketOrder);
  expect(market.marketPrice).toBe(100);
  expect(marketOrder.filled).toBe(150);
});

// TODO test for stops being added Thu 10 Jan 23:34:09 2019
// test for stops being triggered
