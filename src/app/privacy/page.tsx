import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Kebijakan Privasi - AiDorama",
	description: "Kebijakan privasi dan perlindungan data pengguna AiDorama",
};

export default function PrivacyPolicyPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-14 items-center px-4 md:px-6">
					<Link href="/" className="mr-4">
						<Button variant="ghost" size="sm">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Kembali
						</Button>
					</Link>
					<h1 className="font-semibold text-lg">Kebijakan Privasi</h1>
				</div>
			</header>

			{/* Content */}
			<main className="container px-4 py-8 md:px-6">
				<div className="mx-auto max-w-4xl space-y-6">
					{/* Hero Section */}
					<div className="text-center space-y-4 pb-8 px-4">
						<h1 className="font-bold text-3xl md:text-4xl">Kebijakan Privasi AiDorama</h1>
						<p className="text-muted-foreground text-lg">
							Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", { 
								day: "numeric", 
								month: "long", 
								year: "numeric" 
							})}
						</p>
					</div>

					{/* Main Privacy Policy Content */}
					<Card>
						<CardHeader>
							<CardTitle>Komitmen Kami terhadap Privasi Anda</CardTitle>
						</CardHeader>
						<CardContent className="prose prose-gray dark:prose-invert max-w-none">
							<p className="text-lg leading-relaxed">
								Di AiDorama, kami sangat menghargai privasi dan kepercayaan Anda. 
								Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, 
								dan melindungi informasi Anda saat menggunakan platform kami.
							</p>
							
							<div className="mt-6 rounded-lg bg-primary/10 p-4">
								<p className="font-semibold text-primary mb-2 text-sm md:text-base">🔒 Komitmen Utama Kami:</p>
								<ul className="list-disc list-inside space-y-2 text-xs md:text-sm">
									<li>Kami TIDAK menjual data Anda kepada siapa pun</li>
									<li>Kami TIDAK menghasilkan uang dari data pengguna</li>
									<li>Data Anda hanya digunakan untuk memberikan layanan terbaik</li>
								</ul>
							</div>
						</CardContent>
					</Card>

					{/* Data Collection Section */}
					<Card>
						<CardHeader>
							<CardTitle>1. Informasi yang Kami Kumpulkan</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<h3 className="font-semibold text-lg mb-2">a. Informasi Akun</h3>
								<p className="text-muted-foreground mb-2">
									Saat Anda mendaftar di AiDorama, kami mengumpulkan:
								</p>
								<ul className="list-disc list-inside space-y-1 text-sm md:text-base text-muted-foreground ml-2 md:ml-4">
									<li>Nama lengkap atau nama pengguna</li>
									<li>Alamat email</li>
									<li>Foto profil (opsional)</li>
									<li>Bio atau deskripsi profil (opsional)</li>
								</ul>
							</div>

							<div>
								<h3 className="font-semibold text-lg mb-2">b. Data Karakter & Percakapan</h3>
								<p className="text-muted-foreground mb-2">
									Untuk memberikan layanan roleplay AI:
								</p>
								<ul className="list-disc list-inside space-y-1 text-sm md:text-base text-muted-foreground ml-2 md:ml-4">
									<li>Karakter yang Anda buat (nama, deskripsi, kepribadian, avatar)</li>
									<li>Riwayat percakapan dengan karakter AI</li>
									<li>Preferensi pengaturan karakter</li>
								</ul>
							</div>

							<div>
								<h3 className="font-semibold text-lg mb-2">c. Data Teknis</h3>
								<p className="text-muted-foreground mb-2">
									Informasi yang dikumpulkan secara otomatis:
								</p>
								<ul className="list-disc list-inside space-y-1 text-sm md:text-base text-muted-foreground ml-2 md:ml-4">
									<li>Alamat IP (untuk keamanan sesi)</li>
									<li>Informasi browser (user agent)</li>
									<li>Waktu akses dan aktivitas</li>
								</ul>
							</div>
						</CardContent>
					</Card>

					{/* Data Usage Section */}
					<Card>
						<CardHeader>
							<CardTitle>2. Bagaimana Kami Menggunakan Informasi Anda</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground">
								Kami menggunakan informasi yang dikumpulkan HANYA untuk:
							</p>
							
							<div className="space-y-3">
								<div className="flex gap-3">
									<span className="text-xl md:text-2xl flex-shrink-0">✨</span>
									<div className="min-w-0">
										<h4 className="font-semibold text-sm md:text-base">Menyediakan Layanan</h4>
										<p className="text-muted-foreground text-xs md:text-sm">
											Memungkinkan Anda membuat karakter dan melakukan percakapan roleplay dengan AI
										</p>
									</div>
								</div>

								<div className="flex gap-3">
									<span className="text-xl md:text-2xl flex-shrink-0">🔐</span>
									<div className="min-w-0">
										<h4 className="font-semibold text-sm md:text-base">Keamanan & Autentikasi</h4>
										<p className="text-muted-foreground text-xs md:text-sm">
											Menjaga keamanan akun Anda dan mencegah akses tidak sah
										</p>
									</div>
								</div>

								<div className="flex gap-3">
									<span className="text-xl md:text-2xl flex-shrink-0">🚀</span>
									<div className="min-w-0">
										<h4 className="font-semibold text-sm md:text-base">Peningkatan Layanan</h4>
										<p className="text-muted-foreground text-xs md:text-sm">
											Memahami cara pengguna berinteraksi dengan platform untuk meningkatkan pengalaman
										</p>
									</div>
								</div>

								<div className="flex gap-3">
									<span className="text-xl md:text-2xl flex-shrink-0">📧</span>
									<div className="min-w-0">
										<h4 className="font-semibold text-sm md:text-base">Komunikasi Penting</h4>
										<p className="text-muted-foreground text-xs md:text-sm">
											Mengirim email terkait akun, keamanan, atau perubahan layanan (bukan iklan)
										</p>
									</div>
								</div>
							</div>

							<div className="mt-6 rounded-lg bg-primary/10 p-3 md:p-4">
								<p className="font-semibold text-primary mb-2 text-sm md:text-base">❌ Kami TIDAK Pernah:</p>
								<ul className="list-disc list-inside space-y-1 text-xs md:text-sm text-white/80">
									<li>Menjual atau menyewakan data Anda</li>
									<li>Membagikan data Anda untuk iklan pihak ketiga</li>
									<li>Menggunakan data Anda untuk tujuan selain yang disebutkan</li>
								</ul>
							</div>
						</CardContent>
					</Card>

					{/* Data Storage & Security Section */}
					<Card>
						<CardHeader>
							<CardTitle>3. Penyimpanan & Keamanan Data</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<h3 className="font-semibold text-lg mb-2">Lokasi Penyimpanan</h3>
								<p className="text-muted-foreground">
									Data Anda disimpan dengan aman menggunakan layanan cloud terpercaya dengan enkripsi standar industri.
									Server kami menggunakan protokol keamanan terkini untuk melindungi informasi Anda.
								</p>
							</div>

							<div>
								<h3 className="font-semibold text-lg mb-2">Langkah Keamanan</h3>
								<ul className="list-disc list-inside space-y-1 text-sm md:text-base text-muted-foreground ml-2 md:ml-4">
									<li>Enkripsi data saat transit (HTTPS)</li>
									<li>Enkripsi data saat disimpan</li>
									<li>Akses terbatas hanya untuk tim yang berwenang</li>
									<li>Monitoring keamanan 24/7</li>
									<li>Backup rutin untuk mencegah kehilangan data</li>
								</ul>
							</div>

							<div>
								<h3 className="font-semibold text-lg mb-2">Retensi Data</h3>
								<p className="text-muted-foreground">
									Kami menyimpan data Anda selama akun Anda aktif. Jika Anda menghapus akun,
									semua data pribadi akan dihapus permanen dalam waktu 30 hari, kecuali
									jika diperlukan untuk mematuhi kewajiban hukum.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* User Rights Section */}
					<Card>
						<CardHeader>
							<CardTitle>4. Hak-Hak Anda</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground">
								Sebagai pengguna AiDorama, Anda memiliki hak penuh atas data Anda:
							</p>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
								<div className="rounded-lg border p-3 md:p-4">
									<h4 className="font-semibold mb-2 text-sm md:text-base">📋 Akses Data</h4>
									<p className="text-muted-foreground text-xs md:text-sm">
										Anda dapat meminta salinan lengkap data yang kami miliki tentang Anda
									</p>
								</div>

								<div className="rounded-lg border p-3 md:p-4">
									<h4 className="font-semibold mb-2 text-sm md:text-base">✏️ Koreksi Data</h4>
									<p className="text-muted-foreground text-xs md:text-sm">
										Anda dapat memperbarui atau memperbaiki informasi yang tidak akurat
									</p>
								</div>

								<div className="rounded-lg border p-3 md:p-4">
									<h4 className="font-semibold mb-2 text-sm md:text-base">🗑️ Penghapusan Data</h4>
									<p className="text-muted-foreground text-xs md:text-sm">
										Anda dapat meminta penghapusan akun dan semua data terkait
									</p>
								</div>

								<div className="rounded-lg border p-3 md:p-4">
									<h4 className="font-semibold mb-2 text-sm md:text-base">📦 Portabilitas Data</h4>
									<p className="text-muted-foreground text-xs md:text-sm">
										Anda dapat meminta data Anda dalam format yang dapat dibaca mesin
									</p>
								</div>
							</div>

							<div className="mt-4 p-4 bg-muted rounded-lg">
								<p className="text-sm">
									Untuk menggunakan hak-hak ini, silakan hubungi kami melalui email support 
									atau melalui pengaturan akun Anda.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Subscription Model Section */}
					<Card>
						<CardHeader>
							<CardTitle>5. Model Berlangganan</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="rounded-lg bg-primary/10 p-3 md:p-4">
								<p className="font-semibold mb-2 text-sm md:text-base">💎 Rencana Monetisasi Kami</p>
								<p className="text-muted-foreground text-xs md:text-sm">
									AiDorama berencana meluncurkan layanan berlangganan premium untuk mendanai 
									biaya operasional LLM (Large Language Model) dan pengembangan platform.
								</p>
							</div>

							<div>
								<h3 className="font-semibold text-lg mb-2">Prinsip Berlangganan:</h3>
								<ul className="list-disc list-inside space-y-2 text-sm md:text-base text-muted-foreground ml-2 md:ml-4">
									<li>Langganan bersifat opsional - fitur dasar tetap gratis</li>
									<li>Pembayaran hanya untuk akses fitur premium</li>
									<li>Tidak ada biaya tersembunyi atau penjualan data</li>
									<li>Transparansi penuh tentang manfaat premium</li>
								</ul>
							</div>

							<div>
								<h3 className="font-semibold text-lg mb-2">Data Pembayaran:</h3>
								<p className="text-muted-foreground">
									Jika Anda berlangganan, informasi pembayaran akan diproses melalui 
									penyedia layanan pembayaran pihak ketiga yang aman. Kami tidak menyimpan 
									detail kartu kredit atau informasi pembayaran sensitif di server kami.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Third-Party Services Section */}
					<Card>
						<CardHeader>
							<CardTitle>6. Layanan Pihak Ketiga</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground">
								Untuk memberikan layanan terbaik, kami menggunakan beberapa layanan pihak ketiga:
							</p>

							<div className="space-y-3">
								<div className="rounded-lg border p-3">
									<h4 className="font-semibold mb-1 text-sm md:text-base">🤖 Penyedia AI/LLM</h4>
									<p className="text-muted-foreground text-xs md:text-sm">
										Untuk menghasilkan respons karakter AI. Percakapan dikirim ke penyedia 
										LLM dengan enkripsi dan tanpa informasi identitas pribadi.
									</p>
								</div>

								<div className="rounded-lg border p-3">
									<h4 className="font-semibold mb-1 text-sm md:text-base">☁️ Cloud Storage</h4>
									<p className="text-muted-foreground text-xs md:text-sm">
										Untuk menyimpan avatar karakter dan file media. Semua file disimpan 
										dengan akses terbatas dan enkripsi.
									</p>
								</div>

								<div className="rounded-lg border p-3">
									<h4 className="font-semibold mb-1 text-sm md:text-base">📊 Analytics (PostHog)</h4>
									<p className="text-muted-foreground text-xs md:text-sm">
										Untuk memahami penggunaan platform dan meningkatkan pengalaman pengguna. 
										Data yang dikumpulkan bersifat anonim dan agregat.
									</p>
								</div>

								<div className="rounded-lg border p-3">
									<h4 className="font-semibold mb-1 text-sm md:text-base">🔐 Autentikasi</h4>
									<p className="text-muted-foreground text-xs md:text-sm">
										Untuk login yang aman dan manajemen sesi. Password dienkripsi dengan 
										standar industri.
									</p>
								</div>
							</div>

							<div className="mt-4 p-4 bg-amber-500/10 rounded-lg">
								<p className="text-sm">
									<strong>Catatan:</strong> Layanan pihak ketiga memiliki kebijakan privasi mereka sendiri. 
									Kami memilih mitra yang memiliki komitmen kuat terhadap privasi dan keamanan data.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Cookies Section */}
					<Card>
						<CardHeader>
							<CardTitle>7. Cookies dan Teknologi Serupa</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground">
								Kami menggunakan cookies dan teknologi serupa untuk:
							</p>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div className="rounded-lg bg-muted p-3">
									<h4 className="font-semibold text-xs md:text-sm mb-1">🔑 Cookies Esensial</h4>
									<p className="text-muted-foreground text-xs">
										Untuk autentikasi dan menjaga sesi login Anda
									</p>
								</div>

								<div className="rounded-lg bg-muted p-3">
									<h4 className="font-semibold text-xs md:text-sm mb-1">⚙️ Cookies Preferensi</h4>
									<p className="text-muted-foreground text-xs">
										Untuk menyimpan pengaturan tema (terang/gelap) dan preferensi lainnya
									</p>
								</div>

								<div className="rounded-lg bg-muted p-3">
									<h4 className="font-semibold text-xs md:text-sm mb-1">📈 Cookies Analitik</h4>
									<p className="text-muted-foreground text-xs">
										Untuk memahami bagaimana Anda menggunakan platform (anonim)
									</p>
								</div>

								<div className="rounded-lg bg-muted p-3">
									<h4 className="font-semibold text-xs md:text-sm mb-1">🛡️ Cookies Keamanan</h4>
									<p className="text-muted-foreground text-xs">
										Untuk melindungi dari serangan CSRF dan ancaman keamanan lainnya
									</p>
								</div>
							</div>

							<p className="text-muted-foreground text-sm mt-4">
								Anda dapat mengatur browser untuk menolak cookies, namun beberapa fitur 
								platform mungkin tidak berfungsi dengan baik.
							</p>
						</CardContent>
					</Card>

					{/* Children's Privacy Section */}
					<Card>
						<CardHeader>
							<CardTitle>8. Privasi Anak-Anak</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								AiDorama tidak ditujukan untuk anak-anak di bawah usia 17 tahun. 
								Kami tidak dengan sengaja mengumpulkan informasi pribadi dari anak-anak 
								di bawah usia 17 tahun. Jika Anda adalah orang tua atau wali dan mengetahui 
								bahwa anak Anda telah memberikan informasi pribadi kepada kami, silakan 
								hubungi kami untuk penghapusan data.
							</p>
						</CardContent>
					</Card>

					{/* Changes to Policy Section */}
					<Card>
						<CardHeader>
							<CardTitle>9. Perubahan Kebijakan Privasi</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground">
								Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu untuk 
								mencerminkan perubahan dalam praktik kami atau untuk alasan operasional, 
								hukum, atau peraturan lainnya.
							</p>

							<div className="rounded-lg bg-muted p-4">
								<h4 className="font-semibold mb-2">Pemberitahuan Perubahan:</h4>
								<ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-2">
									<li>Email notifikasi untuk perubahan material</li>
									<li>Banner pemberitahuan di platform</li>
									<li>Tanggal "Terakhir diperbarui" di bagian atas kebijakan</li>
								</ul>
							</div>

							<p className="text-muted-foreground text-sm">
								Penggunaan platform setelah perubahan kebijakan berarti Anda menerima 
								kebijakan yang telah diperbarui.
							</p>
						</CardContent>
					</Card>

					{/* Contact Section */}
					<Card>
						<CardHeader>
							<CardTitle>10. Hubungi Kami</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground">
								Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait 
								kebijakan privasi ini atau penanganan data pribadi Anda, jangan ragu 
								untuk menghubungi kami:
							</p>

							<div className="rounded-lg bg-primary/10 p-4 md:p-6 text-center">
								<h3 className="font-bold text-lg md:text-xl mb-2">Tim Privasi AiDorama</h3>
								<div className="space-y-2">
									<p className="text-muted-foreground text-sm md:text-base">
										📧 Email: hello@aidorama.com
									</p>
									<p className="text-muted-foreground text-sm md:text-base">
										📮 Alamat: Yogyakarta, Indonesia
									</p>
								</div>
							</div>

							<div className="mt-6 p-4 bg-muted rounded-lg">
								<p className="text-center text-sm text-muted-foreground">
									Terima kasih telah mempercayai AiDorama. Privasi Anda adalah prioritas kami! 🙏
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Footer */}
					<div className="text-center py-8 text-muted-foreground text-sm">
						<p>© 2025 AiDorama. Tidak ada hak cipta dilindungi.</p>
						<p className="mt-2">
							Dibuat dengan ❤️ untuk komunitas Roleplay Indonesia
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
