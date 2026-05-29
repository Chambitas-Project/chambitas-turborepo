import { Observable } from 'rxjs';

export enum UserRole {
  STUDENT = 'student',
  EMPLOYER = 'employer',
  ADMIN = 'admin'
}

export const PROTO_PACKAGE = {
  AUTH: 'auth',
  PROFILE: 'profile',
  MEDIA: 'media',
  MARKETPLACE: 'marketplace',
  MATCHING: 'matching',
  NOTIFICATION: 'notification',
  ANALYTICS: 'analytics'
};

import { join } from 'path';

export const PROTO_PATH = {
  AUTH: join(__dirname, '..', 'auth.proto'),
  PROFILE: join(__dirname, '..', 'profile.proto'),
  MEDIA: join(__dirname, '..', 'media.proto'),
  MARKETPLACE: join(__dirname, '..', 'marketplace.proto'),
  MATCHING: join(__dirname, '..', 'matching.proto'),
  NOTIFICATION: join(__dirname, '..', 'notification.proto'),
  ANALYTICS: join(__dirname, '..', 'analytics.proto'),
  ML_ENGINE: join(__dirname, '..', 'ml-engine.proto')
};

// --- Auth Interfaces ---

export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
  university_id?: string; // Opcional: solo requerido para students
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
  role: string;
  accessToken: string;
  isOnboarded: boolean;
}

export interface OnboardingRequest {
  user_id: string;
  role: string;
  full_name?: string;
  career?: string;
  academic_cycle?: number;
  company_name?: string;
  sector?: string;
  skills?: string[];
}

export interface OnboardingResponse {
  success: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
  access_token?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
}

export interface University {
  id: string;
  name: string;
  email_domain: string;
  slug: string;
}

export interface UniversityListResponse {
  universities: University[];
}

export interface UniversityResponse {
  id: string;
  name: string;
  email_domain: string;
  slug: string;
  is_active: boolean;
  logo_url?: string;
}

// --- Profile Interfaces (Snake Case) ---

export interface ProfileResponse {
  success: boolean;
  is_onboarded: boolean;
  message?: string;
}

export interface SkillInfo {
  id: string;
  name: string;
  proficiency_level: number;
  verified: boolean;
}

export interface ActivityInfo {
  id: string;
  title: string;
  status: string;
  type: number;
  date: string;
}

export interface UnifiedProfileResponse {
  id: string;
  role: string;
  full_name: string;
  career?: string;
  university_id?: string;
  university_name?: string;
  university_logo?: string;
  bio?: string;
  academic_cycle?: number;
  gpa?: number;
  skills: SkillInfo[];
  activity: ActivityInfo[];
  is_onboarded: boolean;
  availability_blocks?: string;
  company_name?: string;
  commercial_name?: string;
  is_gpa_verified: boolean;
  evidence_url?: string;
}

export interface CreateStudentProfileRequest {
  user_id: string;
  full_name: string;
  career: string;
  academic_cycle: number;
  university_id: string;
  bio?: string;
  availability_blocks?: string;
  skills: string[];
}

export interface SkillUpdate {
  skill_id: string;
  proficiency_level: number;
  deleted: boolean;
}

export interface UpdateStudentProfileRequest {
  user_id: string;
  full_name?: string;
  career?: string;
  academic_cycle?: number;
  bio?: string;
  availability_blocks?: string;
  skill_updates?: SkillUpdate[];
  gpa?: number;
  is_gpa_verified?: boolean;
  evidence_url?: string;
}

export interface CreateEmployerProfileRequest {
  user_id: string;
  company_name: string;
  ruc: string;
  sector: string;
  description?: string;
}

export interface UpdateEmployerProfileRequest {
  user_id: string;
  company_name?: string;
  ruc?: string;
  sector?: string;
  description?: string;
}

export interface SkillInput {
  name: string;              // Nombre o UUID de la skill del catálogo
  proficiency_level: number; // 1=Básico, 2=Elemental, 3=Intermedio, 4=Avanzado, 5=Experto
}

export interface BaseOnboardingRequest {
  user_id: string;
  role: string;
}

export interface StudentOnboardingRequest extends BaseOnboardingRequest {
  role: 'student';
  full_name: string;
  career_id: string;
  academic_cycle: number;
  skill_inputs: SkillInput[];
  bio?: string;
  gpa?: number;
  availability_blocks?: string;
  is_gpa_verified?: boolean;
  evidence_url?: string;
}

export interface EmployerOnboardingRequest extends BaseOnboardingRequest {
  role: 'employer';
  company_name: string;
  name: string;
  description: string;
}

export type CompleteOnboardingRequest = StudentOnboardingRequest | EmployerOnboardingRequest;

export interface Skill {
  id: string;
  name: string;
  category: string;
  type: string;
}

export interface ListSkillsRequest {
  category?: string;
}

export interface ListSkillsResponse {
  skills: Skill[];
}

export interface StudentProfileResponse {
  id: string;
  full_name: string;
  career: string;
  academic_cycle: number;
  university_id: string;
  bio: string;
  availability_blocks: string;
  skills: string[];
  gpa: number;
  is_onboarded: boolean;
  is_gpa_verified: boolean;
  evidence_url?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployerProfileResponse {
  id: string;
  company_name: string;
  ruc: string;
  sector: string;
  description: string;
  verified: boolean;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

// --- Marketplace Interfaces ---

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
  skills: SkillRequirement[];
  schedule_constraints?: string;
}

export interface SkillRequirement {
  skill_id: string;
  skill_name?: string;
  min_proficiency: number;
  mandatory: boolean;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  employer_id: string;
  budget: number;
  requirements: string[];
  service_category: string;
  university_ids: string[];
  deadline: string;
  max_hours_week: number;
  skills: SkillRequirement[];
  schedule_constraints?: string;
}

export interface GetProjectRequest {
  id: string;
}

export interface ListProjectsRequest {
  employer_id?: string;
  status?: string;
  service_category?: string;
  university_id?: string;
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
  skills?: SkillRequirement[];
  schedule_constraints?: string;
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
  student_name?: string;
  student_career?: string;
  student_academic_cycle?: number;
  match_score?: number;
  project_title?: string;
  student_skills?: SkillInfo[];
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

export interface DeleteApplicationRequest {
  id: string;
}

export interface DeleteApplicationResponse {
  success: boolean;
  message?: string;
}

export interface CompleteProjectRequest {
  id: string;
}

export interface CompleteProjectResponse {
  success: boolean;
  message: string;
}

// --- Review Interfaces ---

export interface Review {
  id: string;
  application_id: string;
  reviewer_id: string;
  reviewer_role: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name?: string;
}

export interface CreateReviewRequest {
  application_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
}

export interface ListReviewsRequest {
  student_id?: string;
  employer_id?: string;
  project_id?: string;
}

export interface ListReviewsResponse {
  reviews: Review[];
  average_rating: number;
}

export interface UpdateReviewRequest {
  id: string;
  reviewer_id: string;
  rating?: number;
  comment?: string;
}

export interface DeleteReviewRequest {
  id: string;
  reviewer_id: string;
}

// --- Matching Interfaces ---

export interface GetRecommendationsRequest {
  userId: string;
  limit?: number;
}

export interface Recommendation {
  jobId: string;
  score: number;
  reason: string;
  aiMetadata: string;
  matchId: string;
}

export interface GetRecommendationsResponse {
  recommendations: Recommendation[];
}

export interface UpdateMatchStatusRequest {
  matchId: string;
  status: string;
  userId: string;
}

export interface UpdateMatchStatusResponse {
  success: boolean;
}

// --- Media Interfaces ---

export interface UploadRequest {
  file_buffer: Buffer | Uint8Array;
  mime_type: string;
  folder: string;
}

export interface UploadResponse {
  url: string;
}

// --- Notification Interfaces ---

export interface SendPushNotificationRequest {
  user_id: string;
  title: string;
  body: string;
  data_json?: string;
}

export interface SendPushNotificationResponse {
  success: boolean;
  message_id: string;
}

export enum NotificationType {
  SYSTEM = 0,
  MATCH = 1,
  APPLICATION = 2,
  MESSAGE = 3,
}

export enum NotificationPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

export interface CreateNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  metadata_json: string;
}

export interface CreateNotificationResponse {
  success: boolean;
  notification_id: string;
}

// --- Analytics Interfaces ---

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

// --- Service Interfaces ---

export interface IAuthService {
  Register(data: RegisterRequest, metadata?: any): Observable<RegisterResponse>;
  Login(data: LoginRequest, metadata?: any): Observable<LoginResponse>;
  UpdateOnboarding(data: OnboardingRequest, metadata?: any): Observable<OnboardingResponse>;
  ListUniversities(data: {}, metadata?: any): Observable<UniversityListResponse>;
  ForgotPassword(data: ForgotPasswordRequest, metadata?: any): Observable<AuthResponse>;
  ResetPassword(data: ResetPasswordRequest, metadata?: any): Observable<AuthResponse>;
}

export interface IProfileService {
  CreateStudentProfile(data: CreateStudentProfileRequest, metadata?: any): Observable<ProfileResponse>;
  GetStudentProfile(data: { id: string }, metadata?: any): Observable<StudentProfileResponse>;
  UpdateStudentProfile(data: UpdateStudentProfileRequest, metadata?: any): Observable<ProfileResponse>;
  CreateEmployerProfile(data: CreateEmployerProfileRequest, metadata?: any): Observable<ProfileResponse>;
  GetEmployerProfile(data: { id: string }, metadata?: any): Observable<EmployerProfileResponse>;
  UpdateEmployerProfile(data: UpdateEmployerProfileRequest, metadata?: any): Observable<ProfileResponse>;
  UpdateProfile(request: CompleteOnboardingRequest, metadata?: any): Observable<ProfileResponse>;
  DeleteProfile(data: { user_id: string }, metadata?: any): Observable<ProfileResponse>;
  SearchProfiles(data: { query: string, role?: string, limit?: number, offset?: number }, metadata?: any): Observable<{ profiles: UnifiedProfileResponse[] }>;
  GetProfile(data: { id: string }, metadata?: any): Observable<UnifiedProfileResponse>;
  CompleteOnboarding(data: CompleteOnboardingRequest, metadata?: any): Observable<ProfileResponse>;
  ListSkills(data: ListSkillsRequest, metadata?: any): Observable<ListSkillsResponse>;
  ListCareers(data: ListCareersRequest, metadata?: any): Observable<ListCareersResponse>;
}

export interface Career {
  id: string;
  name: string;
  area: string;
  is_active: boolean;
}

export interface ListCareersRequest {
  university_id?: string;
  area?: string;
}

export interface ListCareersResponse {
  careers: Career[];
}

export interface IMarketplaceService {
  CreateProject(data: CreateProjectRequest, metadata?: any): Observable<Project>;
  GetProject(data: GetProjectRequest, metadata?: any): Observable<Project>;
  ListProjects(data: ListProjectsRequest, metadata?: any): Observable<ListProjectsResponse>;
  UpdateProject(data: UpdateProjectRequest, metadata?: any): Observable<Project>;
  DeleteProject(request: DeleteProjectRequest, metadata?: any): Observable<DeleteProjectResponse>;
  CompleteProject(request: CompleteProjectRequest, metadata?: any): Observable<CompleteProjectResponse>;
  CreateApplication(data: CreateApplicationRequest, metadata?: any): Observable<Application>;
  GetApplication(data: GetApplicationRequest, metadata?: any): Observable<Application>;
  ListStudentApplications(data: ListStudentApplicationsRequest, metadata?: any): Observable<ListApplicationsResponse>;
  ListProjectApplications(data: ListProjectApplicationsRequest, metadata?: any): Observable<ListApplicationsResponse>;
  UpdateApplicationStatus(data: UpdateApplicationStatusRequest, metadata?: any): Observable<Application>;
  DeleteApplication(data: DeleteApplicationRequest, metadata?: any): Observable<DeleteApplicationResponse>;
  CreateReview(data: CreateReviewRequest, metadata?: any): Observable<Review>;
  ListReviews(data: ListReviewsRequest, metadata?: any): Observable<ListReviewsResponse>;
  UpdateReview(data: UpdateReviewRequest, metadata?: any): Observable<Review>;
  DeleteReview(data: DeleteReviewRequest, metadata?: any): Observable<Review>;
}

export interface IMatchingService {
  GetRecommendations(data: GetRecommendationsRequest, metadata?: any): Observable<GetRecommendationsResponse>;
  UpdateMatchStatus(data: UpdateMatchStatusRequest, metadata?: any): Observable<UpdateMatchStatusResponse>;
}

export interface IMediaService {
  UploadFile(data: UploadRequest, metadata?: any): Observable<UploadResponse>;
  DeleteFile(data: { url: string }, metadata?: any): Observable<{ success: boolean }>;
}

export interface INotificationService {
  CreateNotification(data: CreateNotificationRequest, metadata?: any): Observable<CreateNotificationResponse>;
  SendPushNotification(data: SendPushNotificationRequest, metadata?: any): Observable<SendPushNotificationResponse>;
}

export interface IAnalyticsService {
  TrackEvent(data: TrackEventRequest, metadata?: any): Observable<TrackEventResponse>;
}
