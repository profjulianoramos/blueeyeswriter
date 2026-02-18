import React, { useState } from 'react';
import { X, Table } from 'lucide-react';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rows: number, cols: number) => void;
}

const TableModal: React.FC<TableModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-80 overflow-hidden border office-border">
        {/* Header */}
        <div className="office-blue p-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Table size={18} />
            <span className="text-sm font-semibold">Inserir Tabela</span>
          </div>
          <button onClick={onClose} className="hover:opacity-70 p-1 rounded transition-opacity">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Número de Colunas</label>
            <input 
              type="number" 
              min="1" 
              max="20"
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value) || 1)}
              className="border p-2 rounded text-sm outline-none focus:border-[#2b579a] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Número de Linhas</label>
            <input 
              type="number" 
              min="1" 
              max="50"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value) || 1)}
              className="border p-2 rounded text-sm outline-none focus:border-[#2b579a] transition-colors"
            />
          </div>
          
          <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-100 flex items-center gap-3">
             <div className="grid grid-cols-3 gap-1 opacity-40">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-4 h-3 bg-[#2b579a] rounded-sm"></div>
                ))}
             </div>
             <span className="text-[10px] text-blue-700 leading-tight">
               Será gerada uma tabela de {cols}x{rows} com a primeira linha como cabeçalho.
             </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-3 flex justify-end gap-2 border-t office-border">
          <button 
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onConfirm(rows, cols)}
            className="px-4 py-1.5 text-xs font-medium bg-[var(--theme-accent)] text-[var(--theme-on-accent)] hover:opacity-90 rounded transition-colors shadow-sm"
          >
            Inserir Tabela
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableModal;