
import {  Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TemplateEditor from "./pages/TemplateEditor";
import SurveyTaker from "./pages/SurveyTaker";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { RequireAuth } from "./context/RequireAuth";
import { AuthProvider } from "./context/AuthContext";

export default function AppRouter() {
    return (
        <AuthProvider>

        <Routes>
            <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/create" element={<RequireAuth><TemplateEditor /></RequireAuth>} /> 
            <Route path="/survey/:templateId?" element={<RequireAuth><SurveyTaker /></RequireAuth>} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
        </Routes>
        </AuthProvider>

    )
}