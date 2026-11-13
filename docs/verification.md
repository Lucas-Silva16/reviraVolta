# Verificação

Verificações realizadas em **13 de novembro de 2026**, Windows, Node.js 24.22.2, Next.js 16.4.6, Prisma ORM 7.10.1 e PostgreSQL local real. O motor Docker não ficou disponível neste ambiente; os testes de BD foram executados com PostgreSQL 18.6 local, e não com um mock ou SQLite. O Compose fornecido usa PostgreSQL 17; não foi possível executar essa imagem aqui.

| Verificação | Resultado |
|---|---|
| Instalação e geração Prisma | Concluídas; lockfile criado e cliente gerado. |
| `npm run db:migrate` | Migração aplicada com sucesso à BD local. |
| `npm run db:roles` | Papéis da aplicação e docente configurados com privilégios separados. |
| `npm run lint` | Sem erros ou avisos. |
| `npm run typecheck` | Tipos de rotas e TypeScript verificados. |
| `npm run build` | Build de produção compilado com sucesso; rotas dinâmicas e servidor standalone gerados. |
| `postbuild` | Ficheiros `.env` removidos do artefacto standalone; nenhum valor secreto configurado encontrado no bundle público. |
| `npm test` | **38/38** testes unitários passaram, em 6 ficheiros. |
| Integração em PostgreSQL real | **9/9** testes passaram. |
| `npm run test:e2e` | **4/4** testes de navegador passaram em Chrome. |
| Axe WCAG 2 A/AA e 2.1 AA | Zero violações automáticas em `/`, `/impacto`, `/sobre`, `/privacidade` nos estados verificados. |
| `npm audit --omit=dev` | Zero vulnerabilidades reportadas nas dependências de produção na data da verificação. Não é garantia de ausência de vulnerabilidades. |
| PDFs académicos | Canvas e modelo de Results Poster gerados e verificados com **1 página A4 cada**. |

Total: **51 testes passaram**, além de lint, typecheck e build.

## O que foi exercitado

- Primeiro cookie HttpOnly, prazo fixo e persistência sem renovar a validade; Secure e prefixo `__Host-` em produção; recusa de HTTP produtivo.
- HMAC-SHA-256 correto, ausência do token original na tabela e JSON, cinco campos persistentes e hora UTC do servidor.
- Atribuição estável, aproximadamente 50/50 e independente de curso; ausência de dados/módulo coletivo em A.
- Volumes, cursos, campos adicionais, origem externa, CSRF e corpos grandes rejeitados pelo servidor.
- Seis submissões concorrentes da mesma ação produzem **um** registo; conflitos e limites por token/dia são aplicados.
- Participantes distintos, médias incluindo registo único, retorno em dias diferentes, separação de A/B e CSV real.
- Agregados B ocultos com quatro pessoas; desbloqueados com cinco; registos A não entram no limiar ou nos litros B.
- Eliminação confirmada de apenas um navegador, manutenção da versão e preservação dos outros históricos.
- Login, expiração/assinatura de sessão, CSV protegido, métodos administrativos de escrita inexistentes e rejeição de INSERT/DELETE pelo papel SQL de leitura.
- Retenção remove registos antigos; impacto não os mostra; seed recusa a base de testes e ambiente sem opt-in demo.
- Fluxo mobile a 390 px, meta persistente/removível, login docente, download CSV, QR renderizado e estilos de impressão.
- Navegação por teclado com skip link, foco e ausência de overflow horizontal; contraste corrigido a partir das falhas encontradas.

## Isolamento e limites

Integração e navegador criam uma BD `reviravolta_test_<sufixo>` e papéis temporários. Eliminam-nos no fim. Consulta final confirmou **0 registos na base normal e 0 bases de teste restantes**; nenhum seed foi usado na base normal. Um processo Next temporário que sobreviveu às restrições de gestão de processos foi identificado e terminado; o runner passou a rejeitar uma porta 3101 já ocupada e a comunicar falhas de limpeza, evitando reutilizar um servidor antigo inadvertidamente.

Screenshots de QA em `.local/qa-desktop.png` e `.local/qa-mobile.png`; relatório Playwright em `playwright-report/`. São evidência de funcionamento da interface, **não resultados académicos de utilização**.

Não foi feito deploy externo, teste de HTTPS num alojamento real, execução do Dockerfile, validação em Safari/Firefox, ensaio físico num telemóvel, auditoria formal de segurança ou certificação WCAG completa. A recolha de três semanas e recrutamento de 30 participantes externos continuam por realizar. Configuração institucional, políticas do alojamento e eliminações de backups/CSV precisam de validação do responsável.

## Revisão visual com prioridade ao telemóvel — 13/11/2026

- Paleta revista: fundo neutro `#F5F6F2`, texto escuro `#243B3B`, ações em verde-petróleo `#2F6F73` e água suave `#6F9FA6`. Retirados os gradientes luminosos e os grandes blocos de azul saturado.
- Layout de base em coluna única, com introdução curta e formulário prioritário. Navegação inferior em ecrãs abaixo de 900 px, com espaço para a área segura do dispositivo e para o conteúdo final.
- Campos com letra de 16 px, opções de volume com pelo menos 50 px de altura e botões principais de 52 px. Zoom do navegador permitido. Texto informativo e páginas de leitura aumentados.
- Chrome com emulação móvel: páginas públicas e login a 320, 360, 390, 430, 768 e 1365 px; lago visível com resposta simulada a 320, 390 e 1365 px; painel autenticado e QR a 320, 390 e 1365 px. **39 combinações de página/largura sem overflow horizontal e sem violações detetadas pelo axe nos critérios automáticos WCAG A/AA utilizados.**
- Fluxo por toque com quantidade personalizada, confirmação focada e meta pessoal verificado com respostas simuladas apenas no navegador, sem inserir enchimentos na base normal. Navegação inferior, opção de curso mais longa, skip link, foco acima da barra inferior e deslocação das tabelas com as setas verificados.
- Em 390 × 844 px, o formulário começa aproximadamente aos 232 px e o botão de registo termina aos 706 px, acima da navegação inferior. A impressão continua a ocultar a navegação e a mostrar o QR.
- Evidência local: `.local/mobile-design-qa.json`, `.local/mobile-design-extra-qa.json` e imagens `.local/mobile-design-*.png`. As imagens do lago e da confirmação identificadas como `fixture` contêm dados simulados de verificação, não resultados do estudo.

A verificação móvel é emulada em Chrome; não substitui um ensaio físico em iPhone/Android ou uma auditoria manual completa de acessibilidade. A separação entre superfícies neutras e cores de ação segue a orientação de [papéis de cor do Material Design](https://m3.material.io/styles/color/roles); a paleta é uma adaptação própria ao projeto.