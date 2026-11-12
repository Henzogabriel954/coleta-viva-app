# Direção de Interface — Coleta Viva

O **Coleta Viva** será apresentado em orientação retrato, priorizando leitura rápida e operação com uma mão. A interface segue referências nativas do iOS: hierarquia tipográfica objetiva, cartões com cantos arredondados, ações principais sempre ao alcance do polegar e feedbacks discretos. O escopo é demonstrativo, por isso posições de caminhões, avisos e denúncias serão mantidos no dispositivo e simulados de forma coerente, sem depender de uma operação municipal conectada.

## Paleta e linguagem visual

| Papel | Cor | Aplicação |
| --- | --- | --- |
| Primária | `#A8D5BA` | Áreas suaves, chips neutros e elementos de contexto. |
| Ação | `#7FB69E` | Botões principais, rota ativa e destaques interativos. |
| Fundo | `#F6FBF8` | Fundo principal de todas as telas. |
| Texto | `#2E4A3D` | Títulos, números e textos principais. |
| Atenção | `#F4D9A0` | Pendências, avisos de proximidade e status em espera. |
| Sucesso | `#8FCB9B` | Coletas concluídas e denúncias resolvidas. |

Será usada a tipografia do sistema com pesos e espaçamentos inspirados na Inter, preservando legibilidade e desempenho nativo. Os ícones serão de traço fino, sem preenchimento, e a superfície não usará sombras pesadas: cartões serão diferenciados por bordas leves e contraste de fundo.

## Lista de telas

| Tela | Conteúdo principal | Funções demonstrativas |
| --- | --- | --- |
| Boas-vindas | Proposta de valor, resumo da cobertura e CTA. | Iniciar cadastro ou entrar com conta social simulada. |
| Cadastro | Nome, endereço e telefone em formulário progressivo. | Validar campos e salvar o perfil localmente. |
| Mapa | Mapa ilustrado, casa do morador, caminhões e distância. | Acompanhar caminhões com movimento suave, centralizar a rota e abrir denúncia. |
| Nova denúncia | Imagem, endereço obtido do perfil, descrição e categoria. | Escolher/tirar foto, preencher dados e salvar denúncia local. |
| Minhas denúncias | Lista cronológica de denúncias com miniatura e status. | Abrir detalhes, consultar linha do tempo e criar nova denúncia. |
| Detalhe da denúncia | Foto, localização, status e atualizações de atendimento. | Consultar informações e voltar para a lista. |
| Notificações | Histórico de alertas operacionais e confirmação de coleta. | Marcar alertas como lidos e filtrar mentalmente o estado visual. |
| Perfil | Dados cadastrais, endereço e preferências. | Alterar preferência local de alertas e encerrar a demonstração. |

## Fluxos prioritários

O fluxo principal começa na boas-vindas, segue pelo cadastro simples e leva diretamente ao mapa. No mapa, a pessoa visualiza sua residência, um caminhão em aproximação e a estimativa de distância. Ao tocar na ação de denunciar, a pessoa registra uma foto, descreve o problema e recebe uma confirmação visual; a nova ocorrência passa a aparecer em **Minhas denúncias**.

O fluxo de acompanhamento começa no mapa ou na aba de notificações. A pessoa abre um aviso de aproximação, volta ao mapa e identifica a rota do caminhão em relação à residência. Já o fluxo de acompanhamento de denúncia permite abrir um cartão, examinar a linha do tempo e reconhecer rapidamente se a solicitação está pendente, em andamento ou resolvida.

## Estrutura de navegação

A navegação usa uma pilha para autenticação e formulários, combinada a uma barra inferior de quatro abas: **Mapa**, **Denúncias**, **Avisos** e **Perfil**. A criação e o detalhe de denúncia ficam fora das abas para manter o foco da tarefa. Cada tela terá uma ação de retorno clara e nenhuma ação essencial dependerá apenas de gesto.

## Dados e comportamento do protótipo

As informações de perfil, preferências e denúncias serão persistidas no aparelho. As posições dos caminhões serão geradas localmente em um hook de atualização periódica, reproduzindo o contrato visual de uma conexão em tempo real sem simular uma integração externa inexistente. Permissões de localização, câmera/galeria e notificações serão solicitadas quando a pessoa escolher usar o respectivo recurso, com estados de continuidade caso a permissão não seja concedida.
