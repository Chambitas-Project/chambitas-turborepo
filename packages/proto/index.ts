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
  MARKETPLACE: findProto('marketplace.proto'),
  MATCHING: findProto('matching.proto'),
  NOTIFICATION: findProto('notification.proto'),
  ANALYTICS: findProto('analytics.proto'),
};

export const PROTO_PACKAGE = {
  AUTH: 'auth',
  PROFILE: 'profile',
  MEDIA: 'media',
  MARKETPLACE: 'marketplace',
  MATCHING: 'matching',
  NOTIFICATION: 'notification',
  ANALYTICS: 'analytics',
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
  university_id: string;
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

export interface UniversityResponse {
  id: string;
  name: string;
  email_domain: string;
  slug: string;
}

export interface UniversityListResponse {
  universities: UniversityResponse[];
}

export interface IAuthService {
  Register(data: RegisterRequest): Observable<RegisterResponse>;
  Login(data: LoginRequest): Observable<LoginResponse>;
  UpdateOnboarding(data: OnboardingRequest): Observable<OnboardingResponse>;
  ListUniversities(data: any): Observable<UniversityListResponse>;
}

// --- Profile Service Interfaces ---

export interface GetProfileRequest {
  id: string;
}

export interface DeleteProfileRequest {
  userId: string;
}

export interface CreateStudentProfileRequest {
  userId: string;
  fullName: string;
  career: string;
  academicCycle: number;
  university_id: string;
  bio?: string;
  availabilityBlocks?: string;
  skills?: string[];
}

export interface UpdateStudentProfileRequest {
  userId: string;
  fullName?: string;
  career?: string;
  academicCycle?: number;
  bio?: string;
  availabilityBlocks?: string;
  skills?: string[];
  gpa?: number;
}

export interface CreateEmployerProfileRequest {
  userId: string;
  companyName: string;
  ruc: string;
  sector: string;
  description?: string;
}

export interface UpdateEmployerProfileRequest {
  userId: string;
  companyName?: string;
  ruc?: string;
  sector?: string;
  description?: string;
}

export interface StudentProfileResponse {
  id: string;
  fullName: string;
  career: string;
  academicCycle: number;
  university_id: string;
  bio: string;
  availabilityBlocks: string;
  skills: string[];
  gpa: number;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployerProfileResponse {
  id: string;
  companyName: string;
  ruc: string;
  sector: string;
  description: string;
  verified: boolean;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  isOnboarded: boolean;
  message?: string;
}

export interface IProfileService {
  CreateStudentProfile(data: CreateStudentProfileRequest): Observable<ProfileResponse>;
  GetStudentProfile(data: GetProfileRequest): Observable<StudentProfileResponse>;
  UpdateStudentProfile(data: UpdateStudentProfileRequest): Observable<ProfileResponse>;
  
  CreateEmployerProfile(data: CreateEmployerProfileRequest): Observable<ProfileResponse>;
  GetEmployerProfile(data: GetProfileRequest): Observable<EmployerProfileResponse>;
  UpdateEmployerProfile(data: UpdateEmployerProfileRequest): Observable<ProfileResponse>;
  DeleteProfile(data: DeleteProfileRequest): Observable<ProfileResponse>;
  SearchProfiles(data: SearchProfilesRequest): Observable<SearchProfilesResponse>;
  GetProfile(data: GetProfileRequest): Observable<UnifiedProfileResponse>;
}

export interface SearchProfilesRequest {
  query: string;
  role?: string;
  limit?: number;
  offset?: number;
}

export interface SearchProfilesResponse {
  profiles: UnifiedProfileResponse[];
}

export interface UnifiedProfileResponse {
  id: string;
  role: string;
  fullName: string;
  career?: string;
  universityId?: string;
  sector?: string;
  bio?: string;
}

// --- Media Service Interfaces ---

export interface IMediaService {
  UploadFile(data: { fileBuffer: Uint8Array, mimeType: string, folder: string }): Observable<{ url: string }>;
  DeleteFile(data: { url: string }): Observable<{ success: boolean }>;
}

// --- Marketplace Service Interfaces ---

export interface Project {
  id: string;
  title: string;
  description: string;
  employer_id: string;
  budget: number;
  requirements: string[];
  status: string;
  service_category: string;
  university_ids: string[];
  deadline: string;
  max_hours_week: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  employer_id: string;
  budget: number;
  requirements: string[];
  service_category: string;
  university_ids?: string[];
  deadline?: string;
  max_hours_week?: number;
}

export interface University {
  id: string;
  name: string;
  email_domain: string;
  slug: string;
  is_active: boolean;
  logo_url?: string;
}


export interface GetProjectRequest {
  id: string;
}

export interface ListProjectsRequest {
  employer_id?: string;
  status?: string;
  service_category?: string;
  university_id?: string; // Used for student filtering
  limit?: number;
  offset?: number;
}

export interface ListProjectsResponse {
  projects: Project[];
  total: number;
}

export interface UpdateProjectRequest {
  id: string;
  title?: string;
  description?: string;
  budget?: number;
  requirements?: string[];
  status?: string;
  service_category?: string;
  university_ids?: string[];
  deadline?: string;
  max_hours_week?: number;
}


export interface DeleteProjectRequest {
  id: string;
}

export interface DeleteProjectResponse {
  success: boolean;
  message: string;
}

export interface Application {
  id: string;
  project_id: string;
  student_id: string;
  status: string;
  cover_note: string;
  match_id?: string;
  applied_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface CreateApplicationRequest {
  project_id: string;
  student_id: string;
  cover_note: string;
  match_id?: string;
}

export interface GetApplicationRequest {
  id: string;
}

export interface ListStudentApplicationsRequest {
  student_id: string;
  limit?: number;
  offset?: number;
}

export interface ListProjectApplicationsRequest {
  project_id: string;
  limit?: number;
  offset?: number;
}

export interface ListApplicationsResponse {
  applications: Application[];
  total: number;
}

export interface UpdateApplicationStatusRequest {
  id: string;
  status: string;
}

export interface IMarketplaceService {
  // Projects
  CreateProject(request: CreateProjectRequest): Observable<Project>;
  GetProject(request: GetProjectRequest): Observable<Project>;
  ListProjects(request: ListProjectsRequest): Observable<ListProjectsResponse>;
  UpdateProject(request: UpdateProjectRequest): Observable<Project>;
  DeleteProject(request: DeleteProjectRequest): Observable<DeleteProjectResponse>;
  
  // Applications
  CreateApplication(request: CreateApplicationRequest): Observable<Application>;
  GetApplication(request: GetApplicationRequest): Observable<Application>;
  ListStudentApplications(request: ListStudentApplicationsRequest): Observable<ListApplicationsResponse>;
  ListProjectApplications(request: ListProjectApplicationsRequest): Observable<ListApplicationsResponse>;
  UpdateApplicationStatus(request: UpdateApplicationStatusRequest): Observable<Application>;
}


// --- Matching Service Interfaces ---

export interface GetRecommendationsRequest {
  userId: string;
  limit: number;
}

export interface Recommendation {
  jobId: string;
  score: number;
  reason: string;
}

export interface GetRecommendationsResponse {
  recommendations: Recommendation[];
}

export interface IMatchingService {
  GetRecommendations(data: GetRecommendationsRequest): Observable<GetRecommendationsResponse>;
}

// --- Notification Service Interfaces ---

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  templateName?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId: string;
}

export interface INotificationService {
  SendEmail(data: SendEmailRequest): Observable<SendEmailResponse>;
}

// --- Analytics Service Interfaces ---

export interface TrackEventRequest {
  userId: string;
  eventType: string;
  source: string;
  payloadJson: string;
  timestamp: string;
}

export interface TrackEventResponse {
  success: boolean;
}

export interface IAnalyticsService {
  TrackEvent(data: TrackEventRequest): Observable<TrackEventResponse>;
}
