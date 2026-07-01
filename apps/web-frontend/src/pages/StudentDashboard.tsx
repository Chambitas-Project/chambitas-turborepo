import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/api-client";
import { DashboardNavbar } from "../widgets/navbar/ui/DashboardNavbar";
import { Sparkles } from "lucide-react";
// Types and Constants
import type { Profile, CatalogSkill } from "../features/student-dashboard/types";

// Components
import { ProfileHeader } from "../features/student-dashboard/components/ProfileHeader";
import { AvailabilityGrid } from "../features/student-dashboard/components/AvailabilityGrid";
import { MatchScoreWidget } from "../features/student-dashboard/components/MatchScoreWidget";
import { SkillsWidget } from "../features/student-dashboard/components/SkillsWidget";
import { EditProfileModal, type EditProfileFormData } from "../features/student-dashboard/components/EditProfileModal";
import { AddSkillModal, type AddSkillFormData } from "../features/student-dashboard/components/AddSkillModal";

export function StudentDashboard() {
  useAuth();

  // Data State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availableSkills, setAvailableSkills] = useState<CatalogSkill[]>([]);
  const [maxMatchScore, setMaxMatchScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // UI State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [addingSkillType, setAddingSkillType] = useState<'hard' | 'soft' | null>(null);
  const [skillSearch, setSkillSearch] = useState("");

  // Forms initial data
  const [editFormInitialData, setEditFormInitialData] = useState<EditProfileFormData>({
    bio: "",
    gpa: "",
    phoneNumber: "",
    academicCycle: "1",
    availability: {
      mon: "0".repeat(32), tue: "0".repeat(32), wed: "0".repeat(32),
      thu: "0".repeat(32), fri: "0".repeat(32), sat: "0".repeat(32), sun: "0".repeat(32),
    }
  });

  const parseAvailability = (raw: any) => {
    if (!raw) return null;
    let data = raw;
    if (typeof raw === 'string') {
      try { data = JSON.parse(raw); } catch (e) { return null; }
    }
    if (data && data.schedule && typeof data.schedule === 'object') {
      return data.schedule;
    }
    return data;
  };

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/profile/me");
      const data = response.data;
      const rawBlocks = data.availability_blocks || data.availabilityBlocks || data.availability || null;
      const parsedBlocks = parseAvailability(rawBlocks);

      const normalizedSkills = (data.skills || []).map((s: any) => ({
        ...s,
        level: s.proficiencyLevel || s.proficiency_level || s.level || 3
      }));

      setProfile({
        ...data,
        fullName: data.full_name || data.fullName,
        careerId: data.career_id || data.careerId,
        skills: normalizedSkills,
        availability_blocks: parsedBlocks,
        weekly_availability: data.weekly_availability || data.weeklyAvailability || 0
      });

      setEditFormInitialData({
        bio: data.bio || "",
        gpa: Number(data.gpa || 0).toFixed(2),
        phoneNumber: data.phoneNumber || data.phone_number || "",
        academicCycle: (data.academicCycle || data.academic_cycle || "1").toString(),
        availability: parsedBlocks || {
          mon: "0".repeat(32), tue: "0".repeat(32), wed: "0".repeat(32),
          thu: "0".repeat(32), fri: "0".repeat(32), sat: "0".repeat(32), sun: "0".repeat(32),
        }
      });
    } catch (err) {
      console.error("Error fetching profile", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await apiClient.get("/matching/recommendations/me");
      const recs = Array.isArray(response.data) ? response.data : (response.data?.recommendations || []);
      if (recs.length > 0) {
        const max = Math.max(...recs.map((r: any) => r.score || 0));
        setMaxMatchScore(Math.round(max * 100));
      } else {
        setMaxMatchScore(0);
      }
    } catch (err) {
      console.error("Error fetching recommendations", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    const fetchSkills = async () => {
      try {
        const response = await apiClient.get("/profile/skills");
        const data = Array.isArray(response.data) ? response.data : (response.data?.skills || []);
        setAvailableSkills(data);
      } catch (err) {
        console.error("Error fetching catalog skills", err);
      }
    };
    fetchSkills();
    fetchRecommendations();
  }, []);

  const handleUpdateProfile = async (formData: EditProfileFormData) => {
    setUpdating(true);
    try {
      await apiClient.patch("/profile/me", {
        bio: formData.bio,
        gpa: parseFloat(formData.gpa),
        phone_number: formData.phoneNumber,
        academic_cycle: parseInt(formData.academicCycle),
        availability_blocks: formData.availability
      });
      await fetchProfile();
      setTimeout(() => { fetchRecommendations(); }, 1500);
      setTimeout(() => { setShowEditModal(false); }, 1000);
    } catch {
      alert("Error al actualizar el perfil.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddSkill = async (formData: AddSkillFormData) => {
    if (!profile) return;
    setUpdating(true);
    try {
      const currentSkills = (profile.skills || []).map(s => ({
        name: s.name,
        proficiency_level: s.level
      }));

      const updatedSkills = [...currentSkills, {
        name: formData.name,
        proficiency_level: formData.level
      }];

      await apiClient.patch("/profile/me", {
        skill_inputs: updatedSkills
      });

      setShowSkillsModal(false);
      setAddingSkillType(null);
      setSkillSearch("");
      await fetchProfile();
      setTimeout(() => { fetchRecommendations(); }, 1500);
    } catch (err) {
      alert("Error al añadir habilidad.");
    } finally {
      setUpdating(false);
    }
  };

  const removeSkill = async (skillName: string) => {
    if (!profile) return;
    try {
      const updatedSkills = (profile.skills || [])
        .filter(s => s.name !== skillName)
        .map(s => ({
          name: s.name,
          proficiency_level: s.level
        }));

      await apiClient.patch("/profile/me", {
        skill_inputs: updatedSkills
      });
      await fetchProfile();
      setTimeout(() => { fetchRecommendations(); }, 1500);
    } catch {
      alert("Error al eliminar habilidad.");
    }
  };

  const filteredCatalogSkills = availableSkills.filter(s =>
    (addingSkillType === 'soft' ? s.type === 'soft' : (addingSkillType === 'hard' ? s.type !== 'soft' : true)) &&
    (s.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(skillSearch.toLowerCase()))) &&
    !profile?.skills?.some((ps: any) => ps.name === s.name)
  );

  const strength = (() => {
    if (!profile) return 0;
    let score = 40;
    if (profile.bio) score += 20;
    if (profile.gpa && profile.gpa > 0) score += 15;
    if (profile.skills && profile.skills.length > 3) score += 15;
    if (profile.academicCycle > 1) score += 10;
    return Math.min(score, 100);
  })();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Sparkles className="h-6 w-6 text-emerald-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      <DashboardNavbar role="student" />
      <main className="w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full h-full">
          {/* Columna Principal */}
          <div className="lg:col-span-8 2xl:col-span-9 border-r border-slate-100 p-6 md:p-10 lg:pl-16 pb-16 space-y-12 md:space-y-16">
            <ProfileHeader
              profile={profile}
              onEditClick={() => setShowEditModal(true)}
            />
            <AvailabilityGrid profile={profile} />
          </div>

          {/* Lateral - Sidebar Integrated */}
          <div className="lg:col-span-4 2xl:col-span-3 p-6 md:p-10 lg:pr-16 space-y-14 bg-slate-50/50 border-l border-slate-100">
            <MatchScoreWidget
              maxMatchScore={maxMatchScore}
              profile={profile}
              strength={strength}
            />
            <SkillsWidget
              profile={profile}
              availableSkills={availableSkills}
              onAddSkillClick={(type) => { setAddingSkillType(type); setShowSkillsModal(true); }}
              onRemoveSkill={removeSkill}
            />
          </div>
        </div>
      </main>

      <AddSkillModal
        isOpen={showSkillsModal}
        updating={updating}
        addingSkillType={addingSkillType}
        filteredCatalogSkills={filteredCatalogSkills}
        onClose={() => { setShowSkillsModal(false); setAddingSkillType(null); }}
        onSubmit={handleAddSkill}
        skillSearch={skillSearch}
        setSkillSearch={setSkillSearch}
      />

      <EditProfileModal
        initialData={editFormInitialData}
        isOpen={showEditModal}
        updating={updating}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateProfile}
      />
    </div>
  );
}
