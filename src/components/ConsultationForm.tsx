import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { Screen, EyeExam, Consultation, Patient } from '@/types';
import { getPatient, saveConsultation, emptyEyeExam } from '@/storage';

interface ConsultationFormProps {
  patientId: string;
  onNavigate: (screen: Screen) => void;
}

const EXAM_FIELDS: { key: keyof EyeExam; label: string; type: 'text' | 'number' | 'select'; options?: string[] }[] = [
  { key: 'reflexoPupilarDireto', label: 'Reflexo pupilar direto', type: 'select', options: ['Presente', 'Ausente', 'Diminuído'] },
  { key: 'reflexoPupilarConsensual', label: 'Reflexo pupilar consensual', type: 'select', options: ['Presente', 'Ausente', 'Diminuído'] },
  { key: 'ameaca', label: 'Ameaça', type: 'select', options: ['Presente', 'Ausente'] },
  { key: 'schirmer', label: 'Schirmer (mm)', type: 'number' },
  { key: 'pio', label: 'PIO (mmHg)', type: 'number' },
  { key: 'bulboOcular', label: 'Bulbo ocular', type: 'select', options: ['Normal', 'Exoftalmia', 'Enoftalmia', 'Microftalmia'] },
  { key: 'palpebra', label: 'Pálpebra', type: 'text' },
  { key: 'secrecao', label: 'Secreção', type: 'select', options: ['Nenhuma', 'Serosa', 'Mucopurulenta', 'Purulenta'] },
  { key: 'conjuntiva', label: 'Conjuntiva', type: 'select', options: ['Normal', 'Hiperêmica', 'Edemaciada', 'Prolapso'] },
  { key: 'cornea', label: 'Córnea', type: 'text' },
  { key: 'fluoresceina', label: 'Fluoresceína', type: 'select', options: ['Negativa', 'Positiva'] },
  { key: 'testeJones', label: 'Teste de Jones', type: 'select', options: ['Permeável', 'Obstruído'] },
  { key: 'camaraAnterior', label: 'Câmara anterior, íris e pupila', type: 'text' },
  { key: 'lente', label: 'Lente', type: 'text' },
  { key: 'fundoVitreo', label: 'Fundo e vítreo', type: 'text' },
];

export default function ConsultationForm({ patientId, onNavigate }: ConsultationFormProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [history, setHistory] = useState('');
  const [od, setOd] = useState<EyeExam>(emptyEyeExam());
  const [oe, setOe] = useState<EyeExam>(emptyEyeExam());
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [returnDate, setReturnDate] = useState('');

  useEffect(() => {
    getPatient(patientId).then((p) => { setPatient(p); setLoading(false); });
  }, [patientId]);

  if (loading) return <div className="p-8 text-slate-400 text-sm">Carregando...</div>;
  if (!patient) {
    return <div className="p-8"><p className="text-slate-500">Paciente não encontrado.</p></div>;
  }

  const setEye = (side: 'od' | 'oe', key: keyof EyeExam, value: string) => {
    if (side === 'od') setOd((prev) => ({ ...prev, [key]: value }));
    else setOe((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data: Omit<Consultation, 'id' | 'createdAt'> = {
      patientId, date, history, od, oe, diagnosis, treatment, returnDate,
    };
    const saved = await saveConsultation(data);
    setSaving(false);
    onNavigate({ name: 'consultationView', patientId, consultationId: saved.id });
  };

  const inputClass = 'w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500';
  const labelClass = 'block text-xs font-medium text-slate-500 mb-1';

  const renderField = (field: (typeof EXAM_FIELDS)[number], side: 'od' | 'oe') => {
    const value = side === 'od' ? od[field.key] : oe[field.key];
    return (
      <div key={String(field.key)}>
        <label className={labelClass}>{field.label}</label>
        {field.type === 'select' ? (
          <select
            className={inputClass}
            value={value}
            onChange={(e) => setEye(side, field.key, e.target.value)}
          >
            <option value="">—</option>
            {field.options!.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={field.type}
            className={inputClass}
            value={value}
            onChange={(e) => setEye(side, field.key, e.target.value)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-5xl">
      <button
        onClick={() => onNavigate({ name: 'patientRecord', patientId })}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao prontuário
      </button>

      <h2 className="text-2xl font-bold text-slate-800 mb-1">Nova consulta</h2>
      <p className="text-sm text-slate-500 mb-6">
        Paciente: <span className="font-medium text-slate-700">{patient.name}</span> · {patient.species} · {patient.breed}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">1. Consulta</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelClass}>Data</label>
              <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className={labelClass}>Histórico / Anamnese</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              value={history}
              onChange={(e) => setHistory(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">2. Exame oftalmológico</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">OD</span>
                <span className="text-sm font-medium text-slate-600">Olho direito</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                {EXAM_FIELDS.map((f) => renderField(f, 'od'))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">OE</span>
                <span className="text-sm font-medium text-slate-600">Olho esquerdo</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                {EXAM_FIELDS.map((f) => renderField(f, 'oe'))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">3. Resultado</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Diagnóstico</label>
              <textarea className={`${inputClass} resize-none`} rows={2} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Tratamento</label>
              <textarea className={`${inputClass} resize-none`} rows={2} value={treatment} onChange={(e) => setTreatment(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Retorno</label>
                <input type="date" className={inputClass} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </div>
            </div>
          </div>
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
            onClick={() => onNavigate({ name: 'patientRecord', patientId })}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
