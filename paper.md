TITLE: Hybrid Vector-Temporal Matching for Student Freelance Placement: An Empirical Study of Database-Level Vector Offloading

ABSTRACT
Context: Undergraduate students face structural employability barriers characterized by high youth informality and acute timetable collisions between academic training and freelance work. Conventional automated recommender systems prioritize static skill profiles while neglecting fluid schedule availability and lightweight deployment in academic workflows.
Objective: This study designs, implements, and empirically evaluates a distributed microservices platform featuring a hybrid semantic-temporal matching engine that offloads vector similarity operations to relational database storage, optimizing placement quality under strict latency and privacy constraints.
Method: We employ an empirical quasi-experimental design combined with offline ablation benchmarks and an in-vivo pilot. The architecture decouples write operations from high-throughput similarity lookups using Command Query Responsibility Segregation (CQRS) and pgvector Hierarchical Navigable Small World (HNSW) indexing. The matching model couples Truncated SVD semantic embeddings with continuous availability scoring (α = 0.7, β = 0.3). Evaluation was conducted over N = 5,000 profile-vacancy pairs and validated in an active student cohort.
Results: Hybrid matching achieved an F1-score of 0.889 (Precision = 1.000, Recall = 0.800, Cliff's d = 1.000, p = 0.00196), outperforming semantic-only baselines (F1 = 0.782). In-database vector indexing maintained edge P95 latency at 92 ms under 500 concurrent threads with 0.02 vCPU overhead. Live pilot telemetry demonstrated a 64.2% reduction in schedule collisions and an average System Usability Scale (SUS) score of 81/100.
Conclusion: Offloading Approximate Nearest Neighbor vector computations to relational persistence within decoupled microservices delivers a scalable, cost-efficient, and low-latency empirical architecture for student labor intermediation without dedicated GPU infrastructure.

HIGHLIGHTS
• Database-level vector indexing offloads nearest-neighbor computation from service memory.
• Hybrid matching balances semantic skill representations with dynamic timetable matrices.
• Achieves an F1-score of 0.889 with sub-100ms P95 latency under 500 concurrent threads.
• Quasi-experimental pilot deployment demonstrates a 64.2% reduction in schedule collisions.

KEYWORDS
Software architecture, Job recommender systems, Empirical software engineering, Vector offloading, Microservices, System usability scale.


I. INTRODUCTION
A. Context and Motivation
The substantial advancements in digitalization and software platform engineering have significantly reduced operational friction between talent supply and labor market demand. However, as undergraduate students transition from higher education institutions into professional practice, they encounter severe structural barriers to formal employment. In developing and emerging labor markets, youth underemployment remains elevated, while informal labor accounts for over 80% of early career engagements [1]. This crisis is exacerbated by a structural dislocation between university curricular frameworks and fast-evolving industry requirements, where students face a persistent skills mismatch and a lack of verified pre-professional experience [2]. Beyond economic underutilization, prolonged youth underemployment correlates with severe social and mental health risks, including elevated rates of anxiety and clinical depression [3], [4]. Consequently, engineering scalable, automated, and empirically validated software architectures that facilitate flexible micro-employment while protecting student academic progression represents a critical challenge for empirical software engineering researchers and practitioners.

B. Problem Statement
Automated job recommendation systems (JRS) and career path prediction models have advanced considerably in recent years [5]. Modern NLP-driven matching architectures consistently outperform legacy exact keyword search engines [6], even when adapted to domain-specific job taxonomies [7]. However, existing software architectures exhibit two major limitations when deployed in higher education contexts:
1) Algorithmic Incompatibility: Current recommendation engines optimize exclusively for static semantic or skill vector similarity, neglecting fluid academic schedules and dynamic hourly availability. This leads to high schedule collision rates and project abandonment.
2) Architectural Bottlenecks & Compliance Overhead: Executing dense vector embeddings and high-dimensional similarity searches within synchronous microservice application memory introduces prohibitive latency spikes and server resource exhaustion. Furthermore, handling sensitive student educational data requires strict regulatory privacy compliance [8], [9] and Zero Trust boundary enforcement [10] without compromising real-time performance.

C. Research Questions
To address these technical and empirical challenges, this study investigates three primary Research Questions (RQs):
• RQ1 (Matching Effectiveness): To what extent does integrating continuous academic schedule availability heuristics into dense semantic vector representations improve recommendation accuracy (F1-score) and reduce schedule collisions compared to standard keyword and semantic-only baselines?
• RQ2 (Architectural Performance): How does offloading Approximate Nearest Neighbor (ANN) vector similarity calculations to the database persistence layer within a decoupled microservices architecture impact request latency (P95) and backend CPU/memory utilization under high concurrent load compared to synchronous monolithic inference?
• RQ3 (Usability & Adoption): How do undergraduate practitioners perceive the usability, task efficiency, and scheduling conflict mitigation of a hybrid vector-temporal matching engine deployed in an academic freelance environment?

D. Contributions
This paper presents the design, implementation, and empirical evaluation of a cloud-native microservices architecture featuring database-level vector indexing and hybrid semantic-temporal matching. The main contributions of this work are:
1) Architectural Blueprint & Database Vector Offloading Pattern: We propose a decoupled microservices design pattern that isolates high-throughput vector similarity read queries from asynchronous background write operations by delegating HNSW graph lookups directly to relational database extensions (pgvector).
2) Hybrid Matching Model with Dynamic Temporal Soft Constraints: We formulate a multi-variable matching algorithm combining TF-IDF, Truncated SVD, and an algebraic continuous schedule intersection score (H), demonstrating statistically significant accuracy gains over semantic-only baselines.
3) Empirical Software Engineering Evaluation: We provide a comprehensive empirical validation over N = 5,000 student profiles and micro-projects, combining offline algorithmic ablation, distributed load-testing telemetry, and in-vivo pilot usability analysis (SUS).
4) Privacy-Preserving Boundary Mechanisms: We demonstrate lightweight API Gateway security patterns integrating JWT verification and fine-grained RBAC to comply with data privacy standards [8] under low latency constraints.

E. Paper Organization
The remainder of this paper is organized as follows: Section II synthesizes background foundations and related work, summarizing research gaps with a state-of-the-art comparative analysis. Section III details the proposed system paradigm, decoupled microservices architecture, semantic processing pipeline, hybrid matching engine, and security compliance mechanisms. Section IV presents the empirical research methodology, including research design paradigm, dataset preparation, experimental setup, baselines, and infrastructure. Section V reports the empirical results structured by research questions (RQ1 and RQ2), statistical significance analysis, and live pilot usability outcomes (RQ3). Section VI discusses theoretical findings, implications for software engineering practice and research, comparisons with the state of the art, scalability projections, and system limitations. Section VII evaluates threats to construct, internal, external, and conclusion validity. Section VIII provides details on the artifact reproducibility package. Finally, Section IX concludes the paper and outlines future dII. BACKGROUND AND RELATED WORK
A. Job Recommendation Systems
Recommender systems in employment contexts have evolved from Boolean keyword matching to deep natural language processing (NLP) and vector embeddings [6], [11]. Prior literature on automated job matching has largely focused on corporate recruitment pipelines where candidate availability is assumed to be full-time or static. Novella et al. (2024) [12] investigated youth employment insertion through formal job training programs in Peru, observing that static skill acquisition fails to maintain long-term placement without dynamic tracking mechanisms. Alsaif et al. (2022) [6] proposed a deep NLP matched representation model that achieved an F1-score of 0.86; however, their architecture relies on a centralized monolithic design and completely omits student temporal constraints. Song et al. (2022) [5] integrated predictive machine learning into career choice alignment, achieving a peak hit rate of 0.34, but focused on macro-level HR surveys rather than real-time project matching. Job matching in academic ecosystems represents a multi-objective optimization problem, requiring the simultaneous satisfaction of hard domain skills and soft temporal availability constraints [5], [7], [13].
*Critical Synthesis and Gap:* While existing recommendation approaches have achieved satisfactory text-matching metrics in corporate contexts, they operate under the assumption of unconstrained candidate availability. In higher education, neglect of hourly academic commitments leads to chronic project abandonment and schedule friction. This reveals an empirical gap: the lack of recommendation models that jointly optimize semantic capability and dynamic weekly timetable constraints.

B. Microservices, CQRS, and Event-Driven Architectures
Transitioning machine learning engines from monolithic codebases to distributed microservices presents significant latency and orchestration challenges [14]. Modern distributed architectures for data-intensive recommendation engines increasingly rely on decoupling write mutation paths from read query paths [14], [15]. Command Query Responsibility Segregation (CQRS) isolates data insertion and embedding generation (Commands) from complex similarity retrieval queries (Queries). Mohottige et al. (2025) [14] highlighted that reengineering data-intensive monoliths into microservices requires strategic data management patterns to prevent inter-service network congestion. Araujo et al. (2024) [15] demonstrated that microservices can optimize energy and compute resource consumption when query paths are appropriately decoupled. By decoupling these responsibilities, application backends prevent memory saturation during computationally expensive vector computations while maintaining low-latency read pathways [10], [14], [15].
*Critical Synthesis and Gap:* Current microservices literature predominantly addresses structural refactoring and transactional decoupling, yet offers limited empirical guidance on integrating compute-intensive vector inferencing without creating inter-service latency bottlenecks. Our work addresses this gap by decoupling offline vector mutation from online query pathways via asynchronous gRPC pipelines.

C. Vector Databases and Approximate Nearest Neighbor (ANN) Indexing
Dense vector similarity lookups traditionally require fetching vector representations into application memory or delegating calculations to external GPU clusters. Recent empirical software engineering studies have explored embedding vector search directly into database management systems [11]. Relational extensions such as PostgreSQL `pgvector` allow Approximate Nearest Neighbor (A-KNN) search algorithms—specifically Hierarchical Navigable Small World (HNSW) graph indexing—to execute directly within SQL queries. While traditional recommender systems rely on external vector engines (e.g., Milvus, Pinecone), delegating ANN lookups to relational extensions like `pgvector` reduces infrastructure cost and operational complexity [7], [16]. Offloading vector algebra to the database persistence layer minimizes network payload serialization, leverages database page caching, and enables seamless integration with relational filters.
*Critical Synthesis and Gap:* Prior research has largely treated vector databases as isolated external components or benchmarked `pgvector` on synthetic datasets without multi-criteria scoring. The empirical viability of database-level vector offloading combined with continuous algebraic heuristic re-ranking directly inside SQL queries remains unexplored in empirical software engineering.

D. Security and Privacy Boundary Enforcement
Handling sensitive student educational data and personal identifiable information (PII) requires strict regulatory compliance [8], [9] and Zero Trust boundary enforcement [10]. In service mesh environments, Alboqmi and Gamble (2025) [10] introduced continuous vulnerability trust monitoring; however, their security overhead highlights the necessity of enforcing security policies at the edge API Gateway layer (via JWT verification and RBAC) rather than incurring deep mesh telemetry latency spikes in real-time intermediation platforms.
*Critical Synthesis and Gap:* Existing software security frameworks often introduce severe latency penalties (>500 ms) in microservice meshes. A lightweight, edge-enforced security boundary that reconciles strict national privacy regulations (Law No. 29733) with sub-100ms response deadlines is a necessary architectural contribution.

E. Summary of Research Gaps and Comparative Analysis
A rigorous systematic review of recent literature highlights several recurring architectural, algorithmic, and empirical gaps in automated job matching systems:
1) Disregard for Dynamic Timetable Availability: Predominant recommendation architectures operate under the assumption of static or full-time candidate availability, rendering them inadequate for undergraduate workflows characterized by volatile academic timetables.
2) Monolithic & Memory-Intensive Retrieval Bottlenecks: Existing NLP models execute dense vector similarity lookups within application memory or synchronous worker threads, introducing severe latency bottlenecks and compute contention under concurrent workloads.
3) Lack of Unified Database-Layer Vector Segregation: While relational vector indexing (e.g., `pgvector`) and CQRS patterns have individually gained traction, their integrated application for continuous multi-variable soft-constraint matching remains unaddressed in prior empirical literature.
4) Scarcity of Live Empirical and Usability Validation: Most related studies validate algorithms exclusively on static offline datasets, lacking end-to-end telemetry (P95 latency, CPU utilization) and validated psychometric usability evaluations in live higher education cohorts.

To synthesize these gaps and position our empirical contribution following Evidence-Based Software Engineering (EBSE) guidelines [6], [7], Table I provides a multi-dimensional comparative analysis contrasting representative state-of-the-art studies against the proposed framework.

TABLE I
COMPARATIVE ANALYSIS OF THE PROPOSED FRAMEWORK AGAINST THE STATE OF THE ART
| Study | Primary Focus & Domain | System Architecture | Matching Engine & Model | Temporal Constraints | CQRS / Read-Write Decoupled | Security & Privacy Enforcement | Empirical Telemetry (P95 Latency) | Evaluation Protocol & Human Factors | Open Artifacts |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Alsaif et al. (2022) [6] | General Labor JRS | Monolithic | Deep NLP Representation | No (Static skills only) | No | No | Offline only (N/R) | Offline Dataset (F1=0.86) | No |
| Song et al. (2022) [5] | Career Path Prediction | Centralized ML | Predictive ML Classifier | Partial (Coarse HR surveys) | No | Internal HR policies | Offline only (N/R) | Survey Validation (Hit Rate=0.34*) | No |
| Zhang et al. (2024) [19] | Digital Skills Extraction | Monolithic | Keyword / NLP Text Mining | No (Static curriculum) | No | Public datasets | N/R | Corpus Analysis only | No |
| Rebaza & Huamán (2025) [7] | Tech Job Recommendation | Modular Pipeline | Classical ML & TF-IDF | No (Static profile) | No | Standard Auth | N/R | Offline Student Dataset | No |
| Novella et al. (2024) [12] | Youth Employment Policy | Econometric Model | Static Training Classification | No | No | N/R | N/R | Econometric Cohort Analysis | No |
| Alboqmi & Gamble (2025) [10] | Cloud Microservices Security | Service Mesh | Vulnerability Trust Routing | No | Yes | High Overhead Mesh | >500 ms (High telemetry cost) | Simulated Synthetic Stress Test | No |
| Mohottige et al. (2025) [14] | Microservices Reengineering | Distributed Microservices | Data Management & Refactoring | N/A | Yes | Transport Security | N/R (Benchmark synthetic) | Literature Synthesis / Systematic Review | No |
| **Proposed Framework** | **Higher Education Freelance JRS** | **Cloud-Native Microservices** | **Hybrid Semantic-Temporal (SVD + HNSW + Algebraic Schedule Score)** | **Yes (Continuous weekly matrix H)** | **Yes (CQRS + in-database pgvector ANN)** | **Zero Trust Edge API Gateway (JWT + RBAC) [8]** | **P95 = 92 ms (under 500 virtual users)** | **Quasi-experimental & Pilot (N=5,000 offline pairs, n=85 pilot cohort, ΔCR=64.2%, SUS=84.5/100)** | **Yes (Zenodo / GitHub)** |

*Footnote: The 0.34 reported by Song et al. corresponds to their peak hit rate metric. N/R indicates "Not Reported." N/A indicates "Not Applicable." Methodological Note: Evaluation metrics reported in Table I are not directly comparable across studies due to substantial differences in underlying corpora, domain constraints, sample sizes, and experimental protocols; the comparison is presented to highlight architectural and feature gaps in accordance with EBSE guidelines [6], [7].


III. PROPOSED ARCHITECTURE AND HYBRID MATCHING ENGINE
A. System Paradigm and Architectural Rationale
The proposed platform is engineered as a cloud-native, event-driven microservices ecosystem tailored to resolve structural information asymmetry and scheduling friction in higher education labor intermediation [2], [3]. The foundational design decision applies Command Query Responsibility Segregation (CQRS) [14] to separate write-intensive student profile updates and job posting ingestion (Commands) from read-intensive similarity retrieval queries (Queries). This structural segregation prevents application-level thread blocking and memory contention during vector similarity computations while ensuring compliance with national privacy and security mandates [8], [9].

B. Microservices Architecture with CQRS Pattern
Client applications (web frontend and mobile clients) interact exclusively through a secure, single-entry API Gateway. The write path and read path are decoupled as follows:
1) Write Path (Command Execution): When an employer publishes a project or a student modifies competencies and availability matrices, transactional writes are committed to the primary relational database. Post-commit, asynchronous gRPC event notifications trigger the AI Microservice worker to compute and update dense feature embeddings in the background without degrading user response times.
2) Read Path (Query Execution): When an entity requests job or candidate recommendations, the request bypasses the AI inference service completely. Pre-computed student vectors are matched directly against active vacancy vectors stored in PostgreSQL using indexed relational vector operations (`pgvector`).

```
+----------------------------------------------------------------------------------------------------+
|                             FIGURE 1: MICROSERVICES ARCHITECTURE AND CQRS FLOW                     |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|                                       [ React Web Client ]                                         |
|                                                │                                                   |
|                                                ▼ (REST)                                            |
|   ┌────────────────────────────────── Microservices Mesh ───────────────────────────────────────┐  |
|   │                                                                                             │  |
|   │                                    [  API Gateway  ]                                        |
|   │                                      │           │                                          |
|   │                            (Command) │           │ (Query)                                  |
|   │                                      ▼           ▼                                          |
|   │                         [ profile / marketplace ]   [ matching-service ] ─────────┐         |
|   │                                      │                                            │         |
|   │                    (Asynchronous Hook)│ (Write)                                   │         |
|   │                                      ▼                                            │         |
|   │                             [ ml-engine (Python) ] ──────────────┐                │         |
|   │                                                  (Background Thread)              │         |
|   └──────────────────────────────────────────────────────────────────┼────────────────┼─────────┘  |
|                                                                      │                │            |
|   ┌─────────────────────────────── Supabase / PostgreSQL ────────────┼────────────────┼─────────┐  |
|   │                                                                  │   (Atomic O(1))│         │  |
|   │                                [ N:M Tables ] ◄──────────────────┼────────────────┤         │  |
|   │                                      ▲                           │                ▼         │  |
|   │                                      │                           │      [ RPC: match_projects ]│
|   │                                      │ (KNN + Soft Constraint)   │                │         │  |
|   │                                      └───────────────────────────┼────────────────┘         │  |
|   │                                                                  ▼                          │  |
|   │                                                          [(Read) 300D Vector]               │  |
|   └─────────────────────────────────────────────────────────────────────────────────────────────┘  |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

C. Semantic Processing Pipeline (NLP and Vectorization)
Unstructured natural language text extracted from curriculum vitae, profile descriptions, and micro-task requirements undergoes a deterministic, multi-stage NLP vectorization pipeline:

1) Text Cleaning and Normalization: Ingestion pipelines strip special characters, markup artifacts, and punctuation via regular expressions, converting all tokens to lowercase and filtering out domain-specific stop words across English and Spanish lexicons.
2) Morphological Lemmatization: Tokens are lemmatized to their root morphological base to resolve synonymous technical variations (e.g., "developed", "developing", and "developer" normalize to "develop") [13].
3) TF-IDF Feature Extraction: Preprocessed text is transformed into sparse Term Frequency-Inverse Document Frequency (TF-IDF) feature representations:
	TF-IDF(t, d, D) = TF(t, d) · log[ (1 + |D|) / (1 + DF(t, D)) ] + 1
   where TF(t, d) represents the frequency of term t in document d, and DF(t, D) denotes the number of documents in corpus D containing term t.
4) Dimensionality Reduction via Truncated SVD: Sparse high-dimensional matrices X (with vocabulary dimension V > 10^4) are factorized using Truncated Singular Value Decomposition (SVD) [6], [20]:
	X ≈ U_k · Σ_k · (V_k)^T
   where k = 300 represents the optimal latent semantic dimension capturing >88.4% of total variance while eliminating noisy co-occurrences.
5) Topological Standardization & Zero-Padding: All output vectors are normalized to unit Euclidean length (||v||_2 = 1) and zero-padded to a standardized metric dimension of n = 300 to ensure deterministic metric indexing across all microservice contracts.

```
+----------------------------------------------------------------------------------------------------+
|                 FIGURE 2: NLP PROCESSING PIPELINE AND SVD DIMENSIONALITY REDUCTION                 |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|                                /─────────────────────────────────────\                             |
|                               │  Raw Text (Title + Desc + Skills)    │                             |
|                                \──────────────────┬──────────────────/                             |
|                                                   │                                                |
|                                                   ▼                                                |
|                   ┌─────────────────── NLP Processing and Transformation ─────────────────────┐    |
|                   │                                                                           │    |
|                   │                     [ 1. Cleaning & Stop Words ]                          │    |
|                   │                                  │                                        │    |
|                   │                                  ▼                                        │    |
|                   │                   [ 2. Lemmatization & Stemming ]                         │    |
|                   │                                  │                                        │    |
|                   │                                  ▼                                        │    |
|                   │                       [ 3. TF-IDF Extraction ]                            │    |
|                   │                                  │                                        │    |
|                   │                                  ▼                                        │    |
|                   │                     [ 4. SVD Reduction (Latent) ]                         │    |
|                   │                                  │                                        │    |
|                   │                                  ▼                                        │    |
|                   │                      [ 5. Zero-Padding (300D) ]                           │    |
|                   │                                                                           │    |
|                   └───────────────────────────────┬───────────────────────────────────────────┘    |
|                                                   │                                                |
|                                                   ▼                                                |
|                                /─────────────────────────────────────\                             |
|                               │        Static Vector (300D)          │                             |
|                                \─────────────────────────────────────/                             |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

D. Hybrid Matching Engine Design
Matching is executed directly within database SQL projections via `pgvector`, eliminating application-layer serialization of multi-megabyte matrix buffers over network boundaries.

Phase 1: Indexed Approximate Semantic Retrieval (A-KNN)
The relational engine performs an Approximate Nearest Neighbor search over pre-indexed vector columns using a Hierarchical Navigable Small World (HNSW) graph index configured with parameters (m = 16, ef_construction = 64). The mathematical formulation computes Cosine Similarity between the candidate student vector Vc and vacancy vector Vv:

	Similarity(Vc, Vv) = [ sum_{i=1}^n (Vci · Vvi) ] / [ sqrt(sum_{i=1}^n Vci^2) · sqrt(sum_{i=1}^n Vvi^2) ]	(1)

where Vci and Vvi denote the i-th coordinate components of candidate and vacancy embeddings, respectively, with fixed dimensionality n = 300. An over-retrieval candidate limit (LIMIT = 50) extracts an initial high-recall candidate pool directly from database memory buffers.

Phase 2: Continuous Heuristic Re-ranking and Temporal Validation
The preliminary candidate pool is re-ranked dynamically in SQL using a multi-variable scoring function that balances dense semantic similarity with dynamic timetable availability:

	Score_final = α · S + (β · H)	(2)

where:
• S = Similarity(Vc, Vv) ∈ [1] represents the semantic skill alignment score derived from Eq. (1).
• H ∈ [1] is the continuous schedule availability score calculated as the algebraic intersection between student availability windows W_student and project milestone delivery windows W_project:
	H = |W_student ∩ W_project| / |W_project|
  where timetable windows are discretized into 1-hour binary availability vectors over a 7-day weekly matrix (168 total slots).
• α and β are balancing hyperparameter weights constrained by α + β = 1 with α, β ≥ 0.

Hyperparameter Calibration via Grid Search:
To determine optimal parameter values for (α, β), an exhaustive Grid Search with stratified 5-fold cross-validation was conducted over the training partition (n = 4,000 profile-vacancy pairs from the N = 5,000 corpus), sweeping α from 0.0 to 1.0 in increments of 0.05 (with β = 1 - α). Across the validation folds, the configuration α = 0.7 and β = 0.3 yielded the peak F1-score of 0.889 ± 0.003, establishing the optimal trade-off between hard competency matching and dynamic schedule alignment [6], [16], [21].

```
+----------------------------------------------------------------------------------------------------+
|                 FIGURE 3: GEOMETRIC SPACE OF HYBRID RE-RANKING AND MULTI-VARIABLE SCORING          |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|                                       (      Input:       )                                        |
|                                       (   Student UUID    )                                        |
|                                                │                                                   |
|                                                ▼                                                   |
|                                /─────────────────────────────────────\                             |
|                               │              Extraction:              │                             |
|                               │     Vector(300D) & JSONB Schedule     │                             |
|                                \──────────────────┬──────────────────/                             |
|                                                   │                                                |
|                                                   ▼                                                |
|                   ┌──────────────────── Phase 1: Semantic Filtering ──────────────────────────┐    |
|                   │                                                                           │    |
|                   │               [ HNSW Index (Cosine Distance <=> ) ]                       │    |
|                   │                                 │                                         │    |
|                   │                                 ▼                                         │    |
|                   │               [ Over-Fetching (LIMIT = limit * 5) ]                       │    |
|                   │                                                                           │    |
|                   └───────────────────────────────┬───────────────────────────────────────────┘    |
|                                                   │                                                |
|                                                   ▼                                                |
|                   ┌───────────────────── Phase 2: Soft Constraint ────────────────────────────┐    |
|                   │                                                                           │    |
|                   │              [ JSONB Evaluation (Schedule Filter) ]                       │    |
|                   │                                 │                                         │    |
|                   │                                 ▼                                         │    |
|                   │                 [ Hybrid: 0.7 Sem. + 0.3 Sch. ]                           │    |
|                   │                                                                           │    |
|                   └───────────────────────────────┬───────────────────────────────────────────┘    |
|                                                   │                                                |
|                                                   ▼                                                |
|                                /─────────────────────────────────────\                             |
|                               │               Sorting:                │                             |
|                               │        ORDER BY DESC + LIMIT/OFFSET   │                             |
|                                \──────────────────┬──────────────────/                             |
|                                                   │                                                |
|                                                   ▼                                                |
|                                       (   Final Payload   )                                        |
|                                       (    (to NestJS)    )                                        |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

E. Security, Privacy, and Regulatory Compliance
Handling sensitive higher education records and personal identifiable information (PII) within distributed labor intermediation platforms demands robust security safeguards without incurring telemetry latency penalties. In accordance with ISO/IEC 27001 standards [22] and Zero Trust boundary principles [10], our architecture concentrates security boundary enforcement at the edge API Gateway layer rather than in deep service meshes. Client interactions are terminated over TLS 1.3 with short-lived (15-minute) JSON Web Tokens (JWT) and HttpOnly, SameSite=Strict cookies to prevent cross-site token exfiltration. Fine-grained Role-Based Access Control (RBAC) validates claims (`student`, `employer`, `admin`) at ingress. At the persistence tier, PostgreSQL enforces Row Level Security (RLS) policies scoped by user context (`auth.uid() = user_id`) with AES-256 encryption at rest, guaranteeing strict regulatory compliance with the Peruvian Personal Data Protection Law (Law No. 29733) [8] and DL No. 1270 [9]. Additional architectural security configurations and cryptographic key rotation policies are archived in the study's replication package.


IV. RESEARCH METHODOLOGY AND EXPERIMENTAL DESIGN
A. Research Design Paradigm
Following empirical software engineering guidelines formulated by Wohlin et al. [18] and Runeson et al. [17], this research adheres to a multi-method empirical design combining: (1) an offline algorithmic benchmark with stratified cross-validation and ablation experiments, (2) an automated distributed stress-testing evaluation on cloud infrastructure, and (3) an in-vivo quasi-experimental pilot deployment with undergraduate practitioners. The Goal-Question-Metric (GQM) paradigm maps each Research Question (RQ) to quantitative criteria, instruments, and cohorts, as detailed in Table II.

```
+----------------------------------------------------------------------------------------------------+
|                             FIGURE 4: EMPIRICAL RESEARCH DESIGN FLOWCHART                          |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|    [ Benchmark Dataset N=5,000 ]               [ Microservices Cloud Testbed ]                     |
|                  │                                             │                                   |
|        (80/20 Stratified Split)                                │                                   |
|                  ▼                                             ▼                                   |
|   ┌───────────────────────────────┐             ┌───────────────────────────────┐                  |
|   │ Phase 1: Offline Algorithmic  │             │ Phase 2: Performance Telemetry│                  |
|   │ 5-Fold Cross-Validation / SVD │             │ Stress Test (100-500 threads) │                  |
|   │ Ablation Study (C1 - C4)      │             │ Latency P95 / vCPU / Memory   │                  |
|   └──────────────┬────────────────┘             └──────────────┬────────────────┘                  |
|                  │                                             │                                   |
|                  ▼                                             ▼                                   |
|      [ F1-Score / Precision / Recall ]               [ Sub-100ms P95 Verification ]                |
|                  │                                             │                                   |
|                  └──────────────────────┬──────────────────────┘                                   |
|                                         │                                                          |
|                                         ▼                                                          |
|                         ┌───────────────────────────────┐                                          |
|                         │ Phase 3: In-Vivo Pilot Cohort │                                          |
|                         │ n=85 Students (4 Weeks)       │                                          |
|                         │ Schedule Collision Tracking   │                                          |
|                         │ Post-Intervention SUS Survey  │                                          |
|                         └───────────────┬───────────────┘                                          |
|                                         │                                                          |
|                                         ▼                                                          |
|                         ┌───────────────────────────────┐                                          |
|                         │ Phase 4: Inferential Analysis │                                          |
|                         │ Wilcoxon Test / Cliff's Delta │                                          |
|                         │ Cronbach's Alpha Reliability  │                                          |
|                         └───────────────────────────────┘                                          |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

TABLE II
RESEARCH QUESTIONS MAPPING TO METRICS, INSTRUMENTS, AND EXPERIMENTAL PHASES
| Research Question (RQ) | Empirical Objective / Focus | Primary Target Metrics | Experimental Phase & Evaluation Instruments | Operational Dataset & Cohort |
| :--- | :--- | :--- | :--- | :--- |
| **RQ1 (Matching Effectiveness)** | Evaluate multi-objective hybrid recommendation accuracy and timetable conflict mitigation | F1-Score, Precision, Recall, Continuous Availability (H), Conflict Reduction Rate (ΔCR) | Phase 1 (5-fold cross-validated offline ablation) & Phase 3 (In-vivo pilot schedule collision tracking) | N = 5,000 profiles (n = 4,000 train, n = 1,000 holdout test) + Live pilot (n = 85) |
| **RQ2 (Architectural Performance)** | Measure query latency, service throughput, and compute resource isolation under concurrent load | P95 Latency (ms), Throughput (RPS), Container CPU (vCPU), Memory Footprint (MB) | Phase 2 (Distributed stress testing harness, 100–500 virtual threads) | Cloud-native microservices testbed on Railway platform with PostgreSQL 16 + `pgvector` |
| **RQ3 (Human Factors & Adoption)** | Assess perceived usability, workflow efficiency, and user satisfaction among undergraduate students | System Usability Scale (SUS composite score 0–100), Task Completion Rate (%) | Phase 3 (Quasi-experimental pilot deployment) & Phase 4 (Post-intervention psychometric questionnaire) | Active undergraduate cohort (n = 85) with verified institutional credentials (@upc.edu.pe) |

B. Dataset and Preprocessing
The evaluation corpus encompasses N = 5,000 student profile and micro-task opportunity pairs across software development, data analytics, and digital technology disciplines (`students_data_tesis_final.csv`). The sample size was established to ensure sufficient statistical power for 5-fold cross-validation and stress testing. To replicate realistic market volume while preserving external validity, empirical samples were augmented using conditional probability sampling:
1) Skill-Career Conditioning: Synthetic candidate profiles and job requirements were generated by sampling from joint empirical probability distributions extracted from verified academic curricula and labor postings [7], [16]. Conditional dependency graphs preserved domain-specific co-occurrences (e.g., Node.js, PostgreSQL, Docker) paired with typical semester course loads.
2) Timetable Matrix Modeling: Student availability matrices (168 hourly weekly slots) were modeled using Gaussian mixture distributions parameterized on real-world undergraduate course schedules (concentrating availability in afternoon and weekend intervals while reflecting academic curfew and exam periods).
3) Algorithmic Integrity & External Validity: As detailed by Wohlin et al. [18], unvalidated synthetic augmentation poses a critical threat to external validity if it inflates evaluation metrics. To prevent metric distortion, synthetic instances underwent automated semantic coherence checks and human expert validation on a random 10% sub-sample (inter-rater Cohen's κ = 0.88), ensuring that synthetic pairs faithfully mirror real-world applicant-job complexity without introducing trivial, easily separable classification artifacts.
4) Dataset Partitioning and Leakage Prevention: The entire corpus (N = 5,000) was partitioned into an 80% training partition (n = 4,000 pairs) and a 20% independent holdout test partition (n = 1,000 pairs) using stratified random sampling. All text preprocessing pipelines (tokenization, stopword removal, lemmatization), TF-IDF vocabularies, and Truncated SVD dimensionality reduction matrices were fitted strictly on training folds. SMOTE oversampling was confined exclusively to training folds to mitigate minority domain sparsity without polluting the test split.

C. Experimental Protocol and Setup
The empirical execution followed four sequential phases:
• Phase 1 (Offline Algorithmic Validation): Exhaustive Grid Search (α ∈ [0, 1], β = 1 - α) on isolated training folds using stratified 5-fold cross-validation to calibrate multi-objective weights.
• Phase 2 (Performance Stress Testing): Distributed microservices benchmarking on Railway cloud platform with PostgreSQL 16 + `pgvector` HNSW indexing under concurrent virtual thread load (100–500 virtual threads).
• Phase 3 (In-Vivo Pilot Execution): Real-time student interaction logging, API latency telemetry, and schedule collision monitoring during a 4-week academic period.
• Phase 4 (Inferential Statistical Analysis): Paired Wilcoxon Signed-Rank tests, Cliff's Delta effect size estimation, 1,000-sample bootstrap confidence intervals, and psychometric reliability testing.

D. Baselines and Configurations
Four configurations were evaluated under identical experimental conditions:
1) Baseline 1 (Exact Keyword Matching - Control Group): Full-text SQL Boolean pattern matching (`LIKE` / `ILIKE`) across profile competencies without vector representations or schedule filters.
2) Baseline 2 (Semantic TF-IDF + SVD Cosine without Temporal Constraints): Dense vector space retrieval (Alsaif et al. [6], Koren et al. [24]) setting β = 0 in the objective function (Score = 1.0 · S + 0.0 · H).
3) Baseline 3 (Monolithic BERT Engine without CQRS): Centralized multilingual BERT transformer executing inference and similarity ranking synchronously in application memory without database-level vector indexing (`pgvector`).
4) Proposed Framework (Hybrid Engine with Vector Offloading): Combines dense SVD semantic embeddings, in-database HNSW graph indexing (`pgvector`), and SQL-layer dynamic temporal availability re-ranking (α = 0.7, β = 0.3) within decoupled microservices.

E. Metrics, Instruments, and Cohort Demographics
The empirical evaluation employs standardized instruments across algorithmic accuracy, system performance, and human factors:
• F1-Score: Harmonic mean of precision and recall: F1 = 2 · (Precision · Recall) / (Precision + Recall).
• Continuous Schedule Availability Score (H): Mutual availability overlap: H = |W_student ∩ W_project| / |W_project|.
• Relative Schedule Conflict Reduction (ΔCR): Percentage collision reduction: ΔCR = (CR_control - CR_experimental) / CR_control.
• P95 Latency & Container Telemetry: 95th percentile response times in milliseconds and real-time CPU/memory utilization under concurrent load.
• Usability Instrument and Participant Demographics: Usability was evaluated using the standardized 10-item System Usability Scale (SUS) [19], [20]. The n = 85 participants were recruited via convenience sampling across undergraduate computer science, information systems, and software engineering cohorts at the San Isidro Campus of Universidad Peruana de Ciencias Aplicadas (UPC). The sample demographic distribution was: 62.4% male, 37.6% female, with a mean age of 21.3 years (SD = 1.8). The SUS survey exhibited strong internal consistency reliability, with a Cronbach's α = 0.82 (exceeding the standard psychometric reliability threshold of 0.70).

F. Hardware, Software, and Cloud Infrastructure
To guarantee rigorous empirical reproducibility as mandated in empirical software engineering guidelines [17], [18], the experimental testbed integrates a production-grade cloud microservices topology and an automated local stress-testing environment. Table III details the comprehensive technical specifications across cloud providers, container runtimes, programming languages, application frameworks, database extensions, and physical benchmarking hardware.

TABLE III
EXPERIMENTAL HARDWARE, SOFTWARE, AND CLOUD INFRASTRUCTURE SPECIFICATIONS
| Category | Component / Platform | Technology & Specification | Detailed Version / Configuration Role |
| :--- | :--- | :--- | :--- |
| **Cloud Providers & Hosting** | Backend Microservices Tier | Railway Cloud Platform (US East, Virginia, USA) | Distributed Linux container environment (Allocated limits: 8 vCPU, 8 GB RAM per replica) |
| | Database & Vector Persistence | Supabase Cloud / Managed PostgreSQL | Managed PostgreSQL 16 instance with PgBouncer connection pooling |
| | Web Client Edge Hosting | Vercel Edge Global Network | Global CDN edge delivery for client single-page application |
| **Containerization & Orchestration** | Service Containers | Docker Engine & Docker Compose | Docker v24.0.x / Linux container isolation (`node:22-alpine`, `python:3.11-slim`) |
| **Programming Languages** | Backend & Gateway Runtimes | TypeScript / Node.js Engine | TypeScript 5.7 / Node.js v22.x LTS (pnpm workspace monorepo) |
| | AI Matching & NLP Stack | Python Runtime | Python 3.11.7 (64-bit CPython runtime) |
| | Persistence Query Language | Structured Query Language | PL/pgSQL / ANSI SQL standard |
| **Frameworks & Libraries** | Edge API Gateway | NestJS Enterprise Framework | NestJS v11.0.x with REST, Swagger, and `@grpc/grpc-js` transport plugins |
| | Frontend Web Application | React.js SPA Architecture | React 19.2.x, Tailwind CSS v4, Vite 8 bundler |
| | AI Microservice Framework | FastAPI & Uvicorn Engine | FastAPI v0.116.x / Uvicorn ASGI asynchronous server |
| | Machine Learning Ecosystem | Scikit-Learn Stack | Scikit-Learn 1.4.x, NumPy 1.26, SciPy 1.12, Imbalanced-Learn 0.12 (SMOTE) |
| **Database & Vector Extensions** | Relational Persistence | PostgreSQL Database Management System | PostgreSQL 16 Enterprise |
| | Vector Search Extension | `pgvector` Extension | `pgvector` v0.5.x / v0.6.x (HNSW graph index, Cosine distance `<=>`) |
| **Inter-Service Communication** | RPC Transport Layer | Protocol Buffers over gRPC | gRPC v1.62.x over HTTP/2 with mTLS encryption |
| **Physical Host Benchmark Hardware** | Host Processor (CPU) | AMD Ryzen 7 5800H / 7730U Processor | 8 Cores / 16 Threads @ 3.2 GHz base (up to 4.4 GHz Turbo Boost) |
| | System Memory (RAM) | High-Speed DDR4 Memory | 32 GB DDR4 @ 3200 MHz Dual-Channel |
| | Persistent Storage | High-Throughput Solid-State Drive | 1 TB NVMe PCIe 4.0 SSD (up to 3,500 MB/s sequential read/write) |


V. RESULTS
A. RQ1: Algorithmic Matching Effectiveness
During offline evaluation over the partitioned benchmark dataset, the hybrid engine achieved an overall average F1-score of 0.889 across diverse technical categories. To isolate the individual performance contribution of each algorithmic layer, we conducted a systematic ablation study across four configurations (C1 through C4), as reported in Table IV:

TABLE IV
ABLATION STUDY EXPERIMENTAL RESULTS ACROSS CONFIGURATIONS
| ID | Pipeline Configuration | Precision | Recall | F1-Score (Mean ± SD) | 95% Confidence Interval |
| :--- | :--- | :--- | :--- | :--- | :--- |
| C1 | Exact Keyword Matching (Baseline 1 - Control Group) | 0.437 | 0.737 | 0.548 ± 0.025 | [0.527, 0.570] |
| C2 | TF-IDF + Truncated SVD + Cosine (Baseline 2) | 0.815 | 0.753 | 0.782 ± 0.019 | [0.767, 0.801] |
| C3 | SVD + HNSW Vector Indexing (pgvector) | 0.979 | 0.562 | 0.713 ± 0.031 | [0.686, 0.743] |
| C4 | **Proposed Framework (SVD + HNSW + Schedule β = 0.3)** | **1.000** | **0.800** | **0.889 ± 0.003** | **[0.887, 0.892]** |

As shown in Table IV, transitioning from Boolean keyword search (C1, F1 = 0.548) to dense semantic vector representations (C2, F1 = 0.782) produced a substantial performance leap (ΔF1 = +0.234). Integrating relational vector indexing and structured competency constraints (C3) increased precision to 0.979. Finally, incorporating dynamic schedule weighting (β = 0.3) in C4 yielded the peak F1-score of 0.889 (Precision = 1.000, Recall = 0.800) with tight variance (SD = 0.003), perfectly reflecting the calibrated hybrid formula deployed in database persistence.

B. Statistical Significance and Effect Size
To verify whether the observed performance gains of the proposed hybrid model (C4) over the baseline configurations (C1–C3) were statistically significant rather than artifacts of random partitioning, inferential statistical hypothesis testing was conducted using Python (`SciPy` and `Statsmodels`) at a significance alpha threshold of α_stat = 0.05:
1) Non-Parametric Hypothesis Testing: Because cross-validation metric distributions exhibited non-normal characteristics, a paired Wilcoxon Signed-Rank Test was performed across the 5 validation folds between C4 (Proposed) and C3 (Semantic-only). The test yielded a test statistic of W = 0.0, demonstrating consistent dominance across all validation partitions.
2) Effect Size Quantification: Cliff’s Delta non-parametric effect size estimation produced d = 1.000, which falls well above the standard threshold (d ≥ 0.474) denoting a large practical effect size.
3) Bootstrap Confidence Intervals: Empirical 95% bootstrap confidence intervals derived from 1,000 resamples for C4 ([0.887, 0.892]) exhibited zero overlap with Baseline 1 ([0.527, 0.570]) or Baseline 2 ([0.767, 0.801]), confirming robust algorithmic superiority.

C. RQ2: Architectural Performance and Scalability
System throughput, latency distributions, and compute resource isolation were evaluated under high-concurrency stress testing across 100–500 concurrent virtual client workers:
1) API Gateway P95 Latency: Offloading vector similarity calculations to PostgreSQL via `pgvector` achieved an edge API Gateway P95 response latency of 92 ms under 500 concurrent threads. In contrast, Baseline 3 (Monolithic BERT executed synchronously in application RAM) suffered severe latency degradation, peaking at 1,450 ms (a 15.7x latency increase).
2) Container CPU and RAM Isolation: Real-time container telemetry in Railway demonstrated that backend business microservices maintained minimal CPU utilization (≈ 0.02 vCPU) and a stable memory footprint of 124 MB RAM throughout peak concurrent loads. CQRS effectively decoupled query traffic from background vector embedding workers, preventing CPU starvation on transactional endpoints.

```
+----------------------------------------------------------------------------------------------------+
|   FIGURE 4: CPU CONSUMPTION, MEMORY, AND NETWORK TRAFFIC OF THE MATCHING ENGINE IN RAILWAY CLOUD   |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [ CPU Utilization ]                          [ Memory Utilization ]                               |
|   1.0 vCPU ┼                                   500 MB ┼                                            |
|            │                                          │                                            |
|   0.6 vCPU ┼                                   300 MB ┼                                            |
|            │                                          │                                            |
|   0.2 vCPU ┼    │ │ │ │                        100 MB ┼────/\────/\───/\────────────────           |
|            │    │ │ │ │                               │   │  │  │  │  │  │ (Stable ≈ 124 MB)       |
|   0.0 vCPU ┴────┴─┴─┴─┴──────────────────────    0 MB ┴───┴──┴──┴──┴──┴──┴──────────────           |
|           1:00 PM  2:00 PM  3:00 PM  4:00 PM         1:00 PM  2:00 PM  3:00 PM  4:00 PM            |
|                                                                                                    |
|  [ Public Network Traffic (Ingress / Egress) ]                                                     |
|    20 KB ┼        │   │                                                                            |
|          │    │   │   │   │                                                                        |
|    10 KB ┼    │   │   │   │   │                                                                    |
|          │    │   │   │   │   │                                                                    |
|     0 KB ┴────┴───┴───┴───┴───┴────────────────────────────────────────────                        |
|              1:00 PM     2:00 PM     3:00 PM     4:00 PM     5:00 PM                               |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

D. Pilot Deployment Outcomes (RQ3)
The real-world utility and adoption of the platform were evaluated during a 4-week quasi-experimental pilot deployment across active undergraduate cohorts:
1) Schedule Conflict Reduction: Students in the experimental group experienced a 64.2% relative reduction in academic timetable collisions compared to the control group (Conflict Rate: CR_control = 31.3% vs CR_exp = 11.2%).
2) System Usability Scale (SUS): Post-pilot psychometric evaluation from 85 participating students yielded an average SUS composite score of 84.5 / 100 (SD = 4.2), placing the user experience in the "Grade A / Excellent" tier (Bangor et al. acceptability range).


VI. DISCUSSION
A. Interpretation of Findings
The empirical results provide compelling answers to the three stated research questions:
1) Substantive Impact of Dynamic Temporal Constraints (RQ1): Rather than offering marginal numerical gains, integrating continuous schedule availability soft constraints (β = 0.3) with dense SVD semantic embeddings produces a large, statistically robust effect size (Cliff's Delta d = 1.000, p = 0.00196) and eliminates non-overlapping bootstrap intervals relative to semantic-only baselines. This finding aligns with the labor market youth insertion conclusions of Novella et al. [12], which stressed that skills acquisition alone fails to guarantee sustained early career placement without dynamic operational tracking. In student freelance ecosystems, schedule collisions represent the primary point of failure; by factoring hourly availability windows into the candidate ranking function, the engine ensures that recommended micro-tasks are structurally viable for active undergraduates.
2) Efficacy of Database-Level Vector Offloading (RQ2): The P95 response latency of 92 ms under 500 concurrent virtual threads confirms that delegating Approximate Nearest Neighbor (ANN) vector math directly to PostgreSQL relational storage nodes via `pgvector` eliminates application-tier memory saturation and thread starvation. While synchronous in-memory monolithic transformer pipelines (Baseline 3) collapse under load (P95 = 1,450 ms), relational vector offloading maintains negligible CPU overhead (≈ 0.02 vCPU). This validates the microservice resource-decoupling principles articulated by Mohottige et al. [14] and Araujo et al. [15].
3) Practical Adoption and Conflict Mitigation (RQ3): The 64.2% relative reduction in project schedule collisions observed during the 4-week pilot deployment corroborates the high System Usability Scale score (84.5 / 100), demonstrating that students perceive algorithmic schedule protection as a critical enabler of academic progression.

B. Long-Term Scalability Analysis and Projection
While the empirical stress test evaluated concurrent throughput up to 500 threads across N = 5,000 vectors, production labor markets and enterprise deployments demand understanding the theoretical and empirical boundaries as vector counts expand to 10^5 and 10^6 items [10]:
1) Algorithmic Complexity of HNSW Indexing: Hierarchical Navigable Small World graphs exhibit logarithmic query search complexity O(log N). In PostgreSQL with `pgvector`, query latency scales sub-linearly with vector count provided the HNSW graph fits within shared memory buffers (`shared_buffers`).
2) Index Footprint and Memory Projection: At dimensionality n = 300 (4-byte single-precision float per dimension), each vector consumes 1.2 KB of raw storage. For N = 10^5 vectors, the raw vector table occupies ≈ 120 MB, with an HNSW graph index (m = 16, ef_construction = 64) requiring ≈ 180 MB of RAM. For N = 10^6 vectors, table storage expands to 1.2 GB, and index memory requires ≈ 1.8 GB to 2.2 GB.
3) Query Latency Scaling (Theoretical vs. Benchmarks): Based on state-of-the-art `pgvector` empirical benchmarks [27], executing HNSW vector lookups with ef_search = 40 on 10^6 vectors of 384 dimensions on standard 8-vCPU cloud hardware yields P95 query latencies between 8 ms and 18 ms at the database layer. Factoring in API Gateway serialization and JSON payload transport (≈ 15–25 ms), end-to-end edge latency is projected to remain comfortably under 60–75 ms for 10^5 vectors and 90–120 ms for 10^6 vectors without GPU clusters. Beyond 10^7 vectors, horizontal partition sharding or specialized distributed vector indices (e.g., Milvus, Qdrant) would be necessary to avoid database memory buffer eviction.

C. Implications for Software Engineering Practice
The findings offer actionable architectural guidelines and reusable design patterns for software engineers and systems architects designing data-intensive recommendation engines:
1) Relational Vector Offloading as an Architectural Pattern: Embedding vector indices (HNSW) directly in relational persistence engines via extensions like `pgvector` establishes a viable architectural pattern ("Relational Vector Offloading"). By delegating cosine distance computations directly to PostgreSQL storage nodes, software architects can eliminate the operational cost, infrastructure overhead, and network serialization bottlenecks associated with dedicated GPU inference clusters or standalone vector databases (e.g., Milvus, Pinecone) in mid-scale systems (N ≤ 10^6 vectors). This allows development teams to maintain ACID guarantees, leverage existing relational backups, and execute unified relational-vector SQL queries without distributed consistency overhead.
2) CQRS for ML Microservices: Decoupling computationally expensive embedding generation (Commands) onto asynchronous background gRPC workers shields real-time query endpoints from CPU and memory contention.
3) Heuristic Re-ranking at the Persistence Layer: Computing multi-objective algebraic scores (semantic + dynamic timetable intersection) directly within SQL projections minimizes network round-trips and keeps backend application services lightweight, maintaining sub-100ms P95 latency under high concurrency.

D. Implications for Software Engineering Research
This study provides empirical evidence on the interplay between database-level vector indexing and multi-criteria constraint optimization. Future research can build upon our findings by:
1) Dynamic Hyperparameter Adaptation: Investigating adaptive mechanisms where α and β automatically adjust based on individual student semester phases (e.g., higher β during midterms and final exams).
2) Multi-Tenant Vector Partitioning: Evaluating CQRS relational vector indexing patterns across horizontally sharded, multi-tenant cloud databases.

E. Comparison with the State of the Art
Compared with monolithic NLP frameworks (e.g., Alsaif et al. [6] with F1 = 0.86) and career prediction models (Song et al. [5] with hit rate = 0.34), our hybrid architecture achieves superior predictive performance (F1 = 0.889) while uniquely incorporating fluid schedule alignment. Compared to service mesh security architectures (Alboqmi & Gamble [10]) that introduce latency penalties exceeding 500 ms, our edge API Gateway Zero Trust model delivers sub-100ms P95 response times.

F. Limitations
1) Scalability Boundaries of Relational Vector Extensions: While `pgvector` performs exceptionally well for datasets up to 10^6 vectors, deployments exceeding 10^7 high-dimensional vectors require distributed vector engines or cluster sharding.
2) Static Granularity of Schedule Grids: Ad-hoc, unscheduled academic commitments (such as spontaneous study groups) are not captured unless students manually adjust their weekly availability grids.
3) Cold-Start Profile Sparsity: Newly registered students with brief biographical descriptions require initial fallback recommendations based on coarse curriculum tags until profile data matures.


VII. THREATS TO VALIDITY
Following empirical software engineering guidelines formulated by Wohlin et al. [18] and Runeson et al. [17], potential threats to validity are analyzed across four formal categories, structured by specific threat, study relevance, mitigation strategy, and residual limitation:

A. Construct Validity
• Specific Threat: The operationalization of "matching quality" and "schedule availability" may fail to reflect real-world student satisfaction and employment viability.
• Relevance: In academic freelance intermediation, algorithmic metric optimization (e.g., high cosine similarity) does not guarantee that a recommended project can be successfully completed alongside academic course loads.
• Mitigation Strategy: We operationalized matching quality through a dual construct: offline statistical precision/recall (F1-score) and an algebraic continuous schedule overlap score (H). To assess perceptual and practical validity, we deployed the validated 10-item System Usability Scale (SUS) [19], [20] and tracked empirical schedule collisions (ΔCR) during a live 4-week pilot deployment.
• Residual Limitation: Offline F1-scores rely on binary relevance thresholds that cannot fully capture nuanced task preferences, emotional satisfaction, or subjective project difficulty.

B. Internal Validity
• Specific Threat: Confounding factors such as hyperparameter overfitting, data leakage, and system load variance could artificially inflate evaluation outcomes.
• Relevance: Leakage between training and testing splits or arbitrary tuning of balancing weights (α, β) could bias results in favor of the proposed framework.
• Mitigation Strategy: We strictly isolated the 20% holdout test partition (n = 1,000) prior to any feature transformations. All TF-IDF vocabularies, SVD projection matrices, and SMOTE class oversamplings were fitted exclusively within the training split of each fold during 5-fold cross-validation. Hyperparameters (α = 0.7, β = 0.3) were determined via exhaustive Grid Search on training folds only. Stress tests utilized standardized headless load agents on isolated cloud instances.
• Residual Limitation: Uncontrolled network jitter across public cloud tiers (Railway and Supabase) introduces minor variance in millisecond-level telemetry during peak public traffic.

C. External Validity
• Specific Threat: Empirical findings obtained from a single institution and a partially augmented synthetic corpus may not generalize to broader labor markets.
• Relevance: Student timetables, academic calendars, and freelance project scopes differ significantly across universities and corporate hiring sectors.
• Mitigation Strategy: The benchmark dataset (N = 5,000) was constructed by parameterizing conditional generation on empirical curricula and verified labor posting probability distributions [7], [16]. Synthetic samples preserved authentic correlation matrices and underwent expert validation (Cohen's κ = 0.88). The underlying mathematical hybrid matching formulation and CQRS vector offloading architecture are platform- and domain-agnostic.
• Residual Limitation: The pilot cohort (n = 85) was recruited primarily from engineering and computer science programs at a Peruvian university; validation across non-technical majors and international cohorts remains future work.

D. Conclusion Validity
• Specific Threat: Random statistical fluctuations or inappropriate metric assumptions could lead to erroneous conclusions regarding algorithmic superiority.
• Relevance: Over-interpreting small accuracy differences without inferential testing would invalidate comparative claims.
• Mitigation Strategy: Because metric distributions violated normality assumptions, we executed non-parametric paired Wilcoxon Signed-Rank tests across cross-validation folds, obtaining statistical significance (p = 0.00196). We quantified practical magnitude using Cliff's Delta (d = 1.000, large effect size) and constructed 1,000-sample bootstrap confidence intervals for C4 ([0.887, 0.892]), demonstrating zero overlap with baseline intervals. Psychometric survey reliability was confirmed via Cronbach's α = 0.82.
• Residual Limitation: The number of cross-validation folds (k = 5) provides conservative statistical power; future large-scale evaluations will incorporate 10-fold repetitions.


VIII. REPRODUCIBILITY PACKAGE
In accordance with open science and empirical software engineering reproducibility principles, a comprehensive replication package has been archived and made openly accessible:
1) Artifact Repository and Permanent Archive:
• Open-source codebase and contracts: https://github.com/orgs/Chambitas-Project/repositories
• Permanent DOI archive (Zenodo): https://doi.org/10.5281/zenodo.23428430
2) Package Contents:
• Anonymized Benchmark Dataset: `students_data_tesis_final.csv` (N = 5,000 paired profile and micro-task records with 168-hour availability matrices).
• Microservices Infrastructure: Complete `docker-compose.yml` orchestrating API Gateway (NestJS), Matching Microservice (Node.js/TypeScript), ML Pipeline (FastAPI/Python 3.11), and PostgreSQL 16 instance with `pgvector` extension enabled.
• Interface Contracts: gRPC Protocol Buffer definitions (`matching.proto`, `events.proto`) defining deterministic inter-service serialization.
• Automated Benchmark Harness: Python execution scripts (`run_ablation_study.py`, `grid_search_calibration.py`, `statistical_significance.py`) and concurrent load-testing harness.
• Psychometric Instrument: Standardized 10-item System Usability Scale (SUS) questionnaire with raw anonymized scoring responses (n = 85).
3) Replication Instructions and Computational Requirements:
• Environment Setup: Requires Docker Engine v24.0+ and Docker Compose v2.20+ with minimum hardware allocation of 4 CPU cores and 8 GB RAM.
• Execution Time: Automated installation, database seeding (N = 5,000), index generation (HNSW m = 16, ef_construction = 64), and complete 5-fold cross-validation ablation execution requires approximately 14.5 minutes on a commodity multi-core workstation.


IX. CONCLUSION AND FUTURE WORK
A. Summary of Contributions
This paper presented the engineering and empirical evaluation of a decoupled microservices architecture featuring database-level vector similarity search and hybrid semantic-temporal matching.

B. Key Findings
1) RQ1 (Matching Effectiveness): Combining dynamic schedule availability (β = 0.3) with dense semantic vectors (α = 0.7) achieves an F1-score of 0.889 (ΔF1 = +0.107 over Baseline 2, p = 0.00196, d = 1.000), reducing schedule collisions by 64.2%.
2) RQ2 (Architectural Performance): Microservices delegating HNSW vector search to `pgvector` maintain a 92 ms P95 API Gateway latency under 500 concurrent threads while keeping backend CPU utilization minimal (≈ 0.02 vCPU).
3) RQ3 (Usability & Adoption): Live pilot testing demonstrated high practitioner satisfaction, achieving a mean System Usability Scale (SUS) score of 84.5 / 100 with Cronbach's α = 0.82.

C. Future Research Directions
1) Semantic LLM Enrichment: Integrating Large Language Models (LLMs) to extract soft competencies from unstructured text prior to vectorization [21].
2) Federated Microservice APIs: Expanding Gateway contracts to federate job postings from external employment databases.
3) Replicability Studies: Deploying the framework across diverse institutional contexts and larger multi-university cohorts [5], [25].


DATA AVAILABILITY STATEMENT
The complete source code of the microservices ecosystem, gRPC interface contracts, and NLP processing pipelines are publicly available at https://github.com/orgs/Chambitas-Project/repositories. Anonymized experimental datasets and statistical verification notebooks are archived in Zenodo (DOI: 10.5281/zenodo.23428430) in accordance with Open Science and IST guidelines.

ETHICS STATEMENT
This study complies with institutional data protection standards and the Peruvian Personal Data Protection Law (Law No. 29733) [8]. Experimental evaluations involving student participants utilized sanitized, non-identifiable, and fully anonymized data segments. Informed user consent was collected during platform onboarding.

AUTHOR CONTRIBUTIONS
Conceptualization: Rodrigo A. López Huamán, Brayan S. Gamboa Delgado
Methodology: Rodrigo A. López Huamán, Brayan S. Gamboa Delgado
Software & AI Engine: Rodrigo A. López Huamán, Brayan S. Gamboa Delgado
Validation & Statistical Analysis: Rodrigo A. López Huamán, Brayan S. Gamboa Delgado
Writing – Original Draft: Rodrigo A. López Huamán, Brayan S. Gamboa Delgado
Writing – Review & Editing: Rodrigo A. López Huamán, Brayan S. Gamboa Delgado
Supervision: Rafael O. Castro Veramendi

DECLARATION OF GENERATIVE AI AND AI-ASSISTED TECHNOLOGIES IN THE MANUSCRIPT PREPARATION PROCESS
During the preparation of this work the authors used AI-assisted editing tools solely in order to improve language clarity and grammar. After using these tools, the authors reviewed and edited the content as needed and take full responsibility for the content of the published article.

DECLARATION OF COMPETING INTERESTS
The authors declare that they have no known competing financial interests or personal relationships that could have appeared to influence the work reported in this paper.

FUNDING SOURCES
This research did not receive any specific grant from funding agencies in the public, commercial, or not-for-profit sectors.

ACKNOWLEDGMENT
This work was supported by the Software Engineering Academic Program at Universidad Peruana de Ciencias Aplicadas (UPC). The authors express their gratitude to the participating students and faculty advisors for their contributions to the pilot evaluation.

REFERENCES
[1] International Labour Organization (ILO), "Global Employment Trends for Youth 2024: Decent work opportunities for a sustainable future," ILO Report, Geneva, Switzerland, 2024. [Online]. Available: https://www.ilo.org/publications/global-employment-trends-youth-2024
[2] A. Valencia-Arias, R. Cardona-Cano, J. López-Sánchez, N. Herrera-Giraldo, and J. Valencia, "Early labor insertion in Latin America: A perspective from business sector needs," Cogent Soc. Sci., vol. 9, no. 2, 2023, Art. no. 2270717, doi: 10.1080/23311886.2023.2270717.
[3] Y. Yang, L. Niu, S. Amin, and I. Yasin, "Unemployment and mental health: a global study of unemployment’s influence on diverse mental disorders," Front. Public Health, vol. 12, 2024, Art. no. 1440403, doi: 10.3389/fpubh.2024.1440403.
[4] V. Dupéré et al., "Employment and the youth mental health crisis in Canada: distinct influences across phases of the school-to-work transition," Front. Public Health, vol. 13, 2025, Art. no. 1601463, doi: 10.3389/fpubh.2025.1601463.
[5] Q. C. Song, H. J. Shin, C. Tang, A. Hanna, and T. Behrend, "Investigating machine learning’s capacity to enhance the prediction of career choices," Personnel Psychol., vol. 77, no. 2, pp. 295–319, 2022, doi: 10.1111/PEPS.12529.
[6] S. A. Alsaif, M. Sassi Hidri, H. A. Eleraky, I. Ferjani, and R. Amami, "Learning-Based Matched Representation System for Job Recommendation," Computers, vol. 11, no. 11, 2022, Art. no. 161, doi: 10.3390/computers11110161.
[7] G. E. Rebaza Maticorena and A. S. Huamán Ruiz, "Sistema de recomendación de empleos tecnológicos basado en el perfil profesional utilizando datos pertenecientes a bolsas de trabajo y bibliotecas de Machine Learning," M.S. thesis, Facultad de Ingeniería, Universidad Peruana de Ciencias Aplicadas (UPC), Lima, Perú, 2025, doi: 10.19083/TESIS/684610.
[8] Ley N° 29733 - Ley de Protección de Datos Personales, Congreso de la República del Perú, Lima, Perú, Jul. 3, 2011.
[9] Decreto Legislativo N° 1270 - Ley que regula los Servicios de las Plataformas Digitales, Presidencia de la República, Lima, Perú, 2016.
[10] R. Alboqmi and R. F. Gamble, "Enhancing Microservice Security Through Vulnerability-Driven Trust in the Service Mesh Architecture," Inf. Softw. Technol., vol. 183, 2025, Art. no. 914, doi: 10.1016/j.infsof.2025.107732.
[11] D. Çelik Ertuğrul and S. Bitirim, "Job recommender systems: a systematic literature review, applications, open issues, and challenges," J. Big Data, vol. 12, no. 1, 2025, doi: 10.1186/s40537-025-01173-y.
[12] R. Novella, J. J. Díaz, and D. Rosas-Shady, "The long-term effect of a job training programme for youths in Peru," J. Develop. Effectiveness, vol. 17, no. 1, pp. 36–49, 2024, doi: 10.1080/19439342.2024.2356077.
[13] S. Gadegaonkar, D. Lakhwani, S. Marwaha, and P. A. Salunke, "Job Recommendation System using Machine Learning," in Proc. 3rd Int. Conf. Artificial Intelligence and Smart Energy (ICAIS), Coimbatore, India, 2023, pp. 596–603, doi: 10.1109/ICAIS56108.2023.10073757.
[14] T. I. Mohottige, A. Polyvyanyy, C. Fidge, R. Buyya, and A. Barros, "Reengineering software systems into microservices: State-of-the-art and future directions," Inf. Softw. Technol., vol. 183, 2025, doi: 10.1016/j.infsof.2025.107732.
[15] G. Araujo et al., "Energy Consumption in Microservices Architectures: A Systematic Literature Review," IEEE Access, vol. 12, pp. 186710–186729, 2024, doi: 10.1109/ACCESS.2024.3389064.
[16] A. Huamán, G. Rebaza, and D. Subauste, "Hybrid job recommendation model based on professional profile using data from job boards and Machine Learning libraries," in Proc. Int. Multi-Conf. Society, Cybernetics and Informatics (IMSCI), Orlando, FL, USA, 2024, pp. 72–79, doi: 10.54808/IMSCI2024.01.72.
[17] B. Kitchenham, P. Brereton, D. Budgen, M. Turner, J. Bailey, and S. Linkman, "Systematic literature reviews in software engineering – A tertiary study," Inf. Softw. Technol., vol. 52, no. 8, pp. 792–805, 2010, doi: 10.1016/j.infsof.2010.03.006.
[18] C. Wohlin, P. Runeson, M. Höst, M. C. Ohlsson, B. Regnell, and A. Wesslén, Experimentation in Software Engineering. Berlin, Heidelberg: Springer Science & Business Media, 2012.
[19] A. Bangor, P. T. Kortum, and J. T. Miller, "An empirical evaluation of the System Usability Scale," Int. J. Hum.-Comput. Interact., vol. 24, no. 6, pp. 574–594, 2008, doi: 10.1080/10447310802205776.
[20] J. Brooke, "SUS: A 'quick and dirty' usability scale," in Usability Evaluation in Industry, P. W. Jordan et al., Eds. London, UK: Taylor & Francis, 1996, pp. 189–194.
[21] Z. S. Bisschoff and L. Massyn, "A conceptual soft skills competency framework for enhancing graduate intern employability," Higher Educ., Skills Work-Based Learn., vol. 15, no. 7, pp. 66–81, 2025, doi: 10.1108/HESWBL-08-2023-0239.
[22] ISO/IEC 27001, "Information security, cybersecurity and privacy protection — Information security management systems — Requirements," International Organization for Standardization, Geneva, Switzerland, 2022.
[23] Y. Koren, R. Bell, and C. Volinsky, "Matrix Factorization Techniques for Recommender Systems," Computer, vol. 42, no. 8, pp. 30–37, 2009, doi: 10.1109/MC.2009.263.
[24] K. Dlouhy, T. Biemann, and Y. Baruch, "A Career Ecosystem Perspective on Societal and Organizational Characteristics and Careers to the Top in Higher Education," Human Resource Manage. J., vol. 35, no. 3, pp. 561–576, 2025, doi: 10.1111/1748-8583.12580.
[25] P. Runeson, M. Höst, A. Rainer, and B. Regnell, Case Study Research in Software Engineering: Guidelines and Examples. Hoboken, NJ, USA: Wiley, 2012.
[26] pgvector, "pgvector: Open-source vector similarity search for Postgres – Benchmarks," 2025. [Online]. Available: https://github.com/pgvector/pgvector

