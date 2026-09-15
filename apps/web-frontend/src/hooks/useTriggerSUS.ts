import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/api-client';

export function calculateSUSScore(responses: number[]): number {
  if (responses.length !== 10) return 0;
  
  let scoreSum = 0;
  for (let i = 0; i < 10; i++) {
    const itemNumber = i + 1;
    const responseValue = responses[i];
    
    if (itemNumber % 2 !== 0) {
      // Preguntas impares (1, 3, 5, 7, 9): (Respuesta - 1)
      scoreSum += (responseValue - 1);
    } else {
      // Preguntas pares (2, 4, 6, 8, 10): (5 - Respuesta)
      scoreSum += (5 - responseValue);
    }
  }

  // Multiplicar suma total por 2.5 para obtener rango de 0 a 100
  return Number((scoreSum * 2.5).toFixed(1));
}

export function useTriggerSUS() {
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [shouldShowModal, setShouldShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Comprobar en el backend/Supabase si el usuario ya respondió previamente
  const checkSUSAvaliationStatus = useCallback(async () => {
    try {
      const res = await apiClient.get('/profile/me');
      const user = res.data;
      if (!user || !user.id) return;

      // Consultar endpoint de verificación o comprobar si existe evaluación previa
      const evalRes = await apiClient.get(`/analytics/sus-status/${user.id}`).catch(() => null);
      if (evalRes && evalRes.data?.hasEvaluated) {
        setHasEvaluated(true);
        setShouldShowModal(false);
      } else {
        setHasEvaluated(false);
      }
    } catch (err) {
      console.error('Error al verificar estado de evaluación SUS:', err);
    }
  }, []);

  useEffect(() => {
    checkSUSAvaliationStatus();
  }, [checkSUSAvaliationStatus]);

  // 2. Método para activar la evaluación si el usuario aún no ha respondido
  const triggerSUSCheck = useCallback(() => {
    if (!hasEvaluated) {
      setShouldShowModal(true);
    }
  }, [hasEvaluated]);

  // 3. Enviar respuestas del cuestionario SUS
  const submitSUS = async (responses: number[]) => {
    if (responses.length !== 10) {
      throw new Error('Debe responder las 10 preguntas obligatorias.');
    }

    setIsSubmitting(true);
    try {
      const calculatedScore = calculateSUSScore(responses);
      const userJson = localStorage.getItem('chambitas_user');
      let userId = '';
      let userRole = 'student';
      let testGroup = 'EXPERIMENTAL';

      if (userJson) {
        try {
          const u = JSON.parse(userJson);
          userId = u.id || '';
          userRole = u.role || 'student';
          testGroup = u.test_group || 'EXPERIMENTAL';
        } catch (e) {}
      }

      // Guardar evaluación en Supabase
      await apiClient.post('/analytics/sus-evaluations', {
        responses,
        calculated_score: calculatedScore,
        user_role: userRole,
        test_group: testGroup
      });

      // Transmitir evento de telemetría UX con el CSAT/SUS equivalente
      await apiClient.post('/analytics/track', {
        eventType: 'UX_TELEMETRY',
        source: 'sus-survey-modal',
        userId,
        payload: {
          event_type: 'step_completed',
          flow_name: 'sus_survey',
          step_name: 'survey_submitted',
          test_group: testGroup,
          user_id: userId,
          satisfaction_score_csat: Number((calculatedScore / 20).toFixed(1)), // Escala 1 a 5
          time_on_step_ms: 12000
        }
      });

      setHasEvaluated(true);
      setShouldShowModal(false);
      return calculatedScore;
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setShouldShowModal(false);

  return {
    hasEvaluated,
    shouldShowModal,
    isSubmitting,
    triggerSUSCheck,
    submitSUS,
    closeModal
  };
}
