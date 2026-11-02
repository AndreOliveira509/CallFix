import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { demoClient, demoTechnician, demoUsers, mockTickets } from './data/mockTickets'
import { Icon, type IconName } from './components/Icon'
import type { Ticket, TicketCategory, TicketLog, TicketPriority, TicketStatus, User } from './types'

type Profile = 'client' | 'admin'
type ClientPage = 'home' | 'tickets'
type StatusFilter = 'all' | TicketStatus
type PriorityFilter = 'all' | TicketPriority

const ADMIN_PASSWORD = 'admin123'
const TICKETS_STORAGE_KEY = 'callfix-demo-tickets-v1'
const todayLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toLocaleUpperCase('pt-BR')
const todayShort = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()).replace('.', '')
const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'

const statusText: Record<TicketStatus, string> = {
  open: 'Aberto', in_progress: 'Em atendimento', waiting_customer: 'Aguardando cliente', closed: 'Encerrado',
}
const priorityText: Record<TicketPriority, string> = { low: 'Baixa', normal: 'Normal', high: 'Alta', urgent: 'Urgente' }
const categoryOptions: TicketCategory[] = ['Hardware', 'Software', 'Rede', 'Acesso e contas', 'Outro']
const statusOptions: TicketStatus[] = ['open', 'in_progress', 'waiting_customer', 'closed']
function loadTickets(): Ticket[] {
  if (typeof window === 'undefined') return mockTickets
  try {
    const saved = window.localStorage.getItem(TICKETS_STORAGE_KEY)
    if (!saved) return mockTickets
    const parsed: unknown = JSON.parse(saved)
    return Array.isArray(parsed) ? (parsed as Ticket[]) : mockTickets
  } catch {
    return mockTickets
  }
}

function formatDate(value: string, withTime = false) {
  const options: Intl.DateTimeFormatOptions = withTime
    ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' }
  return new Intl.DateTimeFormat('pt-BR', options).format(new Date(value)).replace('.', '')
}

function getUser(id: string): User {
  return demoUsers.find((user) => user.id === id) ?? demoClient
}

function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`status-badge status-${status}`}><span className="status-dot" />{statusText[status]}</span>
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <span className={`priority-badge priority-${priority}`}><span />{priorityText[priority]}</span>
}

function Avatar({ user, size = 'normal' }: { user: User; size?: 'normal' | 'small' | 'large' }) {
  return <span className={`avatar avatar-${user.color} avatar-${size}`} aria-label={user.name}>{user.initials}</span>
}

function Brand() {
  return <div className="brand-lockup"><span className="brand-mark"><Icon name="spark" size={20} /></span><span className="brand-name">callfix<span>.</span></span></div>
}

function Sidebar({ profile, clientPage, setClientPage, tickets }: { profile: Profile; clientPage: ClientPage; setClientPage: (page: ClientPage) => void; tickets: Ticket[] }) {
  const isClient = profile === 'client'
  const clientTicketCount = tickets.filter((ticket) => ticket.customerId === demoClient.id).length
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><Brand /><span className="sidebar-caption">{isClient ? 'CENTRAL DE SUPORTE' : 'WORKSPACE TÉCNICO'}</span></div>
      {isClient ? (
        <>
          <div className="sidebar-label">ESPAÇO DO CLIENTE</div>
          <nav className="sidebar-nav" aria-label="Navegação principal">
            <button className={`nav-item ${clientPage === 'home' ? 'nav-item-active' : ''}`} onClick={() => setClientPage('home')}><Icon name="grid" /><span>Visão geral</span></button>
            <button className={`nav-item ${clientPage === 'tickets' ? 'nav-item-active' : ''}`} onClick={() => setClientPage('tickets')}><Icon name="ticket" /><span>Meus chamados</span><span className="nav-count">{clientTicketCount}</span></button>
          </nav>
          <div className="sidebar-help-card"><span className="help-icon"><Icon name="headphones" size={19} /></span><p>Precisando de uma mão?</p><span>Estamos por aqui para ajudar.</span><a href="mailto:suporte@callfix.com.br">Falar com suporte <Icon name="arrow" size={14} /></a></div>
          <div className="sidebar-bottom-note"><Icon name="shield" size={15} /> Dados mantidos neste navegador</div>
        </>
      ) : (
        <>
          <div className="sidebar-label">ATENDIMENTO</div>
          <nav className="sidebar-nav" aria-label="Navegação técnica">
            <button className="nav-item nav-item-active"><Icon name="grid" /><span>Central de chamados</span></button>
            <button className="nav-item" onClick={() => document.querySelector('.admin-filters')?.scrollIntoView({ behavior: 'smooth' })}><Icon name="filter" /><span>Filtros e busca</span></button>
          </nav>
          <div className="queue-mini"><div className="queue-mini-heading"><span>FILA AGORA</span><span className="live-dot" /></div><div className="queue-mini-value">{tickets.filter((ticket) => ticket.status !== 'closed').length}<span> chamados ativos</span></div><div className="queue-mini-bar"><i /></div><small>Fila da equipe CallFix</small></div>
          <div className="sidebar-bottom-note"><Icon name="activity" size={15} /> Sistema operacional</div>
        </>
      )}
      <div className="sidebar-profile"><Avatar user={isClient ? demoClient : demoTechnician} /><div><strong>{isClient ? demoClient.name : demoTechnician.name}</strong><span>{isClient ? demoClient.company : 'Técnico administrador'}</span></div><Icon name="dots" size={18} /></div>
    </aside>
  )
}

function ProfileToggle({ profile, onChange }: { profile: Profile; onChange: (profile: Profile) => void }) {
  return (
    <div className="profile-toggle" aria-label="Alternar perfil">
      <button className={profile === 'client' ? 'selected' : ''} onClick={() => onChange('client')}><span className="toggle-client-dot" />Cliente</button>
      <button className={profile === 'admin' ? 'selected' : ''} onClick={() => onChange('admin')}><Icon name="monitor" size={14} />Técnico / ADM</button>
    </div>
  )
}

function Topbar({ profile, onProfileChange }: { profile: Profile; onProfileChange: (profile: Profile) => void }) {
  return (
    <header className="topbar">
      <div className="topbar-context"><span className="topbar-context-mark"><Icon name={profile === 'client' ? 'grid' : 'activity'} size={15} /></span><span>{profile === 'client' ? 'Portal do cliente' : 'Painel de operação'}</span><Icon name="chevron" size={13} /><span className="topbar-context-current">{profile === 'client' ? 'Estúdio Lume' : 'Equipe CallFix'}</span></div>
      <div className="topbar-actions"><span className="today-indicator"><i />Tudo funcionando bem</span><ProfileToggle profile={profile} onChange={onProfileChange} /><div className="topbar-avatar"><Avatar user={profile === 'client' ? demoClient : demoTechnician} size="small" /></div></div>
    </header>
  )
}

function StatCard({ label, value, hint, icon, tone }: { label: string; value: number | string; hint: string; icon: IconName; tone: string }) {
  return <article className={`stat-card stat-${tone}`}><div className="stat-top"><span className="stat-icon"><Icon name={icon} size={18} /></span><span className="stat-hint">{hint}</span></div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></article>
}

function SectionHeading({ eyebrow, title, description, right }: { eyebrow: string; title: string; description?: string; right?: ReactNode }) {
  return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{description && <p>{description}</p>}</div>{right}</div>
}

function ClientDashboard({ tickets, page, setPage, onTicketClick, onCreate }: { tickets: Ticket[]; page: ClientPage; setPage: (page: ClientPage) => void; onTicketClick: (ticket: Ticket) => void; onCreate: (subject: string, description: string, category: TicketCategory) => void }) {
  const clientTickets = tickets.filter((ticket) => ticket.customerId === demoClient.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const active = clientTickets.filter((ticket) => ticket.status !== 'closed').length
  const resolved = clientTickets.filter((ticket) => ticket.status === 'closed').length
  const waiting = clientTickets.filter((ticket) => ticket.status === 'waiting_customer').length
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TicketCategory>('Hardware')
  const [createdMessage, setCreatedMessage] = useState(false)

  function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!subject.trim() || !description.trim()) return
    onCreate(subject.trim(), description.trim(), category)
    setSubject('')
    setDescription('')
    setCategory('Hardware')
    setCreatedMessage(true)
    window.setTimeout(() => setCreatedMessage(false), 4500)
  }

  return (
    <div className="page-content client-content">
      <div className="welcome-row"><div><div className="eyebrow eyebrow-with-dot"><span />{todayLabel}</div><h1>{greeting}, Ana <span className="wave">✳</span></h1><p>Seu espaço de suporte, sempre em dia.</p></div><div className="welcome-plan"><span className="plan-stars"><Icon name="spark" size={16} /></span><div><strong>Estúdio Lume</strong><span>Plano essencial <i /> ativo</span></div><Icon name="chevron" size={16} /></div></div>

      <div className="client-stats">
        <StatCard label="Chamados em andamento" value={active} hint="Acompanhe por aqui" icon="activity" tone="green" />
        <StatCard label="Aguardando você" value={waiting} hint={waiting ? 'Ação necessária' : 'Tudo em dia'} icon="clock" tone="amber" />
        <StatCard label="Resolvidos" value={resolved} hint="Neste histórico" icon="check" tone="lilac" />
      </div>

      {page === 'home' ? (
        <>
          <div className="client-bento">
            <form className="create-card" onSubmit={submitTicket}>
              <div className="create-card-heading"><span className="create-icon"><Icon name="plus" size={19} /></span><div><div className="eyebrow">NOVO CHAMADO</div><h2>No que podemos ajudar?</h2><p>Conte o que está acontecendo. A gente cuida do resto.</p></div></div>
              {createdMessage && <div className="success-message"><Icon name="check" size={16} />Chamado criado. Você já pode acompanhar o andamento abaixo.</div>}
              <div className="form-grid"><label className="field field-subject"><span>Assunto</span><input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Ex.: Meu computador não liga" required maxLength={100} /></label><label className="field field-category"><span>Categoria</span><select value={category} onChange={(event) => setCategory(event.target.value as TicketCategory)}>{categoryOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label className="field field-description"><span>Descrição</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descreva o problema e quando começou..." rows={3} required maxLength={1000} /></label></div>
              <div className="create-card-footer"><span><Icon name="clock" size={14} /> Normalmente respondemos em até 4 horas úteis</span><button className="button button-primary" type="submit">Enviar chamado <Icon name="arrow" size={15} /></button></div>
            </form>
            <article className="support-card"><div className="support-card-top"><span className="support-live"><i />SUPORTE EM TEMPO REAL</span><span className="support-card-mark"><Icon name="spark" size={18} /></span></div><div className="orbit-scene"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="orbit orbit-three" /><span className="orbit-core"><Icon name="headphones" size={27} /></span><span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" /><span className="orbit-dot dot-three" /></div><div className="support-card-copy"><h3>Gente de verdade.<br /><em>Problemas resolvidos.</em></h3><p>Estamos do outro lado, prontos para deixar sua rotina funcionando.</p></div><div className="support-team"><div className="avatar-stack"><Avatar user={demoTechnician} size="small" /><Avatar user={demoUsers[2]} size="small" /><Avatar user={demoUsers[3]} size="small" /></div><span>Seu time de suporte <strong>está online</strong></span></div></article>
          </div>
          <section className="ticket-section" id="ticket-history"><SectionHeading eyebrow="VISÃO GERAL" title="Seus chamados" description="Acompanhe as atualizações mais recentes." right={<button className="text-button" onClick={() => setPage('tickets')}>Ver todos <Icon name="arrow" size={15} /></button>} /><ClientTicketList tickets={clientTickets.slice(0, 3)} onTicketClick={onTicketClick} /></section>
        </>
      ) : (
        <section className="ticket-section all-tickets-section"><SectionHeading eyebrow="SEU HISTÓRICO" title="Todos os chamados" description="Cada conversa e atualização, sempre à mão." right={<button className="button button-secondary" onClick={() => setPage('home')}><Icon name="plus" size={16} />Abrir chamado</button>} /><ClientTicketList tickets={clientTickets} onTicketClick={onTicketClick} /></section>
      )}
      <footer className="page-footer"><span>CallFix <i>·</i> suporte feito para gente.</span><span>Precisa de ajuda? <a href="mailto:suporte@callfix.com.br">suporte@callfix.com.br</a></span></footer>
    </div>
  )
}

function ClientTicketList({ tickets, onTicketClick }: { tickets: Ticket[]; onTicketClick: (ticket: Ticket) => void }) {
  if (tickets.length === 0) return <div className="empty-state"><span><Icon name="ticket" size={22} /></span><strong>Nenhum chamado por aqui</strong><p>Quando você abrir um chamado, ele vai aparecer nesta lista.</p></div>
  return (
    <div className="client-ticket-list">
      {tickets.map((ticket) => (
        <button className="client-ticket-row" key={ticket.id} onClick={() => onTicketClick(ticket)}><span className={`ticket-category-icon category-${ticket.category === 'Hardware' ? 'hardware' : ticket.category === 'Rede' ? 'network' : 'software'}`}><Icon name={ticket.category === 'Rede' ? 'wifi' : ticket.category === 'Hardware' ? 'monitor' : 'ticket'} size={18} /></span><span className="client-ticket-main"><span className="client-ticket-subject">{ticket.subject}</span><span className="ticket-id">{ticket.id}<i />{ticket.category}</span></span><StatusBadge status={ticket.status} /><span className="client-ticket-date">{formatDate(ticket.createdAt)}</span><span className="row-arrow"><Icon name="chevron" size={17} /></span></button>
      ))}
    </div>
  )
}

function AdminDashboard({ tickets, onTicketClick, onStatusFilter, statusFilter, priorityFilter, onPriorityFilter, search, onSearch }: { tickets: Ticket[]; onTicketClick: (ticket: Ticket) => void; onStatusFilter: (filter: StatusFilter) => void; statusFilter: StatusFilter; priorityFilter: PriorityFilter; onPriorityFilter: (filter: PriorityFilter) => void; search: string; onSearch: (search: string) => void }) {
  const counts = useMemo(() => ({
    open: tickets.filter((ticket) => ticket.status === 'open').length,
    inProgress: tickets.filter((ticket) => ticket.status === 'in_progress').length,
    waiting: tickets.filter((ticket) => ticket.status === 'waiting_customer').length,
    closed: tickets.filter((ticket) => ticket.status === 'closed').length,
  }), [tickets])
  const filteredTickets = useMemo(() => tickets.filter((ticket) => {
    const customer = getUser(ticket.customerId)
    const query = search.toLowerCase().trim()
    const matchesQuery = !query || [ticket.id, ticket.subject, ticket.category, customer.name, customer.company ?? ''].some((value) => value.toLowerCase().includes(query))
    return matchesQuery && (statusFilter === 'all' || ticket.status === statusFilter) && (priorityFilter === 'all' || ticket.priority === priorityFilter)
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [tickets, search, statusFilter, priorityFilter])

  return (
    <div className="page-content admin-content">
      <div className="admin-title-row"><div><div className="eyebrow eyebrow-with-dot"><span />{todayLabel}</div><h1>Central de atendimento</h1><p>Um panorama claro. Cada chamado, no seu lugar.</p></div><div className="admin-date-chip"><Icon name="calendar" size={16} />Hoje, {todayShort}</div></div>
      <div className="admin-stats"><StatCard label="Abertos" value={counts.open} hint="Na fila" icon="inbox" tone="green"/><StatCard label="Em atendimento" value={counts.inProgress} hint="Em andamento" icon="activity" tone="blue"/><StatCard label="Aguardando cliente" value={counts.waiting} hint="Retorno pendente" icon="clock" tone="amber"/><StatCard label="Encerrados" value={counts.closed} hint="Concluídos" icon="check" tone="lilac"/></div>
      <section className="admin-queue-section"><div className="admin-queue-header"><div><div className="eyebrow">INBOX DA EQUIPE</div><h2>Fila de chamados <span className="count-pill">{filteredTickets.length}</span></h2><p>Chamados de todas as empresas atendidas.</p></div><span className="queue-updated"><span className="live-dot" />Atualizado agora</span></div>
        <div className="admin-filters"><label className="search-field"><Icon name="search" size={17}/><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar por chamado, assunto ou cliente" aria-label="Buscar chamados"/>{search && <button aria-label="Limpar busca" onClick={() => onSearch('')}><Icon name="close" size={14}/></button>}</label><label className="filter-select"><Icon name="filter" size={15}/><select value={statusFilter} onChange={(event) => onStatusFilter(event.target.value as StatusFilter)} aria-label="Filtrar por status"><option value="all">Todos os status</option>{statusOptions.map((status) => <option value={status} key={status}>{statusText[status]}</option>)}</select></label><label className="filter-select priority-filter"><span className="priority-select-dot"/><select value={priorityFilter} onChange={(event) => onPriorityFilter(event.target.value as PriorityFilter)} aria-label="Filtrar por prioridade"><option value="all">Todas as prioridades</option>{(Object.keys(priorityText) as TicketPriority[]).map((priority) => <option value={priority} key={priority}>{priorityText[priority]}</option>)}</select></label></div>
        {filteredTickets.length ? <div className="admin-ticket-list"><div className="ticket-list-head"><span>CHAMADO</span><span>CLIENTE</span><span>STATUS</span><span>PRIORIDADE</span><span>ABERTO EM</span><span /></div>{filteredTickets.map((ticket) => { const customer = getUser(ticket.customerId); return <button className="admin-ticket-row" key={ticket.id} onClick={() => onTicketClick(ticket)}><span className="admin-ticket-subject"><span className="table-category-icon"><Icon name={ticket.category === 'Rede' ? 'wifi' : ticket.category === 'Hardware' ? 'monitor' : 'ticket'} size={17}/></span><span><strong>{ticket.subject}</strong><small>{ticket.id} <i /> {ticket.category}</small></span></span><span className="table-customer"><Avatar user={customer} size="small"/><span><strong>{customer.name}</strong><small>{customer.company}</small></span></span><span><StatusBadge status={ticket.status}/></span><span><PriorityBadge priority={ticket.priority}/></span><span className="table-date">{formatDate(ticket.createdAt)}</span><span className="row-arrow"><Icon name="chevron" size={17}/></span></button> })}</div> : <div className="empty-state admin-empty"><span><Icon name="search" size={22}/></span><strong>Nenhum chamado encontrado</strong><p>Tente ajustar os filtros ou fazer outra busca.</p><button className="text-button" onClick={() => { onSearch(''); onStatusFilter('all'); onPriorityFilter('all') }}>Limpar filtros</button></div>}
        <div className="queue-footer"><span>Exibindo <strong>{filteredTickets.length}</strong> de <strong>{tickets.length}</strong> chamados</span><span>Os chamados mais recentes aparecem primeiro</span></div>
      </section>
      <footer className="page-footer"><span>CallFix <i>·</i> console técnico</span><span>Área de demonstração local</span></footer>
    </div>
  )
}

function TicketDetailPanel({ ticket, onClose, onStatusChange, onAddLog, profile }: { ticket: Ticket; onClose: () => void; onStatusChange: (status: TicketStatus) => void; onAddLog: (description: string) => void; profile: Profile }) {
  const [note, setNote] = useState('')
  const customer = getUser(ticket.customerId)
  const latestLog = [...ticket.logs].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
  function submitLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!note.trim()) return
    onAddLog(note.trim())
    setNote('')
  }
  return (
    <div className="panel-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="ticket-panel" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <div className="panel-header"><div><span className="panel-ticket-id">{ticket.id}</span><StatusBadge status={ticket.status}/></div><button className="icon-button" onClick={onClose} aria-label="Fechar detalhes"><Icon name="close" size={19}/></button></div>
        <div className="panel-content"><div className="panel-category"><span className="ticket-category-icon category-hardware"><Icon name={ticket.category === 'Rede' ? 'wifi' : ticket.category === 'Hardware' ? 'monitor' : 'ticket'} size={17}/></span>{ticket.category}<span className="panel-category-separator">·</span><PriorityBadge priority={ticket.priority}/></div><h2 id="detail-title">{ticket.subject}</h2><div className="panel-customer"><Avatar user={customer}/><div><strong>{customer.name}</strong><span>{customer.company} <i /> Cliente</span></div><a href={`mailto:${customer.email}`} aria-label={`Enviar e-mail para ${customer.name}`}><Icon name="arrow" size={15}/></a></div><div className="panel-description"><div className="eyebrow">DESCRIÇÃO DO PROBLEMA</div><p>{ticket.description}</p><span><Icon name="calendar" size={14}/>Aberto em {formatDate(ticket.createdAt, true)}</span></div>
          {profile === 'admin' && <div className="panel-status-control"><label htmlFor="status-select">Status do chamado</label><select id="status-select" value={ticket.status} onChange={(event) => onStatusChange(event.target.value as TicketStatus)}>{statusOptions.map((status) => <option key={status} value={status}>{statusText[status]}</option>)}</select></div>}
          <section className="timeline-section"><div className="timeline-heading"><div><div className="eyebrow">ACOMPANHAMENTO</div><h3>Histórico <span>{ticket.logs.length}</span></h3></div><span className="timeline-sort">Mais recente: {latestLog ? formatDate(latestLog.createdAt) : '—'}</span></div>
            {ticket.logs.length ? <div className="timeline">{[...ticket.logs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((entry: TicketLog) => { const actor = getUser(entry.responsibleId); return <article className="timeline-item" key={entry.id}><span className={`timeline-marker ${entry.responsibleRole === 'admin' ? 'timeline-marker-admin' : ''}`}><Icon name={entry.responsibleRole === 'admin' ? 'spark' : 'ticket'} size={13}/></span><div className="timeline-entry"><div className="timeline-entry-meta"><span className="timeline-name">{entry.responsibleName}</span><span className="timeline-role">{entry.responsibleRole === 'admin' ? 'Técnico' : 'Cliente'}</span><time>{formatDate(entry.createdAt, true)}</time></div><p>{entry.description}</p></div><Avatar user={actor} size="small"/></article> })}</div> : <div className="timeline-empty">Ainda não há atualizações neste chamado.</div>}
          </section>
          {profile === 'admin' && ticket.status !== 'closed' && <form className="reply-form" onSubmit={submitLog}><label htmlFor="reply-note">Adicionar atualização</label><textarea id="reply-note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Descreva uma ação ou orientação..." maxLength={1000}/><div><span>Visível no histórico do cliente</span><button className="button button-primary" disabled={!note.trim()} type="submit"><Icon name="send" size={15}/>Registrar ação</button></div></form>}
          {ticket.status === 'closed' && <div className="closed-note"><Icon name="check" size={17}/>Chamado encerrado. Altere o status para reabrir o atendimento.</div>}
        </div>
      </aside>
    </div>
  )
}

function AdminLoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password === ADMIN_PASSWORD) onSuccess()
    else setError('Senha incorreta. Confira a senha de demonstração abaixo.')
  }
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title"><button className="icon-button modal-close" onClick={onClose} aria-label="Fechar"><Icon name="close" size={19}/></button><span className="login-lock"><Icon name="lock" size={22}/></span><div className="eyebrow">ACESSO DA EQUIPE</div><h2 id="login-title">Área administrativa</h2><p>Entre com a senha de demonstração para abrir o painel técnico.</p><form onSubmit={submit}><label htmlFor="admin-password">Senha</label><input id="admin-password" type="password" autoFocus value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} placeholder="Digite a senha" required/><span className="password-hint"><Icon name="spark" size={14}/>Senha de teste: <strong>admin123</strong></span>{error && <span className="login-error">{error}</span>}<button className="button button-primary login-submit" type="submit">Acessar painel <Icon name="arrow" size={15}/></button></form><div className="login-demo-note">Este acesso é apenas demonstrativo e não protege dados reais.</div></section></div>
  )
}

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>(loadTickets)
  const [profile, setProfile] = useState<Profile>('client')
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [clientPage, setClientPage] = useState<ClientPage>('home')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => { window.localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets)) }, [tickets])
  useEffect(() => { document.body.classList.toggle('body-modal-open', Boolean(loginOpen || selectedTicket)); return () => document.body.classList.remove('body-modal-open') }, [loginOpen, selectedTicket])

  function changeProfile(nextProfile: Profile) {
    if (nextProfile === 'admin' && !adminUnlocked) { setLoginOpen(true); return }
    setProfile(nextProfile)
    setSelectedTicket(null)
  }

  function createTicket(subject: string, description: string, category: TicketCategory) {
    const now = new Date().toISOString()
    const ticketId = `CF-${new Date().getFullYear()}-${window.crypto.randomUUID().slice(0, 6).toUpperCase()}`
    const firstLog: TicketLog = { id: `${ticketId}-log-1`, ticketId, responsibleId: demoClient.id, responsibleName: demoClient.name, responsibleRole: 'client', description: 'Chamado aberto pelo portal do cliente.', createdAt: now }
    const newTicket: Ticket = { id: ticketId, customerId: demoClient.id, subject, description, category, status: 'open', priority: 'normal', createdAt: now, updatedAt: now, logs: [firstLog] }
    setTickets((current) => [newTicket, ...current])
  }

  function changeTicketStatus(ticket: Ticket, status: TicketStatus) {
    if (ticket.status === status) return
    const now = new Date().toISOString()
    const entry: TicketLog = { id: `${ticket.id}-${Date.now()}`, ticketId: ticket.id, responsibleId: demoTechnician.id, responsibleName: demoTechnician.name, responsibleRole: 'admin', description: `Status atualizado para “${statusText[status]}”.`, createdAt: now }
    setTickets((current) => current.map((item) => item.id === ticket.id ? { ...item, status, updatedAt: now, logs: [...item.logs, entry] } : item))
    setSelectedTicket((current) => current?.id === ticket.id ? { ...current, status, updatedAt: now, logs: [...current.logs, entry] } : current)
  }

  function addTicketLog(ticket: Ticket, description: string) {
    const now = new Date().toISOString()
    const entry: TicketLog = { id: `${ticket.id}-${Date.now()}`, ticketId: ticket.id, responsibleId: demoTechnician.id, responsibleName: demoTechnician.name, responsibleRole: 'admin', description, createdAt: now }
    setTickets((current) => current.map((item) => item.id === ticket.id ? { ...item, updatedAt: now, logs: [...item.logs, entry] } : item))
    setSelectedTicket((current) => current?.id === ticket.id ? { ...current, updatedAt: now, logs: [...current.logs, entry] } : current)
  }

  const selectedRecord = selectedTicket ? tickets.find((ticket) => ticket.id === selectedTicket.id) ?? selectedTicket : null

  return (
    <div className={`app-shell ${profile === 'admin' ? 'app-admin' : 'app-client'}`}><Sidebar profile={profile} clientPage={clientPage} setClientPage={setClientPage} tickets={tickets}/><main className="main-shell"><Topbar profile={profile} onProfileChange={changeProfile}/>{profile === 'client' ? <ClientDashboard tickets={tickets} page={clientPage} setPage={setClientPage} onTicketClick={setSelectedTicket} onCreate={createTicket}/> : <AdminDashboard tickets={tickets} onTicketClick={setSelectedTicket} statusFilter={statusFilter} onStatusFilter={setStatusFilter} priorityFilter={priorityFilter} onPriorityFilter={setPriorityFilter} search={search} onSearch={setSearch}/>}</main>
      {selectedRecord && <TicketDetailPanel ticket={selectedRecord} profile={profile} onClose={() => setSelectedTicket(null)} onStatusChange={(status) => changeTicketStatus(selectedRecord, status)} onAddLog={(description) => addTicketLog(selectedRecord, description)}/>}
      {loginOpen && <AdminLoginModal onClose={() => setLoginOpen(false)} onSuccess={() => { setAdminUnlocked(true); setProfile('admin'); setLoginOpen(false); setSelectedTicket(null) }}/>}
    </div>
  )
}
