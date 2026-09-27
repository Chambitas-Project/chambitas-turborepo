import { useEffect, useRef, useCallback } from 'react';
import { trackEvent } from '../api/api-client';

const getSessionId = () => {
  let sId = localStorage.getItem('session_id');
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!sId || !uuidRegex.test(sId)) {
    sId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-0000-0000-000000000001';
    localStorage.setItem('session_id', sId);
  }
  return sId;
};

export function useUxTelemetry(flowName: string, stepName: string) {
  const startTime = useRef<number>(Date.now());
  const hasCompleted = useRef<boolean>(false);

  // Exponer un método para marcar éxito/completado (y enviar evento de éxito)
  const completeStep = useCallback(() => {
    if (hasCompleted.current) return;
    
    hasCompleted.current = true;
    const timeSpent = Date.now() - startTime.current;
    
    const userJson = localStorage.getItem('chambitas_user');
    let testGroup = null;
    let userId = null;
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        testGroup = u.test_group || null;
        userId = u.id || null;
      } catch (e) {}
    }

    trackEvent('UX_TELEMETRY', {
      event_type: 'step_completed',
      flow_name: flowName,
      step_name: stepName,
      test_group: testGroup,
      user_id: userId,
      abandonment_rate: 0,
      time_on_step_ms: timeSpent,
      session_id: getSessionId()
    });
  }, [flowName, stepName]);

  useEffect(() => {
    // Al desmontar (salir del componente), si no se completó, lo contamos como abandono
    return () => {
      if (!hasCompleted.current) {
        const timeSpent = Date.now() - startTime.current;
        const userJson = localStorage.getItem('chambitas_user');
        let testGroup = null;
        let userId = null;
        if (userJson) {
          try {
            const u = JSON.parse(userJson);
            testGroup = u.test_group || null;
            userId = u.id || null;
          } catch (e) {}
        }

        trackEvent('UX_TELEMETRY', {
          event_type: 'step_abandoned',
          flow_name: flowName,
          step_name: stepName,
          test_group: testGroup,
          user_id: userId,
          abandonment_rate: 100, // Marcador de abandono
          time_on_step_ms: timeSpent,
          session_id: getSessionId()
        });
      }
    };
  }, [flowName, stepName]);

  return { completeStep };
}
