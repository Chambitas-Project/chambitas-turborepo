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
}

export interface PredictMatchResponse {
  score: number;
  cluster: number;
  skillMatchRatio: number;
  mandatoryMatch: boolean;
}

export interface MLEngineServiceClient {
  predictMatch(request: PredictMatchRequest): Observable<PredictMatchResponse>;
  trainModel(request: any): Observable<any>;
  getModelStatus(request: any): Observable<any>;
}
