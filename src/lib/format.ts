export const number = (value: number, digits = 2) => new Intl.NumberFormat('pt-PT', { maximumFractionDigits: digits }).format(value);
export const money = (value: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
export const date = (value: string) => new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value));
