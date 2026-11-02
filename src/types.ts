export type UserRole = 'client' | 'technician' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  company?: string
  initials: string
  color: string
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TicketCategory = 'Hardware' | 'Software' | 'Rede' | 'Acesso e contas' | 'Outro'

export interface TicketLog {
  id: string
  ticketId: string
  responsibleId: string
  responsibleName: string
  responsibleRole: UserRole
  description: string
  createdAt: string
}

export interface Ticket {
  id: string
  customerId: string
  subject: string
  description: string
  category: TicketCategory
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  updatedAt: string
  logs: TicketLog[]
}
