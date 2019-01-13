import React from 'react';
import {render} from 'react-dom';
import {TypeChooser} from 'react-stockcharts/lib/helper';

import Chart from './Chart';
import Market, {Order, MarketOrder} from './Market';
import {getFakeData} from './utils';

class ChartComponent extends React.Component {
  componentDidMount() {
    this.market = new Market();
    this.unsub = this.market.subscribe(trade => this.addTrade(trade));

    this.data = getFakeData();

    setTimeout(() => {
      const sellOrder = new Order(100, 100, 'sell', 'limit');
      this.market.addOrder(sellOrder);
      const amount = 10;
      const marketOrder = new MarketOrder(amount, 'buy');
      this.market.fillAtMarket(marketOrder);
    }, 2000);
  }

  addTrade(trade) {
    if (!this.data.length) {
      this.addNewPeriod();
    }

    const current = this.data[this.data.length - 1];

    if (!current.open) {
      current.open = trade.price;
      current.high = trade.price;
      current.low = trade.price;
    }
    current.close = trade.price;
    current.volume += trade.amount;

    if (current.close > current.high) {
      current.high = current.close;
    }
    if (current.close < current.low) {
      current.low = current.close;
    }

    this.setState({data: this.data});
  }

  addNewPeriod() {
    this.data.push({
      close: null,
      date: new Date(),
      high: null,
      low: null,
      open: null,
      volume: null,
    });
    setTimeout(() => {
      this.addNewPeriod();
    }, 10000);
  }

  render() {
    if (this.state == null) {
      return <div>Loading...</div>;
    }
    return (
      <TypeChooser>
        {type => <Chart type={type} data={this.state.data} />}
      </TypeChooser>
    );
  }
}

render(<ChartComponent />, document.getElementById('root'));
