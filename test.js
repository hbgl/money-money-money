const { describe, it } = require('mocha');
const assert = require('chai').assert;
const { Money, RoundingMode, PrecisionHandling } = require('./index.js');
const Big = require('big.js');
const _ = require('lodash');

const EUR = 'EUR';
const USD = 'USD';
const IQD = 'IQD';

const safeNumbers = [
    '10.00',
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
];

const unsafeNumbers = [
    '12341234123412341234.12',
    '1234123412341235.51',
];

// ISO 4217 currency codes
const Currencies = ['AFN', 'EUR', 'ALL', 'DZD', 'USD', 'EUR', 'AOA', 'XCD', 'XCD', 'ARS', 'AMD', 'AWG', 'AUD', 'EUR', 'AZN', 'BSD', 'BHD', 'BDT', 'BBD', 'BYN', 'EUR', 'BZD', 'XOF', 'BMD', 'INR', 'BTN', 'BOB', 'BOV', 'USD', 'BAM', 'BWP', 'NOK', 'BRL', 'USD', 'BND', 'BGN', 'XOF', 'BIF', 'CVE', 'KHR', 'XAF', 'CAD', 'KYD', 'XAF', 'XAF', 'CLP', 'CLF', 'CNY', 'AUD', 'AUD', 'COP', 'COU', 'KMF', 'CDF', 'XAF', 'NZD', 'CRC', 'XOF', 'HRK', 'CUP', 'CUC', 'ANG', 'EUR', 'CZK', 'DKK', 'DJF', 'XCD', 'DOP', 'USD', 'EGP', 'SVC', 'USD', 'XAF', 'ERN', 'EUR', 'ETB', 'EUR', 'FKP', 'DKK', 'FJD', 'EUR', 'EUR', 'EUR', 'XPF', 'EUR', 'XAF', 'GMD', 'GEL', 'EUR', 'GHS', 'GIP', 'EUR', 'DKK', 'XCD', 'EUR', 'USD', 'GTQ', 'GBP', 'GNF', 'XOF', 'GYD', 'HTG', 'USD', 'AUD', 'EUR', 'HNL', 'HKD', 'HUF', 'ISK', 'INR', 'IDR', 'XDR', 'IRR', 'IQD', 'EUR', 'GBP', 'ILS', 'EUR', 'JMD', 'JPY', 'GBP', 'JOD', 'KZT', 'KES', 'AUD', 'KPW', 'KRW', 'KWD', 'KGS', 'LAK', 'EUR', 'LBP', 'LSL', 'ZAR', 'LRD', 'LYD', 'CHF', 'EUR', 'EUR', 'MOP', 'MKD', 'MGA', 'MWK', 'MYR', 'MVR', 'XOF', 'EUR', 'USD', 'EUR', 'MRU', 'MUR', 'EUR', 'XUA', 'MXN', 'MXV', 'USD', 'MDL', 'EUR', 'MNT', 'EUR', 'XCD', 'MAD', 'MZN', 'MMK', 'NAD', 'ZAR', 'AUD', 'NPR', 'EUR', 'XPF', 'NZD', 'NIO', 'XOF', 'NGN', 'NZD', 'AUD', 'USD', 'NOK', 'OMR', 'PKR', 'USD', 'PAB', 'USD', 'PGK', 'PYG', 'PEN', 'PHP', 'NZD', 'PLN', 'EUR', 'USD', 'QAR', 'EUR', 'RON', 'RUB', 'RWF', 'EUR', 'SHP', 'XCD', 'XCD', 'EUR', 'EUR', 'XCD', 'WST', 'EUR', 'STN', 'SAR', 'XOF', 'RSD', 'SCR', 'SLL', 'SGD', 'ANG', 'XSU', 'EUR', 'EUR', 'SBD', 'SOS', 'ZAR', 'SSP', 'EUR', 'LKR', 'SDG', 'SRD', 'NOK', 'SZL', 'SEK', 'CHF', 'CHE', 'CHW', 'SYP', 'TWD', 'TJS', 'TZS', 'THB', 'USD', 'XOF', 'NZD', 'TOP', 'TTD', 'TND', 'TRY', 'TMT', 'USD', 'AUD', 'UGX', 'UAH', 'AED', 'GBP', 'USD', 'USD', 'USN', 'UYU', 'UYI', 'UYW', 'UZS', 'VUV', 'VES', 'VND', 'USD', 'USD', 'XPF', 'MAD', 'YER', 'ZMW', 'ZWL', 'XBA', 'XBB', 'XBC', 'XBD', 'XTS', 'XXX', 'XAU', 'XPD', 'XPT', 'XAG'];

// #region helpers

function m(amount, currency, roundingMode) {
    return new Money(amount, currency, roundingMode);
}

function b(amount) {
    return new Big(amount);
}

function assoc(fn, left, right, ...args) {
    fn(left, right, ...args);
    fn(right, left, ...args);
}

function formatValue(value) {
    if (value === undefined)
        return 'undefined';
    if (value === null)
        return 'null';
    if (_.isArray(value))
        return `array [${value}]`;
    if (_.isBoolean(value))
        return `boolean ${value}`;
    if (_.isDate(value))
        return `Date ${value}`;
    if (_.isString(value))
        return `string "${value}"`;
    if (_.isNaN(value)) {
        return 'NaN';
    }
    if (_.isNumber(value))
        if (Number.isNaN(value) || value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY)
            return `${value}`;
        else
            return `number ${value}`;
    if (_.isPlainObject(value))
        return `object ${JSON.stringify(value)}`;
    if (_.isObject(value))
        return `object ${value}`;
    return `${value}`;
}

// #endregion

// #region custom assertions

function assertMoneyEq(expected, actual) {
    assert.equal(true, expected.amount.eq(actual.amount));
    assert.equal(expected.currency, actual.currency);
}

// #endregion

describe('construct', () => {
    it('gives me money', () => {
        const money = m(-100, EUR);
        assert.equal(true, b(-100).eq(money.amount));
        assert.equal(EUR, money.currency);
    });

    const validAmounts = [
        [m('3.50', EUR), 3.50, EUR],
        [m('0.17', EUR), '.17', EUR],
        [m('0.17', EUR), '.173', EUR],
        [m('-0.17', EUR), '-.173', EUR],
        [m('0.18', EUR), '0.175', EUR],
        [m('0.18', EUR), '0.173', EUR, RoundingMode.up],
        [m('0.17', EUR), '0.175', EUR, RoundingMode.down],
        [m('-0.18', EUR), '-0.173', EUR, RoundingMode.up],
        [m('-0.17', EUR), '-0.175', EUR, RoundingMode.down],
        [m('0.175', IQD), '0.175', IQD],
        [m('0.175', IQD), '0.1753', IQD],
        [m('0.176', IQD), '0.1755', IQD],
        [m('12341234123412340000', EUR), 12341234123412341234, EUR],
        [m('1234.1234123412341', EUR), 1234.12341234123412341234, EUR],
    ];
    validAmounts.forEach(test => {
        const expected = test.splice(0, 1)[0];
        const [amount, currency, roundingMode] = test;
        let title = null;
        if (roundingMode !== undefined) {
            title = `constructs ${currency} ${amount} rounding ${roundingMode} as ${expected.toLocaleString()}`;
        } else {
            title = `constructs ${currency} ${amount} as ${expected.toLocaleString()}`;
        }
        it(title, () => {
            const actual = m(amount, currency, roundingMode);
            assertMoneyEq(expected, actual);
        });
    });

    const invalidAmounts = [
        undefined,
        null,
        {},
        [],
        true,
        false,
        new Date(),
        '',
        '0xff',
        'asdf',
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NaN,
    ];
    invalidAmounts.forEach(amount => {
        it(`invalid amount ${formatValue(amount)}`, () => {
            assert.throws(() => m(amount, EUR), RangeError);
        });
    });

    const invalidCurrencies = [
        null,
        {},
        [],
        true,
        false,
        new Date(),
        '',
        123,
        'FOOBAR',
    ];
    invalidCurrencies.forEach(currency => {
        it(`invalid currency ${formatValue(currency)}`, () => {
            assert.throws(() => m(100, currency), RangeError);
        });
    });

    it('valid currencies in ISO 4217', () => {
        const moneys = Currencies.map(currency => m('10', currency));
        const moneyCurrencies = moneys.map(m => m.currency);
        assert.deepEqual(Currencies, moneyCurrencies);
    });

    it('valid currency "XXX" not in ISO 4217', () => {
        const money = m('10.00', 'XXX');
        assert.equal('XXX', money.currency);
    });

    it('valid currency normalized to uppercase ("eUr" => "EUR")', () => {
        const money = m('10.00', 'eUr');
        assert.equal('EUR', money.currency);
    });
});

describe('add', () => {
    const tests = [
        [m('101', EUR), m('100', EUR), m('1', EUR)],
        [m('0', EUR), m('101', EUR), m('-101', EUR)],
        [m('0', EUR), m('0', EUR), m('0', EUR)],
        [m('1.57', EUR), m('1.34', EUR), m('0.23', EUR)],
    ];
    tests.forEach(test => {
        const [expected, summand1, summand2] = test;
        it(`${summand1.toLocaleString()} + ${summand2.toLocaleString()} = ${expected.toLocaleString()}`, () => {
            assoc((left, right) => {
                assertMoneyEq(expected, left.add(right));
            }, summand1, summand2);
        });
    });
    const summand1 = m('100.00', EUR);
    const summand2 = m('10.00', USD);
    it(`${summand1.toLocaleString()} + ${summand2.toLocaleString()} throws currency mismatch error`, () => {
        assert.throws(() => summand1.plus(summand2));
    });
});

describe('sub', () => {
    const tests = [
        [m('99.01', EUR), m('101', EUR), m('1.99', EUR)],
    ];
    tests.forEach(test => {
        const [expected, minuend, subtrahend] = test;
        it(`${minuend.toLocaleString()} - ${subtrahend.toLocaleString()} = ${expected.toLocaleString()}`, () => {
            assertMoneyEq(expected, minuend.sub(subtrahend));
        });
    });
    const minuend = m('100.00', EUR);
    const subtrahend = m('10.00', USD);
    it(`${minuend.toLocaleString()} - ${subtrahend.toLocaleString()} throws currency mismatch error`, () => {
        assert.throws(() => minuend.minus(subtrahend));
    });
});

describe('mul', () => {
    const tests = [
        [m('15.85', EUR), m('3.17', EUR), 5],
        [m('0', EUR), m('3.17', EUR), 0],
        [m('5.55', EUR), m('3.17', EUR), 1.75],
        [m('5.55', EUR), m('3.17', EUR), '1.75'],
        [m('5.55', EUR), m('3.17', EUR), b('1.75')],
        [m('5.54', EUR), m('3.17', EUR), '1.75', RoundingMode.down],
    ];
    tests.forEach(test => {
        const [expected, money, factor, roundingMode] = test;
        let title = `${money.toLocaleString()} * ${factor instanceof Big ? factor.toFixed() : factor} = ${expected.toLocaleString()}`;
        if (roundingMode !== undefined) {
            title += ` rounding ${roundingMode}`;
        }
        it(title, () => {
            const product = money.mul(factor, roundingMode);
            assertMoneyEq(expected, product);
        });
    });
});

describe('div', () => {
    const tests = [
        [m('0.63', EUR), m('3.17', EUR), 5],
        [m('0.01', EUR), m('0.50', EUR), 100],
        [m('0.00', EUR), m('0.50', EUR), 100, RoundingMode.down],
    ];
    tests.forEach(test => {
        const [expected, dividend, divisor, roundingMode] = test;
        let title = `${dividend.toLocaleString()} / ${divisor instanceof Big ? divisor.toFixed() : divisor} = ${expected.toLocaleString()}`;
        if (roundingMode !== undefined) {
            title += ` rounding ${roundingMode}`;
        }
        it(title, () => {
            const quotient = dividend.div(divisor, roundingMode);
            assertMoneyEq(expected, quotient);
        });
    });

    it('cannot divide by zero', () => {
        assert.throws(() => m('10.00', EUR).div(0), /Division by zero/);
    });
});

describe('mod', () => {
    const tests = [
        [m('0.63', EUR), m('0.63', EUR), m('5.16', EUR)],
        [m('1.00', EUR), m('7.00', EUR), m('3.00', EUR)],
    ];
    tests.forEach(test => {
        const [expected, money, other] = test;
        it(`${money.toLocaleString()} mod ${other.toLocaleString()} = ${expected.toLocaleString()}`, () => {
            assertMoneyEq(expected, money.mod(other));
        });
    });
    it('cannot mod by zero', () => {
        assert.throws(() => m('10.00', EUR).mod(m('0.00', EUR)), /Division by zero/);
    });
});

describe('eq', () => {
    const tests = [
        [true, m('8.00', EUR), m('8.00', EUR)],
        [false, m('8.00', EUR), m('7.00', EUR)],
        [true, m('0.00', EUR), m('0.00', EUR)],
        [false, m('0.00', EUR), m('0.00', USD)],
    ];
    tests.forEach(test => {
        const [expected, a, b] = test;
        it(`${a.toLocaleString()} ${expected ? '===' : '!=='} ${b.toLocaleString()}`, () => {
            assoc((left, right) => {
                assert.equal(expected, left.eq(right));
            }, a, b);
        });
    });
});

describe('lt', () => {
    const tests = [
        [true, m('5.00', EUR), m('8.00', EUR)],
        [false, m('5.00', EUR), m('3.00', EUR)],
        [false, m('5.00', EUR), m('5.00', EUR)],
    ];
    tests.forEach(test => {
        const [expected, left, right] = test;
        it(`${left.toLocaleString()} < ${right.toLocaleString()} === ${expected}`, () => {
            assert.equal(expected, left.lt(right));
        });
    });
    const left = m('10.00', EUR);
    const right = m('10.00', USD);
    it(`${left.toLocaleString()} < ${right.toLocaleString()} throws currency mismatch error`, () => {
        assert.throws(() => left.lt(right));
    });
});


describe('lte', () => {
    const tests = [
        [true, m('5.00', EUR), m('8.00', EUR)],
        [false, m('5.00', EUR), m('3.00', EUR)],
        [true, m('5.00', EUR), m('5.00', EUR)],
    ];
    tests.forEach(test => {
        const [expected, left, right] = test;
        it(`${left.toLocaleString()} <= ${right.toLocaleString()} === ${expected}`, () => {
            assert.equal(expected, left.lte(right));
        });
    });
    const left = m('10.00', EUR);
    const right = m('10.00', USD);
    it(`${left.toLocaleString()} <= ${right.toLocaleString()} throws currency mismatch error`, () => {
        assert.throws(() => left.lte(right));
    });
});

describe('gt', () => {
    const tests = [
        [true, m('8.00', EUR), m('5.00', EUR)],
        [false, m('3.00', EUR), m('5.00', EUR)],
        [false, m('5.00', EUR), m('5.00', EUR)],
    ];
    tests.forEach(test => {
        const [expected, left, right] = test;
        it(`${left.toLocaleString()} > ${right.toLocaleString()} === ${expected}`, () => {
            assert.equal(expected, left.gt(right));
        });
    });
    const left = m('10.00', EUR);
    const right = m('10.00', USD);
    it(`${left.toLocaleString()} > ${right.toLocaleString()} throws currency mismatch error`, () => {
        assert.throws(() => left.gt(right));
    });
});


describe('gte', () => {
    const tests = [
        [true, m('8.00', EUR), m('5.00', EUR)],
        [false, m('3.00', EUR), m('5.00', EUR)],
        [true, m('5.00', EUR), m('5.00', EUR)],
    ];
    tests.forEach(test => {
        const [expected, left, right] = test;
        it(`${left.toLocaleString()} >= ${right.toLocaleString()} === ${expected}`, () => {
            assert.equal(expected, left.gte(right));
        });
    });
    const left = m('10.00', EUR);
    const right = m('10.00', USD);
    it(`${left.toLocaleString()} >= ${right.toLocaleString()} throws currency mismatch error`, () => {
        assert.throws(() => left.gte(right));
    });
});

describe('cmp', () => {
    const tests = [
        [-1, m('5.00', EUR), m('8.00', EUR)],
        [1, m('5.00', EUR), m('3.00', EUR)],
        [0, m('5.00', EUR), m('5.00', EUR)],
    ];
    tests.forEach(test => {
        const [expected, left, right] = test;
        it(`${left.toLocaleString()} <=> ${right.toLocaleString()} === ${expected}`, () => {
            assert.equal(expected, left.cmp(right));
        });
    });
    const left = m('10.00', EUR);
    const right = m('10.00', USD);
    it(`${left.toLocaleString()} <=> ${right.toLocaleString()} throws currency mismatch error`, () => {
        assert.throws(() => left.cmp(right));
    });
});

describe('abs', () => {
    const tests = [
        [m('0.00', EUR), m('0.00', EUR)],
        [m('2.31', EUR), m('2.31', EUR)],
        [m('2.31', EUR), m('-2.31', EUR)],
    ];
    tests.forEach(test => {
        const [expected, money] = test;
        it(`abs(${money.toLocaleString()}) === ${expected.toLocaleString()}`, () => {
            assertMoneyEq(expected, money.abs());
        });
    });
});

describe('ratioOf', () => {
    const tests = [
        [b('2'), m('4.00', EUR), m('2.00', EUR)],
        [b('1.42857142857142857143'), m('10.00', EUR), m('7.00', EUR)],
        [b('-0.2'), m('10.00', EUR), m('-50.00', EUR)],
        [b('0.00'), m('0.00', EUR), m('2.00', EUR)],
    ];
    tests.forEach(test => {
        const [expected, left, right] = test;
        it(`${left.toLocaleString()} / ${right.toLocaleString()} = ${expected.toFixed()}`, () => {
            assert.equal(true, expected.eq(left.ratioOf(right)));
        });
    });
    it('cannot get ratio of x to zero', () => {
        assert.throws(() => m('10.00', EUR).ratioOf(m('0.00', EUR)), /Division by zero/);
    });
    const left = m('10.00', EUR);
    const right = m('10.00', USD);
    it(`${left.toLocaleString()} / ${right.toLocaleString()} throws currency mismatch`, () => {
        assert.throws(() => left.ratioOf(right));
    });
});

const toLocaleStringTests = [
    ['€1,000.00', m('1000.00', EUR), 'en'],
    ['-€1,000.00', m('-1000.00', EUR), 'en'],
    ['1,000', m('1000.00', EUR), 'en', { style: 'decimal' }],
];

describe('toString', () => {
    safeNumbers.concat(unsafeNumbers).forEach(number => {
        const money = m(number, EUR);
        const expected = `${money.currency} ${b(number).toFixed()}`;
        it(`on ${money} equals ${expected}`, () => {
            assert.equal(expected, money.toString());
        });
    });
});

describe('toDecimalString', () => {
    safeNumbers.concat(unsafeNumbers).forEach(number => {
        const money = m(number, EUR);
        const expected = b(number).toFixed();
        it(`on ${money} equals ${expected}`, () => {
            assert.equal(expected, money.toDecimalString());
        });
    });
});

describe('toLocaleString', () => {
    describe('with \'safe\' precision handling', () => {
        toLocaleStringTests.forEach(test => {
            const [expected, money, locale, options] = test;
            let title = `of ${money} equals '${expected}' for locale '${locale}'`;
            if (options !== undefined) {
                title += ` and options ${JSON.stringify(options)}`;
            }
            it(title, () => {
                let formatOptions = Object.assign({ precisionHandling: PrecisionHandling.safe }, options);
                const formatted = money.toLocaleString(locale, formatOptions);
                assert.equal(expected, formatted);
            });
        });

        unsafeNumbers.forEach(unsafeNumber => {
            it(`throws on unsafe Number ${unsafeNumber}`, () => {
                const money = m(unsafeNumber, EUR);
                assert.throws(() => money.toLocaleString(undefined, { precisionHandling: PrecisionHandling.safe }));
            });
        });
    });

    describe('with \'unchecked\' precision handling', () => {
        it('works like \'safe\' precision handling for safe numbers', () => {
            toLocaleStringTests.forEach(test => {
                const [_, money, locale, options] = test;
                let formatOptions = Object.assign({ precisionHandling: PrecisionHandling.unchecked }, options);
                const expected = money.toLocaleString(locale, formatOptions);
                const formatted = money.toLocaleString(locale, formatOptions);
                assert.equal(expected, formatted);
            });
        });

        const unsafeNumberTests = [
            ['€12,341,234,123,412,340,000.00', m('12341234123412341234.12', EUR), 'en'],
            ['€1,234,123,412,341,235.50', m('1234123412341235.51', EUR), 'en'],
            ['€1234123412341235.5', m('1234123412341235.51', EUR), 'en', { useGrouping: false, minimumFractionDigits: 1, maximumFractionDigits: 1 }],
        ];
        unsafeNumberTests.forEach(test => {
            const [expected, money, locale, options] = test;
            let title = `of ${money} equals '${expected}' for locale '${locale}'`;
            if (options !== undefined) {
                title += ` and options ${JSON.stringify(options)}`;
            }
            it(title, () => {
                const formatOptions = Object.assign({ precisionHandling: PrecisionHandling.unchecked }, options);
                const formatted = money.toLocaleString(locale, formatOptions);
                assert.equal(expected, formatted);
            });
        });
    });

    describe('with \'show_imprecision\' precision handling', () => {
        it('works like \'safe\' precision handling for safe numbers', () => {
            toLocaleStringTests.forEach(test => {
                const [_, money, locale, options] = test;
                let formatOptions = Object.assign({ precisionHandling: PrecisionHandling.show_imprecision }, options);
                const expected = money.toLocaleString(locale, formatOptions);
                const formatted = money.toLocaleString(locale, formatOptions);
                assert.equal(expected, formatted);
            });
        });

        const unsafeNumberTests = [
            ['~ €12,341,234,123,412,340,000.00', m('12341234123412341234.12', EUR), 'en'],
            ['~ €1,234,123,412,341,235.50', m('1234123412341235.51', EUR), 'en'],
            ['~ €1234123412341235.5', m('1234123412341235.51', EUR), 'en', { useGrouping: false, minimumFractionDigits: 1, maximumFractionDigits: 1 }],
        ];
        unsafeNumberTests.forEach(test => {
            const [expected, money, locale, options] = test;
            let title = `of ${money} equals '${expected}' for locale '${locale}'`;
            if (options !== undefined) {
                title += ` and options ${JSON.stringify(options)}`;
            }
            it(title, () => {
                const formatOptions = Object.assign({ precisionHandling: PrecisionHandling.show_imprecision }, options);
                const formatted = money.toLocaleString(locale, formatOptions);
                assert.equal(expected, formatted);
            });
        });

        describe('with customized imprecision formatting', () => {
            class MoneyCustomImprecision extends Money {
                formatImprecision(formatted, locale, options) {
                    if (locale === 'en-US') {
                        return `around ${formatted} or so`;
                    } else if (locale === 'en-UK') {
                        return `circa ${formatted}`;
                    }
                    return super.formatImprecision(formatted, locale, options);
                }
            }
            const customizeImprecisionTests = [
                ['around €12,341,234,123,412,340,000.00 or so', new MoneyCustomImprecision('12341234123412341234.12', EUR), 'en-US'],
                ['circa €12,341,234,123,412,340,000.00', new MoneyCustomImprecision('12341234123412341234.12', EUR), 'en-UK'],
            ];
            customizeImprecisionTests.forEach(test => {
                const [expected, money, locale] = test;
                let title = `of ${money} equals '${expected}' for locale '${locale}'`;
                it(title, () => {
                    const formatted = money.toLocaleString(locale, { precisionHandling: PrecisionHandling.show_imprecision });
                    assert.equal(expected, formatted);
                });
            });
        });
    });

    it('cannot override currency', () => {
        assert.throws(() => m('1000.00', EUR).toLocaleString('en', { currency: USD }));
    });

    it('falls back to default locale and options', () => {
        assert.doesNotThrow(() => m(safeNumbers[0], EUR).toLocaleString());
        assert.throws(() => m(unsafeNumbers[0], EUR).toLocaleString());
    });

    it('rejects invalid values for precisionHandling option', () => {
        const invalidPrecisionHandlingValues = [null, true, {}, [], 123, 'SAFE', 'foobar'];
        invalidPrecisionHandlingValues.forEach(value => {
            assert.throws(() => m('10.00', EUR).toLocaleString(undefined, { precisionHandling: value }));
        });
    });
});

describe('toSafeNumber', () => {
    safeNumbers.forEach(number => {
        const money = m(number, EUR);
        const moneyNumber = money.toSafeNumber();
        it(`on ${money} returns number ${number}`, () => {
            assert.equal(number, moneyNumber);
        });
    });

    unsafeNumbers.forEach(number => {
        const money = m(number, EUR);
        it(`on ${money} throws`, () => {
            assert.throws(() => money.toSafeNumber());
        });
    });
});

describe('isSafeNumber', () => {
    const tests = safeNumbers.map(n => [true, n]).concat(unsafeNumbers.map(n => [false, n]));
    tests.forEach(test => {
        const [expected, number] = test;
        const money = m(number, EUR);
        it(`${expected} on ${money}`, () => {
            assert.equal(expected, money.isSafeNumber());
        });
    });
});

describe('isZero', () => {
    const tests = [
        [true, m('0.00', EUR)],
        [true, m('0.00', USD)],
        [true, m(-0, EUR)],
        [false, m('1.00', EUR)],
        [false, m('-1.00', EUR)],
    ];
    tests.forEach(test => {
        const [expected, money] = test;
        it(`${expected} on ${money.currency} ${money.amount.valueOf()}`, () => {
            assert.equal(expected, money.isZero());
        });
    });
});

const signTests = [
    [-1, m('-1.00', EUR)],
    [1, m('1.00', EUR)],
    [0, m('0.00', EUR)],
    [0, m(-0, EUR)],
];

describe('isNegative', () => {
    signTests.forEach(test => {
        const [expectedSign, money] = test;
        const expected = expectedSign < 0;
        it(`${expected} on ${money.currency} ${money.amount.valueOf()}`, () => {
            assert.equal(expected, money.isNegative());
        });
    });
});

describe('isPositive', () => {
    signTests.forEach(test => {
        const [expectedSign, money] = test;
        const expected = expectedSign > 0;
        it(`${expected} on ${money.currency} ${money.amount.valueOf()}`, () => {
            assert.equal(expected, money.isPositive());
        });
    });
});

describe('sign', () => {
    signTests.forEach(test => {
        const [expected, money] = test;
        it(`${expected} on ${money.currency} ${money.amount.valueOf()}`, () => {
            assert.equal(expected, money.sign());
        });
    });
});

describe('hasSameCurrency', () => {
    const tests = [
        [true, m('10.00', EUR), m('5.00', EUR)],
        [true, m('10.00', EUR), m('0.00', EUR)],
    ];
    tests.forEach(test => {
        const [expected, a, b] = test;
        it(`${expected} on ${a.toLocaleString()} and ${b.toLocaleString()}`, () => {
            assoc((left, right) => {
                assert.equal(expected, left.hasSameCurrency(right));
            }, a, b);
        });
    });
});

describe('customBig', () => {
    describe('with 40 decimal places', () => {
        it('calculates ratio more precisely', () => {
            const big40 = Big();
            big40.DP = 40;

            class Money40 extends Money {
                static get Big() {
                    // Return custom Big constructor.
                    return big40;
                }
            }

            const dividend20 = new Money('10.00', EUR);
            const divisor20 = new Money('7.00', EUR);
            const dividend40 = new Money40('10.00', EUR);
            const divisor40 = new Money40('7.00', EUR);

            assert.equal('1.42857142857142857143', dividend20.ratioOf(divisor20).toFixed());
            assert.equal('1.4285714285714285714285714285714285714286', dividend40.ratioOf(divisor40).toFixed());
        });
    });

    const customRoundingMode = RoundingMode.up;
    describe(`with custom rounding mode '${customRoundingMode}'`, () => {
        const BigUp = Big();
        BigUp.RM = customRoundingMode;
        class MoneyUp extends Money {
            static get Big() {
                return BigUp;
            }
        }
        function m() {
            return new MoneyUp(...arguments);
        }
        {
            const [expected, amount, currency] = [m('1.2', EUR), '1.191', EUR];
            it(`constructs ${currency} ${amount} as ${expected.toLocaleString()}`, () => {
                assertMoneyEq(expected, m(amount, currency));
            });
        }
        {
            const [expected, money, factor] = [m('3.34', EUR), m('10.00', EUR), '0.3333'];
            it(`${money.toLocaleString()} * ${factor} = ${expected.toLocaleString()}`, () => {
                assertMoneyEq(expected, money.mul(factor));
            });
        }
        {
            const [expected, dividend, divisor] = [m('3.34', EUR), m('10.00', EUR), '3'];
            it(`${dividend.toLocaleString()} / ${divisor} = ${expected.toLocaleString()}`, () => {
                assertMoneyEq(expected, dividend.div(divisor));
            });
        }
        {
            const [expected, left, right] = [new BigUp('3.33333333333333333334'), m('10.00', EUR), m('3.00', EUR)];
            it(`${left.toLocaleString()} / ${right.toLocaleString()} = ${expected.toFixed()}`, () => {
                assert.equal(true, expected.eq(left.ratioOf(right)));
            });
        }
    });
});

describe('convertCurrency', () => {
    describe('US national debt from USD to Iranian Rial (IRR)', () => {
        it('23405160032451 USD * 42105 IRR / USD = 985474263166349355 IRR', () => {
            const usNationalDebtUsd = new Money('23405160032451', 'USD');
            const usNationalDebtIrr = usNationalDebtUsd.convertCurrency('IRR', '42105');
            assert.equal('985474263166349355', usNationalDebtIrr.toDecimalString());
            assert.equal('IRR', usNationalDebtIrr.currency);
        });
    });
});