const API_URL = 'http://localhost:3333';

export async function requisicao(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const resposta = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Ocorreu um erro na requisição.');
  }

  return dados;
}