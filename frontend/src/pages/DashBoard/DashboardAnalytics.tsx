import { Users, LayoutTemplate, Activity, Building2 } from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import './DashboardAnalytics.css';

// --- DATOS SIMULADOS BASADOS EN TU BD ---
const kpiData = {
  totalPacientes: 142,
  nodosCreados: 3850,
  centrosActivos: 4,
  sesionesHoy: 28
};

// Datos para gráfico de barras: Pacientes por rango de edad
const pacientesPorEdad = [
  { rango: '0-10 años', cantidad: 45 },
  { rango: '11-20 años', cantidad: 30 },
  { rango: '21-40 años', cantidad: 25 },
  { rango: '41-60 años', cantidad: 22 },
  { rango: '+60 años', cantidad: 20 },
];

// Datos para gráfico circular: Tipos de Nodos (basado en tu es_final=True/False)
const tiposNodos = [
  { nombre: 'Nodos de Navegación (Carpetas)', valor: 1250 },
  { nombre: 'Nodos Finales (Mensajes)', valor: 2600 },
];
const COLORS = ['#6366f1', '#10b981']; // Indigo para navegación, Esmeralda para finales

const ultimosPacientes = [
  { id: 1042, nombre: "Lucía Fernández", edad: 8, centro: "Sede Norte", fecha: "Hoy" },
  { id: 1041, nombre: "Marcos Ruiz", edad: 45, centro: "Sede Central", fecha: "Ayer" },
  { id: 1040, nombre: "Elena Gómez", edad: 72, centro: "Sede Sur", fecha: "Ayer" },
];

export default function DashboardAnalytics() {
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Resumen del Centro</h1>
        <p className="dashboard-subtitle">Vista general de pacientes, comunicadores y actividad.</p>
      </header>

      {/* TARJETAS DE MÉTRICAS (KPIs) */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-content">
            <h4>Pacientes Totales</h4>
            <span className="kpi-value">{kpiData.totalPacientes}</span>
          </div>
          <div className="kpi-icon icon-blue"><Users size={24} /></div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-content">
            <h4>Nodos (Pictogramas)</h4>
            <span className="kpi-value">{kpiData.nodosCreados}</span>
          </div>
          <div className="kpi-icon icon-purple"><LayoutTemplate size={24} /></div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <h4>Centros Conectados</h4>
            <span className="kpi-value">{kpiData.centrosActivos}</span>
          </div>
          <div className="kpi-icon icon-orange"><Building2 size={24} /></div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <h4>Sesiones Activas</h4>
            <span className="kpi-value">{kpiData.sesionesHoy}</span>
          </div>
          <div className="kpi-icon icon-emerald"><Activity size={24} /></div>
        </div>
      </div>

      {/* ZONA DE GRÁFICOS */}
      <div className="charts-grid">
        {/* Gráfico de Barras */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Distribución de Pacientes por Edad</h2>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pacientesPorEdad} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="rango" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Circular (Donut) */}
        <div className="chart-card">
          <div className="chart-header">
            <h2 className="chart-title">Estructura de los Comunicadores (Nodos)</h2>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tiposNodos}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="valor"
                >
                  {tiposNodos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ACTIVIDAD RECIENTE (Mini-lista) */}
      <div className="recent-section">
        <h2 className="chart-title">Pacientes Ingresados Recientemente</h2>
        <div className="recent-list">
          {ultimosPacientes.map((paciente) => (
            <div key={paciente.id} className="recent-item">
              <div>
                <p className="text-sm font-semibold text-slate-800">{paciente.nombre}</p>
                <p className="text-xs text-slate-500">Edad: {paciente.edad} años • {paciente.centro}</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {paciente.fecha}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}