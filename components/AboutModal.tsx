import React, { useState } from 'react';
import { X, Info, FileText, Heart, Globe } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col border office-border">
        {/* Header */}
        <div className="office-blue p-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Info size={18} />
            <span className="text-sm font-semibold">Sobre o Blue Eyes Writer</span>
          </div>
          <button onClick={onClose} className="hover:opacity-70 p-1 rounded transition-opacity">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 office-blue rounded-2xl flex items-center justify-center shadow-lg mb-2">
            <FileText size={40} className="text-[var(--theme-on-primary)]" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-gray-800">Blue Eyes Writer</h2>
            <p className="text-xs text-gray-500 font-medium">Versão 1.5.0 Stable</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Data: {currentDate}</p>
          </div>

          <a 
            href="https://blueeyeswriter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-semibold text-[#2b579a] hover:underline"
          >
            <Globe size={14} />
            blueeyeswriter.com
          </a>

          <div className="w-full h-[1px] bg-gray-100 my-2"></div>

          <p className="text-sm text-gray-700 italic leading-relaxed">
            "A vida é muito boa e sempre vai dar certo"
          </p>

          <div className="flex flex-col gap-1 mt-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Desenvolvido por</span>
            <span className="text-sm font-semibold text-[#2b579a]">Prof. Juliano Ramos</span>
            <a href="mailto:profjulianoramos@gmail.com" className="text-xs text-blue-600 hover:underline">
              profjulianoramos@gmail.com
            </a>
          </div>
          
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-4">
            <span>Feito com</span>
            <Heart size={10} className="text-red-500 fill-red-500" />
            <span>para escritores e entusiastas.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-center border-t office-border">
          <button 
            onClick={onClose}
            className="px-8 py-1.5 text-xs font-bold bg-[var(--theme-accent)] text-[var(--theme-on-accent)] hover:opacity-90 rounded transition-colors shadow-sm"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;