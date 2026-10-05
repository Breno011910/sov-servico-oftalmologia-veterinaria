import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/login/login";
import Cadastro from "./components/cadastro/cadastro";
import Dashboard from "./components/dashboard/dashboard";
import Paciente from "./components/paciente/paciente";
import ListaPaciente from "./components/paciente/listapaciente";
import Layout from "./components/layout/layout";
import DetalhePaciente from "./components/paciente/detalhepaciente";
import Consulta from "./components/consulta/consulta";
import ListaConsulta from "./components/consulta/listaconsulta";
import DetalheConsulta from "./components/consulta/detalheconsulta";

function RotaProtegida({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return null;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/cadastro" element={<Cadastro />} />

        <Route path="/dashboard" element={<RotaProtegida><Layout><Dashboard /></Layout></RotaProtegida>} />

        <Route path="/paciente" element={<RotaProtegida><Layout><Paciente /></Layout></RotaProtegida>} />

        <Route path="/listapaciente" element={<RotaProtegida><Layout><ListaPaciente /></Layout></RotaProtegida>} />

        <Route path="/paciente/:id" element={<RotaProtegida><Layout><DetalhePaciente /></Layout></RotaProtegida>} />

        <Route path="/consulta/:pacienteId" element={<RotaProtegida><Layout><Consulta /></Layout></RotaProtegida>} />

        <Route path="/consultas" element={<RotaProtegida><Layout><ListaConsulta /></Layout></RotaProtegida>} />

        <Route path="/consultas/:id" element={<RotaProtegida><Layout><DetalheConsulta /></Layout></RotaProtegida>} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
