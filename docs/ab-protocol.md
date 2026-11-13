# Protocolo A/B

## Pré-registo antes da recolha

Hipótese: **Adicionar progresso coletivo por curso aumenta o número médio de enchimentos registados por participante durante o período de observação.** Registar num documento institucional a versão Git, cursos, preço, meta coletiva, limiar, datas UTC, responsáveis, forma de recrutamento e análise planeada. Não mudar os parâmetros persuasivos, a função de atribuição, TOKEN_HMAC_SECRET ou o desenho durante a recolha sem declarar uma nova fase.

Usar uma BD de estudo vazia, separada de demonstração e testes. DATA_MODE=study, responsável/contacto/fundamento configurados. STUDY_START e STUDY_END definem [início inclusivo, fim exclusivo), pelo menos 21 dias. Ajustar RETENTION_DAYS para cobrir observação, análise e correções sem conservação excessiva. Publicar via HTTPS e testar o mesmo QR nos dispositivos alvo. Recrutar ≥30 pessoas fora da turma através de canais acordados; documentar o recrutamento de forma agregada. O software não recolhe turma e não consegue provar esta condição.

## Unidade e atribuição

Unidade operacional: identificador do navegador, pseudonimizado por HMAC. Token de 256 bits uniforme; primeiro byte par → A, ímpar → B. Probabilidade esperada 1/2; não usar blocos por curso nem reequilibrar a amostra depois da recolha. A versão existe sem qualquer registo na BD e só fica observável em investigação quando há um enchimento. Atribuição reconstruível em cada linha exportada, sem coluna adicional.

Mesmas páginas, estilo, incentivos individuais, meta voluntária, marcos, preços e textos. O único componente adicional de B é `CollectiveLake` em `/impacto`, incluindo o seu estado protegido abaixo do limiar. Soma apenas litros de B no curso do último registo do navegador. A nunca recebe ou vê totais coletivos. Não partilhar resultados parciais do painel com os participantes durante o estudo.

## Denominadores e exposição

Métrica principal por grupo: número de registos / número de HMACs distintos com pelo menos um registo no período. **Inclui pessoas com um só registo.** Por minimização não guardamos visitas, atribuições sem registos ou sessões; esta é uma análise de participantes registantes, não intention-to-treat de todos os visitantes atribuídos. Não se podem estimar conversão ou efeito em quem nunca registou.

Secundárias: soma de litros / HMACs distintos; taxa de retorno = HMACs com registos em ≥2 datas UTC distintas / HMACs com ≥1 registo. Dois enchimentos no mesmo dia não contam como retorno. Reportar n_A, n_B, registos, litros e médias, mesmo se um grupo ficar pequeno. Com grupo vazio, a diferença numérica exibida não é uma comparação interpretável.

Exposição observável: dias do primeiro registo no período até min(agora, fim). Mostrar média por grupo e avaliar entradas tardias. Isto não mede leitura ou visualização real do lago. Abaixo do limiar há exposição apenas ao estado protegido; o modelo mínimo não conserva a data de desbloqueio ou visitas. No relatório reconhecer exposição não medida e possível diluição do efeito. Se a avaliação exigir esta medição, rever protocolo, minimização e informação aos participantes antes de adicionar dados.

## Acompanhamento de três semanas

O painel calcula dias com registos, semanas com registos (segunda-feira UTC), intervalo entre primeiro e último registo, tamanho da amostra e declaração agregada de recrutamento. Nenhum destes indicadores, sozinho, certifica 3 semanas reais de uso ou 30 pessoas únicas externas. Confirmar início/fim, disponibilização do cartaz, atividade semanal e recrutamento através de registos de projeto sem identidades. Atualizar RECRUITMENT_ATTESTATION apenas com uma declaração factual verificável.

A League Table é um resumo semanal privado por curso, sem ranking de indivíduos. Suprime células com menos de cinco participantes. Não promover competição adicional, para não contaminar a diferença única A/B. Excluir datas fora da janela, campos inválidos e pedidos deduplicados de acordo com regras prévias; não excluir participantes de um só registo ou outliers apenas para favorecer a hipótese. Documentar eliminações e efeitos de retenção, que alteram os denominadores.

## Análise e relatório

1. Fixar hora UTC da extração e conservar exportação num local académico autorizado. Registar n, parâmetros e versão de código sem publicar hashes.
2. Agregar todas as linhas por HMAC, derivar A/B e calcular contagem/litros por pessoa. Comparar médias e retorno. Mostrar distribuição ou mediana além da média numa análise externa, se relevante.
3. O dashboard é descritivo e **não calcula p-values ou significância**. Qualquer inferência deve ser pré-especificada, usar participante como unidade (não tratar enchimentos repetidos como independentes), reportar intervalos e justificar um teste/permutação/bootstrap adequado ao desenho e à pequena amostra. A influência social entre participantes pode violar independência.
4. Documentar autorrelato, novidade, amostra de conveniência, poucos participantes, diferença de exposição, supressão do lago, partilha de cookies/dispositivos, múltiplos navegadores, seleção pelo primeiro registo, contaminação entre versões e alterações de curso. O QR não verifica enchimentos físicos.
5. Usar `results-poster-template.md` sem preencher lacunas com valores fictícios. Uma diferença descritiva não é prova de causalidade. Apagar dados e exportações no fim do prazo.
