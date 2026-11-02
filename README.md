# CallFix

Help desk responsivo feito com React, TypeScript, Vite e CSS. O projeto já vem com chamados de demonstração em vários estados; não precisa conectar um backend para navegar pela interface.

## Estrutura

```text
CallFix/
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx                  # Portal do cliente, fila técnica e interações
    ├── main.tsx                 # Entrada React
    ├── styles.css               # Tema, componentes e breakpoints responsivos
    ├── types.ts                 # User, Ticket, TicketLog e enums de domínio
    ├── components/
    │   └── Icon.tsx             # Ícones SVG locais
    └── data/
        └── mockTickets.ts      # Usuários e chamados de demonstração
```

## Executar

```bash
pnpm install
pnpm dev
```

Para gerar a versão de produção: `pnpm build`. Para visualizar o build local: `pnpm preview`.

## Acesso de demonstração

No seletor superior, escolha **Técnico / ADM**. A senha fixa de teste é **admin123**. Ela existe apenas para demonstrar a troca de perfil e não substitui autenticação real.

## Dados

Os tipos de domínio estão em `src/types.ts`. `TicketStatus` usa `open`, `in_progress`, `waiting_customer` e `closed`; prioridades e categorias também são unions tipadas. Os dados iniciais de `src/data/mockTickets.ts` incluem chamados abertos, em atendimento, aguardando o cliente e encerrados. Chamados, mudanças de status e atualizações novas ficam salvos no `localStorage` do navegador com a chave `callfix-demo-tickets-v1`.
