import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="container-section pt-12 sm:pt-20 pb-12">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 leading-tight">
            Prepare. Practice. <span className="text-primary">Succeed</span> at NUET.
          </h1>
          <p className="mt-4 text-slate-600 text-base sm:text-lg max-w-prose">
            Comprehensive preparation for Nazarbayev University Entrance Test. Focused curriculum,
            real practice, and supportive guidance.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/courses" className="btn-primary flex items-center justify-center">
              <span>View Courses</span>
            </Link>
            <Link href="/auth/signup" className="btn-secondary flex items-center justify-center">
              <span>Get Started</span>
            </Link>
          </div>
        </div>
        <div className="relative h-56 sm:h-72 md:h-80 rounded-xl overflow-hidden border border-slate-200">
          <Image
            src="/hero-image.jpg" // Replace with your image path
            alt="NUET Prep Academy - Students studying"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Optional overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>

    </section>
  );
}

