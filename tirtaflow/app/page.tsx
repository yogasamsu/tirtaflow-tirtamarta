import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Droplets, ShieldCheck, Zap, FileText, Send } from 'lucide-react'

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            {/* Navbar */}
            <header className="px-6 h-20 flex items-center justify-between border-b bg-white/90 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Image
                        src="/assets/logo.png"
                        alt="Logo PDAM Tirtamarta"
                        width={40}
                        height={40}
                        className="h-10 w-auto"
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-xl text-blue-700 tracking-tight leading-none">Tirtaflow</span>
                        <span className="text-[10px] text-slate-500 font-medium tracking-wide">SISTEM SURAT DIGITAL</span>
                    </div>
                </div>
                <nav className="flex gap-4">
                    <Link href="/login">
                        <Button size="default" className="bg-blue-600 hover:bg-blue-700">Login Sistem</Button>
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="flex-1 text-center lg:text-left space-y-8">
                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                                Informasi Mutakhir, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                                    Kerja Mengalir.
                                </span>
                            </h1>
                            <p className="text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Platform digitalisasi persuratan resmi PDAM Tirtamarta.
                                Disposisi cepat, arsip aman, dan analisis cerdas berbasis AI untuk efisiensi birokrasi.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                                <Link href="/login">
                                    <Button size="lg" className="rounded-full px-8 h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                                        Mulai Sekarang
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-lg border-blue-200 text-blue-700 hover:bg-blue-50">
                                    Pelajari Fitur
                                </Button>
                            </div>
                        </div>

                        {/* Hero Image / Visual */}
                        <div className="flex-1 relative w-full max-w-xl lg:max-w-none">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-all duration-500">
                                <Image
                                    src="/assets/office.jpg"
                                    alt="Kantor PDAM Tirtamarta"
                                    width={800}
                                    height={600}
                                    className="object-cover w-full h-auto"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                    <p className="text-white font-medium text-lg">Kantor Pusat PDAM Tirtamarta</p>
                                </div>
                            </div>
                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-blue-100 flex items-center gap-4 animate-bounce-slow hidden md:flex">
                                <div className="bg-green-100 p-3 rounded-full text-green-600">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Beban Kerja</p>
                                    <p className="text-lg font-bold text-slate-900">-40% Waktu Admin</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-cyan-100/50 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 bg-white relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Teknologi Modern untuk Pelayanan Prima</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Tirtaflow mengintegrasikan kecerdasan buatan dengan alur kerja birokrasi yang terstruktur.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                                <FileText className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">OCR Cerdas</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Tidak perlu input manual. Sistem otomatis membaca Surat Masuk (PDF/Gambar), mengekstrak nomor, tanggal, dan perihal secara instan.
                            </p>
                        </div>

                        <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6 text-cyan-600 group-hover:scale-110 transition-transform">
                                <Send className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">Disposisi Digital</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Direksi dapat memberikan instruksi langsung dari dashboard. Notifikasi terkirim otomatis ke Bagian terkait via Email.
                            </p>
                        </div>

                        <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">Arsip Terpusat</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Pencarian surat semudah Googling. Semua dokumen tersimpan aman di cloud dengan hak akses bertingkat.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Decorative Image (Tanks) */}
                <div className="absolute bottom-0 right-0 w-1/3 opacity-10 pointer-events-none grayscale">
                    <Image
                        src="/assets/tanks.png"
                        alt="Tangki Air"
                        width={600}
                        height={400}
                        className="w-full h-auto"
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/assets/logo.png"
                            alt="Logo Footer"
                            width={40}
                            height={40}
                            className="h-10 w-auto opacity-80 grayscale hover:grayscale-0 transition-all"
                        />
                        <span className="font-semibold text-white">PDAM Tirtamarta</span>
                    </div>
                    <div className="text-sm">
                        &copy; {new Date().getFullYear()} Tirtaflow System. Developed for Internal Use.
                    </div>
                </div>
            </footer>
        </div>
    )
}
