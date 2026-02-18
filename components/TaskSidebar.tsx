import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Trash2, ChevronLeft, 
  ListTodo, ClipboardList, BookText, History, Timer, Circle
} from 'lucide-react';
import { Task } from '../types';

interface TaskSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenSourcesModal: () => void;
  onOpenSaveLogModal: () => void;
}

const TaskSidebar: React.FC<TaskSidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onOpenSourcesModal, 
  onOpenSaveLogModal
}) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('BLUE_EYES_TASKS');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTaskText, setNewTaskText] = useState("");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);

  useEffect(() => {
    localStorage.setItem('BLUE_EYES_TASKS', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTask();
  };

  useEffect(() => {
    let interval: any = null;
    if (isPomodoroActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPomodoroActive) {
      setIsPomodoroActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPomodoroActive, timeLeft]);

  const togglePomodoro = () => {
    setIsPomodoroActive(!isPomodoroActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sidebar Colapsada (Minimalista)
  if (!isOpen) {
    return (
      <div className="w-14 bg-white/50 backdrop-blur border-r border-[var(--theme-border)] flex flex-col items-center py-6 gap-6 shrink-0 no-print z-30">
        <button onClick={onToggle} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-[var(--theme-accent)] transition-all" title="Tarefas"><ClipboardList size={22} strokeWidth={1.5} /></button>
        <button onClick={onOpenSourcesModal} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)] transition-all" title="Fontes Bibliográficas"><BookText size={22} strokeWidth={1.5} /></button>
        <button onClick={onOpenSaveLogModal} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)] transition-all" title="Histórico"><History size={22} strokeWidth={1.5} /></button>
        <div className="w-8 h-[1px] bg-gray-200 my-1"></div>
        <button onClick={onToggle} className={`p-2.5 rounded-xl transition-all ${isPomodoroActive ? 'bg-red-50 text-red-500 shadow-sm animate-pulse' : 'text-gray-400 hover:text-gray-600'}`} title="Pomodoro"><Timer size={22} strokeWidth={1.5} /></button>
      </div>
    );
  }

  // Sidebar Expandida (Moderna)
  return (
    <div className="w-80 bg-[var(--theme-paper-bg)] border-r border-[var(--theme-border)] flex flex-col shrink-0 no-print h-full shadow-xl relative z-30">
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
           <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
             <ListTodo size={20} />
           </div>
           <div>
             <h3 className="text-sm font-bold text-gray-800">Organização</h3>
             <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Suas Metas</p>
           </div>
        </div>
        <button onClick={onToggle} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><ChevronLeft size={18} /></button>
      </div>

      <div className="px-5 mb-4">
        <div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-xl border border-gray-100 focus-within:border-[var(--theme-accent)] focus-within:ring-2 ring-[var(--theme-accent)]/10 transition-all">
          <input 
             type="text" 
             value={newTaskText} 
             onChange={(e) => setNewTaskText(e.target.value)} 
             onKeyDown={handleKeyDown} 
             placeholder="Adicionar tarefa..." 
             className="flex-1 text-xs bg-transparent p-1.5 outline-none placeholder:text-gray-400 text-gray-700" 
          />
          <button onClick={addTask} className="p-1.5 bg-[var(--theme-accent)] text-[var(--theme-on-accent)] rounded-lg hover:opacity-90 shadow-sm"><Plus size={16} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4 flex flex-col gap-2 scrollbar-thin">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <CheckSquare size={48} strokeWidth={1} className="mb-3 opacity-50" />
            <span className="text-xs font-medium">Tudo limpo por aqui</span>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="group flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <button 
                 onClick={() => toggleTask(task.id)} 
                 className={`mt-0.5 shrink-0 transition-colors ${task.completed ? 'text-green-500' : 'text-gray-300 hover:text-[var(--theme-accent)]'}`}
              >
                {task.completed ? <CheckSquare size={18} /> : <Circle size={18} />}
              </button>
              <span className={`flex-1 text-xs leading-relaxed ${task.completed ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-600 font-medium'}`}>{task.text}</span>
              <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"><Trash2 size={14} /></button>
            </div>
          ))
        )}
      </div>

      <div className="p-5 bg-gray-50/80 border-t border-[var(--theme-border)] mt-auto backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-600">
             <Timer size={18} className={isPomodoroActive ? 'text-red-500 animate-pulse' : ''} />
             <span className="text-xs font-bold">Modo Foco</span>
          </div>
          <span className={`font-mono text-xl font-bold tracking-tight ${isPomodoroActive ? 'text-red-600' : 'text-gray-400'}`}>{formatTime(timeLeft)}</span>
        </div>
        <button 
           onClick={togglePomodoro} 
           className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${isPomodoroActive ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50' : 'bg-[var(--theme-accent)] text-[var(--theme-on-accent)] hover:opacity-90'}`}
        >
           {isPomodoroActive ? "PAUSAR SESSÃO" : "INICIAR SESSÃO"}
        </button>
      </div>
    </div>
  );
};

export default TaskSidebar;