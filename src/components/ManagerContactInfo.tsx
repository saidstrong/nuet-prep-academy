"use client";

import { Phone, MessageCircle, Mail, User } from 'lucide-react';

interface ManagerContactInfoProps {
  showTitle?: boolean;
  className?: string;
}

export default function ManagerContactInfo({ showTitle = true, className = "" }: ManagerContactInfoProps) {
  const managers = [
    {
      name: "Yeraltay",
      telegram: "@MikeHawk02",
      whatsapp: "+77075214911",
      email: "yeraltay@nuet.kz"
    },
    {
      name: "Asylzada", 
      telegram: "@asylzadatop",
      whatsapp: "+77075214911",
      email: "asylzada@nuet.kz"
    }
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          Contact Our Managers
        </h3>
      )}
      
      <div className="space-y-4">
        {managers.map((manager, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">{manager.name}</h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">WhatsApp</p>
                  <a 
                    href={`https://wa.me/${manager.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    {manager.whatsapp}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Telegram</p>
                  <a 
                    href={`https://t.me/${manager.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {manager.telegram}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Email</p>
                  <a 
                    href={`mailto:${manager.email}`}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    {manager.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Quick Contact</p>
              <p>For immediate assistance, contact our main WhatsApp:</p>
              <a 
                href="https://wa.me/77075214911"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-green-600 hover:text-green-700"
              >
                +77075214911
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
