export const COMPANY_NAME = "PT Wijaya Inovasi Gemilang";
export const DEPARTMENT = "Departemen Information Technology (IT)";
export const DOC_DATE = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export interface TaskSopItem { no: number; title: string; sop: string; }
export interface SlaRequestItem { category: string; target: string; notes: string; }

export const DAILY_TASKS: TaskSopItem[] = [
    { no: 1, title: "Pemeriksaan Konektivitas & Kualitas Jaringan Intranet/Internet", sop: "Instruksi Kerja: 1. Login ke sistem monitoring jaringan (Proxmox/RouterOS). 2. Verifikasi status semua interface WAN dan LAN harus dalam keadaan 'UP'. 3. Lakukan ping test ke gateway dan DNS public (contoh: 8.8.8.8) dengan standar latency < 20ms tanpa packet loss. 4. Jika terdeteksi downtime atau anomali traffic, segera hubungi ISP, buka tiket 'Network Incident', dan informasikan ke seluruh departemen. Output: Log harian uptime jaringan 100% atau tercatatnya tiket insiden dengan MTTR maksimal 2 jam." },
    { no: 2, title: "Manajemen & Distribusi Tiket Helpdesk", sop: "Instruksi Kerja: 1. Login ke Dashboard IT Ticketing System pada pukul 08:00 WIB. 2. Filter tiket berdasarkan prioritas (URGENT, HIGH, MEDIUM, LOW). 3. Tiket URGENT/HIGH harus didistribusikan ke staf IT dalam waktu kurang dari 15 menit. 4. Pastikan setiap tiket memiliki status 'In Progress' ketika mulai dikerjakan. Output: Zero unassigned tickets pada akhir jam kerja dan SLA First Response Time terpenuhi." },
    { no: 3, title: "Eksekusi & Verifikasi Backup Database Sistem", sop: "Instruksi Kerja: 1. Akses server database (Ubuntu/Proxmox) via SSH yang aman. 2. Jalankan skrip mysqldump/pg_dump untuk seluruh basis data (HRIS, ERP, Web). 3. Verifikasi ukuran file .sql.gz (tidak boleh 0 byte dan ukurannya harus proporsional dengan hari sebelumnya). 4. Transfer file backup ke Network Attached Storage (NAS) dan pastikan tersinkronisasi ke cloud storage. Output: Log backup sukses harian tersimpan, menjamin integritas data (RPO < 24 Jam)." },
    { no: 4, title: "Inspeksi Infrastruktur Printer Jaringan", sop: "Instruksi Kerja: 1. Akses Print Server atau lakukan ping ke seluruh IP address printer. 2. Buka spooler queue untuk memastikan tidak ada dokumen yang macet (stuck in queue). 3. Jika terjadi stuck, bersihkan antrean (clear spooler) dan restart service CUPS/Print Spooler. 4. Periksa level tinta/toner via Web UI printer. Output: Seluruh printer berfungsi normal dan permintaan pergantian tinta diajukan sebelum habis." },
    { no: 5, title: "Monitoring Kondisi Lingkungan Server Room & UPS", sop: "Instruksi Kerja: 1. Inspeksi fisik ruang server. 2. Cek indikator load dan baterai pada panel UPS (harus berwarna hijau, tidak ada alarm peringatan). 3. Verifikasi suhu ruangan berkisar antara 18°C hingga 22°C dan kelembapan stabil. 4. Jika suhu abnormal, periksa AC dan laporkan ke GA. Output: Server beroperasi pada lingkungan optimal untuk mencegah hardware failure (Overheating)." },
    { no: 6, title: "Monitoring Uptime & Status Website Perusahaan", sop: "Instruksi Kerja: 1. Buka dashboard uptime monitoring (atau curl via terminal). 2. Periksa status wijayainovasi.co.id, mahakaryakosmetika.co.id, dan shinyoungbeauty.com. 3. Verifikasi bahwa tidak ada error 500/502/503. 4. Jika website down, segera restart Nginx/Apache atau container Docker yang relevan. Output: Uptime website publik terjaga pada 99.9% dan isu diselesaikan sebelum ada komplain." },
    { no: 7, title: "Analisis Log Error & Keamanan Web Application", sop: "Instruksi Kerja: 1. Akses dashboard Vercel atau server logs (var/log/nginx/error.log). 2. Cari anomali berupa lonjakan error 404 (indikasi scanning) atau 5xx (server error). 3. Lakukan mitigasi jika terdeteksi serangan brute-force (block IP via firewall). Output: Laporan harian log analisis bersih atau terdapat tindakan preventif terhadap potensi ancaman keamanan." },
    { no: 8, title: "Quality Assurance (QA) Fungsi Kritis Website", sop: "Instruksi Kerja: 1. Akses production site sebagai user biasa. 2. Lakukan simulasi pengisian formulir kontak, pencarian produk, dan navigasi halaman utama. 3. Pastikan SSL valid dan tidak ada layout yang pecah (broken CSS/JS) di desktop maupun mobile. Output: Pengalaman pengguna akhir (End-User Experience) terjamin tanpa adanya cacat fungsi." },
];

export const WEEKLY_TASKS: TaskSopItem[] = [
    { no: 1, title: "Evaluasi SLA & Kinerja Departemen IT", sop: "Instruksi Kerja: 1. Ekspor data performa dari halaman Analytics. 2. Hitung persentase SLA Compliance Rate (Target >= 90%). 3. Identifikasi tiket yang melewati batas waktu penyelesaian (breach). 4. Adakan briefing internal 15 menit untuk membahas akar masalah dan pencegahannya. Output: Laporan evaluasi SLA mingguan yang memetakan efisiensi layanan IT." },
    { no: 2, title: "Manajemen Patching & Pembaruan Firmware", sop: "Instruksi Kerja: 1. Periksa ketersediaan firmware terbaru untuk Router (MikroTik/Cisco), Switch, dan Access Point. 2. Baca rilis catatan (release notes) untuk memastikan stabilitas. 3. Jadwalkan instalasi di luar jam operasional kerja (misal: Sabtu pagi). 4. Buat backup konfigurasi (export config) sebelum instalasi. Output: Seluruh perangkat jaringan memiliki versi firmware yang aman dari kerentanan keamanan terbaru." },
    { no: 3, title: "Optimalisasi Storage Server & Pembersihan Log", sop: "Instruksi Kerja: 1. SSH ke seluruh node Proxmox dan Ubuntu Server. 2. Jalankan perintah 'df -h' untuk memantau kapasitas penyimpanan. 3. Eksekusi 'journalctl --vacuum-time=7d' dan hapus file sampah di '/tmp/'. 4. Pastikan free space selalu berada di atas 20%. Output: Pencegahan sistem crash akibat kondisi disk-full (No Space Left on Device)." },
    { no: 4, title: "Audit Fisik Infrastruktur & Perangkat Jaringan", sop: "Instruksi Kerja: 1. Lakukan inspeksi visual di ruang server dan area kerja. 2. Pastikan susunan kabel UTP/Fiber di patch panel rapi dan tidak melilit. 3. Cek lampu indikator port pada switch untuk memastikan tidak ada loop jaringan atau port mati. Output: Kondisi fisik infrastruktur jaringan sesuai dengan standar keselamatan dan estetika." },
    { no: 5, title: "Simulasi Restore (Disaster Recovery Test Skala Kecil)", sop: "Instruksi Kerja: 1. Ambil salah satu file backup database dari NAS secara acak. 2. Siapkan database environment staging. 3. Lakukan proses import data dan verifikasi apakah jumlah record sesuai dengan data production pada tanggal tersebut. Output: Validasi bahwa file backup tidak corrupt dan dapat digunakan sepenuhnya saat terjadi bencana (Disaster)." },
    { no: 6, title: "Pembaruan Dependensi & Keamanan Source Code Website", sop: "Instruksi Kerja: 1. Buka repository project website (Next.js/React/dll). 2. Jalankan 'npm audit' untuk mendeteksi kerentanan package. 3. Lakukan 'npm update' untuk minor patch, test jalankan server secara lokal. 4. Commit dan deploy ke environment staging sebelum masuk ke production. Output: Source code website aman dari eksploitasi (Zero-Day Vulnerability) melalui dependensi pihak ketiga." },
    { no: 7, title: "Audit Performa Web & Search Engine Optimization (SEO)", sop: "Instruksi Kerja: 1. Jalankan Google Lighthouse atau PageSpeed Insights untuk semua domain utama. 2. Catat metrik LCP, FID, dan CLS. 3. Jika skor kurang dari 80, buat tiket untuk tim Web Dev guna melakukan kompresi aset (gambar/JS). Output: Peringkat SEO dan waktu muat (Load Time) website perusahaan optimal di mesin pencari." },
];

export const MONTHLY_TASKS: TaskSopItem[] = [
    { no: 1, title: "Penyusunan Laporan Kinerja IT Bulanan (Executive Report)", sop: "Instruksi Kerja: 1. Kumpulkan data dari Analytics Dashboard (Total Tiket, MTTR, Uptime %, Rasio Penyelesaian). 2. Buat grafik tren (trendline) insiden dan analisis area infrastruktur yang sering bermasalah. 3. Rangkum pencapaian dan rekomendasi strategis. 4. Serahkan dokumen resmi kepada manajemen pada tanggal 5 setiap bulan. Output: Keputusan manajemen berbasis data terkait anggaran dan kebutuhan SDM/Infrastruktur." },
    { no: 2, title: "Maintenance Preventif Hardware (Cleaning & Thermal)", sop: "Instruksi Kerja: 1. Lakukan pendataan PC, Laptop, dan Printer yang sudah memasuki jadwal pemeliharaan. 2. Matikan unit, bersihkan kipas, heatsink, dan bagian dalam dari debu menggunakan blower/kuas anti-statis. 3. Ganti thermal paste pada CPU yang menunjukkan suhu tinggi. Output: Usia pakai (Lifetime) aset hardware meningkat dan mencegah kerusakan permanen (Hardware Failure)." },
    { no: 3, title: "Evaluasi Topologi & Utilisasi Bandwidth Jaringan", sop: "Instruksi Kerja: 1. Analisis traffic log dari router utama selama satu bulan terakhir. 2. Identifikasi jam sibuk (peak hours) dan IP yang mengonsumsi bandwidth tertinggi (bandwidth hogging). 3. Lakukan re-konfigurasi QoS (Quality of Service) jika diperlukan agar layanan krusial tidak terganggu. Output: Alokasi bandwidth perusahaan terdistribusi secara efisien sesuai prioritas bisnis." },
    { no: 4, title: "Manajemen & Inventarisasi Aset Fisik IT", sop: "Instruksi Kerja: 1. Berkoordinasi dengan divisi General Affairs (GA). 2. Lakukan Stock Opname dengan memindai barcode/QR Code setiap aset IT di seluruh lantai. 3. Update database: Aset mana yang rusak, sedang diperbaiki, dipensiunkan (disposal), atau masih aktif. Output: Akuntabilitas aset perusahaan terjaga dan mencegah hilangnya barang inventaris IT." },
    { no: 5, title: "Audit Keamanan SSL & Perpanjangan Domain Name", sop: "Instruksi Kerja: 1. Cek tanggal kedaluwarsa sertifikat SSL (HTTPS) dan nama domain untuk seluruh website perusahaan. 2. Ajukan permohonan perpanjangan minimal 30 hari sebelum masa aktif berakhir. 3. Pastikan pembayaran telah diproses oleh divisi keuangan. Output: Website selalu dapat diakses secara aman tanpa adanya peringatan 'Not Secure' dari browser pengunjung." },
    { no: 6, title: "Review & Penyesuaian Kebijakan SLA (Service Level Agreement)", sop: "Instruksi Kerja: 1. Buka menu pengaturan SLA di sistem Ticketing. 2. Evaluasi apakah target SLA saat ini (misal: penanganan 2 jam untuk URGENT) masih realistis dengan jumlah SDM yang ada. 3. Ubah parameter sistem jika ada kesepakatan baru dengan pihak manajemen. Output: Target operasional divisi IT yang rasional, dapat dicapai, dan berfokus pada kualitas pelayanan." },
];

export const SLA_REQUESTS: SlaRequestItem[] = [
    { category: "Pembuatan Website Baru (Company Profile)", target: "30 - 45 Hari Kerja", notes: "Prosedur: Pengumpulan requirement, desain UI/UX, development, UAT, dan deployment final." },
    { category: "Pembuatan Website E-Commerce / Custom System", target: "45 - 90 Hari Kerja", notes: "Prosedur: Kompleksitas tinggi (Payment Gateway, API logistik, dan skema database yang kompleks)." },
    { category: "Pengembangan Fitur Baru pada Sistem Existing", target: "10 - 20 Hari Kerja", notes: "Prosedur: Meliputi pembuatan modul baru, integrasi API pihak ketiga, dan stress testing." },
    { category: "Perbaikan Bug Kritis (Website Down / Error 500)", target: "1 - 2 Hari Kerja", notes: "Prosedur: Response darurat. Harus segera ditangani (Hotfix) untuk menjaga kontinuitas bisnis." },
    { category: "Setup Infrastruktur Server & Hosting", target: "2 - 5 Hari Kerja", notes: "Prosedur: Provisioning VM, konfigurasi web server (Nginx), database, SSL, dan domain management." },
    { category: "Instalasi Jaringan Komputer Baru (LAN/WiFi)", target: "3 - 7 Hari Kerja", notes: "Prosedur: Survey lapangan, penarikan kabel, konfigurasi switch/router, dan pengujian throughput." },
    { category: "Pembuatan / Perubahan Akses Email Korporat", target: "1 Hari Kerja", notes: "Prosedur: Setup via Google Workspace/M365, konfigurasi signature, dan assign lisensi." },
    { category: "Instalasi / Setup PC & Laptop Karyawan Baru", target: "1 - 2 Hari Kerja", notes: "Prosedur: Instalasi OS, standar aplikasi kantor (Office, Antivirus), dan pendaftaran ke domain." },
    { category: "Perawatan Hardware (Cleaning / Upgrade RAM/SSD)", target: "1 - 3 Hari Kerja", notes: "Prosedur: Bergantung pada ketersediaan spare parts dari vendor. Mencakup backup data pengguna." },
];

export const JOBDESK_IT_MANAGER = {
    title: "IT Manager / Kepala IT",
    responsibilities: [
        "Memimpin dan mengarahkan seluruh kegiatan IT di perusahaan agar berjalan lancar dan aman.",
        "Mengelola tim IT (Infra dan Software Dev) serta membagi tugas agar target tercapai.",
        "Merancang anggaran kebutuhan IT (seperti pembelian laptop, server, atau software) agar tidak boros.",
        "Mengambil keputusan teknis, seperti memilih internet provider, layanan cloud, atau teknologi website yang akan digunakan.",
        "Menjaga keamanan data penting perusahaan dari ancaman virus, hacker, atau kebocoran data.",
        "Membuat laporan bulanan kepada pimpinan perusahaan mengenai kinerja IT dan masalah yang terjadi.",
        "Membangun aturan kerja (SOP) dan memastikan semua anggota tim IT mengikuti aturan tersebut."
    ],
    kpis: [
        "Layanan utama (Internet, Server, Website) selalu menyala tanpa gangguan (Uptime 99.9%).",
        "Penyelesaian keluhan/tiket karyawan sesuai target waktu (SLA 95%).",
        "Pengeluaran IT tidak melebihi anggaran yang telah disetujui.",
        "Tidak ada kebocoran data atau serangan virus yang merugikan perusahaan."
    ],
};

export const JOBDESK_IT_INFRA = {
    title: "IT Infrastruktur & Helpdesk",
    responsibilities: [
        "Membantu karyawan yang mengalami masalah komputer, laptop, printer, atau jaringan internet (Tugas Helpdesk).",
        "Mengecek dan memastikan kabel internet, WiFi, dan komputer di kantor berfungsi dengan baik setiap hari.",
        "Merawat dan membersihkan perangkat keras (hardware) secara rutin agar tidak cepat rusak.",
        "Membantu menyiapkan komputer, email, dan akun sistem untuk karyawan yang baru masuk kerja.",
        "Melakukan backup data (menyimpan cadangan data) setiap hari agar data tidak hilang jika komputer rusak.",
        "Mencatat semua keluhan dan perbaikan yang sudah dilakukan ke dalam sistem tiket bantuan.",
        "Menghubungi teknisi dari luar (seperti petugas Telkom/Indihome) jika ada masalah internet dari pusat."
    ],
    kpis: [
        "Cepat tanggap: Masalah darurat langsung direspon dalam waktu kurang dari 15 menit.",
        "Banyaknya keluhan karyawan yang berhasil diselesaikan mencapai 90% setiap minggunya.",
        "Pekerjaan rutin (cek WiFi, cek printer, backup) selesai 100% setiap hari.",
        "Karyawan puas dengan pelayanan bantuan IT (Skor Kepuasan minimal 4.5 dari 5.0)."
    ],
};

export const JOBDESK_IT_DEV = {
    title: "IT Software & Web Developer",
    responsibilities: [
        "Membuat, memperbaiki, dan merawat website perusahaan (seperti wijayainovasi.co.id, mahakaryakosmetika.co.id).",
        "Mengelola sistem internal yang dipakai karyawan, seperti sistem absensi (HRIS), laporan, atau ERP.",
        "Memperbaiki error atau bug pada website/sistem secepat mungkin jika ada laporan dari pengguna.",
        "Menulis kode program yang rapi, aman, dan mudah dimengerti agar sistem tidak gampang rusak.",
        "Menghubungkan sistem perusahaan dengan aplikasi luar (misalnya menghubungkan website dengan sistem pembayaran).",
        "Melakukan uji coba (testing) sebelum fitur baru diluncurkan agar tidak ada error saat dipakai karyawan.",
        "Mencatat panduan penggunaan sistem (manual book) agar karyawan tahu cara memakai aplikasi yang baru dibuat."
    ],
    kpis: [
        "Proyek website atau fitur baru selesai tepat waktu sesuai jadwal yang disepakati.",
        "Tidak ada error fatal (bug parah) saat sistem baru saja diluncurkan (Zero Critical Bug).",
        "Website berjalan cepat dan tidak lemot saat dibuka oleh pelanggan.",
        "Keluhan error pada website selesai diperbaiki dalam waktu maksimal 2 hari kerja."
    ],
};
