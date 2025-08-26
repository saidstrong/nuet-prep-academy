"use client";
import { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="container-section py-3">
        <div className="rounded-lg bg-slate-900 text-white p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shadow-lg">
          <div className="text-sm">
            We use cookies for basic analytics to improve your experience. By using this site, you
            agree to our use of cookies.
          </div>
          <div className="flex gap-2">
            <button
              className="btn-accent"
              onClick={() => {
                localStorage.setItem('cookie-consent', 'accepted');
                setVisible(false);
              }}
            >
              Accept
            </button>
            <button
              className="btn-primary"
              onClick={() => setVisible(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

