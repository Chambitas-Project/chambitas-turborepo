import { Observable } from 'rxjs';

export interface PredictMatchRequest {
  student: StudentMLData;
  project: ProjectMLData;
}

export interface StudentMLData {
  id: string;
  career: string;
  ciclo: number;
  gpa: number;
  isGpaVerified: boolean;
  hoursAvailable: number;
  availabilityJson: string;
  hSkills: string;
  sSkills: string;
  embedding?: number[];
}

export interface ProjectMLData {
  id: string;
  title: string;
  category: string;
  maxHours: number;
  scheduleJson: string;
  reqJson: string;
  reqHSkills: string;
  complexity: string;
  embedding?: number[];
}

export interface PredictMatchResponse {
  score: number;
  cluster: number;
  skillMatchRatio: number;
  mandatoryMatch: boolean;
}

export interface PredictBatchRequest {
  student: StudentMLData;
  projects: ProjectMLData[];
}

export interface PredictBatchResponse {
  results: PredictMatchResponse[];
}

export interface EmbeddingResponse {
  success: boolean;
  status: string;
  message: string;
}

export interface MLEngineServiceClient {
  predictMatch(request: PredictMatchRequest): Observable<PredictMatchResponse>;
  predictBatch(request: PredictBatchRequest): Observable<PredictBatchResponse>;
  trainModel(request: any): Observable<any>;
  getModelStatus(request: any): Observable<any>;
  generateProjectEmbedding(request: { project_id: string }): Observable<EmbeddingResponse>;
  generateStudentEmbedding(request: { student_id: string }): Observable<EmbeddingResponse>;
  generateSkillEmbedding(request: { skill_id: string }): Observable<EmbeddingResponse>;
}
