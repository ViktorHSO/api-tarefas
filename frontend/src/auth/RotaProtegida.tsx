import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './contexto'

/** Só deixa passar quem está logado; os outros vão para o login e voltam depois. */
export function RotaProtegida() {
  const { sessao } = useAuth()
  const local = useLocation()
  if (!sessao) return <Navigate to="/entrar" replace state={{ de: local.pathname + local.search }} />
  return <Outlet />
}

/** Páginas de login e cadastro: quem já está logado vai direto para as tarefas. */
export function RotaPublica() {
  const { sessao } = useAuth()
  if (sessao) return <Navigate to="/tarefas" replace />
  return <Outlet />
}
