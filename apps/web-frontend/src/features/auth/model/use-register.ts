import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authApi } from "../api/auth.api";
import type { University } from "../api/auth.api";
import { useAuth } from "../../../context/AuthContext";

const registerSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
  universityId: z.string().optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  terms: z.boolean().refine(val => val === true, "Debes aceptar los términos y condiciones"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function useRegister(role: string, onSuccess?: () => void) {
  const { register: registerWithApi, login } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
      universityId: "",
    }
  });

  const emailValue = form.watch("email");

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const unis = await authApi.getUniversities();
        setUniversities(unis);
      } catch (error) {
        console.error("Error al cargar universidades:", error);
      } finally {
        setLoadingUnis(false);
      }
    };
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (role === "student" && emailValue && emailValue.includes("@")) {
      const domain = emailValue.split("@")[1]?.toLowerCase();
      if (domain) {
        const matchedUni = universities.find(u => u.email_domain.toLowerCase() === domain);
        if (matchedUni) {
          form.setValue("universityId", matchedUni.id);
        }
      }
    }
  }, [emailValue, universities, role, form]);

  const onSubmit = async (data: RegisterFormValues) => {
    if (role === "student" && (!data.universityId || data.universityId === "")) {
      form.setError("universityId", { message: "Debes seleccionar una universidad" });
      return;
    }

    setRegError(null);
    try {
      await registerWithApi({
        email: data.email,
        password: data.password,
        role: role,
        university_id: role === "student" ? data.universityId : null
      });
      
      try {
        await login({ email: data.email, password: data.password });
        if (onSuccess) onSuccess();
      } catch (loginError) {
        console.error("Auto-login falló tras registro:", loginError);
        setIsSuccess(true);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al crear la cuenta. Verifica los datos.";
      setRegError(message);
    }
  };

  return {
    form,
    universities,
    loadingUnis,
    regError,
    isSuccess,
    onSubmit: form.handleSubmit(onSubmit)
  };
}
