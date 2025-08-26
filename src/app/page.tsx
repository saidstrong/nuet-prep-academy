import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import TestimonialCard from '@/components/TestimonialCard';
import Reveal from '@/components/Reveal';

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <section className="container-section py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          <Reveal>
            <div className="rounded-xl border border-slate-200 p-6 bg-white">
            <h3 className="font-semibold text-slate-900">Tailored NUET Preparation</h3>
            <p className="text-slate-600 mt-2">Curriculum aligned to NUET in Math, CT, and English.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-xl border border-slate-200 p-6 bg-white">
            <h3 className="font-semibold text-slate-900">Evening Flexible Classes</h3>
            <p className="text-slate-600 mt-2">Schedules that work for school students.</p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="rounded-xl border border-slate-200 p-6 bg-white">
            <h3 className="font-semibold text-slate-900">Experienced Tutor (Founder-led)</h3>
            <p className="text-slate-600 mt-2">Daily guidance and feedback from the founder.</p>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="container-section py-12">
        <h2 className="text-2xl font-bold text-slate-900">What parents and students say</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <Reveal>
            <TestimonialCard quote="Clear explanations and a structured plan — exactly what we needed to start NUET prep with confidence." author="Parent from Astana" role="Prospective Parent" />
          </Reveal>
          <Reveal delay={0.1}>
            <TestimonialCard quote="Weekly practice tests and solution walkthroughs make it much easier to track progress." author="Yerkezhan" role="Prospective Student" />
          </Reveal>
          <Reveal delay={0.2}>
            <TestimonialCard quote="I like the evening schedule and the focus on problem‑solving strategies." author="Adil" role="Prospective Student" />
          </Reveal>
        </div>
      </section>
      <Footer />
    </main>
  );
}

