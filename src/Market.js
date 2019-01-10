import TinyQueue from 'tinyqueue';
import {buyComparator, sellComparator} from './Order';

export default class Market {
  constructor() {
    this.buys = new TinyQueue([], buyComparator);
    this.sells = new TinyQueue([], sellComparator);
    this.marketPrice = null;
  }

  addOrder(order) {
    // TODO add stop orders Thu 10 Jan 00:04:07 2019
    if (order.orderType === 'buy') {
      this.buys.push(order);
      return true;
    }
    if (order.orderType === 'sell') {
      this.sells.push(order);
      return true;
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

    return totalFilled;
  }
}
