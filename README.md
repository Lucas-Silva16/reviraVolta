# reviraVolta

**Enche a tua garrafa. Faz a diferença.** MVP funcional para um projeto universitário de Persuasive Computing. Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL e Prisma. Interface em português de Portugal, sem contas de participantes, sem analytics ou dados fictícios na base normal.

## Arranque local (Windows / PowerShell)

Requisitos: Node.js 24 LTS, npm e Docker Desktop com o motor Linux ativo. Usar `npm.cmd` e `npx.cmd` no PowerShell se a execução de `.ps1` estiver desativada. Nos restantes sistemas pode usar `npm` / `npx`.

```powershell
cd C:\Users\lucas\Desktop\reviraVolta
npm.cmd ci
npm.cmd run setup
docker compose up -d db
npm.cmd run db:migrate
npm.cmd run db:roles
npm.cmd run dev
```

Abrir **http://localhost:3000**. `setup` não substitui um `.env` existente. Cria segredos locais aleatórios, ligações para três papéis PostgreSQL, datas de observação de exemplo e uma credencial do docente em `.local/docente.txt`. O ficheiro de credenciais e `.env` estão ignorados pelo Git; não os publicar. Não existem segredos reais no código ou `.env.example`.

O Compose expõe a BD apenas em `127.0.0.1:5432` e mantém os dados num volume. `docker compose down` para os contentores sem apagar dados. Não usar `down -v` se quiser conservar o histórico. Se a porta 5432 já estiver ocupada, parar a instância de desenvolvimento anterior ou ajustar a porta e todas as ligações em `.env`.

Nesta preparação o Docker Desktop não disponibilizou o motor. Foi adicionada uma alternativa **opcional de desenvolvimento** para executar PostgreSQL real localmente; não altera a stack ou o caminho normal Docker. Os binários auxiliares não são dependência da aplicação:

```powershell
npm.cmd install --prefix .local/pg-tools embedded-postgres@18.6.0-beta.19
npm.cmd run db:local
```

Manter esse terminal aberto; noutro terminal executar `db:migrate`, `db:roles` e `dev` como acima. `db:local` escuta só em loopback, usa a palavra-passe gerada em `.env`, conserva dados em `.local/postgres` e recusa modo study/produção. O pacote auxiliar está em versão beta; a aplicação usa bibliotecas estáveis. Para produção e recolha real usar PostgreSQL gerido ou Docker configurado. Não iniciar Docker e a alternativa ao mesmo tempo na mesma porta.

Se o Node indicar `UNABLE_TO_VERIFY_LEAF_SIGNATURE` numa rede com CA empresarial, usar a CA de sistema suportada pelo Node 24: `$env:NODE_OPTIONS='--use-system-ca'`. Não desligar validação TLS. O setup não altera a política de execução do PowerShell.

## Páginas e funcionalidades

| Página | Funcionalidade |
|---|---|
| `/` | Informação curta de dados; curso configurável; volumes rápidos ou 0,10–5 L; registo e confirmação real do servidor. |
| `/impacto` | Litros pessoais, equivalentes de 0,5 L, poupança estimada, meta opt-in e marcos reais. Só B recebe o lago coletivo. |
| `/sobre` | Projeto, fundamentos teóricos, limitações e carta ética. |
| `/privacidade` | Política configurável, dados/retenção/direitos e eliminação confirmada do próprio histórico. |
| `/admin` | Login do docente, dados reais, COUNT DISTINCT, comparação A/B, retorno, séries diárias/semanais, League Table privada, indicadores do enunciado e CSV. |
| `/qr` | Protegida pela sessão docente; QR da origem oficial e cartaz com estilo de impressão A4. |

Cada enchimento guarda **apenas** ID técnico, HMAC do token, curso, litros e timestamp UTC do servidor. A atribuição A/B usa a paridade do primeiro byte do HMAC, independentemente do curso. Cookie de 256 bits aleatórios, HttpOnly, SameSite=Strict, Secure em produção, Path=/ e validade fixa. Token original nunca persistido na BD ou entregue ao JavaScript.

Os dois grupos partilham a mesma experiência individual. O único módulo adicional é um lago por curso em B, calculado apenas com participantes B. Totais públicos requerem ≥5 participantes distintos, não revelam a contagem e são apresentados por intervalos de 5 L. Sem ranking público, contagens inventadas, pressão ou punições.

Mutações protegidas por origem, CSRF, validação, tamanho máximo de corpo e SQL parametrizado. Transações e advisory locks impedem duplicação concorrente. Mesmo pedido é idempotente; novos pedidos têm intervalo mínimo de 45 s e limites de 20 registos/20 L por dia UTC. Limites por token, sem IP. Eliminar o histórico mantém o cookie e a versão.

## Configuração antes de um estudo real

Editar `.env`, reiniciar a aplicação depois de alterações e conservar os parâmetros durante a recolha:

| Configuração | Uso |
|---|---|
| `APP_ORIGIN` | Origem exata, sem caminho/parametrização. HTTPS obrigatório em produção; usada em CSRF e QR. |
| `DATABASE_URL` | Papel da aplicação: SELECT, INSERT, DELETE nos enchimentos; SELECT/UPDATE apenas na tabela técnica de limite de login; sem DDL. |
| `RESEARCH_DATABASE_URL` | Papel dedicado ao docente: só SELECT. Obrigatório; não usa fallback de escrita. |
| `MIGRATION_DATABASE_URL` | Papel proprietário, apenas para migrações/operação. Não colocar no ambiente do servidor de produção quando desnecessário. |
| `TOKEN_HMAC_SECRET` | ≥32 bytes aleatórios hexadecimais. Não rodar durante o estudo: perde o vínculo e muda grupos. |
| `SESSION_SECRET` | Outro segredo independente; assina sessões e CSRF. |
| `CRON_SECRET` | Segredo independente para a limpeza diária autenticada na Vercel. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` | Credenciais fora das tabelas de participantes. Hash `scrypt:salt:hash`. |
| `STUDY_START`, `STUDY_END` | Datas ISO UTC; intervalo [início,fim), com pelo menos 21 dias planeados. |
| `DATA_MODE` | `development` por omissão; `demo` tem aviso explícito; `study` exige contactos/fundamento e restringe recolha às datas. |
| `PROJECT_CONTROLLER`, `PROJECT_CONTACT`, `PROJECT_LAWFUL_BASIS` | Responsável, contacto institucional e fundamento validado pela universidade. Visíveis na política. |
| `REFERENCE_PRICE_PER_LITER` | Hipótese de preço, 0,80 €/L por omissão, sempre identificada como estimativa. |
| `COURSE_GOAL_LITERS` | Meta coletiva, 500 L por omissão. Não depende de dados inventados. |
| `MIN_COURSE_PARTICIPANTS` | Mínimo de participantes B distintos por curso; nunca inferior a 5. |
| `RETENTION_DAYS`, `COOKIE_MAX_AGE_DAYS` | 90 dias por omissão; alinhar com protocolo, calendário de análise e minimização. |
| `RECRUITMENT_ATTESTATION` | Declaração factual agregada do responsável sobre recrutamento externo à turma. Sem nomes. |

Lista de cursos: [config/courses.json](config/courses.json), organizada por nível de ensino e preenchida a partir do catálogo oficial da Universidade da Madeira, com as opções adicionais «Docente» e «Funcionário». As [fontes e critérios de atualização](docs/uma-courses.md) documentam a consulta. Não remover/renomear cursos durante o estudo sem documentar o impacto. Metas pessoais são uma preferência numérica apenas no localStorage; não há identificador ou token nesse armazenamento.

Para gerar outra credencial, `node scripts/password.mjs` lê a palavra-passe por stdin, exige ≥16 caracteres e devolve apenas o hash. Não passar palavras-passe em argumentos de shell ou versioná-las. Em produção usar um gestor de segredos e eliminar `.local/docente.txt` depois de transferir a credencial para um gestor de palavras-passe.

## Testes e build

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run test:integration
npm.cmd run test:e2e
npm.cmd run build
```

`npm.cmd run test:full` executa integração e navegador na mesma instância temporária. Exige PostgreSQL local ativo, `.env` configurado e acesso do proprietário para criar/eliminar a BD de teste. Recusa ambiente study/produção ou host de BD remoto. Cria `reviravolta_test_<aleatório>`, papéis temporários de aplicação e leitura, aplica a migração, inicia Next na porta 3101, executa verificações e elimina apenas esses recursos. Nunca inserir fixtures na BD usada como evidência.

E2E usa Chrome instalado (`channel: chrome`). Se não existir, instalar um browser Playwright apropriado e ajustar `playwright.config.ts` para esse canal; em CI pode usar Chromium com `npx playwright install --with-deps chromium` e retirar `channel: 'chrome'`. Testes cobrem mobile, teclado, axe, persistência, meta, eliminação, A/B, login, CSV e impressão QR. Screenshots locais em `.local/qa-desktop.png` e `.local/qa-mobile.png`; relatório HTML em `playwright-report/`.

As suites unitárias e de integração verificam HMAC, cookie, atribuição estável, validação, CSRF, concorrência, rate limits, cinco campos persistentes, contagens, separação A/B, supressão de agregados, eliminação, autenticação, permissões SELECT e CSV UTC. Ver [docs/verification.md](docs/verification.md) para resultados realmente executados neste ambiente. Acessibilidade automatizada não certifica WCAG integral; completar revisão de leitor de ecrã, zoom e utilizadores reais.

Fora da Vercel, o build cria um servidor Next standalone. Na Vercel usa o output normal do Next.js para Functions. O `postbuild` remove ficheiros `.env` que o Next possa copiar para o standalone e verifica que os valores secretos não constam do bundle público. Configure segredos apenas no ambiente do alojamento. `npm run start` serve produção e exige `APP_ORIGIN=https://…`, TLS terminado por proxy e configuração completa. Para desenvolvimento usar `npm run dev`; não relaxar Secure para simular produção em HTTP.

## Telemóvel e distribuição do QR

1. Para teste local, colocar computador e telemóvel na mesma rede. Obter o IPv4 do computador com `ipconfig`.
2. Definir `APP_ORIGIN=http://<IPv4-do-computador>:3000` em `.env`, reiniciar `npm.cmd run dev` e abrir **essa mesma origem** no computador e no telemóvel. O servidor já escuta em `0.0.0.0`; a origem localhost deixa de ser aceite para submissões enquanto o IP estiver configurado.
3. Autorizar a porta 3000 apenas na rede privada na firewall, se necessário. O QR não funciona noutro dispositivo se apontar para localhost. O teste em LAN com HTTP é só desenvolvimento; dados e cookies não têm confidencialidade de transporte.
4. Para o estudo, publicar num domínio HTTPS estável, configurar a origem HTTPS e revalidar login, cookie, submissão e eliminação a partir do telemóvel. Digitalizar o QR abre o browser, sem permissão de câmara dentro da aplicação.
5. Entrar em `/admin`, abrir “Imprimir QR” e imprimir o cartaz em `/qr`. Usar o mesmo QR em todos os enchedores. Não acrescentar identificadores de estação, encurtadores com tracking ou parâmetros pessoais.

## Docente

Abrir **http://localhost:3000/admin** em desenvolvimento (ou `/admin` na origem configurada). Utilizador inicial `docente`; a palavra-passe aleatória gerada está em `.local/docente.txt`. Não há credenciais fixas no repositório. A sessão dura 4 horas e a BD do painel tem acesso só de leitura. CSV disponível por botão autenticado, nunca público. Ver [instruções de acesso](docs/teacher-access.md).

## Deploy na Vercel

Seguir [docs/deploy-vercel.md](docs/deploy-vercel.md). O projeto inclui Node 24, `vercel.json`, validação prévia de configuração e permissões, pool PostgreSQL adaptado à Vercel e retenção diária autenticada. `npm run setup:vercel` prepara variáveis e credenciais independentes em `.local`, sem alterar o ambiente local. É necessário provisionar PostgreSQL externo e importar as variáveis na conta Vercel; não foi feito deploy externo.

## Deploy HTTPS noutros alojamentos

Não foi feito deploy externo. Escolher alojamento Node compatível com Next standalone e PostgreSQL, região/subcontratantes aprovados pela instituição. O `Dockerfile` prepara uma imagem não privilegiada do servidor; não incorpora `.env`, `.local`, dados ou credenciais. O Compose fornecido destina-se à BD local, não é uma arquitetura de produção completa.

1. Provisionar uma BD de estudo vazia; aplicar migrações com o papel proprietário, depois instalar papéis mínimos (`db:roles` ou equivalentes no fornecedor).
2. Configurar segredos e variáveis no alojamento. Separar os dois segredos e credenciais de BD; entregar ao runtime apenas as ligações necessárias. Não usar variáveis NEXT_PUBLIC para segredos. Validar responsável, contacto, fundamento e datas.
3. Compilar `npm ci` e `npm run build`, servir `npm run start` ou a imagem `docker build -t reviravolta .`. Terminar TLS num proxy com certificado válido; passar APP_ORIGIN do domínio final. Proteger também a ligação à BD e validar certificados.
4. Desativar caches de páginas/API personalizadas e logs que conservem IPs, cookies, query strings, User-Agent ou dados de formulários. Desativar APM com captura de pedidos. A app não consegue controlar o logging do fornecedor; rever o documento de arquitetura.
5. Agendar retenção diária num job com o script/Prisma disponíveis e credenciais de DELETE. A imagem final standalone destina-se ao servidor: executar migrações/retenção a partir de um job do checkout ou imagem de operação com as dependências instaladas.
6. O limitador de login usa PostgreSQL e é partilhado entre instâncias; aplicar todas as migrações e os privilégios da tabela técnica. Validar backups, retenção, alertas e recuperação sem ressuscitar dados eliminados.
7. Verificar o percurso completo com dados de ensaio numa BD separada antes de abrir recolha. Não semear a BD de estudo e não tratar o modo development/demo como evidência.

## Retenção e seed

```powershell
# Agendar diariamente:
npm.cmd run db:retention
# No fim do projeto, eliminação total irreversível, pelo operador:
npm.cmd run db:retention -- --all --confirm-project-end
```

A eliminação total é deliberadamente só por script de operação; não existe no painel docente. Gerir exportações e backups separadamente. O script só imprime número de registos eliminados, sem identificadores.

Seed é opcional e não foi executado na BD normal. Exige explicitamente `DATA_MODE=demo`, `ALLOW_DEMO_SEED=true`, NODE_ENV não produtivo e BD local terminada em `_demo`, vazia e migrada. Preparar essa BD separada, apontar as ligações para ela e executar `npm.cmd run db:seed`. Cria 36 registos fictícios, identificados pela mensagem e aviso permanente de demonstração. Nunca usar o seed como avaliação académica.

## Estrutura

```text
config/courses.json              Cursos configuráveis
src/app/                        Páginas App Router e rotas HTTP
src/components/                 Formulários, impacto, lago, docente e QR
src/lib/                        HMAC, auth, CSRF, validação, BD e métricas
src/proxy.ts                    CSP e headers de segurança
prisma/schema.prisma            Modelo mínimo de cinco campos
prisma/migrations/              Migração SQL e índices
prisma/seed.ts                  Seed exclusivamente demo
scripts/                       Setup, papéis, retenção e isolamento de testes
tests/unit/                    Identidade, validação, métricas, auth e agregados
tests/integration/             API contra PostgreSQL real
tests/e2e/                     Percursos reais em Chrome / mobile
docs/                          Documentação académica e operacional
compose.yaml / Dockerfile      PostgreSQL local / servidor de produção
.env.example                   Configuração sem segredos reais
```

Documentação: [arquitetura e dados](docs/architecture-and-privacy.md), [Persuasion Canvas](docs/persuasion-canvas.md), [protocolo A/B](docs/ab-protocol.md), [carta ética](docs/ethics-charter.md), [teoria e estimativas](docs/theory-and-estimates.md), [Results Poster](docs/results-poster-template.md), [Red Team](docs/red-team.md), [docente](docs/teacher-access.md).

Entregáveis de uma página para imprimir: [Persuasion Canvas (PDF)](docs/persuasion-canvas.pdf) e [Results Poster por preencher (PDF)](docs/results-poster-template.pdf). Regenerar com `node scripts/print-docs.mjs` (Chrome instalado).

## Limites que permanecem

HMAC é pseudonimização, não anonimato absoluto. Um navegador não equivale necessariamente a uma pessoa, e perda de cookies perde o acesso ao histórico. O QR prova apenas acesso à página; enchimentos são declarados. Não recolhemos exposições ou visitantes sem registos, nem podemos comprovar pertença externa à turma. A análise inclui quem tem ≥1 registo e mostra exposição observável desde o primeiro registo, não verdadeira exposição ao módulo.

Há riscos residuais de inferência em agregados, abuso com novos cookies, contaminação entre versões e enviesamento de amostra/autorrelato. O painel não afirma significância estatística ou causalidade. Três semanas de uso e 30 participantes externos continuam a exigir recolha real e documentação de recrutamento. Estimativas não medem poupança efetiva, plástico ou CO₂. Contactos, fundamento RGPD, alojamento, backups, retenção agendada e HTTPS precisam de configuração e validação institucional.
