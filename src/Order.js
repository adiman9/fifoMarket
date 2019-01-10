export class Trade {
  constructor(amount, price, type) {
    this.price = price;
    this.amount = amount;
    this.initiatingType = type;
  }
}

export default class Order {
  constructor(price, quantity, type, method) {
    this.orderPrice = price;
    this.quantity = quantity;
    this.orderType = type;
    this.orderMethod = method;
    this.filled = 0;
    this.executed = false;
    this.trades = [];
    this.executedTime = null;
    this.createdTime = new Date().getTime();
  }

  validate(order) {
    // TODO flesh out validation Thu 10 Jan 19:32:22 2019
    if (order.orderType === this.orderType) {
      return false;
    }
    return order.orderType === 'buy' || order.orderType === 'sell';
  }

  isFilled() {
    if (this.executed) {
      return true;
    }

    if (this.filled === this.quantity) {
      this.executed = true;
      this.executedTime = new Date().getTime();
      return true;
    }
    return false;
  }

  addTrade(trade) {
    this.filled += trade.amount;
    if (this.filled === this.quantity) {
      this.executed = true;
      this.executedTime = new Date().getTime();
    }
    this.trades.push(trade);
  }

  leftToFill() {
    return this.quantity - this.filled;
  }

  attemptFill(order) {
    let filled = 0;
    let trade;
    if (!this.isFilled() && this.validate(order)) {
      const amtLeft = this.quantity - this.filled;
      if (order.leftToFill() >= amtLeft) {
        trade = new Trade(
          amtLeft,
          this.orderPrice,
          order.orderType
        );
      } else {
        trade = new Trade(
          order.leftToFill(),
          this.orderPrice,
          order.orderType
        );
      }

      this.addTrade(trade);
      order.addTrade(trade);
      filled = trade.amount;
    }

    return {
      order,
      filled,
      trade,
    }
  }
}

export const buyComparator = (orderA, orderB) => {
  let compareVal = 0;
  if (orderA.orderPrice > orderB.orderPrice) {
    compareVal = -1;
  } else if (orderA.orderPrice < orderB.orderPrice) {
    compareVal = 1;
  } else {
    compareVal = orderA.createdTime - orderB.createdTime;
  }

  return compareVal;
}

export const sellComparator = (orderA, orderB) => {
  let compareVal = 0;
  if (orderA.orderPrice > orderB.orderPrice) {
    compareVal = 1;
  } else if (orderA.orderPrice < orderB.orderPrice) {
    compareVal = -1;
  } else {
    compareVal = orderA.createdTime - orderB.createdTime;
  }

  return compareVal;
}
