import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { Screen, Patient } from '@/types';
import { getPatient, savePatient } from '@/storage';

interface PatientFormProps {
  patientId?: string;
  onNavigate: (screen: Screen) => void;
}

export default function PatientForm({ patientId, onNavigate }: PatientFormProps) {
  const [form, setForm] = useState({
    name: '',
    species: '',
    breed: '',
    sex: '',
    age: '',
    weight: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!patientId) { setLoading(false); return; }
    getPatient(patientId).then((p) => {
      if (p) {
        setForm({
          name: p.name,
          species: p.species,
          breed: p.breed,
          sex: p.sex,
          age: p.age,
          weight: p.weight,
          ownerName: p.owner.name,
          ownerPhone: p.owner.phone,
          ownerEmail: p.owner.email,
          notes: p.notes,
        });
      }
      setLoading(false);
    });
  }, [patientId]);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data: Omit<Patient, 'id' | 'createdAt'> & { id?: string } = {
      id: patientId,
      name: form.name,
      species: form.species,
      breed: form.breed,
      sex: form.sex,
      age: form.age,
      weight: form.weight,
      owner: { name: form.ownerName, phone: form.ownerPhone, email: form.ownerEmail },
      notes: form.notes,
    };
    const saved = await savePatient(data);
    setSaving(false);
    onNavigate({ name: 'patientRecord', patientId: saved.id });
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500';
  const labelClass = 'block text-xs font-medium text-slate-600 mb-1';

  if (loading) return <div className="p-8 text-slate-400 text-sm">Carregando...</div>;

  return (
    <div className="p-8 max-w-3xl">
      <button
        onClick={() => onNavigate(patientId ? { name: 'patientRecord', patientId } : { name: 'patients' })}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <h2 className="text-2xl font-bold text-slate-800 mb-1">
        {patientId ? 'Editar paciente' : 'Cadastro de paciente'}
      </h2>
      <p className="text-sm text-slate-500 mb-6">Dados do animal e do proprietário</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Dados do animal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nome</label>
              <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Espécie</label>
              <select className={inputClass} value={form.species} onChange={(e) => set('species', e.target.value)} required>
                <option value="">Selecione...</option>
                <option value="Canino">Canino</option>
                <option value="Felino">Felino</option>
                <option value="Equino">Equino</option>
                <option value="Bovino">Bovino</option>
                <option value="Ave">Ave</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Raça</label>
              <input className={inputClass} value={form.breed} onChange={(e) => set('breed', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Sexo</label>
              <select className={inputClass} value={form.sex} onChange={(e) => set('sex', e.target.value)}>
                <option value="">Selecione...</option>
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Idade</label>
              <input className={inputClass} placeholder="Ex: 7 anos" value={form.age} onChange={(e) => set('age', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Peso</label>
              <input className={inputClass} placeholder="Ex: 8 kg" value={form.weight} onChange={(e) => set('weight', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Dados do proprietário</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nome</label>
              <input className={inputClass} value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input className={inputClass} value={form.ownerPhone} onChange={(e) => set('ownerPhone', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>E-mail</label>
              <input className={inputClass} type="email" value={form.ownerEmail} onChange={(e) => set('ownerEmail', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Observações</h3>
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate(patientId ? { name: 'patientRecord', patientId } : { name: 'patients' })}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
