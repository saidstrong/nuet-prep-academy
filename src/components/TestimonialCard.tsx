type Props = {
  quote: string;
  author: string;
  role?: string;
};

export default function TestimonialCard({ quote, author, role }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 p-6 bg-white">
      <p className="text-slate-700">“{quote}”</p>
      <div className="mt-4 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{author}</span>
        {role ? ` • ${role}` : null}
      </div>
    </div>
  );
}

