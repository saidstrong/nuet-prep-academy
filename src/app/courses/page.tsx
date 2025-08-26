import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';

export default function CoursesPage() {
  return (
    <main>
      <Header />
      <section className="container-section pt-10 pb-16">
        <h1 className="text-3xl font-bold text-slate-900">Courses</h1>
        <p className="text-slate-600 mt-2 max-w-prose">Choose a program that fits your needs and schedule.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CourseCard
            title="NUET Full Prep"
            description="60,000 ₸ for 6 months. Math, Critical Thinking, English. Weekday online lessons for new topics. Saturday full sample test on the website; Sunday review with solutions and feedback."
            duration="6 months"
          />
          <CourseCard
            title="NUET Crash Course"
            description="40,000 ₸ for 2 months. All topics, content, and problem sets with detailed solutions for self-prep, plus a full sample exam."
            duration="2 months"
          />
          <CourseCard
            title="1-on-1 Private Tutoring"
            description="80,000 ₸ per month. Daily 1-hour online sessions with the tutor focused on new topics."
            duration="Monthly"
          />
        </div>
      </section>
      <Footer />
    </main>
  );
}

