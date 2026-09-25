import { useState, useMemo, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Screen, Patient, Consultation } from '@/types';
import { getPatients, getConsultationsByPatient, formatDate } from '@/storage';

interface PatientsProps {
  onNavigate: (screen: Screen) => void;
}

export default function Patients({ onNavigate }: PatientsProps) {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultationDates, setConsultationDates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatients().then(async (pats) => {
      setPatients(pats);
      const dates: Record<string, string> = {};
      for (const p of pats) {
        const consults = await getConsultationsByPatient(p.id);
        dates[p.id] = consults.length > 0 ? formatDate(consults[0].date) : '—';
      }
      setConsultationDates(dates);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.owner.name.toLowerCase().includes(q) ||
        p.breed.toLowerCase().includes(q)
    );
  }, [search, patients]);

  if (loading) {
    return <div className="p-8 text-slate-400 text-sm">Carregando...</div>;
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pacientes</h2>
          <p className="text-sm text-slate-500 mt-0.5">Lista de pacientes cadastrados</p>
        </div>
        <button
          onClick={() => onNavigate({ name: 'patientForm' })}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo paciente
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, raça ou proprietário..."
          className="w-full max-w-md pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Espécie</th>
              <th className="px-5 py-3 font-medium">Raça</th>
              <th className="px-5 py-3 font-medium">Idade</th>
              <th className="px-5 py-3 font-medium">Proprietário</th>
              <th className="px-5 py-3 font-medium">Última consulta</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  Nenhum paciente encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onNavigate({ name: 'patientRecord', patientId: p.id })}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 font-medium text-slate-700">{p.name}</td>
                  <td className="px-5 py-3 text-slate-600">{p.species}</td>
                  <td className="px-5 py-3 text-slate-600">{p.breed}</td>
                  <td className="px-5 py-3 text-slate-600">{p.age}</td>
                  <td className="px-5 py-3 text-slate-600">{p.owner.name}</td>
                  <td className="px-5 py-3 text-slate-500">{consultationDates[p.id] || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
