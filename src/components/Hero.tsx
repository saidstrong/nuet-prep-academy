import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Hero() {
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const handleWhatsAppEnroll = () => {
    const message = encodeURIComponent("Hello! I'm interested in NUET preparation courses. Could you please provide more information?");
    window.open(`https://wa.me/77075214911?text=${message}`, '_blank');
    setShowEnrollModal(false);
  };

  const handleTelegramEnroll = () => {
    window.open('https://t.me/sherlockzini', '_blank');
    setShowEnrollModal(false);
  };
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
            <button
              onClick={() => setShowEnrollModal(true)}
              className="btn-primary flex items-center justify-center"
            >
              <span>Enroll Now</span>
            </button>
            <Link href="/courses" className="btn-secondary flex items-center justify-center">
              <span>View Courses</span>
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

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Choose Enrollment Method</h3>
            <p className="text-slate-600 mb-6">
              Select your preferred way to get in touch with us for enrollment:
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleWhatsAppEnroll}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>📱 WhatsApp</span>
              </button>
              
              <button
                onClick={handleTelegramEnroll}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>💬 Telegram</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowEnrollModal(false)}
              className="w-full mt-4 text-slate-500 hover:text-slate-700 font-medium py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

