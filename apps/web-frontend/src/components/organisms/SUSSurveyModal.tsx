import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '@chambitas/ui';

interface SUSSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (responses: number[]) => Promise<number>;
  isSubmitting?: boolean;
}

const SUS_QUESTIONS = [
  '1. Creo que me gustaría usar esta página web con frecuencia.',
  '2. Encontré la página web innecesariamente compleja.',
  '3. Pensé que la página web era fácil de usar.',
  '4. Creo que necesitaría el apoyo de un técnico para poder usar esta página web.',
  '5. Encontré que las diversas funciones de la página web estaban bien integradas.',
  '6. Pensé que había demasiada inconsistencia en esta página web.',
  '7. Imagino que la mayoría de las personas aprenderían a usar esta página web muy rápidamente.',
  '8. Encontré la página web muy incómoda de usar.',
  '9. Me sentí muy seguro(a) usando la página web.',
  '10. Necesité aprender muchas cosas antes de poder empezar a usar esta página web.'
];

export const SUSSurveyModal: React.FC<SUSSurveyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false
}) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOptionChange = (questionIdx: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionIdx]: value }));
    if (error) setError(null);
  };

  const isFormComplete = Object.keys(answers).length === 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) {
      setError('Por favor responda las 10 preguntas obligatorias para enviar la evaluación.');
      return;
    }

    try {
      const responsesArray = Array.from({ length: 10 }, (_, i) => answers[i]);
      await onSubmit(responsesArray);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la encuesta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="bg-white text-slate-900 p-6 sm:p-8 flex items-start justify-between shrink-0 border-b border-slate-100">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              Encuesta de Experiencia
            </h2>
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Ayúdanos a evaluar la plataforma respondiendo este breve cuestionario de 10 preguntas.
              </p>
              <div className="text-[10px] sm:text-xs text-black font-bold flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-6 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                <span>1: Totalmente en desacuerdo</span>
                <span>2: En desacuerdo</span>
                <span>3: Neutral</span>
                <span>4: De acuerdo</span>
                <span>5: Totalmente de acuerdo</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-xl hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content & Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-8">
            {SUS_QUESTIONS.map((question, qIdx) => (
              <div key={qIdx} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 space-y-4">
                <p className="text-sm font-bold text-slate-900">{question}</p>

                <div className="grid grid-cols-5 gap-2 sm:gap-4">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const isSelected = answers[qIdx] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleOptionChange(qIdx, val)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1 ${isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                      >
                        <span className="text-base font-black">{val}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer & Submit */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Sus respuestas son anónimas y se registrarán solo 1 vez para el estudio.</span>
            </div>

            <Button
              type="submit"
              disabled={!isFormComplete || isSubmitting}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-md font-bold text-sm transition-all ${isFormComplete && !isSubmitting
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Enviar Encuesta
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
