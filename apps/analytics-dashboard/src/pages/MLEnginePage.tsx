import { useEffect, useState } from 'react';
import { AlertTriangle, Eye, X } from 'lucide-react';
import { apiClient } from '../api/api-client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend } from 'recharts';

export default function MLEnginePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await apiClient.getMLEngineKPIs();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos del ML Engine');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const rawModelVersions = data?.modelVersions || [];
  const sortedModelVersions = [...rawModelVersions].sort((a: any, b: any) => {
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    
    const dateA = new Date(a.trained_at || 0).getTime();
    const dateB = new Date(b.trained_at || 0).getTime();
    return dateB - dateA;
  });

  const totalPages = Math.ceil(sortedModelVersions.length / itemsPerPage);
  
  const currentModelVersions = sortedModelVersions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center text-red-700 dark:text-red-400">
          <AlertTriangle className="h-5 w-5 mr-3 shrink-0" />
          <p>Ocurrió un error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Versions Evolution */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:col-span-2">
          <h3 className="text-base font-semibold mb-6">Evolución de Modelos (F1, Precision, Recall)</h3>
          <div className="h-80">
            {isLoading ? (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.modelVersions || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="version_tag" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0.5, 1]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                  <Legend />
                  <Line type="monotone" dataKey="f1_score" name="F1 Score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="precision_val" name="Precision" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="recall_val" name="Recall" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Model Versions Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:col-span-2">
          <h3 className="text-base font-semibold mb-6">Historial de Versiones del Modelo</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Versión</th>
                  <th className="px-6 py-3 font-medium">Algoritmo</th>
                  <th className="px-6 py-3 font-medium">F1 Score</th>
                  <th className="px-6 py-3 font-medium">Precision</th>
                  <th className="px-6 py-3 font-medium">Recall</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Fecha de Entrenam.</th>
                  <th className="px-6 py-3 font-medium">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-slate-500">Cargando...</td>
                  </tr>
                ) : data?.modelVersions?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-slate-500">No hay datos disponibles</td>
                  </tr>
                ) : (
                  currentModelVersions.map((version: any, idx: number) => (
                    <tr 
                      key={version.id || idx} 
                      className="border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{version.version_tag}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{version.algorithm || '-'}</td>
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">{version.f1_score}</td>
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">{version.precision_val}</td>
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">{version.recall_val}</td>
                      <td className="px-6 py-4">
                        {version.active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {version.trained_at ? new Date(version.trained_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedVersion(version)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                          title="Ver detalles e hiperparámetros"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Mostrando del {(currentPage - 1) * itemsPerPage + 1} al {Math.min(currentPage * itemsPerPage, sortedModelVersions.length)} de {sortedModelVersions.length}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Inference Latency */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-base font-semibold mb-6">Latencia de Inferencias (ms)</h3>
          <div className="h-80">
            {isLoading ? (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.recommendationLogs || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="time" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="response_ms" name="Latencia (ms)" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorLat)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Similarity Score Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h3 className="text-base font-semibold mb-6">Distribución de Similitud (Matches)</h3>
          <div className="h-80">
            {isLoading ? (
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.matchesDistribution || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="range" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                  <Bar dataKey="count" name="Matches" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Model Details Modal */}
      {selectedVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full p-6 shadow-xl relative border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedVersion(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-1 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Detalles del Modelo</h3>
              {selectedVersion.active ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Inactivo
                </span>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Versión</div>
                  <div className="font-medium text-slate-700 dark:text-slate-200">{selectedVersion.version_tag}</div>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Algoritmo</div>
                  <div className="font-medium text-slate-700 dark:text-slate-200">{selectedVersion.algorithm || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">F1 Score</div>
                  <div className="font-medium text-slate-700 dark:text-slate-200">{selectedVersion.f1_score}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Precision</div>
                  <div className="font-medium text-slate-700 dark:text-slate-200">{selectedVersion.precision_val}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Recall</div>
                  <div className="font-medium text-slate-700 dark:text-slate-200">{selectedVersion.recall_val}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Fecha Entrenamiento</div>
                  <div className="font-medium text-slate-700 dark:text-slate-200">
                    {selectedVersion.trained_at ? new Date(selectedVersion.trained_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-100">Hiperparámetros</h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(
                      typeof selectedVersion.hyperparameters === 'string' 
                        ? JSON.parse(selectedVersion.hyperparameters) 
                        : selectedVersion.hyperparameters || {}
                    ).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">{key}</div>
                        <div className="text-sm font-medium font-mono text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-1 rounded block w-full border border-slate-200 dark:border-slate-700 break-all">
                          {JSON.stringify(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-slate-800 dark:text-slate-100">Leyenda de Hiperparámetros</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg">
                  <li><strong className="text-slate-700 dark:text-slate-200">smote:</strong> Balanceo de clases (Synthetic Minority Over-sampling)</li>
                  <li><strong className="text-slate-700 dark:text-slate-200">clusters:</strong> Número de agrupaciones (K-Means)</li>
                  <li><strong className="text-slate-700 dark:text-slate-200">scenario:</strong> Escenario de simulación de datos</li>
                  <li><strong className="text-slate-700 dark:text-slate-200">gpa_range:</strong> Rango de notas GPA generado</li>
                  <li><strong className="text-slate-700 dark:text-slate-200">n_samples:</strong> Cantidad de muestras simuladas</li>
                  <li><strong className="text-slate-700 dark:text-slate-200">n_estimators:</strong> Número de árboles (Random Forest)</li>
                  <li><strong className="text-slate-700 dark:text-slate-200">svd_components:</strong> Componentes SVD (Reducción de dimensión)</li>
                  <li><strong className="text-slate-700 dark:text-slate-200">skills_per_student:</strong> Rango de habilidades por estudiante</li>
                  <li><strong className="text-slate-700 dark:text-slate-200">max_depth:</strong> Profundidad máxima del árbol</li>
                  <li><strong className="text-slate-700 dark:text-slate-200">weighted:</strong> Pesos de clase balanceados</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
