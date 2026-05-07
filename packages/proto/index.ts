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

// --- Shared Interfaces for Type Safety ---

export interface IAuthService {
  Register(data: any): Observable<any>;
  Login(data: any): Observable<any>;
  UpdateOnboarding(data: any): Observable<any>;
}

export interface IProfileService {
  UpdateStudentProfile(data: any): Observable<any>;
  UpdateEmployerProfile(data: any): Observable<any>;
}

export interface IMediaService {
  UploadFile(data: { fileBuffer: Uint8Array, mimeType: string, folder: string }): Observable<{ url: string }>;
  DeleteFile(data: { url: string }): Observable<{ success: boolean }>;
}
