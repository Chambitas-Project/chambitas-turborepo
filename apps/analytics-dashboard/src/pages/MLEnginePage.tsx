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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center text-red-700">
          <AlertTriangle className="h-5 w-5 mr-3 shrink-0" />
          <p>Ocurrió un error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Versions Evolution */}
        <div className="bg-white rounded-xl border border-[#e5e9e2] p-6 lg:col-span-2">
          <h3 className="text-base font-semibold mb-6 text-[#414941]">Evolución de Modelos (F1, Precision, Recall)</h3>
          <div className="h-80">
            {isLoading ? (
              <div className="w-full h-full bg-[#d3d8d0] rounded-xl animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.modelVersions || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e9e2" />
                  <XAxis dataKey="version_tag" tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0.8, 1]} tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ stroke: '#0f6c41', strokeWidth: 1 }}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e9e2', borderRadius: '8px', color: '#181d19', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                    itemStyle={{ color: '#181d19', fontSize: '13px', fontWeight: '500' }}
                    labelStyle={{ color: '#181d19', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ color: '#414941' }} />
                  <Line type="monotone" dataKey="f1_score" stroke="#0f6c41" strokeWidth={3} dot={{ r: 4, fill: '#0f6c41' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="precision_val" stroke="#2563eb" strokeWidth={2} dot={{ r: 4, fill: '#2563eb' }} />
                  <Line type="monotone" dataKey="recall_val" stroke="#d97706" strokeWidth={2} dot={{ r: 4, fill: '#d97706' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Model Versions Table */}
        <div className="bg-white rounded-xl border border-[#e5e9e2] p-6 lg:col-span-2">
          <h3 className="text-base font-semibold mb-6 text-[#414941]">Historial de Versiones del Modelo</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#414941] uppercase bg-[#ebf0e8]">
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
                      className="border-b border-[#e5e9e2] hover:bg-[#ebf0e8] transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{version.version_tag}</td>
                      <td className="px-6 py-4 text-[#414941]">{version.algorithm || '-'}</td>
                      <td className="px-6 py-4 font-mono text-[#414941]">{version.f1_score}</td>
                      <td className="px-6 py-4 font-mono text-[#414941]">{version.precision_val}</td>
                      <td className="px-6 py-4 font-mono text-[#414941]">{version.recall_val}</td>
                      <td className="px-6 py-4">
                        {version.active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#a0f5bd] text-[#002110]">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#d3d8d0] text-[#181d19]">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#414941]">
                        {version.trained_at ? new Date(version.trained_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedVersion(version)}
                          className="p-2 text-[#414941] hover:text-[#002110] hover:bg-[#a0f5bd] rounded-lg transition-colors cursor-pointer"
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e9e2]">
              <div className="text-sm text-[#414941]">
                Mostrando del {(currentPage - 1) * itemsPerPage + 1} al {Math.min(currentPage * itemsPerPage, sortedModelVersions.length)} de {sortedModelVersions.length}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium border border-[#e5e9e2] rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ebf0e8] text-[#181d19]"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium border border-[#e5e9e2] rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ebf0e8] text-[#181d19]"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Inference Latency */}
        <div className="bg-white rounded-xl border border-[#e5e9e2] p-6">
          <h3 className="text-base font-semibold mb-6 text-[#414941]">Latencia de Inferencias (ms)</h3>
          <div className="h-80">
            {isLoading ? (
              <div className="w-full h-full bg-[#d3d8d0] rounded-xl animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.recommendationLogs || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e9e2" />
                  <XAxis dataKey="time" tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(15, 108, 65, 0.08)' }}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e9e2', borderRadius: '8px', color: '#181d19', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                    itemStyle={{ color: '#181d19', fontSize: '13px', fontWeight: '500' }}
                    labelStyle={{ color: '#181d19', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="response_ms" name="Latencia (ms)" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorLat)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Similarity Score Distribution */}
        <div className="bg-white rounded-xl border border-[#e5e9e2] p-6">
          <h3 className="text-base font-semibold mb-6 text-[#414941]">Distribución de Similitud (Matches)</h3>
          <div className="h-80">
            {isLoading ? (
              <div className="w-full h-full bg-[#d3d8d0] rounded-xl animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.matchesDistribution || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e9e2" />
                  <XAxis dataKey="range" tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#414941' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(15, 108, 65, 0.08)' }}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e9e2', borderRadius: '8px', color: '#181d19', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                    itemStyle={{ color: '#181d19', fontSize: '13px', fontWeight: '500' }}
                    labelStyle={{ color: '#181d19', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" fill="#0f6c41" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Model Details Modal */}
      {selectedVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl relative border border-[#e5e9e2] max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedVersion(null)}
              className="absolute top-4 right-4 text-[#414941] hover:text-[#181d19] bg-[#ebf0e8] hover:bg-[#d3d8d0] rounded-full p-1 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-lg font-bold text-[#181d19]">Detalles del Modelo</h3>
              {selectedVersion.active ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#a0f5bd] text-[#002110] border border-[#a0f5bd]">
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#d3d8d0] text-[#181d19] border border-[#c3c8c0]">
                  Inactivo
                </span>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#f1f5ee] p-4 rounded-xl border border-[#e5e9e2]">
                <div>
                  <div className="text-xs text-[#414941] uppercase mb-1">Versión</div>
                  <div className="font-medium text-[#181d19]">{selectedVersion.version_tag}</div>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <div className="text-xs text-[#414941] uppercase mb-1">Algoritmo</div>
                  <div className="font-medium text-[#181d19]">{selectedVersion.algorithm || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-[#414941] uppercase mb-1">F1 Score</div>
                  <div className="font-medium text-[#181d19]">{selectedVersion.f1_score}</div>
                </div>
                <div>
                  <div className="text-xs text-[#414941] uppercase mb-1">Precision</div>
                  <div className="font-medium text-[#181d19]">{selectedVersion.precision_val}</div>
                </div>
                <div>
                  <div className="text-xs text-[#414941] uppercase mb-1">Recall</div>
                  <div className="font-medium text-[#181d19]">{selectedVersion.recall_val}</div>
                </div>
                <div>
                  <div className="text-xs text-[#414941] uppercase mb-1">Fecha Entrenamiento</div>
                  <div className="font-medium text-[#181d19]">
                    {selectedVersion.trained_at ? new Date(selectedVersion.trained_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-[#181d19]">Hiperparámetros</h4>
                <div className="bg-[#f1f5ee] rounded-lg p-4 border border-[#e5e9e2]">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(
                      typeof selectedVersion.hyperparameters === 'string' 
                        ? JSON.parse(selectedVersion.hyperparameters) 
                        : selectedVersion.hyperparameters || {}
                    ).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-xs text-[#414941] uppercase mb-1">{key}</div>
                        <div className="text-sm font-medium font-mono text-[#181d19] bg-white px-2 py-1 rounded block w-full border border-[#e5e9e2] break-all">
                          {JSON.stringify(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-[#181d19]">Leyenda de Hiperparámetros</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-xs text-[#414941] list-disc list-inside bg-[#f1f5ee] p-4 rounded-xl border border-[#e5e9e2]">
                  <li><strong className="text-[#181d19]">smote:</strong> Balanceo de clases (Synthetic Minority Over-sampling)</li>
                  <li><strong className="text-[#181d19]">clusters:</strong> Número de agrupaciones (K-Means)</li>
                  <li><strong className="text-[#181d19]">scenario:</strong> Escenario de simulación de datos</li>
                  <li><strong className="text-[#181d19]">gpa_range:</strong> Rango de notas GPA generado</li>
                  <li><strong className="text-[#181d19]">n_samples:</strong> Cantidad de muestras simuladas</li>
                  <li><strong className="text-[#181d19]">n_estimators:</strong> Número de árboles (Random Forest)</li>
                  <li><strong className="text-[#181d19]">svd_components:</strong> Componentes SVD (Reducción de dimensión)</li>
                  <li><strong className="text-[#181d19]">skills_per_student:</strong> Rango de habilidades por estudiante</li>
                  <li><strong className="text-[#181d19]">max_depth:</strong> Profundidad máxima del árbol</li>
                  <li><strong className="text-[#181d19]">weighted:</strong> Pesos de clase balanceados</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
