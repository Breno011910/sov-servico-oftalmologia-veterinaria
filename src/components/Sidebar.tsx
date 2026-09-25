import { Eye, LayoutDashboard, Users, LogOut } from 'lucide-react';
import type { Screen } from '@/types';
import { useAuth } from '@/auth';

interface SidebarProps {
  current: Screen['name'];
  onNavigate: (screen: Screen) => void;
}

export default function Sidebar({ current, onNavigate }: SidebarProps) {
  const { user, signOut } = useAuth();

  const items = [
    { name: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { name: 'patients' as const, label: 'Pacientes', icon: Users },
  ];

  return (
    <aside className="w-60 shrink-0 bg-slate-800 text-slate-100 flex flex-col h-screen">
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-slate-700">
        <Eye className="w-7 h-7 text-teal-400" />
        <div>
          <h1 className="text-lg font-bold tracking-tight">S.O.V</h1>
          <p className="text-[11px] text-slate-400">Serviço de Oftalmologia Veterinária</p>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = current === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onNavigate({ name: item.name })}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-teal-600/20 text-teal-300 border-l-4 border-teal-400'
                  : 'text-slate-300 hover:bg-slate-700/50 border-l-4 border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-slate-700">
        <div className="text-[11px] text-slate-300 mb-0.5 truncate font-medium">
          {user?.user_metadata?.name || user?.email}
        </div>
        {user?.user_metadata?.name && (
          <div className="text-[11px] text-slate-500 mb-2 truncate">
            {user?.email}
          </div>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
