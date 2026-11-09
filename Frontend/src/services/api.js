const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

/**
 * Extrai uma mensagem amigável de erros HTTP (incluindo o formato de
 * validação do FastAPI, onde `detail` é uma lista de objetos).
 */
function extractErrorMessage(status, body) {
  if (body && typeof body === 'object' && 'detail' in body) {
    const { detail } = body;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((err) => {
          const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : '';
          return field ? `${field}: ${err.msg}` : err.msg;
        })
        .join(' ');
    }
  }
  if (status >= 500) return 'Erro interno do servidor. Tente novamente em instantes.';
  return 'Não foi possível concluir a requisição. Verifique os dados e tente novamente.';
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se a API está no ar.');
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractErrorMessage(response.status, body));
  }

  return body;
}

export function fetchDevices() {
  return request('/api/v1/devices/');
}

export function createOrder(payload) {
  return request('/api/v1/orders/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
