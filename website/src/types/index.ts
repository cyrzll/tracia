export interface Course {
  kdmk: string;
  nmmk: string;
  klpk: string;
  sks: number;
  sts: string;
}

export interface SemesterKrs {
  ta: string;
  kode_ta: string;
  krs: Course[];
}

export interface CourseGrade {
  kdmk: string;
  nmmk: string;
  sks: string | number;
  nl: string;
}

export interface GradeDist {
  nilai: string;
  jumlah: number;
}

export interface KhsHeader {
  total_sks: number;
  ipk: number;
  total_nilai: GradeDist[];
}

export interface Student {
  nim: string;
  nama: string;
  email: string;
  gender: string;
  foto: string;
  gpa: number;
  sks: number;
  semester: number;
  risk_probability: number;
  risk_level: string;
  xp?: number;
  streak?: number;
  completedQuests?: string | null;
}

export interface Billing {
  status: string;
  total_tagih: number;
  informasi: string;
  tahun_ajaran: string;
  status_pembayaran: string;
  via?: string;
  tanggal?: string;
  SKS_sekarang?: number;
  SPP_sekarang?: number;
  GDG_sekarang?: number;
  MOD_sekarang?: number;
  BK_sekarang?: number;
  POLI_sekarang?: number;
}

export interface JWTPayload {
  uid: string;
  username: string;
  name: string;
  level: string;
}

export interface AuthResult {
  isLoggedIn: boolean;
  adminInfo: JWTPayload | null;
}
