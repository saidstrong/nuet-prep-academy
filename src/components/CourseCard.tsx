import Link from 'next/link';

type Props = {
  title: string;
  description: string;
  duration: string;
  href?: string;
};

export default function CourseCard({ title, description, duration, href = '/contact' }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow bg-white">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
      <div className="mt-3 text-sm text-slate-500">Duration: {duration}</div>
      <div className="mt-5">
        <Link href={href} className="btn-primary">Enroll</Link>
      </div>
    </div>
  );
}

