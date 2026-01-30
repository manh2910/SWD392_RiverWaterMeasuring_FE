import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Rivers from "./pages/Rivers/Rivers";
import Stations from "./pages/Stations/Stations";
import Hubs from "./pages/Hubs/Hubs";
import Sensors from "./pages/Sensors/Sensors";
import Parameters from "./pages/Parameters/Parameters";
import Observations from "./pages/Observations/Observations";
import DataPackages from "./pages/DataPackages/DataPackages";


function App() {
  return (
    <Routes>
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
