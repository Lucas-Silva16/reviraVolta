# Teoria, produto e limites das estimativas

O quadro de aplicação e as salvaguardas estão no [Persuasion Canvas](persuasion-canvas.md). O produto traduz estes conceitos em decisões de design, não alega que a teoria prove a eficácia desta implementação.

- **Fogg:** motivação, capacidade e prompt devem convergir. O QR junto ao enchedor combina oportunidade física, formulário simples e informação de impacto. [Modelo do próprio autor](https://www.behaviormodel.org/).
- **Cialdini:** compromisso/coerência na meta voluntária; prova social apenas no lago real de B; unidade na pertença ao campus, em ambos os grupos. [Princípios apresentados pela Influence at Work](https://www.influenceatwork.com/7-principles-of-persuasion/).
- **Framing:** os mesmos litros podem ser apresentados como um ganho potencial. A interface privilegia esse enquadramento, explicitando hipóteses e evitando perdas/culpa. Tversky e Kahneman, *The Framing of Decisions and the Psychology of Choice*, Science 211 (1981), 453–458. [DOI](https://doi.org/10.1126/science.7455683).
- **Disponibilidade/saliência e Sistema 1:** números e progressos imediatamente após o registo tornam um impacto abstrato mais fácil de recordar. Trata-se de uma escolha de design inspirada nos mecanismos pedidos no enunciado; não se medem processos cognitivos nem se demonstra que o comportamento resulte especificamente do Sistema 1. Uma visualização saliente pode enviesar perceções, pelo que se mantém junto dela a explicação das estimativas.

## Fórmulas verificáveis

`garrafas_equivalentes = litros_registados / 0,5`.

`euros_potenciais = litros_registados × REFERENCE_PRICE_PER_LITER`.

Por omissão, 0,80 €/L é **uma hipótese configurável de comparação**, não uma cotação de mercado ou resultado científico. Não foram usadas referências ambientais inventadas. A interpretação pressupõe que o enchimento substitui uma compra equivalente; isto não é observado. Não subtrai custos de água, compra/lavagem da garrafa ou outros custos. Equivalentes fracionários são deliberados, não contagens de objetos realmente evitados. Não se estima CO₂.

O lago mostra `floor(litros_B_curso / 5) × 5`, apresentado com “≥” e explicação da granularidade. A barra limita-se a 100% da meta, mas o total pode continuar acima dela. A meta pessoal usa os litros reais declarados do histórico conservado. Marcos só aparecem depois de um limiar ser atingido por esses registos; são reconhecimento, não um prémio fictício.
