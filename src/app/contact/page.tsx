"use client";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MessageCircle, Phone, Mail, MapPin, Clock, Users, BookOpen, Trophy } from 'lucide-react';

export default function ContactPage() {
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Hello! I'm interested in NUET preparation courses. Could you please provide more information?");
    window.open(`https://wa.me/77075214911?text=${message}`, '_blank');
  };

  const handleTelegramContact = () => {
    window.open('https://t.me/sherlockzini', '_blank');
  };

  return (
    <main>
      <Header />
      <section className="container-section pt-10 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Ready to start your NUET preparation journey? Get in touch with us through WhatsApp or Telegram for instant enrollment and support.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-start">
          {/* Contact Methods */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-900">WhatsApp</h3>
                  <p className="text-green-700">Instant messaging and enrollment</p>
                </div>
              </div>
              <p className="text-green-800 mb-6">
                Contact us directly on WhatsApp for immediate assistance with course enrollment, 
                payment processing, and any questions about our NUET preparation programs.
              </p>
              <button
                onClick={handleWhatsAppContact}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact on WhatsApp (+77075214911)</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-blue-900">Telegram</h3>
                  <p className="text-blue-700">Alternative messaging platform</p>
                </div>
              </div>
              <p className="text-blue-800 mb-6">
                Prefer Telegram? We're also available on Telegram for course inquiries, 
                enrollment assistance, and ongoing support throughout your learning journey.
              </p>
              <button
                onClick={handleTelegramContact}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Phone className="w-5 h-5" />
                <span>Contact on Telegram (@sherlockzini)</span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-purple-900">Email</h3>
                  <p className="text-purple-700">For detailed inquiries</p>
                </div>
              </div>
              <p className="text-purple-800 mb-6">
                For detailed course information, academic questions, or formal communications, 
                you can reach us via email.
              </p>
              <a
                href="mailto:amanzhol.said08@gmail.com"
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Mail className="w-5 h-5" />
                <span>Send Email</span>
              </a>
            </div>
          </div>

          {/* Course Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Why Choose NUET Prep Academy?</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Comprehensive Curriculum</h4>
                    <p className="text-slate-600 text-sm">Complete coverage of Mathematics, Critical Thinking, and English sections</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Expert Instructors</h4>
                    <p className="text-slate-600 text-sm">Experienced educators with proven track records in NUET preparation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Flexible Schedule</h4>
                    <p className="text-slate-600 text-sm">Evening classes designed for high school students</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Practice Tests</h4>
                    <p className="text-slate-600 text-sm">Saturday sample tests and Sunday solution reviews</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Course Schedule</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Weekday Lessons</span>
                  <span className="text-slate-600">Monday - Friday</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="font-medium text-slate-700">Sample Tests</span>
                  <span className="text-slate-600">Saturdays</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-slate-700">Solution Reviews</span>
                  <span className="text-slate-600">Sundays</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-8 border border-yellow-200">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Enrollment</h3>
              <p className="text-slate-700 mb-4">
                Ready to start? Contact us now to secure your spot in our next batch!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleWhatsAppContact}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enroll via WhatsApp</span>
                </button>
                <button
                  onClick={handleTelegramContact}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Enroll via Telegram</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

