export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string | null
          cover_note: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          match_id: string | null
          project_id: string
          status: Database["public"]["Enums"]["application_status"] | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          cover_note?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          match_id?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["application_status"] | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          cover_note?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          match_id?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      careers: {
        Row: {
          area: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          university_id: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          university_id?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "careers_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id: string
          name: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_outcomes_tracking: {
        Row: {
          cohort_tag: string | null
          employer_id_hired_by: string | null
          first_application_at: string | null
          first_microjob_completed_at: string | null
          formal_employment_at: string | null
          id: string
          income_generated: number | null
          post_project_status:
          | Database["public"]["Enums"]["post_project_status"]
          | null
          skills_verified_count: number | null
          student_id: string
          time_to_hire_days: number | null
          total_microjobs_completed: number | null
          university_id: string
          updated_at: string | null
        }
        Insert: {
          cohort_tag?: string | null
          employer_id_hired_by?: string | null
          first_application_at?: string | null
          first_microjob_completed_at?: string | null
          formal_employment_at?: string | null
          id?: string
          income_generated?: number | null
          post_project_status?:
          | Database["public"]["Enums"]["post_project_status"]
          | null
          skills_verified_count?: number | null
          student_id: string
          time_to_hire_days?: number | null
          total_microjobs_completed?: number | null
          university_id: string
          updated_at?: string | null
        }
        Update: {
          cohort_tag?: string | null
          employer_id_hired_by?: string | null
          first_application_at?: string | null
          first_microjob_completed_at?: string | null
          formal_employment_at?: string | null
          id?: string
          income_generated?: number | null
          post_project_status?:
          | Database["public"]["Enums"]["post_project_status"]
          | null
          skills_verified_count?: number | null
          student_id?: string
          time_to_hire_days?: number | null
          total_microjobs_completed?: number | null
          university_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employment_outcomes_tracking_employer_id_hired_by_fkey"
            columns: ["employer_id_hired_by"]
            isOneToOne: false
            referencedRelation: "employer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employment_outcomes_tracking_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employment_outcomes_tracking_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      infrastructure_performance_metrics: {
        Row: {
          cpu_usage_percent: number | null
          db_query_time_ms: number | null
          endpoint: string | null
          estimated_energy_wh: number | null
          http_status_code: number | null
          id: string
          k8s_pod_id: string | null
          latency_ms: number | null
          memory_usage_mb: number | null
          microservice_name: Database["public"]["Enums"]["microservice_name"]
          recorded_at: string
          transaction_count: number | null
          university_id: string | null
        }
        Insert: {
          cpu_usage_percent?: number | null
          db_query_time_ms?: number | null
          endpoint?: string | null
          estimated_energy_wh?: number | null
          http_status_code?: number | null
          id?: string
          k8s_pod_id?: string | null
          latency_ms?: number | null
          memory_usage_mb?: number | null
          microservice_name: Database["public"]["Enums"]["microservice_name"]
          recorded_at: string
          transaction_count?: number | null
          university_id?: string | null
        }
        Update: {
          cpu_usage_percent?: number | null
          db_query_time_ms?: number | null
          endpoint?: string | null
          estimated_energy_wh?: number | null
          http_status_code?: number | null
          id?: string
          k8s_pod_id?: string | null
          latency_ms?: number | null
          memory_usage_mb?: number | null
          microservice_name?: Database["public"]["Enums"]["microservice_name"]
          recorded_at?: string
          transaction_count?: number | null
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_performance_metrics_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      institutional_emails: {
        Row: {
          id: string
          regex_pattern: string
          role: Database["public"]["Enums"]["user_role"]
          university_id: string
        }
        Insert: {
          id?: string
          regex_pattern: string
          role: Database["public"]["Enums"]["user_role"]
          university_id: string
        }
        Update: {
          id?: string
          regex_pattern?: string
          role?: Database["public"]["Enums"]["user_role"]
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institutional_emails_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      institutional_integrity_checks: {
        Row: {
          actual_row_count: number | null
          check_type: Database["public"]["Enums"]["integrity_check_type"]
          checksum: string | null
          cross_tenant_leaks_found: number | null
          duration_ms: number | null
          executed_at: string
          executed_by: string | null
          expected_row_count: number | null
          id: string
          previous_checksum: string | null
          rls_policies_failed: number | null
          rls_policies_verified: number | null
          status: Database["public"]["Enums"]["integrity_status"]
          table_audited: string
          university_id: string
        }
        Insert: {
          actual_row_count?: number | null
          check_type: Database["public"]["Enums"]["integrity_check_type"]
          checksum?: string | null
          cross_tenant_leaks_found?: number | null
          duration_ms?: number | null
          executed_at: string
          executed_by?: string | null
          expected_row_count?: number | null
          id?: string
          previous_checksum?: string | null
          rls_policies_failed?: number | null
          rls_policies_verified?: number | null
          status: Database["public"]["Enums"]["integrity_status"]
          table_audited: string
          university_id: string
        }
        Update: {
          actual_row_count?: number | null
          check_type?: Database["public"]["Enums"]["integrity_check_type"]
          checksum?: string | null
          cross_tenant_leaks_found?: number | null
          duration_ms?: number | null
          executed_at?: string
          executed_by?: string | null
          expected_row_count?: number | null
          id?: string
          previous_checksum?: string | null
          rls_policies_failed?: number | null
          rls_policies_verified?: number | null
          status?: Database["public"]["Enums"]["integrity_status"]
          table_audited?: string
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institutional_integrity_checks_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          feature_vector: Json | null
          id: string
          insights: Json | null
          model_version_id: string
          project_id: string
          score: number | null
          status: Database["public"]["Enums"]["match_status"] | null
          student_id: string
        }
        Insert: {
          created_at?: string | null
          feature_vector?: Json | null
          id?: string
          insights?: Json | null
          model_version_id: string
          project_id: string
          score?: number | null
          status?: Database["public"]["Enums"]["match_status"] | null
          student_id: string
        }
        Update: {
          created_at?: string | null
          feature_vector?: Json | null
          id?: string
          insights?: Json | null
          model_version_id?: string
          project_id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["match_status"] | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "ml_model_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_model_versions: {
        Row: {
          active: boolean | null
          algorithm: string | null
          f1_score: number | null
          hyperparameters: Json | null
          id: string
          precision_val: number | null
          recall_val: number | null
          trained_at: string | null
          version_tag: string
        }
        Insert: {
          active?: boolean | null
          algorithm?: string | null
          f1_score?: number | null
          hyperparameters?: Json | null
          id?: string
          precision_val?: number | null
          recall_val?: number | null
          trained_at?: string | null
          version_tag: string
        }
        Update: {
          active?: boolean | null
          algorithm?: string | null
          f1_score?: number | null
          hyperparameters?: Json | null
          id?: string
          precision_val?: number | null
          recall_val?: number | null
          trained_at?: string | null
          version_tag?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          email_sent_at: string | null
          id: string
          message: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["notification_priority"]
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_sent_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_sent_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      project_required_skills: {
        Row: {
          id: string
          mandatory: boolean | null
          min_proficiency: number | null
          project_id: string
          skill_id: string
        }
        Insert: {
          id?: string
          mandatory?: boolean | null
          min_proficiency?: number | null
          project_id: string
          skill_id: string
        }
        Update: {
          id?: string
          mandatory?: boolean | null
          min_proficiency?: number | null
          project_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_required_skills_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_required_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      project_universities: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          project_id: string
          university_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          project_id: string
          university_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          project_id?: string
          university_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_universities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_universities_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string | null
          deadline: string | null
          deleted_at: string | null
          description: string | null
          embedding: string | null
          employer_id: string
          id: string
          max_hours_week: number | null
          requirements: string[] | null
          schedule_constraints: Json | null
          service_category: string
          status: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          deadline?: string | null
          deleted_at?: string | null
          description?: string | null
          embedding?: string | null
          employer_id: string
          id?: string
          max_hours_week?: number | null
          requirements?: string[] | null
          schedule_constraints?: Json | null
          service_category: string
          status?: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          deadline?: string | null
          deleted_at?: string | null
          description?: string | null
          embedding?: string | null
          employer_id?: string
          id?: string
          max_hours_week?: number | null
          requirements?: string[] | null
          schedule_constraints?: Json | null
          service_category?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_logs: {
        Row: {
          created_at: string | null
          id: string
          input_features: Json | null
          model_version_id: string
          output_scores: Json | null
          response_ms: number | null
          student_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          input_features?: Json | null
          model_version_id: string
          output_scores?: Json | null
          response_ms?: number | null
          student_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          input_features?: Json | null
          model_version_id?: string
          output_scores?: Json | null
          response_ms?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_logs_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "ml_model_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      restricted_service_categories: {
        Row: {
          category_name: string
          id: string
          legal_basis: string
          notes: string | null
          requires_collegiate: boolean
        }
        Insert: {
          category_name: string
          id?: string
          legal_basis: string
          notes?: string | null
          requires_collegiate: boolean
        }
        Update: {
          category_name?: string
          id?: string
          legal_basis?: string
          notes?: string | null
          requires_collegiate?: boolean
        }
        Relationships: []
      }
      reviews: {
        Row: {
          application_id: string
          comment: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          rating: number | null
          reviewer_id: string
          reviewer_role: Database["public"]["Enums"]["reviewer_role"] | null
          updated_at: string | null
        }
        Insert: {
          application_id: string
          comment?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          rating?: number | null
          reviewer_id: string
          reviewer_role?: Database["public"]["Enums"]["reviewer_role"] | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string
          comment?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          rating?: number | null
          reviewer_id?: string
          reviewer_role?: Database["public"]["Enums"]["reviewer_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_logs: {
        Row: {
          actor_user_id: string | null
          blocked_service_category: string | null
          created_at: string
          endpoint: string | null
          event_type: Database["public"]["Enums"]["audit_event_type"]
          http_method: Database["public"]["Enums"]["http_method"] | null
          id: string
          ip_address: string | null
          legal_basis_triggered: string | null
          metadata: Json | null
          regex_matched: boolean | null
          regex_pattern_tested: string | null
          rls_policy_name: string | null
          severity: Database["public"]["Enums"]["audit_severity"]
          university_id: string | null
        }
        Insert: {
          actor_user_id?: string | null
          blocked_service_category?: string | null
          created_at: string
          endpoint?: string | null
          event_type: Database["public"]["Enums"]["audit_event_type"]
          http_method?: Database["public"]["Enums"]["http_method"] | null
          id?: string
          ip_address?: string | null
          legal_basis_triggered?: string | null
          metadata?: Json | null
          regex_matched?: boolean | null
          regex_pattern_tested?: string | null
          rls_policy_name?: string | null
          severity: Database["public"]["Enums"]["audit_severity"]
          university_id?: string | null
        }
        Update: {
          actor_user_id?: string | null
          blocked_service_category?: string | null
          created_at?: string
          endpoint?: string | null
          event_type?: Database["public"]["Enums"]["audit_event_type"]
          http_method?: Database["public"]["Enums"]["http_method"] | null
          id?: string
          ip_address?: string | null
          legal_basis_triggered?: string | null
          metadata?: Json | null
          regex_matched?: boolean | null
          regex_pattern_tested?: string | null
          rls_policy_name?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"]
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_audit_logs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          embedding: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["skill_type"] | null
        }
        Insert: {
          category?: string | null
          embedding?: string | null
          id?: string
          name: string
          type?: Database["public"]["Enums"]["skill_type"] | null
        }
        Update: {
          category?: string | null
          embedding?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["skill_type"] | null
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          academic_cycle: number | null
          availability_blocks: Json | null
          bio: string | null
          career_id: string | null
          created_at: string | null
          deleted_at: string | null
          embedding: string | null
          evidence_url: string | null
          full_name: string | null
          gpa: number | null
          id: string
          is_gpa_verified: boolean | null
          skills: string[] | null
          university_id: string
          updated_at: string | null
        }
        Insert: {
          academic_cycle?: number | null
          availability_blocks?: Json | null
          bio?: string | null
          career_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          embedding?: string | null
          evidence_url?: string | null
          full_name?: string | null
          gpa?: number | null
          id: string
          is_gpa_verified?: boolean | null
          skills?: string[] | null
          university_id: string
          updated_at?: string | null
        }
        Update: {
          academic_cycle?: number | null
          availability_blocks?: Json | null
          bio?: string | null
          career_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          embedding?: string | null
          evidence_url?: string | null
          full_name?: string | null
          gpa?: number | null
          id?: string
          is_gpa_verified?: boolean | null
          skills?: string[] | null
          university_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_career_id_fkey"
            columns: ["career_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_profiles_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      student_skills: {
        Row: {
          evidence_url: string | null
          id: string
          proficiency_level: number | null
          skill_id: string
          student_id: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          evidence_url?: string | null
          id?: string
          proficiency_level?: number | null
          skill_id: string
          student_id: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          evidence_url?: string | null
          id?: string
          proficiency_level?: number | null
          skill_id?: string
          student_id?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_skills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          created_at: string | null
          email_domain: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_domain: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_domain?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          is_onboarded: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          university_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id: string
          is_onboarded?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          university_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          is_onboarded?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      ux_usability_telemetry: {
        Row: {
          abandonment_rate: number | null
          device_type: Database["public"]["Enums"]["device_type"] | null
          error_message: string | null
          event_type: Database["public"]["Enums"]["ux_event_type"]
          flow_name: Database["public"]["Enums"]["flow_name"]
          id: string
          navigation_time_total_ms: number | null
          recorded_at: string
          satisfaction_score_csat: number | null
          session_id: string
          step_name: string
          step_order: number | null
          time_on_step_ms: number | null
          university_id: string | null
          user_id: string | null
        }
        Insert: {
          abandonment_rate?: number | null
          device_type?: Database["public"]["Enums"]["device_type"] | null
          error_message?: string | null
          event_type: Database["public"]["Enums"]["ux_event_type"]
          flow_name: Database["public"]["Enums"]["flow_name"]
          id?: string
          navigation_time_total_ms?: number | null
          recorded_at: string
          satisfaction_score_csat?: number | null
          session_id: string
          step_name: string
          step_order?: number | null
          time_on_step_ms?: number | null
          university_id?: string | null
          user_id?: string | null
        }
        Update: {
          abandonment_rate?: number | null
          device_type?: Database["public"]["Enums"]["device_type"] | null
          error_message?: string | null
          event_type?: Database["public"]["Enums"]["ux_event_type"]
          flow_name?: Database["public"]["Enums"]["flow_name"]
          id?: string
          navigation_time_total_ms?: number | null
          recorded_at?: string
          satisfaction_score_csat?: number | null
          session_id?: string
          step_name?: string
          step_order?: number | null
          time_on_step_ms?: number | null
          university_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ux_usability_telemetry_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ux_usability_telemetry_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_employer_id: { Args: never; Returns: string }
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      auth_student_id: { Args: never; Returns: string }
      complete_student_onboarding:
      | {
        Args: {
          p_academic_cycle: number
          p_career: string
          p_full_name: string
          p_skill_ids: string[]
          p_university_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      | {
        Args: {
          p_academic_cycle: number
          p_career: string
          p_full_name: string
          p_proficiency_levels: number[]
          p_skill_ids: string[]
          p_university_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      | {
        Args: {
          p_academic_cycle: number
          p_bio?: string
          p_career: string
          p_full_name: string
          p_proficiency_levels: number[]
          p_skill_ids: string[]
          p_university_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      | {
        Args: {
          p_academic_cycle: number
          p_bio?: string
          p_career_id: string
          p_full_name: string
          p_proficiency_levels: number[]
          p_skill_ids: string[]
          p_university_id: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      application_status:
      | "pending_scoring"
      | "pending"
      | "reviewing"
      | "accepted"
      | "rejected"
      | "completed"
      audit_event_type:
      | "rls_denied"
      | "regex_success"
      | "regex_fail"
      | "illegal_practice_blocked"
      audit_severity: "info" | "warning" | "critical"
      device_type: "mobile" | "tablet" | "desktop"
      flow_name:
      | "registration"
      | "profile_setup"
      | "project_search"
      | "application"
      http_method: "GET" | "POST" | "PATCH" | "DELETE"
      integrity_check_type:
      | "tenant_isolation"
      | "rls_coverage"
      | "data_leakage_scan"
      | "row_count_audit"
      integrity_status: "passed" | "failed" | "warning"
      match_status: "pending" | "accepted" | "rejected" | "expired"
      microservice_name:
      | "auth"
      | "profile"
      | "analytics-audit"
      | "marketplace"
      | "matching"
      | "ml"
      | "notification"
      notification_priority: "LOW" | "MEDIUM" | "HIGH"
      notification_type: "SYSTEM" | "MATCH" | "APPLICATION" | "MESSAGE"
      post_project_status:
      | "seeking"
      | "formal_employed"
      | "freelance"
      | "studying"
      | "unknown"
      project_status: "draft" | "open" | "in_progress" | "closed"
      reviewer_role: "employer" | "student"
      skill_type: "hard" | "soft"
      user_role: "student" | "employer" | "admin"
      ux_event_type:
      | "step_started"
      | "step_completed"
      | "abandoned"
      | "error_shown"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: [
        "pending_scoring",
        "pending",
        "reviewing",
        "accepted",
        "rejected",
        "completed",
      ],
      audit_event_type: [
        "rls_denied",
        "regex_success",
        "regex_fail",
        "illegal_practice_blocked",
      ],
      audit_severity: ["info", "warning", "critical"],
      device_type: ["mobile", "tablet", "desktop"],
      flow_name: [
        "registration",
        "profile_setup",
        "project_search",
        "application",
      ],
      http_method: ["GET", "POST", "PATCH", "DELETE"],
      integrity_check_type: [
        "tenant_isolation",
        "rls_coverage",
        "data_leakage_scan",
        "row_count_audit",
      ],
      integrity_status: ["passed", "failed", "warning"],
      match_status: ["pending", "accepted", "rejected", "expired"],
      microservice_name: [
        "auth",
        "profile",
        "analytics-audit",
        "marketplace",
        "matching",
        "ml",
        "notification",
      ],
      notification_priority: ["LOW", "MEDIUM", "HIGH"],
      notification_type: ["SYSTEM", "MATCH", "APPLICATION", "MESSAGE"],
      post_project_status: [
        "seeking",
        "formal_employed",
        "freelance",
        "studying",
        "unknown",
      ],
      project_status: ["draft", "open", "in_progress", "closed"],
      reviewer_role: ["employer", "student"],
      skill_type: ["hard", "soft"],
      user_role: ["student", "employer", "admin"],
      ux_event_type: [
        "step_started",
        "step_completed",
        "abandoned",
        "error_shown",
      ],
    },
  },
} as const
