import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200/60">
      <div className="container-section py-10 grid gap-6 sm:grid-cols-2">
        <div>
          <div className="text-primary font-semibold text-lg">NUET Prep Academy</div>
          <p className="text-slate-600 mt-2 max-w-prose">
            Comprehensive preparation for the Nazarbayev University Entrance Test. Evening classes,
            focused practice, and founder-led instruction.
          </p>
        </div>
        <div className="sm:justify-self-end">
          <div className="text-sm text-slate-500">Contact</div>
          <div className="text-slate-700">Astana, Kabanbay Batyr ave 53, Nazarbayev University</div>
          <div className="text-slate-700">Email: amanzhol.said08@gmail.com</div>
          <div className="mt-3 flex gap-3">
            <Link href="https://wa.me/77075214911" target="_blank" className="btn-accent">WhatsApp</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200/60 py-4 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} NUET Prep Academy. All rights reserved.
      </div>
    </footer>
  );
}

