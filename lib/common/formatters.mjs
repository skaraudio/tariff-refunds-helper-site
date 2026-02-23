const CURRENCY_FORMATTER = new Intl.NumberFormat(undefined, {
   currency: 'USD',
   style: 'currency'
});

export function formatCurrency(number) {
   return CURRENCY_FORMATTER.format(number);
}

const NUMBER_FORMATTER = new Intl.NumberFormat(undefined);

export function formatNumber(number) {
   return NUMBER_FORMATTER.format(number);
}

const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat(undefined, {
   notation: 'compact'
});

export function formatCompactNumber(number) {
   return COMPACT_NUMBER_FORMATTER.format(number);
}

export function kFormatter(num) {
   return Math.abs(num) > 999
      ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'k'
      : Math.sign(num) * Math.abs(num);
}
