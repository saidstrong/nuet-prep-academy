import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <main>
      <Header />
      <section className="container-section pt-10 pb-16 grid gap-10 md:grid-cols-2 items-start">
        <div className="aspect-[4/3] rounded-xl border border-slate-200 bg-slate-50" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">About Us</h1>
          <p className="text-slate-600 mt-3 max-w-prose">Our mission is simple: help students succeed at the Nazarbayev University Entrance Test through structured learning, real practice, and supportive guidance.</p>
          <p className="text-slate-600 mt-3 max-w-prose">I am <span className="font-semibold text-slate-900">Said Amanzhol</span>, a student at Nazarbayev University and the founder and daily tutor at NUET Prep Academy. <span className="font-semibold text-slate-900">Yeraltay Tabysbek</span> is our co‑founder, also a student at Nazarbayev University. We are committed to guiding students step by step with focused lessons, feedback, and weekly practice tests.</p>
          <p className="text-slate-600 mt-3 max-w-prose">A photo will be added soon. Meanwhile, feel free to reach out with any questions or to discuss your study plan.</p>
        </div>
      </section>
      <Footer />
    </main>
  );
}

