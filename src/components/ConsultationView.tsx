import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Screen, EyeExam, Patient, Consultation } from '@/types';
import { getPatient, getConsultation, formatDate } from '@/storage';

interface ConsultationViewProps {
  patientId: string;
  consultationId: string;
  onNavigate: (screen: Screen) => void;
}

const EXAM_LABELS: { key: keyof EyeExam; label: string }[] = [
  { key: 'reflexoPupilarDireto', label: 'Reflexo pupilar direto' },
  { key: 'reflexoPupilarConsensual', label: 'Reflexo pupilar consensual' },
  { key: 'ameaca', label: 'Ameaça' },
  { key: 'schirmer', label: 'Schirmer (mm)' },
  { key: 'pio', label: 'PIO (mmHg)' },
  { key: 'bulboOcular', label: 'Bulbo ocular' },
  { key: 'palpebra', label: 'Pálpebra' },
  { key: 'secrecao', label: 'Secreção' },
  { key: 'conjuntiva', label: 'Conjuntiva' },
  { key: 'cornea', label: 'Córnea' },
  { key: 'fluoresceina', label: 'Fluoresceína' },
  { key: 'testeJones', label: 'Teste de Jones' },
  { key: 'camaraAnterior', label: 'Câmara anterior, íris e pupila' },
  { key: 'lente', label: 'Lente' },
  { key: 'fundoVitreo', label: 'Fundo e vítreo' },
];

export default function ConsultationView({ patientId, consultationId, onNavigate }: ConsultationViewProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPatient(patientId), getConsultation(consultationId)])
      .then(([p, c]) => { setPatient(p); setConsultation(c); setLoading(false); });
  }, [patientId, consultationId]);

  if (loading) return <div className="p-8 text-slate-400 text-sm">Carregando...</div>;
  if (!patient || !consultation) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Consulta não encontrada.</p>
        <button onClick={() => onNavigate({ name: 'patients' })} className="mt-3 text-teal-600 text-sm">
          Voltar para pacientes
        </button>
      </div>
    );
  }

  const renderEye = (eye: EyeExam, badge: string, eyeLabel: string, color: string) => (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${color}`}>{badge}</span>
        <span className="text-sm font-medium text-slate-600">{eyeLabel}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {EXAM_LABELS.map(({ key, label }) => (
          <div key={String(key)}>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-sm text-slate-700 mt-0.5">{eye[key] || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl">
      <button
        onClick={() => onNavigate({ name: 'patientRecord', patientId })}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao prontuário
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Consulta de {formatDate(consultation.date)}</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Paciente: <span className="font-medium text-slate-700">{patient.name}</span> · {patient.species} · {patient.breed}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Histórico / Anamnese</h3>
        <p className="text-sm text-slate-600 whitespace-pre-wrap">{consultation.history || '—'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {renderEye(consultation.od, 'OD', 'Olho direito', 'bg-teal-100 text-teal-700')}
        {renderEye(consultation.oe, 'OE', 'Olho esquerdo', 'bg-blue-100 text-blue-700')}
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Diagnóstico</h3>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{consultation.diagnosis || '—'}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Tratamento</h3>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{consultation.treatment || '—'}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Retorno</h3>
          <p className="text-sm text-slate-600">{consultation.returnDate ? formatDate(consultation.returnDate) : 'Não definido'}</p>
        </div>
      </div>
    </div>
  );
}
