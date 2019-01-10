export default class Order {
  constructor(price, quantity, type) {
    this.orderPrice = price;
    this.quantity = quantity;
    this.orderType = type;
    this.filled = 0;
    this.executed = false;
    this.executedAt = null;
    this.createdTime = new Date().getTime();
  }

  isFilled() {
    if (this.filled) {
      return true;
    }

    if (this.filled === this.quantity) {
      this.executed = true;
      this.executedAt = new Date().getTime();
      return true;
    }
    return false;
  }

  attemptFill(amount) {
    if (!this.isFilled()) {
      const amtLeft = this.quantity - this.filled;
      if (amount >= amtLeft) {
        this.filled = this.quantity;
        this.executed = true;
        this.executedAt = new Date().getTime();
        return amtLeft;
      }
      this.filled += amount;
      return amount;
    }
    return 0;
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
