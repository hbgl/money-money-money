const Big = require('big.js');

/**
 * Caches {@link NumberFormatEntry}s for currency codes.
 * @type {Map<string,NumberFormatEntry>}
 */
const currencyNumberFormats = new Map();

const RoundingMode = Object.freeze({
    down: 0,
    up: 3,
    halfUp: 1,
    halfEven: 2,
});

const PrecisionHandling = Object.freeze({
    safe: 'safe',
    unchecked: 'unchecked',
    show_imprecision: 'show_imprecision',
});

class Money {
    /**
     * @param {any} amount
     * @param {string} currency
     */
    constructor(amount, currency, roundingMode) {
        // Validate and normalize currency.
        const numberFormatEntry = NumberFormatEntry.get(currency);
        currency = numberFormatEntry.options.currency;

        // Parse and round decimal digits according to the currency.
        const parsedAmount = this.constructor.parseAmount(amount);
        const roundedAmount = this.constructor.roundCurrencyFraction(parsedAmount, currency, roundingMode);

        this.amount = roundedAmount;
        this.currency = currency;
    }

    static create(amount, currency) {
        return new this(amount, currency);
    }

    static createUnchecked(amount, currency) {
        let money = Object.create(this.prototype);
        money.amount = amount;
        money.currency = currency;
        return money;
    }

    add(other) {
        return this.constructor.applyUnitOp('plus', this, other);
    }

    sub(other) {
        return this.constructor.applyUnitOp('minus', this, other);
    }

    mul(n, roundingMode) {
        return this.constructor.applyScalarOp('times', this, n, roundingMode);
    }

    div(n, roundingMode) {
        return this.constructor.applyScalarOp('div', this, n, roundingMode);
    }

    mod(other) {
        return this.constructor.applyUnitOp('mod', this, other);
    }

    eq(other) {
        return this.currency === other.currency && this.amount.eq(other.amount);
    }

    lt(other) {
        return this.constructor.applyCmpOp('lt', this, other);
    }

    lte(other) {
        return this.constructor.applyCmpOp('lte', this, other);
    }

    gt(other) {
        return this.constructor.applyCmpOp('gt', this, other);
    }

    gte(other) {
        return this.constructor.applyCmpOp('gte', this, other);
    }

    cmp(other) {
        return this.constructor.applyCmpOp('cmp', this, other);
    }

    abs() {
        return this.constructor.createUnchecked(this.amount.abs(), this.currency);
    }

    ratioOf(other) {
        verifyCompatibleCurrency('ratioOf', this.currency, other.currency);
        return this.amount.div(other.amount);
    }

    toString() {
        return `${this.currency} ${this.toDecimalString()}`;
    }

    toLocaleString(locale, options) {
        const formatOptions = Object.assign({
            style: 'currency',
            currency: this.currency,
        }, options);

        // If number is formatted as currency then the currency code cannot be overwritten.
        if (formatOptions.style === 'currency' && formatOptions.currency !== this.currency) {
            throw new Error('Overriding the currency via the \'currency\' option is not allowed.');
        }

        let precisionHandling = formatOptions.precisionHandling;
        if (precisionHandling === undefined) {
            precisionHandling = PrecisionHandling.safe;
        } else {
            if (!Object.prototype.hasOwnProperty.call(PrecisionHandling, precisionHandling)) {
                throw new Error(`Invalid value for option precisionHandling: ${precisionHandling}`);
            }
            // Do not expose custom option.
            delete formatOptions.precisionHandling;
        }

        let number = null;
        if (precisionHandling === PrecisionHandling.unchecked || precisionHandling === PrecisionHandling.show_imprecision) {
            number = this.toNumberUnchecked();
        } else {
            number = this.toSafeNumber(); // Might throw
        }

        const formatted = number.toLocaleString(locale, formatOptions);
        if (precisionHandling === PrecisionHandling.show_imprecision && !this.isSafeNumber()) {
            return this.formatImprecision(formatted, locale, formatOptions);
        }
        return formatted;
    }

    /**
     * @protected
     * @param {*} formatted
     * @param {*} locale
     * @param {*} options
     */
    formatImprecision(formatted) {
        return '~\u00A0' + formatted;
    }

    toDecimalString() {
        return this.amount.toFixed();
    }

    toSafeNumber() {
        const number = this.toSafeNumberOrNull();
        if (number === null) {
            throw new RangeError(`Cannot format Money using the 'toLocaleString' because the amount ${this.amount.toFixed()} cannot be accurately represented by an ECMAScript Number.`);
        }
        return number;
    }

    toSafeNumberOrNull() {
        // Round trip from Big to Number to Big and check for equality.
        // Could probably be implemented more efficiently but this works.
        const amount = this.amount;
        const fixed = amount.toFixed();
        const number = Number.parseFloat(fixed);
        const big = this.constructor.roundCurrencyFraction(new this.constructor.Big(number), this.currency);
        if (amount.eq(big)) {
            return number;
        } else {
            return null;
        }
    }


    toNumberUnchecked() {
        const amount = this.amount;
        const fixed = amount.toFixed();
        const number = Number.parseFloat(fixed);
        return number;
    }

    convertCurrency(currency, ratio) {
        return new this.constructor(this.amount.times(ratio), currency);
    }

    isSafeNumber() {
        return this.toSafeNumberOrNull() !== null;
    }

    isZero() {
        return isBigZero(this.amount);
    }

    isNegative() {
        return this.sign() < 0;
    }

    isPositive() {
        return this.sign() > 0;
    }

    sign() {
        return isBigZero(this.amount) ? 0 : this.amount.s;
    }

    hasSameCurrency(other) {
        return this.currency === other.currency;
    }

    static get defaultRoundingMode() {
        return this.Big.RM;
    }

    static get Big() {
        return Big;
    }

    /**
     * @private
     */
    static roundCurrencyFraction(big, currency, roundingMode) {
        const fractionDigits = getCurrencyFractionDigits(currency);
        roundingMode = roundingMode !== undefined ? roundingMode : this.defaultRoundingMode;
        return big.round(fractionDigits, roundingMode);
    }

    /**
     * @private
     */
    static applyUnitOp(op, self, other) {
        verifyCompatibleCurrency(op, self.currency, other.currency);
        let amount = self.amount[op](other.amount);
        return this.createUnchecked(amount, self.currency);
    }

    /**
     * @private
     */
    static applyScalarOp(op, self, n, roundingMode) {
        const currency = self.currency;
        let amount = self.amount[op](n);
        amount = this.roundCurrencyFraction(amount, currency, roundingMode);
        return this.createUnchecked(amount, currency);
    }

    /**
     * @private
     */
    static applyCmpOp(op, self, other) {
        verifyCompatibleCurrency(op, self.currency, other.currency);
        return self.amount[op](other.amount);
    }

    /**
     * @private
     */
    static parseAmount(amount) {
        try {
            return new this.Big(amount);
        } catch (e) {
            throw new RangeError(`Invalid amount: ${amount}`);
        }
    }
}

class NumberFormatEntry {
    /**
     * @param {Intl.NumberFormat} numberFormat
     */
    constructor(numberFormat) {
        this.numberFormat = numberFormat;
        this.options = numberFormat.resolvedOptions();
    }

    static get(currency) {
        let entry = currencyNumberFormats.get(currency);
        if (entry === undefined) {
            const numberFormat = new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: currency,
            });
            entry = new NumberFormatEntry(numberFormat);
            currencyNumberFormats.set(currency, entry);
        }
        return entry;
    }
}

function getCurrencyFractionDigits(currency) {
    const entry = NumberFormatEntry.get(currency);
    return entry.options.minimumFractionDigits;
}

function isBigZero(big) {
    return big.c.length === 1 && big.c[0] === 0;
}

function verifyCompatibleCurrency(op, currency1, currency2) {
    if (currency1 !== currency2) {
        throw new Error(`Cannot apply operation ${op} to currencies ${currency1} and ${currency2}.`);
    }
}

// Exports
module.exports = {
    Money,
    RoundingMode,
    PrecisionHandling,
};
