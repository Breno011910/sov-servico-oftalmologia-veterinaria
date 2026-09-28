import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import type { Screen, Patient } from '@/types';
import { getPatients, getConsultationsByPatient, deletePatient, formatDate } from '@/storage';

interface PatientsProps {
  onNavigate: (screen: Screen) => void;
}

export default function Patients({ onNavigate }: PatientsProps) {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultationDates, setConsultationDates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = () => {
    setLoading(true);
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
  };

  useEffect(() => { loadData(); }, []);

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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePatient(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    } catch {
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

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
              <th className="px-5 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
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
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Excluir paciente</h3>
                <p className="text-sm text-slate-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Tem certeza que deseja excluir <span className="font-semibold">{deleteTarget.name}</span> e todas as suas consultas e fotos?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
