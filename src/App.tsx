import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import Dashboard from '@/pages/Dashboard/Dashboard';
import MapPage from '@/pages/Map/MapPage';
import Tasks from '@/pages/Tasks/Tasks';
import InspectionForm from '@/pages/Inspection/InspectionForm';
import Hazards from '@/pages/Hazards/Hazards';
import WorkOrders from '@/pages/WorkOrders/WorkOrders';
import Reports from '@/pages/Reports/Reports';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/inspection/:id" element={<InspectionForm />} />
          <Route path="/inspection/new" element={<InspectionForm />} />
          <Route path="/hazards" element={<Hazards />} />
          <Route path="/workorders" element={<WorkOrders />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}
