import { supabase } from '@/supabaseClient';
import type { Patient, Consultation, EyeExam, EyePhoto } from '@/types';

export function emptyEyeExam(): EyeExam {
  return {
    reflexoPupilarDireto: '',
    reflexoPupilarConsensual: '',
    ameaca: '',
    schirmer: '',
    pio: '',
    bulboOcular: '',
    palpebra: '',
    secrecao: '',
    conjuntiva: '',
    cornea: '',
    fluoresceina: '',
    testeJones: '',
    camaraAnterior: '',
    lente: '',
    fundoVitreo: '',
  };
}

export function formatDate(iso: string): string {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function mapPatient(row: Record<string, unknown>): Patient {
  return {
    id: row.id as string,
    name: row.name as string,
    species: (row.species as string) || '',
    breed: (row.breed as string) || '',
    sex: (row.sex as string) || '',
    age: (row.age as string) || '',
    weight: (row.weight as string) || '',
    owner: {
      name: (row.owner_name as string) || '',
      phone: (row.owner_phone as string) || '',
      email: (row.owner_email as string) || '',
    },
    notes: (row.notes as string) || '',
    createdAt: row.created_at as string,
  };
}

function mapConsultation(row: Record<string, unknown>): Consultation {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    date: row.date as string,
    history: (row.history as string) || '',
    od: (row.od as EyeExam) || emptyEyeExam(),
    oe: (row.oe as EyeExam) || emptyEyeExam(),
    diagnosis: (row.diagnosis as string) || '',
    treatment: (row.treatment as string) || '',
    returnDate: row.return_date as string || '',
    createdAt: row.created_at as string,
  };
}

function mapEyePhoto(row: Record<string, unknown>, url: string): EyePhoto {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    consultationId: (row.consultation_id as string) || null,
    side: (row.side as string) || '',
    storagePath: row.storage_path as string,
    publicUrl: url,
    createdAt: row.created_at as string,
  };
}

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => mapPatient(r as unknown as Record<string, unknown>));
}

export async function getPatient(id: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapPatient(data as unknown as Record<string, unknown>) : null;
}

export async function savePatient(
  patient: Omit<Patient, 'id' | 'createdAt'> & { id?: string }
): Promise<Patient> {
  const payload = {
    name: patient.name,
    species: patient.species,
    breed: patient.breed,
    sex: patient.sex,
    age: patient.age,
    weight: patient.weight,
    owner_name: patient.owner.name,
    owner_phone: patient.owner.phone,
    owner_email: patient.owner.email,
    notes: patient.notes,
  };

  if (patient.id) {
    const { data, error } = await supabase
      .from('patients')
      .update(payload)
      .eq('id', patient.id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return mapPatient(data as unknown as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from('patients')
    .insert(payload)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return mapPatient(data as unknown as Record<string, unknown>);
}

export async function deletePatient(id: string): Promise<void> {
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) throw error;
}

export async function getConsultations(): Promise<Consultation[]> {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => mapConsultation(r as unknown as Record<string, unknown>));
}

export async function getConsultationsByPatient(patientId: string): Promise<Consultation[]> {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => mapConsultation(r as unknown as Record<string, unknown>));
}

export async function getConsultation(id: string): Promise<Consultation | null> {
  const { data, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapConsultation(data as unknown as Record<string, unknown>) : null;
}

export async function saveConsultation(
  consultation: Omit<Consultation, 'id' | 'createdAt'> & { id?: string }
): Promise<Consultation> {
  const payload = {
    patient_id: consultation.patientId,
    date: consultation.date,
    history: consultation.history,
    od: consultation.od,
    oe: consultation.oe,
    diagnosis: consultation.diagnosis,
    treatment: consultation.treatment,
    return_date: consultation.returnDate || null,
  };

  const { data, error } = await supabase
    .from('consultations')
    .insert(payload)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return mapConsultation(data as unknown as Record<string, unknown>);
}

export async function getEyePhotos(patientId: string): Promise<EyePhoto[]> {
  const { data, error } = await supabase
    .from('eye_photos')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  return (data || []).map((r) => {
    const row = r as unknown as Record<string, unknown>;
    const { data: urlData } = supabase.storage
      .from('eye-photos')
      .getPublicUrl(row.storage_path as string);
    return mapEyePhoto(row, urlData.publicUrl);
  });
}

export async function uploadEyePhoto(
  patientId: string,
  consultationId: string | null,
  side: string,
  file: File,
  userId: string
): Promise<EyePhoto | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('eye-photos')
    .upload(fileName, file);
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('eye_photos')
    .insert({
      patient_id: patientId,
      consultation_id: consultationId,
      side,
      storage_path: fileName,
    })
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { data: urlData } = supabase.storage
    .from('eye-photos')
    .getPublicUrl((data as unknown as Record<string, unknown>).storage_path as string);
  return mapEyePhoto(data as unknown as Record<string, unknown>, urlData.publicUrl);
}

export async function deleteEyePhoto(photoId: string, storagePath: string): Promise<void> {
  await supabase.storage.from('eye-photos').remove([storagePath]);
  const { error } = await supabase.from('eye_photos').delete().eq('id', photoId);
  if (error) throw error;
}

export async function seedDemoData(userId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (existing) return;

  const patients = [
    {
      name: 'Thor',
      species: 'Canino',
      breed: 'Shih-tzu',
      sex: 'Macho',
      age: '7 anos',
      weight: '8 kg',
      owner_name: 'Carlos Silva',
      owner_phone: '(11) 99999-1111',
      owner_email: 'carlos@email.com',
      notes: 'Predisposição a úlceras de córnea.',
    },
    {
      name: 'Mel',
      species: 'Felino',
      breed: 'SRD',
      sex: 'Fêmea',
      age: '5 anos',
      weight: '4 kg',
      owner_name: 'Ana Costa',
      owner_phone: '(11) 98888-2222',
      owner_email: 'ana@email.com',
      notes: 'Gato de apartamento, vida toda indoor.',
    },
    {
      name: 'Luna',
      species: 'Canino',
      breed: 'Golden Retriever',
      sex: 'Fêmea',
      age: '4 anos',
      weight: '28 kg',
      owner_name: 'Roberto Lima',
      owner_phone: '(11) 97777-3333',
      owner_email: 'roberto@email.com',
      notes: 'Histórico de conjuntivite alérgica.',
    },
  ];

  for (const p of patients) {
    const { data: patData, error: patErr } = await supabase
      .from('patients')
      .insert(p)
      .select('id')
      .maybeSingle();
    if (patErr || !patData) continue;
    const patId = (patData as unknown as Record<string, unknown>).id as string;

    const consultations = patients.indexOf(p) === 0
      ? [{
          patient_id: patId,
          date: '2025-09-12',
          history: 'Tutor relata olho vermelho e lacrimejamento há 3 dias.',
          od: { ...emptyEyeExam(), schirmer: '15', pio: '14', cornea: 'Úlcera superficial', fluoresceina: 'Positiva', conjuntiva: 'Hiperêmica' },
          oe: { ...emptyEyeExam(), schirmer: '18', pio: '15', cornea: 'Transparente', fluoresceina: 'Negativa', conjuntiva: 'Normal' },
          diagnosis: 'Úlcera de córnea OD',
          treatment: 'Colírio antibiótico OD 6/6h por 7 dias. Colar protetor.',
          return_date: '2025-09-19',
        }]
      : patients.indexOf(p) === 1
      ? [{
          patient_id: patId,
          date: '2025-09-18',
          history: 'Exame de rotina, sem queixas.',
          od: { ...emptyEyeExam(), schirmer: '12', pio: '16', conjuntiva: 'Normal', cornea: 'Transparente' },
          oe: { ...emptyEyeExam(), schirmer: '13', pio: '16', conjuntiva: 'Normal', cornea: 'Transparente' },
          diagnosis: 'Sem alterações oftalmológicas',
          treatment: 'Nenhum tratamento necessário.',
          return_date: '2026-03-18',
        }]
      : [{
          patient_id: patId,
          date: '2025-09-20',
          history: 'Olho esquerdo lacrimejando e coçando.',
          od: { ...emptyEyeExam(), schirmer: '20', pio: '15', conjuntiva: 'Normal' },
          oe: { ...emptyEyeExam(), schirmer: '22', pio: '15', conjuntiva: 'Hiperêmica leve', secrecao: 'Serosa' },
          diagnosis: 'Conjuntivite alérgica OE',
          treatment: 'Colírio anti-inflamatório OE 8/8h por 5 dias.',
          return_date: '2025-09-27',
        }];

    for (const c of consultations) {
      await supabase.from('consultations').insert(c);
    }
  }
}
