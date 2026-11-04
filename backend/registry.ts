import type { TollOperatorAdapter } from './types';

// Conservative master list only. Adapters stay disabled until written authorization,
// a verified technical interface, privacy review, and owner-controlled testing exist.
const names = [
  ['JM', 'Jasa Marga / Travoy'],
  ['ASTRA', 'Astra Infra Toll Road'],
  ['SERBARAJA', 'Serbaraja'],
  ['BSD', 'BSD Toll'],
  ['CPI', 'Citra Persada Infrastruktur'],
  ['JLB', 'Jalan Lingkar Barat'],
  ['MAKASSAR', 'Makassar / JTSE'],
  ['JTD', 'JTD'],
  ['OTHER_BUJT', 'Operator/BUJT lainnya'],
] as const;

export const registry: TollOperatorAdapter[] = names.map(([code, name]) => ({
  code,
  name,
  enabled: false,
  allowedDomains: [],
  async search() {
    return {
      code,
      name,
      status: 'not_configured',
      message: 'Konektor resmi belum dikonfigurasi atau belum memperoleh otorisasi.',
      transactions: [],
    };
  },
}));
