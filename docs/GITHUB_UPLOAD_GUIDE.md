# Panduan upload paket perbaikan DpgTAP ke GitHub

Paket ZIP memuat folder `DpgTAP_GitHub_Upload`. Upload **isi folder tersebut**, bukan folder pembungkus dan bukan ZIP.

## Upload source code

1. Download ZIP perbaikan dan pilih **Extract All** di Windows.
2. Buka folder hasil ekstraksi `DpgTAP_GitHub_Upload`.
3. Buka repository `https://github.com/dpgstoreid/DpgTAP`.
4. Pilih **Add file → Upload files**.
5. Di File Explorer, buka folder `DpgTAP_GitHub_Upload`, tekan `Ctrl+A`, lalu seret seluruh isinya ke halaman GitHub. Struktur harus menempatkan `backend/`, `docs/`, `supabase/`, `web/`, `package.json`, dan `README.md` langsung di root repository.
6. Periksa antrean upload. Pastikan tidak ada `.env.local`, `.env`, API key, service-role key, nomor kartu penuh, atau file transaksi pribadi.
7. Commit dengan pesan `Harden DpgTAP backend and upgrade framework`.

## Hapus konfigurasi ESLint lama

Upload melalui browser GitHub tidak menghapus file yang tidak ada dalam paket baru. Setelah upload dan commit:

1. Buka `web/.eslintrc.json` di GitHub.
2. Klik ikon tempat sampah **Delete this file**.
3. Commit penghapusan dengan pesan `Remove obsolete ESLint legacy config`.

Paket baru menggunakan `web/eslint.config.mjs` (ESLint flat config).

## Jalankan pemeriksaan di Windows

Instal Node.js 24 LTS (atau minimal 22.13), lalu buka PowerShell di folder repository yang sudah di-clone ke komputer. Jalankan:

```powershell
npm run install:web
npm run verify
npm run lint
npm run typecheck
npm run build
```

Untuk menghasilkan lockfile yang dapat dikomit, jalankan `npm run install:web` dengan koneksi npm registry yang aktif. Setelah itu upload `web/package-lock.json` ke GitHub. Jangan commit folder `node_modules`.

## Supabase

- Project Supabase baru: jalankan migration `001_toll_search.sql`, `002_fullstack_core.sql`, lalu `003_lock_down_unreleased_tables.sql`.
- Project yang sudah menjalankan migration 001 dan 002: jalankan migration 003 saja.
- Jangan memasukkan service-role key ke environment browser atau repository publik. Gunakan hanya konfigurasi publik anon key di client; route server memerlukan sesi bearer pengguna.

## Batasan paket

Paket ini belum merupakan deployment produksi. Semua konektor operator tetap nonaktif. Build Next.js penuh, lint berbasis dependency asli, `npm audit`, dan browser QA harus dijalankan setelah instalasi dependency di jaringan yang dapat mengakses npm registry. Tidak ada integrasi Bandel Banget AI, pembayaran, atau pembacaan saldo NFC yang diaktifkan dalam paket ini.
