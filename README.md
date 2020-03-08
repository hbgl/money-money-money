# Money Money Money

[![Build Status](https://travis-ci.org/hbgl/money-money-money.svg?branch=master)](https://travis-ci.org/hbgl/money-money-money) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/hbgl/money-money-money/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/money-money-money.svg)](https://www.npmjs.com/package/money-money-money)

<span style="color:firebrick;font-size:2em;">**This is a pre-release version. Use at your own risk.**</span>

A JavaScript library for dealing with money safely.

## Why another money library?

Have you ever tried to repesent the US national debt in Iranian rial?

```
23405160032451 USD * 42105 IRR / USD = 985474263166349355 IRR
at 3/5/2020 5:00:00 PM +00:00
```

Many libraries would completely fail or silently lose accuracy. Not this one.

```javascript
const usNationalDebtUsd = new Money('23405160032451', 'USD');
const usNationalDebtIrr = usNationalDebtUsd.convertCurrency('IRR', '42105');
assert.equal('985474263166349355', usNationalDebtIrr.toDecimalString());
assert.equal('IRR', usNationalDebtIrr.currency);
```

## Truth in advertising

You cannot format IRR 985474263166349355 precisely using the built-in `toLocaleString` function because it relies on [`Intl.NumberFormat.format`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat/format) which itself can only format a floating point `Number`.

```javascript
const money = new Money('985474263166349355', 'IRR');
money.toLocaleString(); // throws Error
```

If you are fine with the loss of accuracy then you can call `toLocaleString` with the custom option `precisionHandling`.

```javascript
const { Money } = require('moneta');
const money = new Money('985474263166349355', 'IRR');
console.assert('IRR 985,474,263,166,349,300' === money.toLocaleString(undefined, { precisionHandling: 'unchecked' }));
console.assert('~ IRR 985,474,263,166,349,300' === money.toLocaleString(undefined, { precisionHandling: 'show_imprecision' }));
```

## License

This library is licensed under the [MIT license](https://opensource.org/licenses/MIT).