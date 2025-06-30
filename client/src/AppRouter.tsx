import React from "react";
import ReactDOM from "react-dom/client";
import {  Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TemplateEditor from "./pages/TemplateEditor";
import SurveyTaker from "./pages/SurveyTaker";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<TemplateEditor />} /> 
            <Route path="/survey/:templateId?" element={<SurveyTaker />} />
        </Routes>
    )
}