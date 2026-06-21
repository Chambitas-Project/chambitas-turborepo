import { useEffect, useRef, useCallback } from 'react';
import { trackEvent } from '../api/api-client';

export function useUxTelemetry(flowName: string, stepName: string) {
  const startTime = useRef<number>(Date.now());
  const hasCompleted = useRef<boolean>(false);

  // Exponer un método para marcar éxito/completado (y enviar evento de éxito)
  const completeStep = useCallback(() => {
    if (hasCompleted.current) return;
    
    hasCompleted.current = true;
    const timeSpent = Date.now() - startTime.current;
    
    trackEvent('UX_TELEMETRY', {
      event_type: 'step_completed',
      flow_name: flowName,
      step_name: stepName,
      abandonment_rate: 0,
      time_on_step_ms: timeSpent,
      session_id: localStorage.getItem('session_id') || 'session-' + Math.floor(Math.random()*10000)
    });
  }, [flowName, stepName]);

  useEffect(() => {
    // Al desmontar (salir del componente), si no se completó, lo contamos como abandono
    return () => {
      if (!hasCompleted.current) {
        const timeSpent = Date.now() - startTime.current;
        trackEvent('UX_TELEMETRY', {
          event_type: 'step_abandoned',
          flow_name: flowName,
          step_name: stepName,
          abandonment_rate: 100, // Marcador de abandono
          time_on_step_ms: timeSpent,
          session_id: localStorage.getItem('session_id') || 'session-' + Math.floor(Math.random()*10000)
        });
      }
    };
  }, [flowName, stepName]);

  return { completeStep };
}
