import TinyQueue from 'tinyqueue';
import {buyComparator, sellComparator} from './Order';

export default class Market {
  constructor() {
    this.buys = new TinyQueue([], buyComparator);
    this.sells = new TinyQueue([], sellComparator);
    this.buyStops = new TinyQueue([], buyComparator);
    this.sellStops = new TinyQueue([], sellComparator);
    this.marketPrice = null;
  }

  addOrder(order) {
    if (order.orderMethod === 'stop') {
      if (order.orderType === 'buy') {
        this.buyStops.push(order);
        return true;
      }
      if (order.orderType === 'sell') {
        this.sellStops.push(order);
        return true;
      }
    } else if (order.orderMethod === 'limit') {
      if (order.orderType === 'buy') {
        this.buys.push(order);
        return true;
      }
      if (order.orderType === 'sell') {
        this.sells.push(order);
        return true;
      }
    }
    return false;
  }

  fillAtMarket(amount, type) {
    let orderBook;
    if (type === 'sell') {
      orderBook = this.buys;
    } else if (type === 'buy') {
      orderBook = this.sells;
    } else {
      return false;
    }

    let totalFilled = 0;
    do {
      const nextOrder = orderBook.peek();
      if (!nextOrder) {
        break;
      }
      const filled = nextOrder.attemptFill(amount - totalFilled);
      if (filled === 0) {
        orderBook.pop();
      } else {
        totalFilled += filled;
        this.marketPrice = nextOrder.orderPrice;
        // TODO create a fill object and save it to the market history Wed  9 Jan 23:22:57 2019
      }
    } while(totalFilled < amount);

    if (type === 'sell') {
      let nextStop = this.sellStops.peek();
      if (nextStop && nextStop.orderPrice < this.marketPrice) {
        nextStop = this.sellStops.pop();
        // TODO populate the stop order with fills Thu 10 Jan 01:08:49 2019
        const filled = this.fillAtMarket(nextStop.orderPrice, 'sell');
        // TODO maybe allow simply passing an order into the fillAtMarket function Thu 10 Jan 01:10:38 2019
      }
    } else if (type === 'buy') {
      let nextStop = this.buyStops.peek();
      if (nextStop && nextStop.orderPrice > this.marketPrice) {
        nextStop = this.buyStops.pop();
        const filled = this.fillAtMarket(nextStop.orderPrice, 'buy');
      }
    }

    // TODO return richer data about fills Thu 10 Jan 01:07:36 2019
    return totalFilled;
  }
}
