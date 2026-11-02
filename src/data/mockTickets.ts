import type { Ticket, User } from '../types'

export const demoClient: User = {
  id: 'user-ana',
  name: 'Ana Martins',
  email: 'ana@estudiolume.com.br',
  role: 'client',
  company: 'Estúdio Lume',
  initials: 'AM',
  color: 'lilac',
}

export const demoTechnician: User = {
  id: 'user-caio',
  name: 'Caio Ribeiro',
  email: 'caio@callfix.com.br',
  role: 'admin',
  company: 'Equipe CallFix',
  initials: 'CR',
  color: 'mint',
}

export const demoUsers: User[] = [
  demoClient,
  demoTechnician,
  { id: 'user-bruno', name: 'Bruno Alves', email: 'bruno@floracafe.com.br', role: 'client', company: 'Flora Café', initials: 'BA', color: 'peach' },
  { id: 'user-marina', name: 'Marina Costa', email: 'marina@casanova.com.br', role: 'client', company: 'Casa Nova', initials: 'MC', color: 'blue' },
  { id: 'user-luiza', name: 'Luiza Prado', email: 'luiza@agenciamar.com.br', role: 'client', company: 'Agência Mar', initials: 'LP', color: 'gold' },
]

function log(
  ticketId: string,
  id: string,
  responsibleId: string,
  responsibleName: string,
  responsibleRole: 'client' | 'admin',
  description: string,
  createdAt: string,
) {
  return { id, ticketId, responsibleId, responsibleName, responsibleRole, description, createdAt }
}

export const mockTickets: Ticket[] = [
  {
    id: 'CF-2026-0048', customerId: 'user-ana', subject: 'Notebook não reconhece o monitor externo',
    description: 'Desde a atualização do Windows, meu monitor fica sem sinal quando conecto pelo adaptador USB-C. Já testei outra entrada e reiniciei o equipamento.',
    category: 'Hardware', status: 'in_progress', priority: 'high', createdAt: '2026-11-02T08:42:00-03:00', updatedAt: '2026-11-02T09:18:00-03:00',
    logs: [
      log('CF-2026-0048', 'log-48-1', 'user-ana', 'Ana Martins', 'client', 'Abri o chamado e anexei as informações do equipamento.', '2026-11-02T08:42:00-03:00'),
      log('CF-2026-0048', 'log-48-2', 'user-caio', 'Caio Ribeiro', 'admin', 'Estou verificando a compatibilidade do driver de vídeo com o adaptador. Pode deixar o notebook ligado à tomada?', '2026-11-02T09:18:00-03:00'),
    ],
  },
  {
    id: 'CF-2026-0047', customerId: 'user-bruno', subject: 'Impressora fiscal desconectando do caixa',
    description: 'A impressora perde a conexão de rede algumas vezes durante o expediente.', category: 'Rede', status: 'waiting_customer', priority: 'urgent', createdAt: '2026-11-01T16:20:00-03:00', updatedAt: '2026-11-02T08:55:00-03:00',
    logs: [log('CF-2026-0047', 'log-47-1', 'user-caio', 'Caio Ribeiro', 'admin', 'Identifiquei oscilação no sinal. Você consegue confirmar se o cabo de rede está conectado diretamente ao roteador?', '2026-11-02T08:55:00-03:00')],
  },
  {
    id: 'CF-2026-0046', customerId: 'user-ana', subject: 'Acesso ao e-mail compartilhado da equipe',
    description: 'Preciso incluir uma nova pessoa na caixa de entrada de projetos.', category: 'Acesso e contas', status: 'open', priority: 'normal', createdAt: '2026-11-01T14:06:00-03:00', updatedAt: '2026-11-01T14:06:00-03:00',
    logs: [log('CF-2026-0046', 'log-46-1', 'user-ana', 'Ana Martins', 'client', 'Chamado aberto pelo portal.', '2026-11-01T14:06:00-03:00')],
  },
  {
    id: 'CF-2026-0045', customerId: 'user-marina', subject: 'Computador de recepção muito lento',
    description: 'A máquina leva vários minutos para iniciar os aplicativos usados no atendimento.', category: 'Software', status: 'closed', priority: 'normal', createdAt: '2026-10-31T10:12:00-03:00', updatedAt: '2026-11-01T12:30:00-03:00',
    logs: [
      log('CF-2026-0045', 'log-45-1', 'user-marina', 'Marina Costa', 'client', 'Abri o chamado pelo portal.', '2026-10-31T10:12:00-03:00'),
      log('CF-2026-0045', 'log-45-2', 'user-caio', 'Caio Ribeiro', 'admin', 'Fiz a limpeza de inicialização e atualizei o sistema. O computador voltou a iniciar normalmente.', '2026-11-01T12:30:00-03:00'),
    ],
  },
  {
    id: 'CF-2026-0044', customerId: 'user-luiza', subject: 'Configurar acesso à pasta de criação',
    description: 'Novo computador precisa acessar a unidade compartilhada da equipe criativa.', category: 'Acesso e contas', status: 'in_progress', priority: 'high', createdAt: '2026-10-31T09:25:00-03:00', updatedAt: '2026-11-01T11:14:00-03:00',
    logs: [log('CF-2026-0044', 'log-44-1', 'user-caio', 'Caio Ribeiro', 'admin', 'Acesso provisionado; estou validando as permissões com a equipe.', '2026-11-01T11:14:00-03:00')],
  },
  {
    id: 'CF-2026-0043', customerId: 'user-ana', subject: 'Instalar fonte para apresentação',
    description: 'A fonte da apresentação aparece diferente quando abro o arquivo neste computador.', category: 'Software', status: 'closed', priority: 'low', createdAt: '2026-10-29T13:37:00-03:00', updatedAt: '2026-10-29T15:02:00-03:00',
    logs: [log('CF-2026-0043', 'log-43-1', 'user-caio', 'Caio Ribeiro', 'admin', 'Fonte instalada e apresentação validada. Pode abrir o arquivo novamente.', '2026-10-29T15:02:00-03:00')],
  },
  {
    id: 'CF-2026-0042', customerId: 'user-bruno', subject: 'Wi-Fi não chega à área externa',
    description: 'O sinal cai na área das mesas externas, principalmente no horário de almoço.', category: 'Rede', status: 'open', priority: 'high', createdAt: '2026-10-28T11:48:00-03:00', updatedAt: '2026-10-28T11:48:00-03:00',
    logs: [log('CF-2026-0042', 'log-42-1', 'user-bruno', 'Bruno Alves', 'client', 'Chamado aberto pelo portal.', '2026-10-28T11:48:00-03:00')],
  },
]
