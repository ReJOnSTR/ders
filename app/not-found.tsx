import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 p-4">
      <h2 className="text-2xl font-bold mb-2">Sayfa Bulunamadı (404)</h2>
      <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition-colors"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
