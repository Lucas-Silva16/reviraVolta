# Cursos da Universidade da Madeira

Catálogo consultado no site oficial em **13 de novembro de 2026**. A seleção usa as páginas gerais de cursos da UMa, incluindo cursos de diferentes coortes; constar do catálogo não significa ter candidaturas abertas neste ano letivo.

| Grupo | Entradas | Fonte oficial |
|---|---:|---|
| Licenciaturas e Ciclo Básico em Medicina | 23 (22 licenciaturas + Medicina) | https://www.uma.pt/ensino/1o-ciclo/ |
| Mestrados | 25 | https://www.uma.pt/ensino/2o-ciclo/ |
| Doutoramentos | 8 | https://www.uma.pt/ensino/3o-ciclo/ |
| Cursos Técnicos Superiores Profissionais | 21 | https://www.uma.pt/ensino/ctesp/ |
| Comunidade universitária | 2: Docente e Funcionário | Opções de participação solicitadas para a reviraVolta |

São 77 cursos/percursos e as opções Docente e Funcionário. O catálogo CTeSP repete a lista por razões de apresentação; cada curso foi incluído uma única vez. Usam-se as designações do catálogo, incluindo os CTeSP em Arquivos e Gestão da Informação, Cibersegurança e Redes e Informática de Gestão para o Turismo.

`config/courses.json` contém grupos com `label` e `courses`. A interface usa `optgroup`; a validação no servidor usa a mesma lista, sem depender do HTML. Os mestrados, doutoramentos e CTeSP mantêm o nível no valor guardado para não misturar cursos homónimos, como Design ou Engenharia Informática. Os nomes anteriores que continuam a ser licenciaturas conservam o mesmo valor; registos históricos não são reescritos nem eliminados. Um curso antigo que já não conste da lista tem de ser escolhido novamente antes de um novo registo.

Docente e Funcionário são apenas opções de participação no campo `curso`: não autenticam, não concedem acesso ao painel e não criam novos dados pessoais ou permissões. As métricas existentes incluem todas as opções; se a análise académica se limitar a estudantes, definir previamente esse critério e filtrar os registos Docente e Funcionário no CSV autorizado. A escolha continua sem influência na atribuição A/B.

Para atualizar, rever as quatro páginas oficiais, alterar a lista e confirmar designações únicas e compatíveis com o tamanho do campo `curso` (120 caracteres). Não recolher dados do site da UMa no navegador dos participantes.
