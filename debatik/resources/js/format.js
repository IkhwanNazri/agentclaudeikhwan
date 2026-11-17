export const rm = (value) =>
    'RM' + Number(value).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const compact = (value) =>
    value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 1 : 1).replace(/\.0$/, '')}K` : String(value);
