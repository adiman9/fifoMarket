import {tsvParse} from 'd3-dsv';

function parseData(parse) {
  return d => {
    const obj = d;
    obj.date = parse(d.date);
    obj.open = +d.open;
    obj.high = +d.high;
    obj.low = +d.low;
    obj.close = +d.close;
    obj.volume = +d.volume;

    return obj;
  };
}

export function getData() {
  const promiseIntraDayDiscontinuous = fetch(
    'https://cdn.rawgit.com/rrag/react-stockcharts/master/docs/data/MSFT_INTRA_DAY.tsv',
  )
    .then(response => response.text())
    .then(data => tsvParse(data, parseData(d => new Date(+d))));
  return promiseIntraDayDiscontinuous;
}

export function getFakeData() {
  const NUM_DATA_POINTS = 100;
  const data = [];
  const ts = new Date().getTime();
  let previousClose = 100 + Math.random() * 60 - 30;

  for (let i = NUM_DATA_POINTS; i >= 0; i--) {
    const close = 100 + Math.random() * 60 - 30;
    let low;
    let high;
    if (close < previousClose) {
      low = close - Math.random() * 10;
      high = previousClose + Math.random() * 10;
    } else {
      low = previousClose - Math.random() * 10;
      high = close + Math.random() * 10;
    }
    data.push({
      open: previousClose,
      low,
      high,
      close,
      volume: 100,
      date: new Date(ts - 60000 * i),
    });
    previousClose = close;
  }
  return data;
}

export default {};
