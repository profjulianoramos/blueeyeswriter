
import React, { useState, useEffect, useCallback } from 'react';
import { Timer, Coffee, Play, RotateCcw } from 'lucide-react';

const PomodoroTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos em segundos
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const resetTimer = useCallback(() => {
    setTimeLeft(25 * 60);
    setIsActive(false);
    setIsFinished(false);
    setShowTime(false);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      setShowTime(true); // Sempre mostra ao finalizar
      clearInterval(interval);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      } catch (e) {}
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (isFinished) {
      resetTimer();
    } else if (isActive) {
      setShowTime(!showTime); // Alterna exibição do tempo se já estiver rodando
    } else {
      setIsActive(true);
      setShowTime(false); // Inicia sem mostrar o tempo
    }
  };

  return (
    <div className="fixed bottom-32 left-6 z-[90] flex flex-col items-start group">
      {/* Tooltip/Display de Tempo - Só mostra se explicitamente solicitado ou se acabou */}
      {((isActive && showTime) || isFinished) && (
        <div className={`mb-2 px-3 py-1.5 rounded-lg shadow-lg border flex items-center gap-2 ${
          isFinished ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-white border-gray-200 text-[#2b579a]'
        }`}>
          {isFinished ? (
            <>
              <Coffee size={14} className="animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-tight">Pausa para o café</span>
              <button onClick={resetTimer} className="ml-1 p-0.5 hover:bg-orange-200 rounded transition-colors">
                <RotateCcw size={12} />
              </button>
            </>
          ) : (
            <>
              <Timer size={14} className="text-[#2b579a]" />
              <span className="text-sm font-mono font-bold">{formatTime(timeLeft)}</span>
            </>
          )}
        </div>
      )}

      {/* Botão Principal */}
      <button
        onClick={toggleTimer}
        className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95 group relative border-2 ${
          isFinished 
            ? 'bg-orange-500 border-orange-300 text-white' 
            : isActive 
              ? 'bg-white border-[#2b579a] text-[#2b579a]' 
              : 'bg-white border-gray-300 text-gray-400 hover:border-[#2b579a] hover:text-[#2b579a]'
        }`}
      >
        {isFinished ? (
          <Coffee size={24} />
        ) : isActive ? (
          <div className="relative w-full h-full flex items-center justify-center">
             <div className="w-2 h-2 bg-[#2b579a] rounded-full"></div>
             <span className="sr-only">Rodando</span>
          </div>
        ) : (
          <Timer size={24} />
        )}
        
        {/* Label hover - Posicionado à direita do botão */}
        {!isActive && !isFinished && (
          <div className="absolute left-14 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap">
            Pomodoro 25min
          </div>
        )}
      </button>
    </div>
  );
};

export default PomodoroTimer;
