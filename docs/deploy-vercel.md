# Deploy da reviraVolta na Vercel

O projeto está preparado para **Next.js na Vercel, Node.js 24 e PostgreSQL externo**. A base local do computador não fica disponível ao publicar o site. O deploy não inclui dados locais, `.env` ou credenciais do docente.

## 1. Ficheiros de configuração

Se ainda não existirem, gerar os ficheiros com:

```powershell
npm.cmd run setup:vercel
```

| Ficheiro local | Utilização |
|---|---|
| `.local/vercel.env` | Variáveis para importar no ambiente **Production** da Vercel, depois de preencher os endereços PostgreSQL. |
| `.local/vercel-database.env` | Ligação direta do proprietário e palavras-passe dos papéis. Apenas para migrações e preparação da base; não importar na Vercel. |
| `.local/vercel-docente.txt` | Credencial do painel deste deploy. Guardar num gestor de palavras-passe; não enviar para o alojamento. |

O comando gera segredos independentes e datas de exemplo com 21 dias. Não altera o `.env` local e recusa substituir uma preparação existente. O modelo sem segredos está em [`.env.vercel.example`](../.env.vercel.example). Tanto o Git como o envio pela CLI da Vercel excluem `.local` e os ficheiros de segredos.

## 2. Preparar PostgreSQL

Criar uma base externa vazia, com uma ligação direta de proprietário que permita migrações e criação de papéis. Pode ser um serviço PostgreSQL do [Marketplace da Vercel](https://vercel.com/marketplace?category=databases). Manter uma base/branch diferente para previews e testes.

Preencher `MIGRATION_DATABASE_URL` em `.local/vercel-database.env` com a **ligação direta**, incluindo nome da base, credenciais e `sslmode=verify-full`. Conservar os valores gerados de `APP_DB_PASSWORD` e `READER_DB_PASSWORD`. Executar, a partir da raiz do projeto:

```powershell
node --env-file=.local/vercel-database.env node_modules/prisma/build/index.js migrate deploy
node --env-file=.local/vercel-database.env scripts/db-roles.mjs
```

Estes comandos aplicam as migrações e criam/configuram:

- `reviravolta_app`: SELECT/INSERT/DELETE em `enchimentos` e SELECT/UPDATE apenas no estado técnico do limite de login.
- `reviravolta_reader`: SELECT em `enchimentos`, sem escrita nem acesso ao estado do login.

Se o fornecedor não permitir `CREATE ROLE`, criar os dois papéis na consola do fornecedor e atribuir privilégios equivalentes aos de `scripts/db-roles.mjs`. Não usar o proprietário como alternativa para o runtime: a verificação de deploy rejeita permissões excessivas.

Em `.local/vercel.env`, substituir `SUBSTITUIR_HOST_POOL` e `SUBSTITUIR_BASE` nas duas ligações. Usar os endpoints de **pooling PostgreSQL** do fornecedor, com os papéis acima e as palavras-passe já geradas. Ajustar também a porta se o fornecedor indicar outra. As duas ligações devem apontar à mesma base e branch; a ligação do painel não pode usar o utilizador da aplicação. Manter `sslmode=verify-full`.

A aplicação usa transações e bloqueios de linha/transação. O endpoint escolhido deve suportar transações PostgreSQL completas; não usar uma API REST como connection string. A ligação direta fica reservada às migrações. O pool da aplicação está integrado com a [gestão de ligações da Vercel](https://vercel.com/kb/guide/connection-pooling-with-functions).

## 3. Configurar o projeto Vercel

Importar o repositório Git na Vercel ou ligar esta pasta pela CLI. Para a opção sem repositório, os comandos são:

```powershell
npx.cmd vercel@latest login
npx.cmd vercel@latest link
```

Na configuração do projeto:

| Opção | Valor |
|---|---|
| Framework Preset | Next.js |
| Root Directory | Raiz deste projeto |
| Node.js | 24.x, também definido em `package.json` |
| Install Command | `npm ci` |
| Build Command | `npm run vercel-build` |
| Output Directory | Predefinição do Next.js; não definir `out` nem `.next/standalone` |

`vercel.json` já define os comandos e a tarefa diária. Escolher uma região de Functions próxima da região da base de dados.

Importar **apenas `.local/vercel.env`** em Settings → Environment Variables → **Production**. Não importar o `.env` local nem o ficheiro de proprietário.

Variáveis principais:

| Variável | Valor esperado |
|---|---|
| `DATABASE_URL`, `RESEARCH_DATABASE_URL` | PostgreSQL externo, com os dois papéis mínimos e TLS. |
| `TOKEN_HMAC_SECRET`, `SESSION_SECRET`, `CRON_SECRET` | Valores independentes gerados por `setup:vercel`. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` | Utilizador e hash gerados; a palavra-passe em texto não vai para a Vercel. |
| `APP_ORIGIN` | Origem HTTPS final, sem caminhos. Pode ficar vazia para usar o domínio de produção atribuído pela Vercel. |
| `DATA_MODE` | `development` para validar a instalação; `study` apenas antes da recolha real, com datas e responsável configurados. |
| `STUDY_START`, `STUDY_END` | Datas UTC reais do protocolo. Confirmar as datas de exemplo antes do estudo. |
| `PROJECT_CONTROLLER`, `PROJECT_CONTACT`, `PROJECT_LAWFUL_BASIS` | Responsável, contacto e fundamento definidos pela instituição; obrigatórios em `study`. |

Não adicionar `MIGRATION_DATABASE_URL`, `APP_DB_PASSWORD`, `READER_DB_PASSWORD` ou `POSTGRES_PASSWORD` ao ambiente da Vercel. Não definir `NODE_ENV` manualmente nem transformar segredos em variáveis `NEXT_PUBLIC_*`.

Se `APP_ORIGIN` estiver vazia, a aplicação usa `VERCEL_PROJECT_PRODUCTION_URL` em produção e `VERCEL_URL` em previews. Estas [variáveis são disponibilizadas pela Vercel](https://vercel.com/docs/environment-variables/system-environment-variables). A origem continua a ser exata para proteger os pedidos; usar a URL configurada, não um alias diferente. Ao adotar um domínio próprio, definir `APP_ORIGIN` para esse domínio e redirecionar os outros domínios na Vercel.

## 4. Verificar e publicar

Para verificar localmente a configuração externa, preencher também `APP_ORIGIN` com a origem HTTPS pretendida e executar:

```powershell
npm.cmd run check:deploy -- --env-file .local/vercel.env
```

A verificação é de leitura: confirma configuração, TLS, migrações, ligação e permissões dos dois papéis. Não imprime segredos, não cria dados e não executa migrações. O build da Vercel executa automaticamente esta verificação antes de compilar.

Depois de configurar as variáveis no projeto, publicar pela interface da Vercel ou, se estiver a usar a CLI:

```powershell
npx.cmd vercel@latest --prod
```

Nas atualizações que incluam migrações, aplicar primeiro `migrate deploy` com a ligação direta e rever os privilégios. As migrações ficam separadas do build para não entregar credenciais de proprietário às Functions nem alterar a base durante um build de preview.

## 5. Confirmar no endereço publicado

Abrir a URL HTTPS final no telemóvel e validar um enchimento, a página de impacto e a eliminação do registo de verificação. Entrar em `/admin` com a credencial de `.local/vercel-docente.txt` e abrir `/qr`; o QR deve conter a origem pública correta. Fazer esta validação em `development`, antes de iniciar o estudo.

A tarefa de retenção chama `/api/cron/retention` diariamente, com a expressão `0 4 * * *` (UTC). A Vercel envia o [segredo no header Authorization](https://vercel.com/docs/cron-jobs/manage-cron-jobs). Sem esse segredo, a aplicação recusa o pedido. A rota só elimina registos fora de `RETENTION_DAYS`, recusa HEAD e não corre em previews. No Hobby, o [agendamento diário tem precisão por hora](https://vercel.com/docs/cron-jobs/usage-and-pricing); verificar a primeira execução no painel Cron Jobs. Não imprimir o header ou o segredo nos logs.

O limite de login é partilhado por todas as instâncias através do PostgreSQL: 10 tentativas por 15 minutos, sem IP ou identificadores pessoais. A tabela técnica guarda no máximo dez timestamps globais; limpa-os na tentativa seguinte e na retenção diária. Um bloqueio afeta temporariamente todos os logins do docente.

Previews exigem base e segredos separados, `DATA_MODE=development` e `APP_ORIGIN` vazia para usar a URL gerada. Não promover um preview ligado à base de testes diretamente para o estudo. Confirmar também a visibilidade do domínio de produção: os participantes não devem precisar de autenticação Vercel para abrir o QR.

## Estado da preparação

A base externa Neon foi ligada em 13/11/2026. As duas migrações foram aplicadas e as ligações dos papéis de aplicação e leitura foram verificadas com TLS, esquema e permissões mínimas. O ficheiro `.local/vercel.env` já contém os endereços e segredos prontos para importar no ambiente **Production** da Vercel; `.local/vercel-database.env` conserva a ligação direta do proprietário apenas para administração local.

Depois de o utilizador autenticar a CLI Vercel, as variáveis foram importadas em **Production** e o projeto foi configurado para Node.js 24. O deploy da versão local foi concluído em 13/11/2026 e está disponível em **https://revira-volta.vercel.app**. `APP_ORIGIN` permanece vazia para usar o domínio de produção fornecido pela Vercel; a criação de sessão nesse domínio e a consulta de impacto ao Neon responderam com sucesso. A configuração local de desenvolvimento foi preservada.

O deploy foi feito pela CLI a partir da pasta local. A correção de tipos em `scripts/deploy-config.ts` ainda não foi enviada ao GitHub; deve acompanhar a próxima atualização do repositório para os builds automáticos usarem a mesma correção.
