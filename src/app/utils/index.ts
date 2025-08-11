// Funções auxiliares para mensagens de erro
export function getErrorTitle(errorCode?: string): string {
  switch (errorCode) {
    case 'EXPIRED_TOKEN':
      return 'Convite Expirado';
    case 'USED_TOKEN':
      return 'Convite Já Processado';
    case 'INVALID_TOKEN':
      return 'Convite Inválido';
    case 'NO_TOKEN':
      return 'Token Não Fornecido';
    case 'CONNECTION_ERROR':
      return 'Erro de Conexão';
    case 'ROLE_CHANGED':
      return 'Convite Não Válido';
    default:
      return 'Erro Desconhecido';
  }
}

export function getErrorDescription(errorCode?: string): string {
  switch (errorCode) {
    case 'EXPIRED_TOKEN':
      return 'O convite expirou. Entre em contato com o administrador para obter um novo convite.';
    case 'USED_TOKEN':
      return 'Este convite já foi utilizado anteriormente.';
    case 'INVALID_TOKEN':
      return 'O convite é inválido ou foi corrompido.';
    case 'NO_TOKEN':
      return 'Nenhum token de convite foi fornecido na URL.';
    case 'CONNECTION_ERROR':
      return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    case 'ROLE_CHANGED':
      return 'Este convite não é mais válido pois seu status mudou.';
    default:
      return 'Ocorreu um erro inesperado durante o processamento.';
  }
}
