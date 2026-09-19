import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Medications from "./pages/Medications";
import AIChat from "./pages/AIChat";
import Timeline from "./pages/Timeline";
import FamilyCare from "./pages/FamilyCare";
import Emergency from "./pages/Emergency";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/chat" element={<AIChat />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/family" element={<FamilyCare />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
