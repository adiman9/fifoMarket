export default class Order {
  constructor(price, quantity, type, method) {
    this.orderPrice = price;
    this.quantity = quantity;
    this.orderType = type;
    this.orderMethod = method;
    this.filled = 0;
    this.executed = false;
    // TODO populate fills array the ex Thu 10 Jan 01:06:27 2019
    this.fills = [];
    this.executedTime = null;
    this.createdTime = new Date().getTime();
  }

  isFilled() {
    if (this.filled) {
      return true;
    }

    if (this.filled === this.quantity) {
      this.executed = true;
      this.executedTime = new Date().getTime();
      return true;
    }
    return false;
  }

  // TODO maybe allow passing an order in here and fill against that order Thu 10 Jan 01:12:41 2019
  attemptFill(amount) {
    if (!this.isFilled()) {
      const amtLeft = this.quantity - this.filled;
      if (amount >= amtLeft) {
        this.filled = this.quantity;
        this.executed = true;
        this.executedTime = new Date().getTime();
        return amtLeft;
      }
      this.filled += amount;
      return amount;
    }
    return 0;
  }
}

export class Trade {
  constructor(amount, price, type) {
    this.price = price;
    this.amount = amount;
    this.initiatingType = type;
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
