import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) { console.log("Admin not found. Run seed.mjs first."); return; }

  // Clean existing tasks for idempotent seed
  await prisma.task.deleteMany({ where: { userId: admin.id } });

  const tasks = [
    // ═══════════════════════════════════════════════════════
    // DAILY TASKS (10)
    // ═══════════════════════════════════════════════════════
    {
      title: "Cek Status Koneksi Internet & WiFi",
      description: "SOP: Buka dashboard Monitoring Uptime → pastikan semua node berstatus UP (hijau). Jika ada status DOWN, laporkan ke ISP terkait dan catat di Record Downtime.",
      frequency: "DAILY"
    },
    {
      title: "Monitor Antrian Tiket Masuk",
      description: "SOP: Login dashboard → cek halaman Ticketing → prioritaskan tiket URGENT/HIGH. Assign tiket baru ke teknisi yang tersedia dalam waktu <30 menit sesuai SLA.",
      frequency: "DAILY"
    },
    {
      title: "Backup Database Sistem Internal",
      description: "SOP: SSH ke Ubuntu Server → jalankan script mysqldump untuk database HRIS, ERP, dan Ticketing IT. Simpan file .sql.gz ke folder backup harian di NAS. Verifikasi ukuran file > 0 byte.",
      frequency: "DAILY"
    },
    {
      title: "Verifikasi Ketersediaan Printer Jaringan",
      description: "SOP: Ping semua IP printer sharing dari terminal. Pastikan print queue tidak macet. Restart CUPS/spooler service jika antrian stuck.",
      frequency: "DAILY"
    },
    {
      title: "Periksa UPS & Kondisi Server Room",
      description: "SOP: Cek indikator LED pada UPS server room. Pastikan suhu ruangan 18°C–24°C. Periksa status VM di Proxmox dashboard (CPU/RAM usage). Jika suhu > 27°C, laporkan ke GA.",
      frequency: "DAILY"
    },
    {
      title: "Update Status Tiket In-Progress",
      description: "SOP: Review semua tiket berstatus IN_PROGRESS. Tambahkan komentar update progress. Jika sudah selesai, ubah status ke RESOLVED dan catat waktu resolusi.",
      frequency: "DAILY"
    },
    {
      title: "Cek Uptime Website Perusahaan",
      description: "SOP: Buka dashboard Monitoring → pastikan wijayainovasi.co.id, mahakaryakosmetika.co.id, dan shinyoungbeauty.com berstatus UP. Jika DOWN, cek hosting provider dan restart service jika perlu.",
      frequency: "DAILY"
    },
    {
      title: "Cek Log Error Aplikasi Web",
      description: "SOP: Akses log server (Vercel dashboard / server Ubuntu) untuk semua website production. Periksa error rate dan response time. Catat jika ada lonjakan error 5xx abnormal.",
      frequency: "DAILY"
    },
    {
      title: "Verifikasi Fungsi Kritis Website",
      description: "SOP: Buka setiap website production → test halaman utama, form kontak, dan halaman produk. Pastikan tidak ada broken link, gambar hilang, atau layout rusak. Catat temuan di tiket.",
      frequency: "DAILY"
    },
    {
      title: "Dokumentasi Aktivitas Harian IT",
      description: "SOP: Isi log aktivitas harian di sistem Ticketing IT. Catat semua insiden, penanganan, dan status akhir hari ini. Ini menjadi bahan laporan mingguan.",
      frequency: "DAILY"
    },

    // ═══════════════════════════════════════════════════════
    // WEEKLY TASKS (8)
    // ═══════════════════════════════════════════════════════
    {
      title: "Review & Analisis Performa SLA",
      description: "SOP: Buka halaman Analytics → Review SLA Compliance Rate. Target minimum 90%. Identifikasi tiket yang breach SLA, analisis akar penyebab, dan buat action plan perbaikan.",
      frequency: "WEEKLY"
    },
    {
      title: "Update Firmware & Patch Keamanan",
      description: "SOP: Cek update firmware untuk router, switch, dan access point. Download patch dari vendor resmi. Jadwalkan instalasi di luar jam kerja (setelah 17:00 atau weekend). Dokumentasikan versi before/after.",
      frequency: "WEEKLY"
    },
    {
      title: "Pembersihan Cache & Temp Files Server",
      description: "SOP: SSH ke Proxmox host → bersihkan log lama di setiap VM Ubuntu Server (journalctl --vacuum-time=7d, apt clean, hapus /tmp/*). Cek disk usage dengan df -h → target free space > 20%. Catat space yang dibebaskan.",
      frequency: "WEEKLY"
    },
    {
      title: "Inspeksi Kabel & Perangkat Fisik Jaringan",
      description: "SOP: Periksa kondisi kabel LAN, patch panel, dan switch di setiap lantai. Pastikan tidak ada kabel longgar/rusak. Periksa indikator LED pada switch/router — semua port aktif harus berkedip hijau.",
      frequency: "WEEKLY"
    },
    {
      title: "Tes Restore Backup Database",
      description: "SOP: Ambil satu file backup harian secara acak. Restore ke database staging/test di VM Proxmox. Verifikasi integritas data (jumlah tabel, record count). Pastikan backup bisa digunakan saat bencana.",
      frequency: "WEEKLY"
    },
    {
      title: "Update Dependensi & Security Patch Website",
      description: "SOP: Jalankan npm audit dan npm outdated pada semua project web. Update dependensi minor/patch yang aman. Untuk major update, buat branch terpisah dan test di staging. Commit & push ke repository.",
      frequency: "WEEKLY"
    },
    {
      title: "Review Performa Website (Speed & SEO)",
      description: "SOP: Jalankan Google PageSpeed Insights / Lighthouse pada setiap website production. Catat skor Performance, Accessibility, dan SEO. Jika skor < 80, identifikasi masalah dan buat tiket optimasi.",
      frequency: "WEEKLY"
    },
    {
      title: "Update Artikel Knowledge Base",
      description: "SOP: Tambahkan atau perbarui minimal 1 artikel di Knowledge Base berdasarkan masalah yang sering muncul di tiket minggu ini. Pastikan artikel di-publish agar bisa dibaca user.",
      frequency: "WEEKLY"
    },

    // ═══════════════════════════════════════════════════════
    // MONTHLY TASKS (7)
    // ═══════════════════════════════════════════════════════
    {
      title: "Laporan Kinerja IT Bulanan",
      description: "SOP: Buka halaman Analytics → Export laporan bulanan (Excel). Isi template laporan resmi dengan data: total tiket, SLA rate, MTTR, uptime %, kategori insiden terbanyak. Serahkan ke manajemen paling lambat tanggal 5 bulan berikutnya.",
      frequency: "MONTHLY"
    },
    {
      title: "Maintenance Preventif Hardware",
      description: "SOP: Jadwalkan pembersihan fisik PC, laptop, dan printer kantor. Bersihkan debu pada kipas/heatsink. Periksa kondisi baterai laptop. Ganti thermal paste jika suhu CPU abnormal. Dokumentasikan unit yang perlu penggantian.",
      frequency: "MONTHLY"
    },
    {
      title: "Review & Optimasi Infrastruktur Jaringan",
      description: "SOP: Analisis bandwidth usage bulanan dari ISP. Bandingkan dengan bulan sebelumnya. Identifikasi bottleneck. Buat proposal upgrade jika utilisasi rata-rata > 80%. Update topologi jaringan jika ada perubahan.",
      frequency: "MONTHLY"
    },
    {
      title: "Inventarisasi Aset IT (Koordinasi dengan GA)",
      description: "SOP: Koordinasi dengan Divisi GA untuk stock opname aset IT (PC, laptop, monitor, printer, UPS, router, switch). Cocokkan data fisik dengan database inventaris GA. Update status aset (aktif/rusak/disposal). Serahkan laporan ke GA Admin.",
      frequency: "MONTHLY"
    },
    {
      title: "Uji Coba Disaster Recovery Plan",
      description: "SOP: Simulasikan skenario bencana (VM crash di Proxmox, database corruption). Uji prosedur failover dan restore dari backup. Ukur RTO dan RPO. Dokumentasikan hasil uji dan gap yang ditemukan.",
      frequency: "MONTHLY"
    },
    {
      title: "Review SSL Certificate & Domain Expiry",
      description: "SOP: Periksa masa berlaku sertifikat SSL untuk semua domain production (wijayainovasi.co.id, mahakaryakosmetika.co.id, shinyoungbeauty.com). Perpanjang minimal 30 hari sebelum expired. Cek juga masa berlaku domain.",
      frequency: "MONTHLY"
    },
    {
      title: "Review Kebijakan SLA & Update Target",
      description: "SOP: Buka halaman Settings > SLA. Evaluasi apakah target response time dan resolution time masih realistis berdasarkan data performa 3 bulan terakhir. Diskusikan perubahan dengan manajemen sebelum update di sistem.",
      frequency: "MONTHLY"
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: { ...task, userId: admin.id, isCompleted: false }
    });
  }

  console.log(`Tasks seeded successfully! (${tasks.length} tasks for ${admin.name})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
