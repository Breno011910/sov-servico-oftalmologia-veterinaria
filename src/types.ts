export interface Owner {
  name: string;
  phone: string;
  email: string;
}

export interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  sex: string;
  age: string;
  weight: string;
  owner: Owner;
  notes: string;
  createdAt: string;
}

export interface EyeExam {
  reflexoPupilarDireto: string;
  reflexoPupilarConsensual: string;
  ameaca: string;
  schirmer: string;
  pio: string;
  bulboOcular: string;
  palpebra: string;
  secrecao: string;
  conjuntiva: string;
  cornea: string;
  fluoresceina: string;
  testeJones: string;
  camaraAnterior: string;
  lente: string;
  fundoVitreo: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  date: string;
  history: string;
  od: EyeExam;
  oe: EyeExam;
  diagnosis: string;
  treatment: string;
  returnDate: string;
  createdAt: string;
}

export interface EyePhoto {
  id: string;
  patientId: string;
  consultationId: string | null;
  side: string;
  storagePath: string;
  publicUrl: string;
  createdAt: string;
}

export type Screen =
  | { name: 'dashboard' }
  | { name: 'patients' }
  | { name: 'patientForm'; patientId?: string }
  | { name: 'patientRecord'; patientId: string }
  | { name: 'consultationForm'; patientId: string }
  | { name: 'consultationView'; patientId: string; consultationId: string };
