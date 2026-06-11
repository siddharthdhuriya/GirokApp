export const fmt = {
  km: (n: number) =>
    n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k' : String(n),
  kmFull: (n: number) => n.toLocaleString('en-US'),
  date: (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
  dateShort: (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
  month: (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  time: (mins: number) => {
    const h = Math.floor(mins / 60), m = mins % 60;
    return (h ? h + 'h ' : '') + (m ? m + 'm' : h ? '' : '0m');
  },
};
