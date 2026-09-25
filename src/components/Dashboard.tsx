import { Plus, Search, Users, Stethoscope, Calendar } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import type { Screen, Patient, Consultation } from '@/types';
import { getPatients, getConsultations, formatDate } from '@/storage';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPatients(), getConsultations()])
      .then(([p, c]) => {
        setPatients(p);
        setConsultations(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const recentConsultations = useMemo(
    () => [...consultations].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [consultations]
  );

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return patients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.owner.name.toLowerCase().includes(q)
    );
  }, [search, patients]);

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name || '—';

  if (loading) {
    return <div className="p-8 text-slate-400 text-sm">Carregando...</div>;
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">Visão geral do atendimento oftalmológico</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
            <Users className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800">{patients.length}</p>
            <p className="text-sm text-slate-500">Pacientes cadastrados</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800">{consultations.length}</p>
            <p className="text-sm text-slate-500">Consultas registradas</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => onNavigate({ name: 'patientForm' })}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo paciente
        </button>
        <button
          onClick={() => onNavigate({ name: 'patients' })}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <Stethoscope className="w-4 h-4" />
          Nova consulta
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar paciente ou proprietário..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-1">
            {searchResults.map((p) => (
              <button
                key={p.id}
                onClick={() => onNavigate({ name: 'patientRecord', patientId: p.id })}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-sm transition-colors"
              >
                <span className="font-medium text-slate-700">{p.name}</span>
                <span className="text-slate-400 text-xs">{p.species} · {p.breed}</span>
              </button>
            ))}
          </div>
        )}
        {search.trim() && searchResults.length === 0 && (
          <p className="mt-3 text-sm text-slate-400">Nenhum paciente encontrado.</p>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Consultas recentes</h3>
        </div>
        {recentConsultations.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">Nenhuma consulta registrada.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                <th className="px-5 py-2 font-medium">Data</th>
                <th className="px-5 py-2 font-medium">Paciente</th>
                <th className="px-5 py-2 font-medium">Diagnóstico</th>
              </tr>
            </thead>
            <tbody>
              {recentConsultations.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onNavigate({ name: 'consultationView', patientId: c.patientId, consultationId: c.id })}
                  className="border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      {formatDate(c.date)}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700">{patientName(c.patientId)}</td>
                  <td className="px-5 py-3 text-slate-500">{c.diagnosis || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
