import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Rivers from "./pages/Admin/Rivers/Rivers";
import Stations from "./pages/Admin/Stations/Stations";
import Hubs from "./pages/Admin/Hubs/Hubs";
import Sensors from "./pages/Admin/Sensors/Sensors";
import Parameters from "./pages/Admin/Parameters/Parameters";
import Observations from "./pages/Admin/Observations/Observations";
import DataPackages from "./pages/Admin/DataPackages/DataPackages";
import HomePage from "./pages/User/HomePage/HomePage";
import WaterAnalytics from "./pages/User/WaterAnalytics/WaterAnalytics";
import RiverMap from "./pages/User/RiverMap/RiverMap";
import WaterQualityMetrics from "./pages/User/WaterQualityMetrics/WaterQualityMetrics";

function App() {
  return (
    <Routes>
      {/* ADMIN */}

      <Route path="/" element={<HomePage />} />
      <Route path="/analytics" element={<WaterAnalytics />} />
      <Route path="/map" element={<RiverMap />} />
      <Route path="/quality" element={<WaterQualityMetrics />} />




      {/* ADMIN */}

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="rivers" element={<Rivers />} />
        <Route path="stations" element={<Stations />} />
        <Route path="hubs" element={<Hubs />} />
        <Route path="sensors" element={<Sensors />} />
        <Route path="parameters" element={<Parameters />} />
        <Route path="observations" element={<Observations />} />
        <Route path="data-packages" element={<DataPackages />} />
      </Route>
    </Routes>
  );
}

export default App;
