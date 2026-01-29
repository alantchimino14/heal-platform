import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { PortalLayout } from './components/layout/PortalLayout';
import { Dashboard } from './pages/Dashboard';
import { Pacientes } from './pages/Pacientes';
import { NuevoPaciente } from './pages/NuevoPaciente';
import { PacienteDetalle } from './pages/PacienteDetalle';
import { Sesiones } from './pages/Sesiones';
import { NuevaSesion } from './pages/NuevaSesion';
import { Pagos } from './pages/Pagos';
import { NuevoPago } from './pages/NuevoPago';
import { Productos } from './pages/Productos';
import { Ventas } from './pages/Ventas';
import { NuevaVenta } from './pages/NuevaVenta';
import { Profesionales } from './pages/Profesionales';
import { ProfesionalDetalle } from './pages/ProfesionalDetalle';
import { Ayuda } from './pages/Ayuda';
import {
  PortalHome,
  PortalAgenda,
  PortalMetricas,
  PortalLiquidaciones,
} from './pages/portal';

export default function App() {
  return (
    <Routes>
      {/* Admin Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="pacientes/nuevo" element={<NuevoPaciente />} />
        <Route path="pacientes/:id" element={<PacienteDetalle />} />
        <Route path="sesiones" element={<Sesiones />} />
        <Route path="sesiones/nueva" element={<NuevaSesion />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="pagos/nuevo" element={<NuevoPago />} />
        <Route path="productos" element={<Productos />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="ventas/nueva" element={<NuevaVenta />} />
        <Route path="profesionales" element={<Profesionales />} />
        <Route path="profesionales/:id" element={<ProfesionalDetalle />} />
        <Route path="ayuda" element={<Ayuda />} />
      </Route>

      {/* Portal del Profesional (Mobile-First) */}
      <Route path="/portal/:profesionalId" element={<PortalLayout />}>
        <Route index element={<PortalHome />} />
        <Route path="agenda" element={<PortalAgenda />} />
        <Route path="metricas" element={<PortalMetricas />} />
        <Route path="liquidaciones" element={<PortalLiquidaciones />} />
      </Route>
    </Routes>
  );
}
