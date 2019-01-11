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
  expect(market.getMarketPrice()).toBe(100);
  expect(marketOrder.filled).toBe(10);
});

test('market price is correct after large market buy', () => {
  const sellOrderOne = new Order(110, 100, 'sell', 'limit');
  const sellOrderTwo = new Order(100, 100, 'sell', 'limit');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);
  const marketOrder = new Order(null, 150, 'buy', 'market');
  market.fillAtMarket(marketOrder);
  expect(market.getMarketPrice()).toBe(110);
  expect(marketOrder.filled).toBe(150);
});

test('market price is correct after small market sell', () => {
  const buyOrderOne = new Order(110, 100, 'buy', 'limit');
  const buyOrderTwo = new Order(100, 100, 'buy', 'limit');
  market.addOrder(buyOrderOne);
  market.addOrder(buyOrderTwo);
  const marketOrder = new Order(null, 10, 'sell', 'market');
  market.fillAtMarket(marketOrder);
  expect(market.getMarketPrice()).toBe(110);
  expect(marketOrder.filled).toBe(10);
});

test('market price is correct after large market sell', () => {
  const buyOrderOne = new Order(110, 100, 'buy', 'limit');
  const buyOrderTwo = new Order(100, 100, 'buy', 'limit');
  market.addOrder(buyOrderOne);
  market.addOrder(buyOrderTwo);
  const marketOrder = new Order(null, 150, 'sell', 'market');
  market.fillAtMarket(marketOrder);
  expect(market.getMarketPrice()).toBe(100);
  expect(marketOrder.filled).toBe(150);
});

test('correctly adds buy stops', () => {
  const buyStopOne = new Order(110, 100, 'buy', 'stop');
  const buyStopTwo = new Order(100, 100, 'buy', 'stop');
  market.addOrder(buyStopOne);
  market.addOrder(buyStopTwo);
  expect(market.buyStops.length).toBe(2);
});

test('correctly adds sell stops', () => {
  const sellStopOne = new Order(110, 100, 'sell', 'stop');
  const sellStopTwo = new Order(100, 100, 'sell', 'stop');
  market.addOrder(sellStopOne);
  market.addOrder(sellStopTwo);
  expect(market.sellStops.length).toBe(2);
});

test('market triggers sell stops', () => {
  const buyOrderOne = new Order(110, 100, 'buy', 'limit');
  const buyOrderTwo = new Order(100, 160, 'buy', 'limit');
  market.addOrder(buyOrderOne);
  market.addOrder(buyOrderTwo);

  const sellStopOne = new Order(110, 100, 'sell', 'stop');
  const sellStopTwo = new Order(100, 100, 'sell', 'stop');
  market.addOrder(sellStopOne);
  market.addOrder(sellStopTwo);
  expect(market.sellStops.length).toBe(2);

  const marketOrder = new Order(null, 90, 'sell', 'market');
  market.fillAtMarket(marketOrder);

  expect(market.sellStops.length).toBe(0);
  expect(sellStopOne.executed).toBe(true);
  expect(sellStopOne.filled).toBe(100);
  expect(sellStopOne.trades.length).toBe(2);
  expect(sellStopTwo.executed).toBe(false);
  expect(sellStopTwo.filled).toBe(70);
  expect(sellStopTwo.trades.length).toBe(1);
});

test('market only triggers necessary sell stops', () => {
  const buyOrderOne = new Order(110, 1000, 'buy', 'limit');
  const buyOrderTwo = new Order(100, 160, 'buy', 'limit');
  market.addOrder(buyOrderOne);
  market.addOrder(buyOrderTwo);

  const sellStopOne = new Order(110, 100, 'sell', 'stop');
  const sellStopTwo = new Order(100, 100, 'sell', 'stop');
  market.addOrder(sellStopOne);
  market.addOrder(sellStopTwo);
  expect(market.sellStops.length).toBe(2);

  const marketOrder = new Order(null, 90, 'sell', 'market');
  market.fillAtMarket(marketOrder);

  expect(market.sellStops.length).toBe(1);
  expect(sellStopOne.executed).toBe(true);
  expect(sellStopOne.filled).toBe(100);
  expect(sellStopOne.trades.length).toBe(1);
  expect(sellStopTwo.executed).toBe(false);
  expect(sellStopTwo.filled).toBe(0);
  expect(sellStopTwo.trades.length).toBe(0);
});

test('market triggers buy stops', () => {
  const sellOrderOne = new Order(110, 100, 'sell', 'limit');
  const sellOrderTwo = new Order(100, 160, 'sell', 'limit');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);

  const buyStopOne = new Order(100, 100, 'buy', 'stop');
  const buyStopTwo = new Order(105, 100, 'buy', 'stop');
  market.addOrder(buyStopOne);
  market.addOrder(buyStopTwo);
  expect(market.buyStops.length).toBe(2);

  const marketOrder = new Order(null, 90, 'buy', 'market');

  market.fillAtMarket(marketOrder);

  expect(market.buyStops.length).toBe(0);
  expect(buyStopOne.executed).toBe(true);
  expect(buyStopOne.filled).toBe(100);
  expect(buyStopOne.trades.length).toBe(2);
  expect(buyStopTwo.executed).toBe(false);
  expect(buyStopTwo.filled).toBe(70);
  expect(buyStopTwo.trades.length).toBe(1);
});

test('market only triggers necessary buy stops', () => {
  const sellOrderOne = new Order(110, 100, 'sell', 'limit');
  const sellOrderTwo = new Order(100, 1600, 'sell', 'limit');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);

  const buyStopOne = new Order(100, 100, 'buy', 'stop');
  const buyStopTwo = new Order(105, 100, 'buy', 'stop');
  market.addOrder(buyStopOne);
  market.addOrder(buyStopTwo);
  expect(market.buyStops.length).toBe(2);

  const marketOrder = new Order(null, 90, 'buy', 'market');

  market.fillAtMarket(marketOrder);

  expect(market.buyStops.length).toBe(1);
  expect(buyStopOne.executed).toBe(true);
  expect(buyStopOne.filled).toBe(100);
  expect(buyStopOne.trades.length).toBe(1);
  expect(buyStopTwo.executed).toBe(false);
  expect(buyStopTwo.filled).toBe(0);
  expect(buyStopTwo.trades.length).toBe(0);
});

test('market price should update on buy stops filling', () => {
  const sellOrderOne = new Order(110, 100, 'sell', 'limit');
  const sellOrderTwo = new Order(100, 160, 'sell', 'limit');
  const sellOrderThree = new Order(150, 160, 'sell', 'limit');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);
  market.addOrder(sellOrderThree);

  const buyStopOne = new Order(100, 100, 'buy', 'stop');
  const buyStopTwo = new Order(110, 100, 'buy', 'stop');
  market.addOrder(buyStopOne);
  market.addOrder(buyStopTwo);
  expect(market.buyStops.length).toBe(2);

  const marketOrder = new Order(null, 90, 'buy', 'market');

  market.fillAtMarket(marketOrder);

  expect(market.buyStops.length).toBe(0);
  expect(market.getMarketPrice()).toBe(150);
});

test('market price should update on sell stops filling', () => {
  const buyOrderOne = new Order(110, 100, 'buy', 'limit');
  const buyOrderTwo = new Order(100, 160, 'buy', 'limit');
  const buyOrderThree = new Order(90, 160, 'buy', 'limit');
  market.addOrder(buyOrderOne);
  market.addOrder(buyOrderTwo);
  market.addOrder(buyOrderThree);

  const sellStopOne = new Order(110, 100, 'sell', 'stop');
  const sellStopTwo = new Order(100, 100, 'sell', 'stop');
  market.addOrder(sellStopOne);
  market.addOrder(sellStopTwo);
  expect(market.sellStops.length).toBe(2);

  const marketOrder = new Order(null, 160, 'sell', 'market');
  market.fillAtMarket(marketOrder);

  expect(market.sellStops.length).toBe(0);
  expect(market.getMarketPrice()).toBe(90);
});

test('market fill should reject buy limit below market', () => {
  const sellOrderOne = new Order(110, 100, 'sell', 'limit');
  const sellOrderTwo = new Order(100, 160, 'sell', 'limit');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);
  // done so market has a price
  const buyMarket = new Order(null, 10, 'buy', 'market');
  market.fillAtMarket(buyMarket);

  const buyLimit = new Order(80, 160, 'buy', 'limit');
  market.fillAtMarket(buyLimit);

  expect(buyLimit.filled).toBe(0);
  expect(buyLimit.executed).toBe(false);
});

test('market fill should accept buy limit above market', () => {
  const sellOrderOne = new Order(110, 100, 'sell', 'limit');
  const sellOrderTwo = new Order(100, 160, 'sell', 'limit');
  market.addOrder(sellOrderOne);
  market.addOrder(sellOrderTwo);
  // done so market has a price
  const buyMarket = new Order(null, 10, 'buy', 'market');
  market.fillAtMarket(buyMarket);

  const buyLimit = new Order(150, 160, 'buy', 'limit');
  market.fillAtMarket(buyLimit);

  expect(buyLimit.filled).toBe(160);
  expect(buyLimit.executed).toBe(true);
});

test('market fill should reject sell limit above market', () => {
  const buyOrderOne = new Order(110, 100, 'buy', 'limit');
  const buyOrderTwo = new Order(100, 160, 'buy', 'limit');
  market.addOrder(buyOrderOne);
  market.addOrder(buyOrderTwo);
  // done so market has a price
  const sellMarket = new Order(null, 10, 'sell', 'market');
  market.fillAtMarket(sellMarket);

  const sellLimit = new Order(150, 160, 'sell', 'limit');
  market.fillAtMarket(sellLimit);

  expect(sellLimit.filled).toBe(0);
  expect(sellLimit.executed).toBe(false);
});

test('market fill should accept sell limit below market', () => {
  const buyOrderOne = new Order(110, 100, 'buy', 'limit');
  const buyOrderTwo = new Order(100, 160, 'buy', 'limit');
  market.addOrder(buyOrderOne);
  market.addOrder(buyOrderTwo);
  // done so market has a price
  const sellMarket = new Order(null, 10, 'sell', 'market');
  market.fillAtMarket(sellMarket);

  const sellLimit = new Order(90, 160, 'sell', 'limit');
  market.fillAtMarket(sellLimit);

  expect(sellLimit.filled).toBe(160);
  expect(sellLimit.executed).toBe(true);
});

// TODO maybe make stop order a sub class of Order to add a triggered property Fri 11 Jan 18:36:15 2019
