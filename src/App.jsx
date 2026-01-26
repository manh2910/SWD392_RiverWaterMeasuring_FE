import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Rivers from "./pages/Rivers/Rivers";
import Stations from "./pages/Stations/Stations";


function App() {
  return (
    <Routes>
      {/* ADMIN */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="rivers" element={<Rivers />} />
        <Route path="stations" element={<Stations />} />
       
      </Route>
    </Routes>
  );
}

export default App;
