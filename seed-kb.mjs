import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    console.log("Admin not found. Run seed.mjs first.");
    return;
  }

  // Create Categories
  const networkCategory = await prisma.kbCategory.upsert({
    where: { name: 'Jaringan & Internet' },
    update: {},
    create: {
      name: 'Jaringan & Internet',
      description: 'Solusi permasalahan WiFi, LAN, dan koneksi internet',
      icon: 'wifi',
    }
  });

  const hardwareCategory = await prisma.kbCategory.upsert({
    where: { name: 'Hardware & Perangkat' },
    update: {},
    create: {
      name: 'Hardware & Perangkat',
      description: 'Panduan troubleshooting PC, Laptop, dan Printer',
      icon: 'printer',
    }
  });

  const softwareCategory = await prisma.kbCategory.upsert({
    where: { name: 'Software & Aplikasi' },
    update: {},
    create: {
      name: 'Software & Aplikasi',
      description: 'Panduan instalasi dan error pada aplikasi kantor',
      icon: 'code',
    }
  });

  // Create Articles
  await prisma.kbArticle.upsert({
    where: { slug: 'cara-mengatasi-wifi-terputus' },
    update: {},
    create: {
      title: 'Cara Mengatasi Koneksi WiFi Sering Terputus (Limited Access)',
      slug: 'cara-mengatasi-wifi-terputus',
      content: `
        <h2>Langkah Pertama: Restart Perangkat Jaringan</h2>
        <p>Seringkali masalah koneksi dapat diselesaikan dengan me-restart adapter WiFi Anda. Ikuti langkah berikut:</p>
        <ol>
          <li>Klik ikon <strong>Network</strong> pada taskbar di pojok kanan bawah.</li>
          <li>Matikan WiFi dengan mengklik tombol toggle WiFi, tunggu 10 detik.</li>
          <li>Nyalakan kembali WiFi dan coba hubungkan ulang ke jaringan kantor (misal: <em>WIG-Corporate</em>).</li>
        </ol>
        
        <h2>Langkah Kedua: Forget Network</h2>
        <p>Jika masih gagal, sistem operasi mungkin menyimpan cache kredensial yang salah.</p>
        <ul>
          <li>Masuk ke <strong>Settings > Network & Internet > Wi-Fi > Manage known networks</strong>.</li>
          <li>Pilih jaringan yang bermasalah, lalu klik <strong>Forget</strong>.</li>
          <li>Coba sambungkan ulang dan masukkan password terbaru.</li>
        </ul>

        <h2>Langkah Ketiga: Reset Network (Flush DNS)</h2>
        <p>Jika masalah persisten, lakukan reset DNS melalui Command Prompt:</p>
        <pre><code>ipconfig /flushdns
ipconfig /release
ipconfig /renew</code></pre>
        <p><em>Jika masalah tetap berlanjut setelah 3 langkah ini, silakan buat tiket ke IT Support.</em></p>
      `,
      isPublished: true,
      categoryId: networkCategory.id,
      authorId: admin.id,
      tags: 'wifi, internet, no-connection, limited-access',
      viewCount: 152,
      helpfulCount: 45
    }
  });

  await prisma.kbArticle.upsert({
    where: { slug: 'panduan-koneksi-printer-sharing' },
    update: {},
    create: {
      title: 'Panduan Menghubungkan PC ke Printer Sharing (Jaringan Lokal)',
      slug: 'panduan-koneksi-printer-sharing',
      content: `
        <h2>Persyaratan Awal</h2>
        <p>Pastikan PC/Laptop Anda sudah terkoneksi dengan jaringan LAN atau WiFi lokal kantor (Local Internet).</p>

        <h2>Cara Menambahkan Printer Jaringan</h2>
        <ol>
          <li>Buka <strong>Control Panel</strong> dan arahkan ke <strong>Devices and Printers</strong>.</li>
          <li>Klik <strong>Add a printer</strong> di bagian atas window.</li>
          <li>Pilih opsi <em>"The printer that I want isn't listed"</em>.</li>
          <li>Pilih opsi <em>"Select a shared printer by name"</em>.</li>
          <li>Ketikkan alamat IP server printer. Contoh: <code>\\\\192.168.20.5\\HP-LaserJet-M404</code>. Anda bisa melihat daftar alamat IP printer di papan pengumuman IT.</li>
          <li>Klik <strong>Next</strong> dan tunggu hingga proses instalasi driver selesai.</li>
        </ol>
        
        <h2>Troubleshooting Umum</h2>
        <p>Jika muncul error <strong>0x0000011b</strong> saat menyambungkan printer, ini disebabkan oleh update security Windows. Solusi cepatnya adalah menghubungi IT Support untuk melakukan bypass registry print spooler.</p>
      `,
      isPublished: true,
      categoryId: hardwareCategory.id,
      authorId: admin.id,
      tags: 'printer, sharing, hardware, error-0x0000011b',
      viewCount: 310,
      helpfulCount: 112
    }
  });

  await prisma.kbArticle.upsert({
    where: { slug: 'membersihkan-cache-browser' },
    update: {},
    create: {
      title: 'Cara Membersihkan Cache Browser untuk Akses Sistem Internal',
      slug: 'membersihkan-cache-browser',
      content: `
        <h2>Mengapa Perlu Clear Cache?</h2>
        <p>Ketika tim IT melakukan update pada sistem internal (seperti ERP atau HRIS), browser Anda terkadang masih memuat versi lama dari sistem. Membersihkan cache akan memaksa browser mengunduh versi terbaru.</p>

        <h2>Untuk Google Chrome & Microsoft Edge</h2>
        <ol>
          <li>Tekan kombinasi tombol <strong>Ctrl + Shift + Delete</strong> pada keyboard.</li>
          <li>Pada menu pop-up, pilih tab <strong>Advanced</strong>.</li>
          <li>Pada opsi <em>Time range</em>, pilih <strong>All time</strong>.</li>
          <li>Centang kotak <strong>Cookies and other site data</strong> dan <strong>Cached images and files</strong>. (Pastikan <em>Passwords</em> TIDAK tercentang jika Anda tidak ingin kehilangan password yang tersimpan).</li>
          <li>Klik tombol <strong>Clear data</strong>.</li>
        </ol>

        <h2>Hard Reload (Jalan Pintas)</h2>
        <p>Untuk me-refresh halaman tanpa menghapus seluruh cache browser, Anda dapat menggunakan fitur Hard Reload:</p>
        <p>Tekan dan tahan tombol <strong>Ctrl</strong>, lalu tekan tombol <strong>F5</strong>.</p>
      `,
      isPublished: true,
      categoryId: softwareCategory.id,
      authorId: admin.id,
      tags: 'browser, cache, error, web-sistem',
      viewCount: 89,
      helpfulCount: 20
    }
  });

  console.log('Knowledge Base seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
