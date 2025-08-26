import Link from 'next/link';

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
          <div className="mt-6 flex gap-3">
            <Link href="/contact" className="btn-primary">Enroll Now</Link>
            <Link href="/courses" className="btn-accent">View Courses</Link>
          </div>
        </div>
        <div className="h-56 sm:h-72 md:h-80 rounded-xl bg-gradient-to-br from-primary/10 via-white to-accent/10 border border-slate-200" />
      </div>
    </section>
  );
}

