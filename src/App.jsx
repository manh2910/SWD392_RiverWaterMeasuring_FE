import { Routes, Route, Navigate } from "react-router-dom";
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
import Auth from "./pages/User/Auth/Auth";
import AlertSettings from "./pages/User/AlertSettings/AlertSettings";
import History from "./pages/User/History/History";
import Profile from "./pages/User/Profile/Profile";
import Register from "./pages/User/Register/Register";

function App() {
  return (
    <Routes>
      {/* USER PAGES */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Register />} />
      <Route path="/analytics" element={<WaterAnalytics />} />
      <Route path="/map" element={<RiverMap />} />
      <Route path="/quality" element={<WaterQualityMetrics />} />
      <Route path="/settings" element={<AlertSettings />} />
      <Route path="/history" element={<History />} />
      <Route path="/profile" element={<Profile />} />




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

      {/* 404 */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;
