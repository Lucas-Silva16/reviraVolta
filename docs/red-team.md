# Revisão Red Team: riscos e dark patterns

| Risco / cenário | Defesa implementada | Limitação / verificação |
|---|---|---|
| Token original em BD ou cliente JS | HMAC no servidor, cookie HttpOnly, sem token no JSON/URL/localStorage. | Inspecionar SQL, rede e logs; comprometimento do navegador/servidor continua relevante. |
| CSRF ou registo por site externo | Origem exata, JSON, header CSRF ligado ao cookie, SameSite, Fetch Metadata. | XSS na própria origem pode usar a sessão; CSP, escape React e dependências atualizadas. |
| SQL injection / XSS / CSV injection | Prisma/SQL parametrizado, lista de cursos, texto React escapado, CSV entre aspas com escape e neutralização de fórmulas. | Rever configurações de cursos e não introduzir HTML arbitrário. |
| Duplo clique, retry, concorrência | ID determinístico e advisory lock em transação; resposta idempotente. | Depois de apagamento/retenção não existe memória do ID eliminado. |
| Volumes falsos e automação | Limites de volume, intervalo e dia por token, sem IP. | Novos cookies contornam limites; registos continuam a ser declarações. |
| Curso pequeno / diferenças entre totais | ≥5 HMACs B, supressão de contagem e total, intervalos de 5 L. | Não é privacidade diferencial; observações repetidas podem permitir inferências. |
| Roubo de sessão docente | scrypt, assinatura, Secure, HttpOnly, expiração 4h e acesso SELECT. | Sem revogação individual central; rodar segredo em incidente. |
| Força bruta / negação de serviço no login | Limite global em PostgreSQL, serializado por bloqueio de linha, sem IP; credencial aleatória longa. | Limite pode bloquear todos; não é uma defesa completa contra negação de serviço. |
| Falsos participantes na avaliação | Nenhum seed na BD normal; seed exige _demo local e opt-in; testes criam _test temporária. | Não confundir identificadores com pessoas nem aceitar screenshots como dados ao vivo. |
| Falha de retenção | Script diário, filtros nas consultas, eliminação total confirmada. | Alertar falhas; backups e CSV precisam de políticas e ações externas. |
| IPs guardados no alojamento | Sem IP no código; logs Next desativados, erros sanitizados, opções PostgreSQL no Compose. | Auditar CDN/WAF/proxy/APM e logs geridos; a aplicação não os controla. |
| Contaminação do A/B | Único módulo B, atribuição HMAC estável, lógica partilhada. | Alterar segredo/cookie muda grupo; partilha de ecrãs e influência entre colegas. |
| Coerção, culpa, consenso falso | Metas opcionais e removíveis; sem penalizações, streaks, ranking público ou números inventados. | Rever novos textos, notificações e pedidos do responsável antes de os adicionar. |
| Saída dificultada | Eliminação na privacidade, confirmação simples e cancelar igualmente acessível. | Perder cookie impede associação histórica; comunicar antes da participação. |
| Sobredeclaração de eficácia | Hipóteses de estimativa, autorrelato e ausência de significância explícitos. | Uma comparação de médias não demonstra causalidade. |

## Exercício de revisão

Executar testes unitários, de integração e navegador numa base temporária. Tentar volume negativo/NaN, curso não listado, timestamp fornecido pelo cliente, origem externa, CSRF de outro navegador, seis pedidos concorrentes, escrita com o utilizador de leitura, exportação sem login, eliminação sem confirmação e grupo A a pedir impacto. Validar que um curso B com quatro pessoas não revela total e que registos A não fazem atingir o limiar B.

No browser: teclado, foco, contraste, mobile 390px, zoom 200%, texto com nomes de curso longos, redução de movimento, erro de BD, falha de rede após submit, retorno sem cookie. A verificação automática de acessibilidade não certifica conformidade WCAG completa; completar com leitor de ecrã e revisão humana.

Antes de estudo: verificar acessos ao servidor, segredos fora de Git, regiões/subcontratantes, fundamento institucional, contactos, recrutamento, cópias de segurança, relógio UTC, três semanas reais e plano de eliminação. Registar conclusões e responsáveis sem guardar identidades de participantes.
