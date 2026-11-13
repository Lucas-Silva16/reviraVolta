# Acesso do docente — apenas leitura

1. O operador executa `npm run setup`, inicia PostgreSQL, aplica `npm run db:migrate` e `npm run db:roles`. Entrega a credencial por canal privado. Em desenvolvimento está em `.local/docente.txt`, ignorado pelo Git. O docente não precisa de acesso direto à BD.
2. Abrir `/admin` na origem oficial HTTPS. Introduzir ADMIN_USERNAME e a palavra-passe correspondente ao hash scrypt de ambiente. A sessão dura 4 horas. Nunca partilhar um cookie.
3. O painel consulta a BD e atualiza a cada minuto enquanto visível. “Atualizar” força nova leitura. Mostra período UTC, tamanho da amostra, volumes, registos, A/B, retorno e resultados diários/semanais. A tabela docente usa uma ligação PostgreSQL exclusiva com SELECT. Não há botões de edição, escrita ou eliminação administrativa.
4. “Exportar CSV” obtém `token_hash, curso, quantidade_litros, created_at, versao`. Versão derivada no momento da exportação; timestamps UTC com `Z`; litros com ponto decimal. Em Excel/LibreOffice importar como UTF-8, separador vírgula e identificador como texto.
5. Para rastrear o percurso de um identificador, filtrar localmente pelo mesmo token_hash e ordenar created_at. Só fazê-lo no contexto autorizado. Não publicar ficheiros individuais nem tentar identificar estudantes a partir de horários/cursos. O CSV é pseudonimizado, não anónimo.
6. “Imprimir QR” abre `/qr`. Verificar a origem de destino antes de imprimir. O cartaz é igual para todas as estações; não mede localização nem exposição por estação.
7. “Sair” remove o cookie da sessão. Fechar o navegador não garante logout antes da validade. Guardar exportações em espaço institucional restrito e eliminá-las no fim da retenção; não ficam sincronizadas com o botão de eliminação de participantes.

Avisos de desenvolvimento/demonstração significam que o painel **não deve ser usado como evidência académica**. Para evidência usar uma BD de estudo separada, DATA_MODE=study, período pré-definido e dados efetivamente recolhidos. Um contador de 30 hashes não prova 30 pessoas fora da turma; essa condição exige documentação externa de recrutamento.
