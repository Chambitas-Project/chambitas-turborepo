import { Link } from "react-router-dom";
import { ArrowLeft, Briefcase } from "lucide-react";
import { Button } from "@chambitas/ui";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#065f46] flex items-center justify-center">
            <Briefcase className="size-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-emerald-700">Chambi</span>tas
          </span>
        </Link>
        <Button variant="ghost" className="text-sm font-bold text-slate-500 hover:text-slate-900" asChild>
          <Link to="/register"><ArrowLeft className="h-4 w-4 mr-2" /> Volver</Link>
        </Button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20 space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            TÉRMINOS Y CONDICIONES DE USO DE LA PLATAFORMA "CHAMBITAS"
          </h1>
          <p className="text-lg font-medium text-slate-500">
            Última actualización: 1 de julio de 2026
          </p>
        </div>

        <div className="prose prose-slate prose-lg max-w-none space-y-8">
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              Bienvenido a Chambitas (en adelante, la "Plataforma"). Los presentes Términos y Condiciones de Uso (en adelante, los "Términos") constituyen un acuerdo legalmente vinculante entre el usuario (en adelante, el "Usuario", "Estudiante" o "Cliente/Ofertante", según corresponda) y la administración del proyecto académico/tecnológico Chambitas (en adelante, "Nosotros" o "La Administración").
            </p>
            <p>
              Al acceder, registrarse o utilizar la Plataforma, el Usuario manifiesta su consentimiento expreso, libre e informado de cumplir y estar sujeto a las siguientes cláusulas. Si no está de acuerdo con estos Términos, deberá abstenerse de utilizar los servicios de la Plataforma.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">1. NATURALEZA DE LA PLATAFORMA Y ALCANCE ACADÉMICO</h2>
            <p className="text-slate-600 leading-relaxed">
              Chambitas es una plataforma web basada en una arquitectura de microservicios y un motor híbrido de Machine Learning cuyo propósito principal es optimizar el emparejamiento (matching) entre estudiantes de pregrado de la Universidad Peruana de Ciencias Aplicadas (UPC) y requerimientos de proyectos independientes (freelance o micro-jobs).
            </p>
            <div className="bg-slate-50 p-4 border-l-4 border-slate-400 text-sm text-slate-700">
              <strong>Nota Importante:</strong> El Usuario reconoce que, en su fase actual, la Plataforma opera bajo un piloto controlado de investigación académica e innovación tecnológica. Aunque se implementan rigurosos estándares de seguridad y pasarelas de pago integradas, La Administración actúa exclusivamente como un facilitador técnico e inteligente de intermediación y no forma parte de ninguna relación laboral ni contractual que se derive entre los Estudiantes y los Ofertantes.
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">2. REQUISITOS DE ACCESO Y ELEGIBILIDAD</h2>
            <p className="text-slate-600 leading-relaxed">Para registrarse como Estudiante en la Plataforma, el Usuario debe cumplir obligatoriamente con las siguientes condiciones:</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>Ser estudiante regular de pregrado activo en la Universidad Peruana de Ciencias Aplicadas (UPC).</li>
              <li>Validar su identidad mediante el flujo de autenticación institucional (correo electrónico con dominio @upc.edu.pe).</li>
              <li>Ser mayor de edad (18 años cumplidos al momento del registro) según las leyes de la República del Perú.</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Para registrarse como Ofertante / Cliente, el Usuario debe ser una persona natural con negocio o persona jurídica debidamente constituida en el Perú, con RUC activo y habido ante la SUNAT.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">3. EL MOTOR DE MATCHING Y LA DISPONIBILIDAD HORARIA</h2>
            <p className="text-slate-600 leading-relaxed">La Plataforma utiliza un modelo híbrido de Inteligencia Artificial (procesamiento de texto con TF-IDF y emparejamiento dinámico con índices vectoriales) que automatiza y prioriza las ofertas de trabajo basándose en:</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>Las competencias técnicas declaradas y aprobadas por el Estudiante.</li>
              <li>La disponibilidad horaria declarada: El Estudiante se compromete a actualizar de forma fidedigna sus horarios libres (recomendando un rango de 15 a 25 horas semanales) para que el algoritmo no interfiera con su carga académica lectiva.</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              La Administración no garantiza que el uso del algoritmo resulte en una colocación efectiva del 100% de los casos, operando bajo un estándar de optimización de precisión predictiva (meta de F1-Score {'>'} 0.85).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">4. RESTRICCIONES LEGALES ESPECÍFICAS (CARRERAS REGULADAS)</h2>
            <p className="text-slate-600 leading-relaxed">
              En estricto cumplimiento del Artículo 363 del Código Penal Peruano (Ejercicio Ilegal de la Profesión), la Plataforma restringe rigurosamente los tipos de proyectos freelance disponibles:
            </p>
            <div className="bg-red-50 p-4 border-l-4 border-red-500 text-sm text-slate-700">
              <strong className="text-red-700">Prohibición Estricta:</strong> Queda terminantemente prohibida la publicación y postulación de micro-jobs vinculados a carreras reguladas que exijan por ley título profesional y colegiatura obligatoria para su ejecución (tales como Ciencias de la Salud, Derecho, Ingeniería Civil, entre otras).
            </div>
            <p className="text-slate-600 leading-relaxed">
              El algoritmo cuenta con filtros automatizados que darán de baja inmediatamente cualquier oferta que vulnere esta disposición, procediendo al bloqueo permanente de la cuenta del Ofertante.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">5. PROTECCIÓN DE DATOS PERSONALES Y SEGURIDAD (LEY N° 29733)</h2>
            <p className="text-slate-600 leading-relaxed">De conformidad con la Ley N° 29733 (Ley de Protección de Datos Personales de Perú) y su Reglamento, el tratamiento de los datos personales en Chambitas se rige bajo las siguientes políticas técnicas:</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li><strong>Recopilación:</strong> Al registrarse, el Estudiante autoriza el tratamiento de datos académicos (carrera, ciclo, historial de habilidades) y datos de contacto.</li>
              <li><strong>Seguridad de la Arquitectura:</strong> Los datos recopilados se almacenan utilizando mecanismos de seguridad avanzados, incluyendo Row Level Security (RLS) a nivel de base de datos en Supabase, cifrado de credenciales mediante hashes criptográficos, y contratos estrictos de comunicación entre microservicios vía gRPC (Protocol Buffers).</li>
              <li><strong>Derechos ARCO:</strong> El Usuario podrá ejercer en cualquier momento sus derechos de Acceso, Rectificación, Cancelación y Oposición remitiendo una solicitud a los canales de atención del proyecto.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">6. PROPIEDAD INTELECTUAL</h2>
            <p className="text-slate-600 leading-relaxed">
              El diseño de la interfaz, el código fuente de los microservicios (desarrollados en NestJS, Python y React), el modelo matemático/algorítmico de Machine Learning, los logotipos y las marcas asociadas a Chambitas son propiedad exclusiva de los autores del proyecto de investigación. Queda prohibida la reproducción, ingeniería inversa, descompilación o distribución no autorizada de cualquier componente de la Plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">7. LIMITACIÓN DE RESPONSABILIDAD</h2>
            <p className="text-slate-600 leading-relaxed">La Administración no será responsable por:</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>Malos entendidos, incumplimientos, retrasos o deficiencias en la calidad de los entregables desarrollados por los Estudiantes.</li>
              <li>Falta de pago o retrasos por parte de los Ofertantes (sin perjuicio de las retenciones que la pasarela de pago aliada pueda ejecutar bajo la modalidad de fondos en garantía o escrow).</li>
              <li>Interrupciones temporales del servicio derivadas de ventanas de mantenimiento de los microservicios o caídas en la infraestructura en la nube de terceros.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">8. MODIFICACIONES Y LEGISLACIÓN APLICABLE</h2>
            <p className="text-slate-600 leading-relaxed">
              La Administración se reserva el derecho de modificar los presentes Términos en cualquier momento para adaptarlos a mejoras técnicas del modelo de IA o cambios en la regulación peruana. Las modificaciones serán notificadas a través de la interfaz web de la Plataforma.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Estos Términos se rigen e interpretan de acuerdo con las leyes vigentes de la República del Perú. Cualquier controversia derivada del uso de la plataforma será sometida a la jurisdicción de los jueces y tribunales del Distrito Judicial de Lima Cercado.
            </p>
            <div className="bg-slate-100 p-4 rounded-md text-slate-700 italic text-center mt-6">
              Al marcar la casilla "Acepto los Términos y Condiciones", el Usuario declara haber leído de manera integral este documento y manifiesta su total conformidad con sus estipulaciones.
            </div>
          </section>
        </div>

        <div className="pt-8 border-t border-slate-100 flex justify-center">
          <Button onClick={() => window.close()} className="bg-[#065f46] hover:bg-[#064e3b] text-white font-bold h-12 px-8 rounded-md cursor-pointer shadow-none">
            Entendido
          </Button>
        </div>
      </main>
    </div>
  );
}
