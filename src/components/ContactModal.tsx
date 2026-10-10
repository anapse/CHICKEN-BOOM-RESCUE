import React from 'react';
import { X, Mail, Video, Send } from 'lucide-react';
import { CONTACT_EMAIL } from '../game/constants';

interface ContactModalProps {
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm cartoon-card rounded-3xl p-6 flex flex-col items-center border-4 border-amber-900 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-900 hover:text-red-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-amber-200 border-3 border-amber-900 flex items-center justify-center text-amber-900 mb-3 shadow-md">
          <Mail size={32} />
        </div>

        <h3 className="font-['Titan_One',sans-serif] text-2xl text-amber-950 text-center tracking-wide">
          CONTACTO
        </h3>
        <p className="text-xs font-bold text-amber-800 text-center mt-1 mb-4">
          ANAPSE Video - Chicken Boom Rescue
        </p>

        <div className="w-full bg-amber-100/90 border-2 border-amber-400 p-4 rounded-2xl flex flex-col items-center gap-2 text-center">
          <span className="text-xs font-semibold text-amber-900">
            Para cualquier consulta, soporte técnico, sugerencias o información sobre el juego, contáctanos directamente a:
          </span>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="w-full py-2.5 px-3 bg-amber-900 hover:bg-amber-800 text-yellow-300 font-black rounded-xl border border-amber-950 text-sm flex items-center justify-center gap-2 shadow-md transition-colors break-all"
          >
            <Send size={16} />
            <span>{CONTACT_EMAIL}</span>
          </a>

          <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-800 mt-2">
            <Video size={14} className="text-amber-900" />
            <span>Desarrollado para ANAPSE Video</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 mt-4 rounded-2xl btn-cartoon-yellow font-['Titan_One',sans-serif] text-base text-amber-950 tracking-wider shadow-lg active:scale-95 transition-transform"
        >
          CERRAR
        </button>
      </div>
    </div>
  );
};
