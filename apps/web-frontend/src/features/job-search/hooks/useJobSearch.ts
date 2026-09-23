import { useState, useEffect, useMemo } from "react";
import { apiClient } from "../../../api/api-client";
import type { Project, Recommendation } from "../types";
import type { FilterState } from "../components/JobSearchFilters";
import { getCategoriesForCareer } from "../utils/career-category.map";

const ITEMS_PER_PAGE = 10;

export const defaultFilters: FilterState = {
  category: "Todos",
  skills: [],
  minPrice: 0,
  maxPrice: 5000,
  recommended: false
};

export function useJobSearch() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState("Mayor Match");
  const [currentPage, setCurrentPage] = useState(1);
  const [catalogCategories, setCatalogCategories] = useState<string[]>([]);
  const [userSkillNames, setUserSkillNames] = useState<string[]>([]);
  const [userCareerCategories, setUserCareerCategories] = useState<string[]>([]);
  const [testGroup, setTestGroup] = useState<string>("EXPERIMENTAL");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, recRes, appsRes, skillsRes, profileRes] = await Promise.allSettled([
          apiClient.get("/marketplace/projects"),
          apiClient.get("/matching/recommendations/me"),
          apiClient.get("/marketplace/applications/my-applications"),
          apiClient.get("/profile/skills"),
          apiClient.get("/profile/me")
        ]);

        if (profileRes.status === "fulfilled") {
          const prof = profileRes.value.data;
          if (prof?.test_group) {
            setTestGroup(prof.test_group);
          }
          if (Array.isArray(prof?.skills)) {
            const skillNames = prof.skills.map((s: any) => typeof s === "string" ? s : s.name || s.skill_name).filter(Boolean);
            setUserSkillNames(skillNames);
          }

          const careerName = prof?.career || prof?.careers?.name || prof?.student_career || "";
          const careerArea = prof?.career_area || prof?.careers?.area || "";
          
          const categoriesForCareer = getCategoriesForCareer(careerName, careerArea);
          setUserCareerCategories(categoriesForCareer);
        }

        if (projRes.status === "fulfilled") {
          const data = projRes.value.data;
          const allProjects = Array.isArray(data) ? data : (data.projects || []);
          setProjects(allProjects);
        }

        if (recRes.status === "fulfilled") {
          const data = recRes.value.data;
          const recs = Array.isArray(data) ? data : (data.recommendations || []);
          setRecommendations(recs);
        }

        if (appsRes.status === "fulfilled") {
          const data = appsRes.value.data;
          const apps = Array.isArray(data) ? data : (data.applications || []);
          setApplications(apps);
        }

        if (skillsRes.status === "fulfilled") {
          const data = skillsRes.value.data;
          const skillsData = Array.isArray(data) ? data : (data.skills || []);
          const uniqueCats = new Set<string>();
          skillsData.forEach((s: any) => {
            if (s.category) uniqueCats.add(s.category);
          });
          setCatalogCategories(Array.from(uniqueCats).sort());
        }
      } catch (error) {
        console.error("Unexpected error fetching job search data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, appliedFilters, sortBy]);

  const categories = useMemo(() => {
    const dynamicCats = catalogCategories.map(cat => ({
      label: cat,
      value: cat
    }));
    return [{ label: "Todos", value: "Todos" }, ...dynamicCats];
  }, [catalogCategories]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const isProjectOpen = (project.status || "open").toLowerCase() === "open";
      if (!isProjectOpen) return false;

      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        appliedFilters.category === "Todos" ||
        (project.service_category || "").toLowerCase() === appliedFilters.category.toLowerCase();

      const matchesPrice = project.budget >= appliedFilters.minPrice && project.budget <= appliedFilters.maxPrice;

      const matchesSkill = appliedFilters.skills.length === 0 || appliedFilters.skills.every(skillToMatch => {
        if (!project.skills) return false;
        return project.skills.some(skill => {
          if (typeof skill === 'string') return skill.toLowerCase().includes(skillToMatch.toLowerCase());
          return skill.skill_name?.toLowerCase().includes(skillToMatch.toLowerCase());
        });
      });

      const projectId = project.id || (project as any).project_id || (project as any)._id;
      const match = recommendations.find(r => r.jobId === projectId);
      const matchesRecommended = !appliedFilters.recommended || (match && match.score > 0);

      return matchesSearch && matchesCategory && matchesPrice && matchesSkill && matchesRecommended;
    });
  }, [projects, searchQuery, appliedFilters, recommendations]);

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      if (sortBy === "Más Recientes") {
        const isAInCareerArea = userCareerCategories.some(cat => 
          (a.service_category || "").toLowerCase() === cat.toLowerCase()
        );
        const isBInCareerArea = userCareerCategories.some(cat => 
          (b.service_category || "").toLowerCase() === cat.toLowerCase()
        );

        if (isAInCareerArea && !isBInCareerArea) return -1;
        if (!isAInCareerArea && isBInCareerArea) return 1;

        const dateA = new Date(a.created_at || (a as any).created || 0).getTime();
        const dateB = new Date(b.created_at || (b as any).created || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === "Mayor Match") {
        const idA = a.id || (a as any).project_id || (a as any)._id;
        const idB = b.id || (b as any).project_id || (b as any)._id;
        const matchA = recommendations.find(r => r.jobId === idA)?.score || 0;
        const matchB = recommendations.find(r => r.jobId === idB)?.score || 0;
        return matchB - matchA;
      }
      if (sortBy === "Mejor Pago") {
        return (b.budget || 0) - (a.budget || 0);
      }
      return 0;
    });
  }, [filteredProjects, sortBy, userCareerCategories, recommendations]);

  const totalPages = Math.ceil(sortedProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    return sortedProjects.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [sortedProjects, currentPage]);

  const resetFilters = () => {
    setSearchQuery("");
    setAppliedFilters(defaultFilters);
  };

  return {
    projects: paginatedProjects,
    totalCount: filteredProjects.length,
    loading,
    categories,
    searchQuery,
    setSearchQuery,
    appliedFilters,
    setAppliedFilters,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    userSkillNames,
    testGroup,
    recommendations,
    applications,
    resetFilters
  };
}
