import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Calendar, Stethoscope, Camera, Trash2, GitCompare } from 'lucide-react';
import type { Screen, Patient, Consultation, EyePhoto } from '@/types';
import { getPatient, getConsultationsByPatient, getEyePhotos, formatDate, uploadEyePhoto, deleteEyePhoto } from '@/storage';
import { useAuth } from '@/auth';

interface PatientRecordProps {
  patientId: string;
  onNavigate: (screen: Screen) => void;
}

const EXAM_LABELS: { key: keyof import('@/types').EyeExam; label: string }[] = [
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

export default function PatientRecord({ patientId, onNavigate }: PatientRecordProps) {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [photos, setPhotos] = useState<EyePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompare, setShowCompare] = useState(false);
  const [compareA, setCompareA] = useState<string>('');
  const [compareB, setCompareB] = useState<string>('');
  const [uploadSide, setUploadSide] = useState<string>('OD');
  const [uploadConsultId, setUploadConsultId] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const loadData = () => {
    Promise.all([
      getPatient(patientId),
      getConsultationsByPatient(patientId),
      getEyePhotos(patientId),
    ]).then(([p, c, ph]) => {
      setPatient(p);
      setConsultations(c);
      setPhotos(ph);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, [patientId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      await uploadEyePhoto(
        patientId,
        uploadConsultId || null,
        uploadSide,
        file,
        user.id
      );
      loadData();
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleDeletePhoto = async (photoId: string, storagePath: string) => {
    await deleteEyePhoto(photoId, storagePath);
    loadData();
  };

  const infoCard = (label: string, value: string) => (
    <div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-sm text-slate-700 mt-0.5">{value || '—'}</p>
    </div>
  );

  if (loading) return <div className="p-8 text-slate-400 text-sm">Carregando...</div>;
  if (!patient) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Paciente não encontrado.</p>
        <button onClick={() => onNavigate({ name: 'patients' })} className="mt-3 text-teal-600 text-sm">
          Voltar para pacientes
        </button>
      </div>
    );
  }

  const consultA = consultations.find((c) => c.id === compareA);
  const consultB = consultations.find((c) => c.id === compareB);

  return (
    <div className="p-8 max-w-5xl">
      <button
        onClick={() => onNavigate({ name: 'patients' })}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para pacientes
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{patient.name}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {patient.species} · {patient.breed} · {patient.age}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCompare(!showCompare)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              showCompare ? 'bg-teal-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            Comparar consultas
          </button>
          <button
            onClick={() => onNavigate({ name: 'patientForm', patientId })}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={() => onNavigate({ name: 'consultationForm', patientId })}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova consulta
          </button>
        </div>
      </div>

      {/* Animal + Owner */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Dados do animal</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {infoCard('Espécie', patient.species)}
            {infoCard('Raça', patient.breed)}
            {infoCard('Sexo', patient.sex)}
            {infoCard('Idade', patient.age)}
            {infoCard('Peso', patient.weight)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Dados do proprietário</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {infoCard('Nome', patient.owner.name)}
            {infoCard('Telefone', patient.owner.phone)}
            {infoCard('E-mail', patient.owner.email)}
          </div>
        </div>
      </div>

      {patient.notes && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Observações</h3>
          <p className="text-sm text-slate-600">{patient.notes}</p>
        </div>
      )}

      {/* Comparison */}
      {showCompare && consultations.length >= 2 && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Comparação entre consultas</h3>
          <div className="flex gap-3 mb-4">
            <select
              value={compareA}
              onChange={(e) => setCompareA(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              <option value="">Consulta A</option>
              {consultations.map((c) => (
                <option key={c.id} value={c.id}>{formatDate(c.date)}</option>
              ))}
            </select>
            <span className="self-center text-slate-400">→</span>
            <select
              value={compareB}
              onChange={(e) => setCompareB(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              <option value="">Consulta B</option>
              {consultations.map((c) => (
                <option key={c.id} value={c.id}>{formatDate(c.date)}</option>
              ))}
            </select>
          </div>

          {consultA && consultB && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-xs font-medium text-slate-400">Campo</th>
                    <th className="text-left py-2 px-4 text-xs font-medium text-teal-600">{formatDate(consultA.date)}</th>
                    <th className="text-left py-2 px-4 text-xs font-medium text-blue-600">{formatDate(consultB.date)}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50">
                    <td className="py-2 pr-4 text-xs text-slate-400 font-medium">Diagnóstico</td>
                    <td className="py-2 px-4 text-slate-600">{consultA.diagnosis || '—'}</td>
                    <td className="py-2 px-4 text-slate-600">{consultB.diagnosis || '—'}</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-2 pr-4 text-xs text-slate-400 font-medium">Tratamento</td>
                    <td className="py-2 px-4 text-slate-600">{consultA.treatment || '—'}</td>
                    <td className="py-2 px-4 text-slate-600">{consultB.treatment || '—'}</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-2 pr-4 text-xs text-slate-400 font-medium">Retorno</td>
                    <td className="py-2 px-4 text-slate-600">{consultA.returnDate ? formatDate(consultA.returnDate) : '—'}</td>
                    <td className="py-2 px-4 text-slate-600">{consultB.returnDate ? formatDate(consultB.returnDate) : '—'}</td>
                  </tr>
                  {EXAM_LABELS.map((field) => (
                    <tr key={String(field.key)} className="border-b border-slate-50">
                      <td className="py-2 pr-4 text-xs text-slate-400 font-medium">{field.label}</td>
                      <td className="py-2 px-4 text-slate-600">
                        <span className="text-[10px] text-teal-400 mr-1">OD</span>{consultA.od[field.key] || '—'}
                        <br />
                        <span className="text-[10px] text-blue-400 mr-1">OE</span>{consultA.oe[field.key] || '—'}
                      </td>
                      <td className="py-2 px-4 text-slate-600">
                        <span className="text-[10px] text-teal-400 mr-1">OD</span>{consultB.od[field.key] || '—'}
                        <br />
                        <span className="text-[10px] text-blue-400 mr-1">OE</span>{consultB.oe[field.key] || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Comparison photos */}
          {consultA && consultB && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[consultA, consultB].map((c) => {
                const cPhotos = photos.filter((ph) => ph.consultationId === c.id);
                return (
                  <div key={c.id}>
                    <p className="text-xs font-medium text-slate-500 mb-2">Fotos — {formatDate(c.date)}</p>
                    <div className="flex gap-2 flex-wrap">
                      {cPhotos.length === 0 && <span className="text-xs text-slate-400">Sem fotos</span>}
                      {cPhotos.map((ph) => (
                        <div key={ph.id} className="relative group">
                          <img src={ph.publicUrl} alt={ph.side} className="w-24 h-24 object-cover rounded-lg border border-slate-200" />
                          <span className="absolute top-1 left-1 text-[10px] bg-slate-700 text-white px-1.5 py-0.5 rounded">{ph.side}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Photos */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Fotos dos olhos</h3>
        <div className="flex gap-3 mb-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Olho</label>
            <select
              value={uploadSide}
              onChange={(e) => setUploadSide(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              <option value="OD">OD — Olho direito</option>
              <option value="OE">OE — Olho esquerdo</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Vincular à consulta</label>
            <select
              value={uploadConsultId}
              onChange={(e) => setUploadConsultId(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              <option value="">Sem vínculo</option>
              {consultations.map((c) => (
                <option key={c.id} value={c.id}>{formatDate(c.date)}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors cursor-pointer">
            <Camera className="w-4 h-4" />
            {uploading ? 'Enviando...' : 'Anexar foto'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        {photos.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma foto anexada.</p>
        ) : (
          <div className="flex gap-3 flex-wrap">
            {photos.map((ph) => (
              <div key={ph.id} className="relative group">
                <img src={ph.publicUrl} alt={ph.side} className="w-28 h-28 object-cover rounded-lg border border-slate-200" />
                <span className="absolute top-1 left-1 text-[10px] bg-slate-700 text-white px-1.5 py-0.5 rounded">{ph.side}</span>
                <button
                  onClick={() => handleDeletePhoto(ph.id, ph.storagePath)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {ph.consultationId && (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-slate-700 text-white px-1.5 py-0.5 rounded">
                    {consultations.find((c) => c.id === ph.consultationId) ? formatDate(consultations.find((c) => c.id === ph.consultationId)!.date) : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Histórico de consultas</h3>
        </div>
        {consultations.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-slate-400 mb-3">Nenhuma consulta registrada.</p>
            <button
              onClick={() => onNavigate({ name: 'consultationForm', patientId })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova consulta
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {consultations.map((c) => (
              <button
                key={c.id}
                onClick={() => onNavigate({ name: 'consultationView', patientId, consultationId: c.id })}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-300" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{formatDate(c.date)}</p>
                    <p className="text-xs text-slate-400">{c.diagnosis || 'Sem diagnóstico'}</p>
                  </div>
                </div>
                <span className="text-xs text-teal-600 font-medium">Ver consulta →</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
