import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthContext'
import { RotaProtegida, RotaPublica } from './auth/RotaProtegida'
import { CriarConta } from './paginas/CriarConta'
import { Entrar } from './paginas/Entrar'
import { Inicio } from './paginas/Inicio'
import { LayoutApp } from './paginas/LayoutApp'
import { NaoEncontrada } from './paginas/NaoEncontrada'
import { Painel } from './paginas/Painel'
import { Tarefas } from './paginas/Tarefas'

const clienteConsultas = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

export function Rotas() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route element={<RotaPublica />}>
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/criar-conta" element={<CriarConta />} />
      </Route>
      <Route element={<RotaProtegida />}>
        <Route element={<LayoutApp />}>
          <Route path="/tarefas" element={<Tarefas />} />
          <Route path="/painel" element={<Painel />} />
        </Route>
      </Route>
      <Route path="*" element={<NaoEncontrada />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={clienteConsultas}>
      <BrowserRouter>
        <AuthProvider>
          <Rotas />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
