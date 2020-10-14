# Money Money Money

[![Build Status](https://travis-ci.org/hbgl/money-money-money.svg?branch=master)](https://travis-ci.org/hbgl/money-money-money) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/hbgl/money-money-money/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/money-money-money.svg)](https://www.npmjs.com/package/money-money-money)

<span style="color:firebrick;font-size:2em;">**This is a pre-release version. Use at your own risk.**</span>

A JavaScript library for dealing with money safely.

## Installation

```bash
npm install money-money-money
```

## Basic usage

```javascript
const { Money } = require('money-money-money');
const money = new Money('100', 'EUR');
console.log(money.toLocaleString());
```

## Why another money library?

Have you ever tried to repesent the US national debt in Iranian rial?

```
27067291392010 USD * 42105 IRR / USD = 1139668304060581050 IRR
```

Many libraries would completely fail or silently lose accuracy. Not this one.

```javascript
const { Money } = require('money-money-money');
const usNationalDebtUsd = new Money('27067291392010', 'USD');
const usNationalDebtIrr = usNationalDebtUsd.convertCurrency('IRR', '42105');
console.assert('1139668304060581050' === usNationalDebtIrr.toDecimalString());
console.assert('IRR' === usNationalDebtIrr.currency);
```

## Truth in advertising

You cannot format IRR 985474263166349355 precisely using the built-in `toLocaleString` function because it relies on [`Intl.NumberFormat.format`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat/format) which itself can only format a floating point `Number`.

```javascript
const { Money } = require('money-money-money');
const money = new Money('1139668304060581050', 'IRR');
money.toLocaleString(); // throws Error
```

If you are fine with the loss of accuracy then you can call `toLocaleString` with the custom option `precisionHandling`.

```javascript
const { Money } = require('money-money-money');
const money = new Money('1139668304060581050', 'IRR');
console.assert('IRR\u00A01,139,668,304,060,581,000' === money.toLocaleString(undefined, { precisionHandling: 'unchecked' }));
console.assert('~\u00A0IRR\u00A01,139,668,304,060,581,000' === money.toLocaleString(undefined, { precisionHandling: 'show_imprecision' }));
```

## Dependencies

This library depends on [big.js](https://github.com/MikeMcl/big.js/) for arbitrary-precision decimal arithmetic.

Additionally the environment must provide [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat). It is used to determine how many decimal places the currency uses and for formatting. `Intl.NumberFormat` is supported by [all major browsers](https://caniuse.com/#feat=mdn-javascript_builtins_intl_numberformat) and all recent Node.js versions.

**Please note:** By default, Node.js versions 12 and earlier [are built with small-icu](https://nodejs.org/docs/latest-v12.x/api/intl.html). This means that formatting may be unavailable for your locale. For more information see the [Node.js Internationalization Support](https://nodejs.org/docs/latest-v12.x/api/intl.html). Since Node version 13 the `full-icu` is included by default.


## License

This library is licensed under the [MIT license](https://opensource.org/licenses/MIT).