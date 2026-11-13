# Persuasion Canvas — reviraVolta

**Comportamento:** encher uma garrafa reutilizável no campus e registar voluntariamente curso e litros. **Público:** estudantes da universidade; recrutamento para avaliação fora da turma. **Contexto:** QR junto do enchedor, no momento do gesto, sem identificar estação.

| Dimensão | Aplicação concreta | Salvaguarda / evidência |
|---|---|---|
| Fogg · motivação | Litros, equivalentes de garrafas e poupança potencial em `/impacto`. | Estimativas com hipótese explícita; não medir CO₂ ou compras evitadas. |
| Fogg · capacidade | Sem login; escolher curso, volume e confirmar em `/`. | Volumes rápidos, validação acessível e feedback de erro. |
| Fogg · prompt | Cartaz imprimível em `/qr`, junto do enchedor. | Sem tracking por estação, urgência ou notificações. |
| Convergência B=MAP | O convite aparece quando encher já é possível; a ação exige poucos passos e tem significado. | A aplicação regista a declaração; não prova o comportamento físico. |
| Cialdini · compromisso/coerência | Meta pessoal opt-in e progresso visível em ambas as versões. | Retirar ou alterar a meta sem custo, sem penalizações. |
| Cialdini · prova social | Único módulo adicional em B: lago com progresso real do curso, usando só B. | Nenhuma prova social adicional no percurso A; limiar ≥5 e totais conservadores. |
| Cialdini · unidade | Linguagem de pertença à comunidade universitária em ambos os grupos. | Sem afirmar que toda a comunidade participa ou exigir conformidade. |
| Kahneman · framing | Apresentação de ganhos potenciais por reutilização. | Hipóteses visíveis, sem exagerar poupanças nem explorar perdas/culpa. |
| Kahneman · disponibilidade/saliência | Feedback imediato, indicadores e marcos de litros tornam visível um efeito abstrato. | Registos e estimativas distinguíveis; sem confetti enganador ou resultados inventados. |
| Gamificação | QR → registo → confirmação → meta opcional → convite a regressar. Marcos reais a 1, 5, 10, 25 e 50 L. | Sem streaks, competição individual, castigos, prémios ou contagens artificiais. |
| Ética | `/sobre`, `/privacidade`, eliminação confirmada e meta reversível. | Pseudonimização, minimização, liberdade de desistir e informação sobre a experiência. |

**Hipótese A/B:** adicionar progresso coletivo por curso aumenta o número médio de enchimentos registados por participante durante o período de observação.

**Métrica principal:** registos / HMACs distintos com ≥1 registo por grupo e período. **Secundárias:** litros / participante e retorno em ≥2 dias UTC. Não observamos visitantes sem registos ou exposição efetiva ao lago.

**Logging e avaliação:** cada enchimento guarda apenas ID técnico, HMAC, curso, litros, timestamp UTC do servidor; versão derivada. Painel ao vivo e CSV reservado; período, n e exposição observável documentados. Exigir 3 semanas e pelo menos 30 participantes fora da turma com recrutamento verificado externamente. Não inventar dados.
