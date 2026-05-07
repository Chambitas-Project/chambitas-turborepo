import { join } from 'path';
import { existsSync } from 'fs';
import { Observable } from 'rxjs';

/**
 * Robustly resolves the path to a .proto file.
 * Handles running from src (dev), dist (prod), and monorepo root contexts.
 */
const findProto = (filename: string) => {
  // Option 1: Same directory (dev mode / ts-node)
  const path1 = join(__dirname, filename);
  if (existsSync(path1)) return path1;

  // Option 2: One level up (compiled mode / dist)
  const path2 = join(__dirname, '..', filename);
  if (existsSync(path2)) return path2;

  // Fallback: Absolute path from process.cwd() assuming monorepo structure
  const path3 = join(process.cwd(), 'packages/proto', filename);
  if (existsSync(path3)) return path3;

  // Final fallback (might still fail, but provides the most likely path)
  return path2;
};

export const PROTO_PATH = {
  AUTH: findProto('auth.proto'),
  PROFILE: findProto('profile.proto'),
  MEDIA: findProto('media.proto'),
};

export const PROTO_PACKAGE = {
  AUTH: 'auth',
  PROFILE: 'profile',
  MEDIA: 'media',
};

// --- Shared Types & Enums ---

export enum UserRole {
  STUDENT = 'student',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

// --- Auth Service Interfaces ---

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  universityId: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  role: UserRole;
  accessToken: string;
  isOnboarded: boolean;
}

export interface OnboardingRequest {
  userId: string;
  role: UserRole;
  fullName?: string;
  career?: string;
  academicCycle?: number;
  companyName?: string;
  sector?: string;
}

export interface OnboardingResponse {
  success: boolean;
}

export interface IAuthService {
  Register(data: RegisterRequest): Observable<RegisterResponse>;
  Login(data: LoginRequest): Observable<LoginResponse>;
  UpdateOnboarding(data: OnboardingRequest): Observable<OnboardingResponse>;
}

// --- Profile Service Interfaces ---

export interface UpdateStudentProfileRequest {
  userId: string;
  fullName?: string;
  career?: string;
  academicCycle?: number;
  bio?: string;
  universityId?: string;
  availabilityBlocks?: string;
}

export interface UpdateEmployerProfileRequest {
  userId: string;
  companyName?: string;
  ruc?: string;
  sector?: string;
}

export interface UpdateProfileResponse {
  isOnboarded: boolean;
}

export interface IProfileService {
  UpdateStudentProfile(data: UpdateStudentProfileRequest): Observable<UpdateProfileResponse>;
  UpdateEmployerProfile(data: UpdateEmployerProfileRequest): Observable<UpdateProfileResponse>;
}

// --- Media Service Interfaces ---

export interface IMediaService {
  UploadFile(data: { fileBuffer: Uint8Array, mimeType: string, folder: string }): Observable<{ url: string }>;
  DeleteFile(data: { url: string }): Observable<{ success: boolean }>;
}
