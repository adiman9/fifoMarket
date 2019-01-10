import TinyQueue from 'tinyqueue';
import {buyComparator, sellComparator} from './Order';

export default class Market {
  constructor() {
    this.buys = new TinyQueue([], buyComparator);
    this.sells = new TinyQueue([], sellComparator);
    this.buyStops = new TinyQueue([], buyComparator);
    this.sellStops = new TinyQueue([], sellComparator);
    this.marketPrice = null;
    this.history = [];
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

  fillAtMarket(order) {
    let orderBook;
    if (order.orderType === 'sell') {
      orderBook = this.buys;
    } else if (order.orderType === 'buy') {
      orderBook = this.sells;
    } else {
      return false;
    }

    do {
      const nextOrder = orderBook.peek();
      if (!nextOrder) {
        break;
      }
      const result = nextOrder.attemptFill(order);

      if (result.filled === 0) {
        orderBook.pop();
      } else {
        this.marketPrice = nextOrder.orderPrice;
        this.history.push(result.trade);
      }
    } while(!order.isFilled());

    if (order.orderType === 'sell') {
      let nextStop = this.sellStops.peek();
      if (nextStop && nextStop.orderPrice < this.marketPrice) {
        nextStop = this.sellStops.pop();
        const filled = this.fillAtMarket(nextStop);
      }
    } else if (order.orderType === 'buy') {
      let nextStop = this.buyStops.peek();
      if (nextStop && nextStop.orderPrice > this.marketPrice) {
        nextStop = this.buyStops.pop();
        const filled = this.fillAtMarket(nextStop);
      }
    }

    return order;
  }
}