import TinyQueue from 'tinyqueue';
import {buyComparator, sellComparator} from './Order';

export default class Market {
  constructor() {
    this.buys = new TinyQueue([], buyComparator);
    this.sells = new TinyQueue([], sellComparator);
    this.buyStops = new TinyQueue([], sellComparator);
    this.sellStops = new TinyQueue([], buyComparator);
    this.history = [];
    this.subscribers = [];
  }

  getMarketPrice() {
    if (this.history.length) {
      return this.history[this.history.length - 1].price;
    }
    return null;
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

      if (result.filled === 0 && nextOrder.isFilled()) {
        orderBook.pop();
      } else if (result.filled === 0 && !nextOrder.isFilled()) {
        break;
      } else {
        this._publish(result.trade);
        this.history.push(result.trade);
      }
    } while (!order.isFilled());

    if (order.orderType === 'sell') {
      let nextStop = this.sellStops.peek();
      if (nextStop && nextStop.orderPrice >= this.getMarketPrice()) {
        nextStop = this.sellStops.pop();
        this.fillAtMarket(nextStop);
      }
    } else if (order.orderType === 'buy') {
      let nextStop = this.buyStops.peek();
      if (nextStop && nextStop.orderPrice <= this.getMarketPrice()) {
        nextStop = this.buyStops.pop();
        this.fillAtMarket(nextStop);
      }
    }

    return order;
  }

  _publish(trade) {
    this.subscribers.forEach(fn => fn(trade));
  }

  subscribe(fn) {
    this.subscribers.push(fn);

    return () => {
      const index = this.subscribers.indexOf(fn);

      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
}
