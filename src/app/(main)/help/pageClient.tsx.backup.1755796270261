'use client';

import React, { JSX, useState } from 'react';
import {
  FiBook,
  FiVideo,
  FiUser,
  FiUpload,
  FiSearch,
  FiPlay,
  FiMessageCircle,
  FiArrowRight,
  FiBookOpen,
  FiHelpCircle,
  FiHeart,
  FiUserCheck,
  FiFlag,
  FiMail,
  FiTarget,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano, GiScrollQuill } from 'react-icons/gi';
import AnimatedMusicalNotes from '../../components/AnimatedMusicalNotes';
import Link from 'next/link';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
  FloatingElement,
} from '../../components/animation/AnimatedComponents';

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  guides: Guide[];
}

interface Guide {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'interactive';
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
}

const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Primeiros Passos',
    description: 'Aprenda a usar o Opus Atlas desde o início',
    icon: FiPlay,
    color: 'from-green-500 to-blue-500',
    guides: [
      {
        id: 'create-account',
        title: 'Como criar sua conta',
        description:
          'Guia completo para criar e configurar sua conta no Opus Atlas',
        type: 'article',
        duration: '5 min',
        difficulty: 'beginner',
        content: `
# Como criar sua conta no Opus Atlas

## Métodos de Registro

### 1. Registro com Email
- Acesse a página principal do Opus Atlas
- Clique em "Criar Conta" no canto superior direito
- Preencha seu nome, email e senha
- Confirme sua senha
- Clique em "Criar Conta"

### 2. Registro com Google (Recomendado)
- Clique em "Continuar com Google"
- Selecione sua conta Google
- Autorize o acesso ao Opus Atlas
- Sua conta será criada automaticamente

## Verificação de Email
- Após o registro com email, verifique sua caixa de entrada
- Clique no link de verificação (não obrigatório para usar a plataforma)
- A verificação é necessária apenas para fazer uploads

## Primeiros Passos
1. Complete seu perfil no processo de onboarding
2. Escolha seus instrumentos favoritos
3. Selecione compositores e épocas de interesse
4. Configure sua localização (opcional)
5. Adicione um telefone para contato (opcional)

## Dicas Importantes
- Use o Google para login mais rápido
- A verificação de email é opcional, mas recomendada
- Você pode pular o onboarding e completar depois
        `,
      },
      {
        id: 'onboarding-guide',
        title: 'Completando seu perfil musical',
        description: 'Como configurar suas preferências e instrumentos',
        type: 'interactive',
        duration: '8 min',
        difficulty: 'beginner',
        content: `
# Completando seu Perfil Musical

## Processo de Onboarding

### Passo 1: Tipo de Usuário
Escolha entre:
- **Estudante de Música**: Para alunos e autodidatas
- **Usuário Casual**: Para apreciadores de música clássica
- **Profissional**: Para músicos profissionais
- **Professor**: Para educadores musicais

### Passo 2: Instrumentos
- Selecione todos os instrumentos que você toca ou estuda.
- Defina seu nível para cada instrumento (Iniciante, Intermediário, Avançado)
- Marque seu instrumento principal
- Adicione instrumentos que está aprendendo

### Passo 3: Preferências Musicais
- **Compositores Favoritos**: Escolha até 1 compositor
- **Épocas Musicais**: Selecione período de maior interesse (Barroco, Clássico, Romântico, etc.)
- **Gêneros**: Defina tipos de obra preferidos

### Passo 4: Perfil Pessoal
- **Localização**: País, estado/província, cidade (opcional)
- **Telefone**: Adicione um número para contato (opcional)
- **Bio**: Escreva uma breve descrição sobre você (opcional)

### Passo 5: Configurações de Privacidade
- Defina se seu perfil será público
- Escolha se deseja mostrar sua localização
- Configure preferências de contato

## Completando Depois
- Você pode pular o onboarding a qualquer momento
- Acesse "Configurações" > "Perfil" para completar depois
- Algumas funcionalidades podem ter limitações até completar o perfil
        `,
      },
      {
        id: 'first-navigation',
        title: 'Navegando pela plataforma',
        description: 'Conheça as principais seções e como navegar',
        type: 'article',
        duration: '6 min',
        difficulty: 'beginner',
        content: `
# Navegando pela Plataforma

## Menu Principal
- **Início**: Página inicial com destaques e recomendações
- **História da Música**: História e evolução da música que conhecemos hoje
- **Instrumentos**: História e características dos instrumentos
- **Compositores**: Enciclopédia de compositores clássicos
- **Obras**: Catálogo completo de peças musicais
- **Quem somos**: Conheça nossa história e nossa missão

## Barra de Busca
- Localizada no topo das paginas de peças e compositores
- Busca global por compositores e obras
- Use filtros para refinar resultados

## Perfil do Usuário
- Acesse clicando na sua foto/avatar
- **Meu Perfil**: Informações pessoais e musicais
- **Favoritos**: Suas obras, compositores e partituras favoritas
- **Lições**: Lista de obras que deseja estudar e que ja estudou.
- **Anotações**: Lista de anotações feitas nas peças estudadas
- **Uploads**: Conteúdo que você contribuiu (apenas usuários verificados)

## Navegação Mobile
- Menu hambúrguer (três linhas) para acessar seções
- Busca otimizada para touch
- Todas as funcionalidades disponíveis
- Interface responsiva e intuitiva
        `,
      },
    ],
  },
  {
    id: 'search-explore',
    title: 'Busca e Exploração',
    description: 'Encontre compositores, obras e partituras facilmente',
    icon: FiSearch,
    color: 'from-blue-500 to-purple-500',
    guides: [
      {
        id: 'search-composers',
        title: 'Buscando compositores',
        description: 'Como encontrar compositores por nome e período',
        type: 'article',
        duration: '5 min',
        difficulty: 'beginner',
        content: `
# Buscando Compositores

## Tipos de Busca

### Por Nome
- Digite o nome completo ou parcial do compositor
- Exemplos: "Bach", "Ludwig van Beethoven", "Chopin"
- A busca inclui nomes alternativos e transliterações
- Resultados ordenados por relevância

### Por Período Musical
Use os filtros por época:
- **Barroco** (1600-1750): Bach, Vivaldi, Handel
- **Clássico** (1750-1820): Mozart, Haydn, Beethoven inicial
- **Romântico** (1820-1900): Chopin, Liszt, Brahms
- **Impressionista** (1870-1920): Debussy, Ravel
- **Moderno** (1900+): Stravinsky, Bartók


## Dicas de Busca
- Use aspas para busca exata: "Johann Sebastian Bach"
- Combine filtros para resultados precisos
        `,
      },
      {
        id: 'search-works',
        title: 'Descobrindo obras musicais',
        description: 'Busca avançada por obras usando múltiplos critérios',
        type: 'article',
        duration: '8 min',
        difficulty: 'intermediate',
        content: `
# Descobrindo Obras Musicais

## Critérios de Busca

### Por Nome da Obra
- Digite títulos completos ou parciais
- Exemplos: "Moonlight Sonata", "Für Elise", "Symphony No. 9"
- Inclui títulos em diferentes idiomas
- Busca por números de opus (Op. 27 No. 2)

### Por Compositor
- Filtre por compositor específico
- Combine com outros filtros
- Veja todas as obras de um autor
- Explore cronologicamente

### Por Período Musical
- **Barroco**: Formas como fuga, suíte, concerto grosso
- **Clássico**: Sonatas, sinfonias, quartetos
- **Romântico**: Baladas, noturnos, études
- **Moderno**: Experimentações e novas formas

### Por Instrumento
Encontre obras para:
- **Piano**: Solo, duo, com orquestra
- **Violino**: Solo, sonatas, concertos
- **Orquestra**: Sinfonias, ouverturas, poemas sinfônicos
- **Coro**: Missas, réquiens, cantatas
- **Câmara**: Quartetos, quintetos, trios

### Por Gênero Musical
- **Sonata**: Forma clássica em múltiplos movimentos
- **Concerto**: Instrumento solista com orquestra
- **Sinfonia**: Obra orquestral em grande escala
- **Ópera**: Drama musical cantado
- **Balada**: Peça narrativa e expressiva
- **Estudo**: Obra técnica para desenvolvimento
- **Noturno**: Peça lírica e melancólica
- **Valsa**: Dança em compasso ternário

## Combinando Filtros
Exemplos de buscas eficazes:
- "Piano + Chopin + Romântico + Balada"
- "Violino + Bach + Barroco + Sonata"
- "Orquestra + Beethoven + Clássico + Sinfonia"


## Dicas Avançadas
- Use o número de catálogo: "BWV 1007", "K. 331"
- Busque por dedications: "Para Elise"
- Explore obras do mesmo período
- Verifique obras relacionadas na página de cada peça
        `,
      },
      //       {
      //         id: 'discover-features',
      //         title: 'Recursos de descoberta',
      //         description: 'Como usar recomendações e explorar novo repertório',
      //         type: 'interactive',
      //         duration: '6 min',
      //         difficulty: 'intermediate',
      //         content: `
      // # Recursos de Descoberta

      // ## Recomendações Personalizadas
      // - **Baseadas em Favoritos**: Obras similares às suas preferidas
      // - **Por Instrumento**: Sugestões para seus instrumentos
      // - **Por Nível**: Adequadas ao seu nível de experiência
      // - **Tendências**: Obras populares na comunidade

      // ## Exploração por Categoria
      // ### Páginas de Compositores
      // - **Obras Populares**: Mais acessadas do compositor
      // - **Por Período**: Cronologia da produção
      // - **Por Instrumento**: Filtragem específica
      // - **Obras Relacionadas**: Compositores similares

      // ### Páginas de Obras
      // - **Mesmo Gênero**: Outras sonatas, concertos, etc.
      // - **Mesmo Compositor**: Catálogo completo
      // - **Dificuldade Similar**: Para seu nível
      // - **Época Similar**: Contexto histórico

      // ## Listas Curadas
      // - **Obras Essenciais**: Repertório fundamental
      // - **Para Iniciantes**: Peças acessíveis
      // - **Desafios Técnicos**: Para músicos avançados
      // - **Joias Escondidas**: Obras menos conhecidas

      // ## Sistema de Tags
      // - **Técnica**: #dedilhado #escalas #arpejos
      // - **Expressão**: #melancólico #heroico #pastoral
      // - **Dificuldade**: #iniciante #virtuosístico
      // - **Contexto**: #romântico #impressionista #nacional

      // ## Navegação Inteligente
      // - **Obras Relacionadas**: Links automáticos
      // - **Compositores Similares**: Mesmo estilo/época
      // - **Progressão de Dificuldade**: Caminho de aprendizado
      // - **Contexto Histórico**: Influências e contemporâneos
      //         `,
      //       },
    ],
  },
  {
    id: 'student-mode',
    title: 'Modo Aluno',
    description: 'Sistema de ensino com professores qualificados',
    icon: FiUserCheck,
    color: 'from-purple-500 to-pink-500',
    guides: [
      {
        id: 'student-access',
        title: 'Como acessar o modo aluno',
        description:
          'Processo para professores e alunos acessarem a plataforma educacional',
        type: 'article',
        duration: '7 min',
        difficulty: 'beginner',
        content: `
# Como Acessar o Modo Aluno

## Para Professores

### 1. Solicitação de Acesso
- Entre em contato com nossa moderação através do formulário de contato
- Informe sua qualificação e experiência como professor
- Envie documentos comprobatórios (diploma, certificados)
- Aguarde análise da equipe (até 7 dias úteis)

### 2. Aprovação e Convite
- Receba email de aprovação da moderação
- Clique no link de convite recebido
- Complete seu perfil de professor
- Configure suas especialidades e instrumentos

### 3. Configuração do Perfil Professor
- **Especialidades**: Instrumentos que ensina
- **Experiência**: Anos de ensino e formação
- **Metodologia**: Descrição do seu método de ensino
- **Disponibilidade**: Horários para aulas
- **Localização**: Para aulas presenciais (opcional)

## Para Alunos

### 1. Convite do Professor
- Professores aprovados podem convidar usuários cadastrados
- Receba convite por email ou através da plataforma
- O convite inclui informações sobre o professor
- Você pode aceitar ou recusar o convite

### 2. Aceitando o Convite
- Clique em "Aceitar Convite" no email recebido
- Ou acesse através das notificações na plataforma
- Confirme que deseja estudar com o professor
- Seu acesso ao modo aluno será ativado automaticamente

### 3. Primeiro Acesso
- Nova seção "Modo Aluno" aparecerá no menu
- Acesse ferramentas exclusivas de estudo
- Visualize calendário de aulas
- Veja tarefas e atividades do professor

## Requisitos
- **Para Professores**: Qualificação comprovada em ensino musical
- **Para Alunos**: Apenas ter conta ativa no Opus Atlas
- **Ambos**: Aceitar termos específicos do modo educacional
        `,
      },
      {
        id: 'student-tools',
        title: 'Ferramentas de estudo com professor',
        description: 'Como usar calendário, tarefas e recursos educacionais',
        type: 'interactive',
        duration: '10 min',
        difficulty: 'intermediate',
        content: `
# Ferramentas de Estudo com Professor

## Calendário de Aulas

### Visualização
- **Vista Mensal**: Panorama geral das aulas
- **Vista Semanal**: Detalhes da semana
- **Vista Diária**: Foco nas atividades do dia
- **Próximas Aulas**: Lista das próximas sessões

### Funcionalidades
- **Agendamento**: Professor define horários
- **Confirmação**: Aluno confirma presença
- **Reagendamento**: Solicitação de mudança de horário
- **Anotações**: Notas sobre cada aula
- **Histórico**: Registro de aulas anteriores

## Sistema de Tarefas

### Tipos de Tarefas
- **Prática**: Obras específicas para estudar
- **Teoria**: Exercícios de teoria musical
- **Técnica**: Estudos técnicos e escalas
- **Escuta**: Audição de gravações específicas
- **Composição**: Exercícios criativos

### Gestão de Tarefas
- **Status**: Pendente, em progresso, concluída
- **Prioridade**: Alta, média, baixa
- **Prazo**: Data limite para conclusão
- **Progresso**: Percentual de conclusão
- **Feedback**: Comentários do professor

## Recursos de Comunicação

### Mensagens
- **Chat Direto**: Comunicação em tempo real
- **Anexos**: Envio de áudios e arquivos
- **Histórico**: Conversa sempre disponível
- **Notificações**: Alertas de novas mensagens

### Anotações Compartilhadas
- **Nas Obras**: Professor deixa dicas específicas
- **Progresso**: Registro de evolução
- **Dificuldades**: Identificação de pontos fracos
- **Conquistas**: Celebração de progressos

## Relatórios de Progresso

### Para o Aluno
- **Evolução Técnica**: Gráficos de desenvolvimento
- **Obras Estudadas**: Histórico de repertório
- **Tempo de Prática**: Registro de estudo
- **Objetivos**: Metas alcançadas e pendentes

### Para o Professor
- **Frequência**: Assiduidade às aulas
- **Engajamento**: Participação em atividades
- **Progresso**: Evolução em diferentes aspectos
- **Relatórios**: Geração de documentos de acompanhamento

## Configurações Específicas

### Preferências de Estudo
- **Horários Favoritos**: Quando prefere estudar
- **Dificuldades**: Áreas que precisa melhorar
- **Objetivos**: Metas de curto e longo prazo
- **Instrumentos**: Foco de estudo atual

### Privacidade
- **Visibilidade**: Quem pode ver seu progresso
- **Compartilhamento**: O que mostrar publicamente
- **Comunicação**: Como ser contatado
- **Dados**: Controle de informações pessoais
        `,
      },
      {
        id: 'teacher-student-workflow',
        title: 'Fluxo professor-aluno',
        description: 'Como funciona a dinâmica de ensino na plataforma',
        type: 'article',
        duration: '8 min',
        difficulty: 'intermediate',
        content: `
# Fluxo Professor-Aluno

## Ciclo de Aulas

### 1. Planejamento (Professor)
- Define objetivos da aula
- Seleciona repertório e materiais
- Prepara exercícios específicos
- Agenda horário no calendário

### 2. Preparação (Aluno)
- Recebe notificação da aula agendada
- Revisa tarefas da aula anterior
- Pratica repertório solicitado
- Prepara dúvidas e questões

### 3. Aula (Ambos)
- Professor registra presença
- Conteúdo da aula é documentado
- Feedback imediato é dado
- Próximas metas são definidas

### 4. Pós-Aula (Professor)
- Registra resumo da aula
- Define tarefas para próxima semana
- Atualiza progresso do aluno
- Agenda próxima sessão

### 5. Prática (Aluno)
- Executa tarefas propostas
- Registra tempo de estudo
- Documenta dificuldades
- Solicita esclarecimentos se necessário

## Gestão de Repertório

### Seleção de Obras
- **Professor**: Escolhe obras adequadas ao nível
- **Aluno**: Pode sugerir peças de interesse
- **Plataforma**: Oferece sugestões baseadas no progresso
- **Progressão**: Caminho lógico de dificuldade

### Acompanhamento
- **Partituras**: Acesso direto através da plataforma
- **Anotações**: Professor marca pontos importantes
- **Gravações**: Exemplos e referências
- **Progresso**: Evolução em cada obra

## Sistema de Avaliação

### Critérios
- **Técnica**: Precisão, velocidade, articulação
- **Interpretação**: Expressão, fraseado, estilo
- **Musicalidade**: Sensibilidade, criatividade
- **Progresso**: Evolução ao longo do tempo

### Ferramentas
- **Notas**: Sistema de pontuação personalizado
- **Comentários**: Feedback detalhado
- **Áudio**: Gravações de progresso
- **Metas**: Objetivos específicos e mensuráveis

## Comunicação Efetiva

### Canais
- **Aulas**: Comunicação principal durante sessões
- **Chat**: Mensagens rápidas e dúvidas
- **Email**: Comunicados importantes
- **Plataforma**: Notificações e atualizações

### Boas Práticas
- **Clareza**: Instruções específicas e objetivas
- **Frequência**: Comunicação regular e consistente
- **Feedback**: Retorno construtivo e encorajador
- **Paciência**: Respeito ao ritmo individual

## Resolução de Conflitos

### Procedimentos
1. **Diálogo Direto**: Primeiro contato entre professor e aluno
2. **Mediação**: Intervenção da moderação se necessário
3. **Revisão**: Análise do histórico de interações
4. **Solução**: Implementação de acordo mútuo
5. **Acompanhamento**: Monitoramento da situação

### Contato com Moderação
- Use o formulário "Reportar Problema"
- Descreva a situação objetivamente
- Forneça evidências se necessário
- Aguarde resposta em até 48 horas
        `,
      },
    ],
  },
  {
    id: 'uploads',
    title: 'Sistema de Uploads',
    description: 'Contribua com compositores, obras e partituras',
    icon: FiUpload,
    color: 'from-orange-500 to-red-500',
    guides: [
      {
        id: 'upload-composer',
        title: 'Adicionando compositores',
        description: 'Como adicionar novos compositores usando dados do IMSLP',
        type: 'article',
        duration: '12 min',
        difficulty: 'intermediate',
        content: `
# Adicionando Compositores

## Requisitos
- Conta verificada no Opus Atlas
- Email confirmado

## Processo de Upload

### 1. Acessando o Sistema
- Vá para "Meus Uploads" no menu
- Clique em "Novo Compositor"
- Aceite as diretrizes de contribuição

### 2. Extração Automática do IMSLP

#### Usando Link do IMSLP
- Cole o link da página do compositor no IMSLP
- Exemplo: \`https://imslp.org/wiki/Category:Bach,_Johann_Sebastian\`
- Clique em "Extrair Informações"
- Aguarde o processamento automático

#### Dados Extraídos Automaticamente
- **Nome Completo**: Nome oficial do compositor
- **Nomes Alternativos**: Transliterações e variações
- **Datas**: Nascimento e morte (quando disponíveis)
- **Biografia**: Informações básicas
- **Retrato**: Imagem oficial se disponível
- **Nacionalidade**: País de origem
- **Período Musical**: Classificação por época
- **Categorias**: Tags e classificações do IMSLP

### 3. Preenchimento Manual

#### Informações Obrigatórias
- **Nome**: Nome principal do compositor
- **Nome Completo**: Nome oficial completo
- **Época Musical**: Período histórico
- **Função Principal**: Compositor, libretista, arranjador, etc.

#### Informações Opcionais
- **Biografia**: Descrição da vida e obra
- **Retrato**: Upload de imagem (se não extraída)
- **Data de Nascimento**: Formato livre
- **Data de Morte**: Formato livre
- **Nacionalidade**: País de origem
- **Instrumentos**: Instrumentos associados

### 4. Verificação e Submissão
- Revise todas as informações
- Adicione fontes e referências
- Confirme que o compositor não existe na base
- Envie para moderação

## Diretrizes de Qualidade

### Informações Confiáveis
- Use apenas fontes verificadas
- Priorize dados do IMSLP e Wikipedia
- Evite informações controversas
- Cite fontes quando necessário

### Biografias
- Máximo 2000 caracteres
- Foque em aspectos musicais relevantes
- Use linguagem clara e objetiva
- Evite cópias literais de outras fontes

### Imagens
- Formato JPG ou PNG
- Resolução mínima 300x300px
- Imagens de domínio público
- Retratos oficiais ou históricos

## Processo de Moderação

### Análise Inicial (24-48h)
- Verificação de duplicatas
- Validação de fontes
- Checagem de informações básicas
- Aprovação ou solicitação de correções

### Revisão Detalhada (3-7 dias)
- Verificação biográfica completa
- Validação de datas e fatos
- Checagem de direitos de imagem
- Classificação final de qualidade

### Resultado
- **Aprovado**: Compositor publicado na plataforma
- **Correções**: Lista de ajustes necessários
- **Rejeitado**: Motivos específicos fornecidos
- **Duplicata**: Referência ao compositor existente

## Dicas para Aprovação Rápida
- Use sempre o link do IMSLP quando disponível
- Verifique duplicatas antes de enviar
- Forneça biografias completas e precisas
- Use imagens de alta qualidade
- Cite fontes para informações controversas
        `,
      },
      {
        id: 'upload-work',
        title: 'Cadastrando obras musicais',
        description: 'Como adicionar peças musicais com dados do IMSLP',
        type: 'article',
        duration: '15 min',
        difficulty: 'advanced',
        content: `
# Cadastrando Obras Musicais

## Preparação

### Requisitos
- Compositor já cadastrado na plataforma
- Link da obra no IMSLP (recomendado)
- Informações básicas da obra
- Conta verificada

### Pesquisa Prévia
- Verifique se a obra já existe
- Use busca por título e compositor
- Verifique variações de nomes
- Confirme números de opus/catálogo

## Processo de Cadastro

### 1. Extração do IMSLP

#### Link da Obra
- Cole o link específico da obra no IMSLP
- Exemplo: \`https://imslp.org/wiki/Piano_Sonata_No.14_(Beethoven,_Ludwig_van)\`
- Sistema extrai automaticamente os dados
- Valide informações extraídas

#### Dados Extraídos
- **Título**: Nome oficial da obra
- **Subtítulo**: Nome popular (ex: "Moonlight Sonata")
- **Opus/Catálogo**: Numeração oficial
- **Ano de Composição**: Quando disponível
- **Instrumentação**: Formação instrumental
- **Movimentos**: Estrutura da obra
- **Tonalidade**: Tom principal
- **Duração**: Tempo aproximado
- **Categorias**: Classificações e tags

### 2. Informações Obrigatórias

#### Básicas
- **Título**: Nome principal da obra
- **Compositor**: Seleção do compositor cadastrado
- **Instrumento Principal**: Foco instrumental
- **Época Musical**: Período da composição

#### Classificação
- **Tipo de Obra**: Sonata, concerto, sinfonia, etc.
- **Gênero Musical**: Classificação específica
- **Nível de Dificuldade**: Iniciante, intermediário, avançado
- **Link IMSLP**: URL de referência

### 3. Informações Complementares

#### Técnicas
- **Opus/Catálogo**: Numeração oficial
- **Ano de Composição**: Data ou período
- **Primeira Publicação**: Quando foi publicada
- **Tonalidade**: Tom principal da obra
- **Duração**: Tempo aproximado de execução

#### Estruturais
- **Movimentos**: Lista dos movimentos
- **Instrumentação**: Formação completa
- **Dedicatória**: A quem foi dedicada
- **Estilo Musical**: Características estilísticas

#### Contextuais
- **Categorias**: Tags do IMSLP
- **Gêneros**: Classificações adicionais
- **Observações**: Informações especiais

## Validação de Dados

### Checagem Automática
- **Duplicatas**: Verificação por título e compositor
- **Formato**: Validação de campos obrigatórios
- **Links**: Teste de URLs fornecidas
- **Consistência**: Cruzamento de informações

### Revisão Manual
- Confirme dados extraídos do IMSLP
- Verifique se o compositor está correto
- Valide informações técnicas
- Confira ortografia e formatação

## Partituras Associadas

### Importação Automática
- Sistema detecta partituras disponíveis no IMSLP
- Lista partituras encontradas
- Permite seleção para importação
- Processa automaticamente tipos (partitura completa, partes, arranjos)

### Informações das Partituras
- **Tipo**: Partitura completa, partes separadas, arranjos
- **Editor**: Quem editou a partitura
- **Publicador**: Casa publicadora
- **Ano**: Data da edição
- **Qualidade**: Avaliação da digitalização
- **Formato**: PDF, outros formatos

## Moderação Especializada

### Primeira Análise (48h)
- Verificação de duplicatas
- Validação de dados básicos
- Checagem de links IMSLP
- Aprovação preliminar

### Revisão Musical (5-7 dias)
- Validação por moderadores especializados
- Verificação de informações técnicas
- Confirmação de dados históricos
- Classificação de qualidade final

### Critérios de Qualidade
- **Completude**: Todas as informações relevantes
- **Precisão**: Dados corretos e verificáveis
- **Formatação**: Seguimento dos padrões
- **Fontes**: Referências confiáveis

## Dicas Avançadas

### Para Obras Complexas
- Divida óperas por atos se necessário
- Especifique versões diferentes
- Indique arranjos e transcrições
- Documente variações de instrumentação

### Para Obras Raras
- Forneça fontes adicionais além do IMSLP
- Inclua informações de manuscritos
- Especifique edições utilizadas
- Adicione contexto histórico relevante

### Para Máxima Aprovação
- Use sempre links do IMSLP quando disponível
- Preencha todos os campos possíveis
- Verifique ortografia e acentuação
- Forneça descrições claras e objetivas
- Cite fontes para informações especiais
        `,
      },
      {
        id: 'upload-scores',
        title: 'Upload de partituras',
        description: 'Como contribuir com partituras de qualidade',
        type: 'article',
        duration: '10 min',
        difficulty: 'intermediate',
        content: `
# Upload de Partituras

## Requisitos Legais

### Domínio Público
- Apenas partituras de domínio público
- Compositores mortos há mais de 70 anos
- Edições sem direitos autorais
- Verificação obrigatória antes do upload

### Direitos de Edição
- Editores podem ter direitos sobre layout
- Priorize edições antigas e livres
- Use edições do IMSLP quando possível
- Evite edições comerciais modernas

## Formatos Aceitos

### Arquivos Suportados
- **PDF**: Formato preferencial
- **JPG/PNG**: Para páginas individuais
- **Tamanho Máximo**: 50MB por arquivo
- **Resolução**: Mínimo 300 DPI

### Qualidade Requerida
- **Legibilidade**: Notas e textos claros
- **Orientação**: Páginas alinhadas corretamente
- **Completude**: Obra completa sem páginas faltando
- **Limpeza**: Sem anotações pessoais

## Processo de Upload

### 1. Seleção da Obra
- Busque a obra na plataforma
- Verifique se partituras já existem
- Confirme que a obra está cadastrada
- Acesse seção "Adicionar Partitura"

### 2. Informações da Partitura
- **Título**: Nome específico da partitura
- **Tipo**: Partitura completa, partes, arranjo
- **Editor**: Pessoa ou casa que editou
- **Ano de Edição**: Quando foi publicada
- **Fonte**: De onde obteve a partitura
- **Observações**: Informações especiais

### 3. Upload do Arquivo
- Selecione arquivo do computador
- Aguarde processamento e verificação
- Visualize preview gerado
- Confirme que está correto

### 4. Metadados Adicionais
- **Número de Páginas**: Contagem automática
- **Tonalidade**: Se diferente da obra principal
- **Arranjo**: Se é transcrição ou adaptação
- **Instrumentação**: Se diferente do original
- **Dedicatória**: Informações da edição específica

## Categorização

### Tipos de Partitura
- **Partitura Completa**: Obra completa em um arquivo
- **Partes Separadas**: Instrumentos individuais
- **Arranjos**: Adaptações para outras formações
- **Reduções**: Versões simplificadas
- **Estudos**: Versões para estudo específico

### Qualidade de Digitalização
- **Excelente**: Scan profissional, muito legível
- **Boa**: Qualidade adequada para estudo
- **Regular**: Legível mas com imperfeições
- **Ruim**: Problemas de legibilidade (será rejeitada)

## Moderação de Partituras

### Verificação Automática
- **Formato**: Compatibilidade do arquivo
- **Tamanho**: Dentro dos limites
- **Vírus**: Scan de segurança
- **Duplicação**: Verificação de existência

### Revisão Manual (24-48h)
- **Legalidade**: Verificação de direitos
- **Qualidade**: Avaliação de legibilidade
- **Completude**: Verificação de páginas
- **Correspondência**: Confirmação com a obra

### Critérios de Aprovação
- **Legibilidade**: Todas as notas visíveis
- **Completude**: Obra completa
- **Qualidade**: Adequada para estudo
- **Legalidade**: Domínio público confirmado

## Dicas para Aprovação

### Preparação do Arquivo
- Use scanner de alta qualidade
- Mantenha páginas alinhadas
- Remova anotações pessoais
- Certifique-se da completude

### Informações Precisas
- Verifique editor e ano
- Confirme tipo de partitura
- Adicione observações relevantes
- Cite fonte quando necessário

### Evite Rejeições
- Não envie edições comerciais modernas
- Verifique duplicatas antes de enviar
- Mantenha qualidade mínima de digitalização
- Respeite direitos autorais rigorosamente

## Contribuição Especial

### Partituras Raras
- Manuscritos históricos
- Primeiras edições importantes
- Obras pouco disponíveis
- Edições críticas antigas

### Reconhecimento
- Crédito como contribuidor
- Pontuação de reputação
- Menção em página da obra
- Agradecimento da comunidade

### Responsabilidade
- Verificação rigorosa de direitos
- Qualidade excepcional exigida
- Documentação detalhada
- Revisão especializada necessária
        `,
      },
    ],
  },
  {
    id: 'favorites',
    title: 'Sistema de Favoritos',
    description: 'Organize suas preferências musicais com o nosso sistema.',
    icon: FiHeart,
    color: 'from-pink-500 to-red-500',
    guides: [
      {
        id: 'favorite-composers',
        title: 'Favoritando compositores',
        description: 'Como organizar seus compositores preferidos',
        type: 'article',
        duration: '5 min',
        difficulty: 'beginner',
        content: `
# Favoritando Compositores

## Como Favoritar

### Nas Páginas de Compositores
- Acesse a página de qualquer compositor
- Clique no ícone de coração no canto superior direito
- O coração fica preenchido quando adicionado aos favoritos
- Clique novamente para remover dos favoritos

### Nas Listas de Resultados
- Cada compositor tem um ícone de coração pequeno
- Clique para adicionar/remover diretamente da lista
- Feedback visual imediato
- Não precisa acessar a página completa

## Gerenciando Favoritos

### Acessando Sua Lista
- Vá para "Meu Perfil" > "Compositores Favoritos"
- Ou use o menu "Meus Favoritos"
- Lista todos os compositores favoritados


## Funcionalidades Especiais

### Recomendações Baseadas
- Sistema analisa seus compositores favoritos
- Sugere compositores similares
- Considera época, estilo e instrumentação
- Descubra novos compositores do seu interesse


### Estatísticas Pessoais
- Época musical preferida
- Nacionalidades mais favoritadas
- Evolução de gostos ao longo do tempo
- Comparação com outros usuários

## Perfil Público

### Compartilhamento
- Escolha se quer mostrar favoritos no perfil público
- Outros usuários podem ver seus gostos musicais
- Encontre pessoas com preferências similares
- Sistema de recomendações sociais

### Privacidade
- Configure visibilidade individual
- Mantenha alguns favoritos privados
- Controle total sobre o que compartilhar
- Opção de perfil completamente privado

## Dicas Avançadas

### Construindo uma Coleção
- Comece com compositores que você já conhece
- Explore épocas menos familiares
- Use as recomendações para descobrir novos
- Considere compositores de diferentes nacionalidades

### Aprendizado Progressivo
- Favorite compositores de dificuldades variadas
- Use como guia para seus estudos
- Acompanhe evolução dos seus gostos
- Compartilhe descobertas com a comunidade
        `,
      },
      {
        id: 'favorite-works',
        title: 'Organizando obras favoritas',
        description: 'Como gerenciar sua coleção de peças musicais preferidas',
        type: 'article',
        duration: '7 min',
        difficulty: 'beginner',
        content: `
# Organizando Obras Favoritas

## Adicionando às Favoritas

### Método Direto
- Na página de qualquer obra, clique no coração
- Feedback visual imediato
- Obra adicionada automaticamente à sua lista
- Sincronização instantânea entre dispositivos

### Durante a Navegação
- Favorite diretamente dos resultados de busca
- Use o coração nas listas de obras por compositor
- Adicione múltiplas obras rapidamente
- Marque descobertas interessantes para depois

## Organização Inteligente

### Filtros Automáticos
- **Por Instrumento**: Separe por piano, violino, orquestra, etc.
- **Por Dificuldade**: Iniciante, intermediário, avançado
- **Por Época**: Organize cronologicamente
- **Por Compositor**: Agrupe por autor
- **Por Gênero**: Sonatas, concertos, sinfonias, etc.

### Listas Personalizadas
- **Em Estudo**: Obras que está praticando atualmente
- **Para Aprender**: Futuras metas de estudo
- **Dominadas**: Peças que já conhece bem
- **Inspiração**: Obras para escutar e se inspirar
- **Recital**: Programa para apresentações

## Funcionalidades Avançadas

### Sistema de Notas
- Adicione comentários pessoais a cada obra
- Registre dificuldades específicas
- Anote interpretações interessantes
- Marque trechos favoritos

### Avaliação Pessoal
- Dê notas de 1 a 5 estrelas
- Registre seu nível de afinidade
- Acompanhe mudanças de opinião ao longo do tempo
- Use como referência para recomendações

### Progresso de Estudo
- Marque obras como "estudando"
- Registre tempo dedicado a cada peça
- Acompanhe evolução técnica
- Celebre conquistas musicais

## Integração com Aprendizado

### Lista "Quero Aprender"
- Favorite obras que deseja estudar
- Adicione automaticamente à lista de metas
- Receba lembretes personalizados
- Plane seu percurso de aprendizado

### Sugestões de Partituras
- Sistema recomenda partituras específicas
- Considera suas obras favoritas
- Sugere edições adequadas ao seu nível
- Facilita acesso aos materiais de estudo

## Compartilhamento Social

### Perfil Público
- Mostre suas obras favoritas para outros usuários
- Inspire outros músicos com suas escolhas
- Descubra obras através de perfis similares
- Construa rede de contatos musicais

### Recomendações Mútuas
- Receba sugestões baseadas em usuários similares
- Descubra obras populares na sua faixa de interesse
- Participe de discussões sobre repertório
- Contribua com a comunidade musical

## Estratégias de Uso

### Para Estudantes
- Organize por nível de dificuldade crescente
- Separe obras técnicas de expressivas
- Mantenha lista de "próximas metas"
- Use como currículo pessoal

### Para Professores
- Crie listas por níveis de ensino
- Organize repertório por objetivos pedagógicos
- Mantenha obras para diferentes perfis de alunos
- Use como banco de material didático

### Para Apreciadores
- Agrupe por humor ou ocasião
- Separe para escuta ativa ou background
- Organize por períodos históricos
- Crie playlists temáticas

## Manutenção da Lista

### Revisão Periódica
- Remova obras que não interessam mais
- Atualize avaliações com nova perspectiva
- Reorganize categorias conforme evolução
- Mantenha lista atual e relevante

### Backup e Sincronização
- Favoritos salvos automaticamente na nuvem
- Acesso através de qualquer dispositivo
- Histórico de mudanças preservado
- Recuperação em caso de problemas
        `,
      },
      {
        id: 'favorite-scores',
        title: 'Selecionando partituras específicas',
        description:
          'Como escolher e favoritar versões específicas de partituras',
        type: 'interactive',
        duration: '8 min',
        difficulty: 'intermediate',
        content: `
# Selecionando Partituras Específicas

## Entendendo Múltiplas Versões

### Tipos de Partituras
- **Partitura Completa**: Obra inteira em um arquivo
- **Partes Separadas**: Instrumentos individuais
- **Arranjos**: Adaptações para outras formações
- **Edições Diferentes**: Variações de editores
- **Versões Simplificadas**: Para diferentes níveis

### Critérios de Escolha
- **Qualidade da Digitalização**: Clareza e legibilidade
- **Editor**: Reputação e confiabilidade
- **Época da Edição**: Proximidade com o original
- **Adequação ao Nível**: Compatível com sua habilidade
- **Completude**: Todas as páginas presentes

## Sistema de Favoritos Específicos

### Processo de Seleção
1. Acesse a página da obra desejada
2. Navegue pela seção "Partituras Disponíveis"
3. Compare diferentes versões disponíveis
4. Clique no coração da partitura específica
5. Adicione comentário sobre por que escolheu essa versão

### Informações Detalhadas
Para cada partitura, você encontra:
- **Editor/Fonte**: Quem preparou a edição
- **Ano de Publicação**: Quando foi editada
- **Tipo**: Completa, partes, arranjo
- **Qualidade**: Avaliação da comunidade
- **Páginas**: Número total de páginas
- **Tamanho do Arquivo**: Para download
- **Popularidade**: Quantos usuários favoritaram

## Comparação de Versões

### Ferramentas de Análise
- **Preview**: Visualização de páginas sample
- **Comentários da Comunidade**: Opiniões de outros usuários
- **Avaliações**: Sistema de estrelas
- **Adequação por Nível**: Recomendações específicas

### Fatores de Decisão
- **Finalidade**: Estudo, performance, análise
- **Instrumento**: Adaptações específicas
- **Nível Técnico**: Complexidade da edição
- **Preferências Pessoais**: Estilo de notação

## Organizando Partituras Favoritas

### Categorização Automática
- **Por Obra**: Agrupadas sob cada composição
- **Por Editor**: Preferências de edição
- **Por Tipo**: Completas vs. partes vs. arranjos
- **Por Qualidade**: Excelente, boa, adequada

### Tags Personalizadas
- **#estudo**: Para prática pessoal
- **#performance**: Para apresentações
- **#análise**: Para estudo teórico
- **#ensino**: Para usar com alunos
- **#backup**: Versões alternativas

## Funcionalidades Especiais

### Comparação Lado a Lado
- Visualize diferentes edições simultaneamente
- Compare diferenças de interpretação
- Identifique variações textuais
- Escolha baseada em evidências visuais

### Histórico de Preferências
- Acompanhe evolução de suas escolhas
- Veja padrões de preferência por editores
- Identifique tipos de edição favoritos
- Use para futuras decisões

### Recomendações Inteligentes
- Sistema sugere partituras baseadas em seus favoritos
- Considera editores de sua preferência
- Leva em conta seu nível e instrumentos
- Aprende com suas escolhas anteriores

## Casos de Uso Específicos

### Para Estudo Pessoal
- Priorize clareza e legibilidade
- Escolha edições com dedilhados
- Considere marcações pedagógicas
- Verifique completude da obra

### Para Performance
- Busque edições críticas respeitáveis
- Verifique autenticidade histórica
- Considere tradições interpretativas
- Avalie qualidade de impressão

### Para Ensino
- Selecione edições com marcações didáticas
- Considere adequação ao nível do aluno
- Busque versões com exercícios preparatórios
- Verifique disponibilidade de partes separadas

### Para Pesquisa
- Priorize primeiras edições
- Compare versões históricas
- Considere manuscritos quando disponíveis
- Documente diferenças entre edições
        `,
      },
    ],
  },
  {
    id: 'learning-system',
    title: 'Quero Aprender / Já Aprendi',
    description: 'Organize seu progresso musical com nossas listas.',
    icon: FiTarget,
    color: 'from-green-500 to-teal-500',
    guides: [
      {
        id: 'want-to-learn',
        title: 'Lista "Quero Aprender"',
        description: 'Como organizar suas metas musicais',
        type: 'article',
        duration: '6 min',
        difficulty: 'beginner',
        content: `
# Lista "Quero Aprender"

## Adicionando Obras à Lista

### Método Direto
- Na página de qualquer obra, clique em "Quero Aprender"
- Escolha a partitura específica que pretende estudar
- Defina prioridade (Alta, Média, Baixa)
- Adicione notas pessoais sobre motivação

### Durante Navegação
- Use o botão "+" nas listas de obras
- Adicione rapidamente durante descobertas
- Marque obras interessantes para revisar depois
- Favorite automaticamente ao adicionar

## Organizando Suas Metas

### Sistema de Prioridades
- **Alta Prioridade**: Obras para estudar imediatamente
- **Média Prioridade**: Metas de médio prazo
- **Baixa Prioridade**: Aspirações futuras
- **Sem Pressa**: Obras para "algum dia"

### Filtragem e Organização
- **Por Instrumento**: Separe por piano, violino, etc.
- **Por Dificuldade**: Organize por nível crescente
- **Por Compositor**: Agrupe por autor favorito
- **Por Época**: Cronologia de estudo
- **Por Estimativa de Tempo**: Duração para dominar

## Definindo Metas Realistas

### Avaliação de Dificuldade
- Compare com peças que já domina
- Considere aspectos técnicos específicos
- Avalie tempo disponível para estudo
- Consulte recomendações da comunidade

### Planejamento Temporal
- **Curto Prazo** (1-3 meses): 3-5 obras simples
- **Médio Prazo** (6 meses): 1-2 obras desafiadoras
- **Longo Prazo** (1 ano+): 1 obra muito complexa
- **Manutenção**: Revisão de obras já aprendidas

### Critérios de Escolha
- **Motivação Pessoal**: Obras que realmente deseja tocar
- **Progressão Técnica**: Desenvolvimento de habilidades
- **Variedade Estilística**: Diferentes épocas e compositores
- **Aplicação Prática**: Para recitais, concursos, etc.

## Acompanhamento de Progresso

### Status de Desenvolvimento
- **Não Iniciado**: Aguardando início
- **Estudando**: Em processo de aprendizado
- **Quase Pronto**: Próximo de dominar
- **Pausado**: Temporariamente suspenso
- **Abandonado**: Decidiu não continuar

### Registro de Sessões
- Anote tempo dedicado a cada obra
- Registre dificuldades encontradas
- Documente progressos alcançados
- Marque marcos importantes

### Avaliação Contínua
- Reavalie prioridades regularmente
- Ajuste metas conforme evolução
- Celebre conquistas parciais
- Replaneje quando necessário

## Funcionalidades Especiais

### Seleção de Partituras
- Escolha partitura específica para estudar
- Compare diferentes edições disponíveis
- Considere adequação ao seu nível
- Salve versão preferida para referência futura

### Lembretes Personalizados
- Configure notificações de estudo
- Receba sugestões de prática
- Mantenha disciplina de estudo
- Acompanhe consistência

### Recomendações Inteligentes
- Sistema sugere obras similares
- Considera seu nível atual
- Analisa padrões de preferência
- Propõe progressão lógica

## Estratégias Eficazes

### Para Iniciantes
- Comece com 2-3 obras simples
- Foque em técnicas fundamentais
- Escolha peças motivadoras
- Celebre pequenos progressos

### Para Intermediários
- Balance técnica e expressão
- Explore diferentes estilos
- Defina metas de 6 meses
- Mantenha variedade no repertório

### Para Avançados
- Estabeleça projetos ambiciosos
- Foque em perfecionamento
- Desenvolva interpretação pessoal
- Prepare para apresentações

## Integração com Favoritos

### Sincronização Automática
- Obras favoritadas podem ser adicionadas automaticamente
- Sugestões baseadas em gostos
- Descubra através de compositores favoritos
- Mantenha coerência musical

### Análise de Padrões
- Identifique preferências de época
- Reconheça instrumentos favoritos
- Descubra compositores de interesse
- Use para futuras escolhas

## Motivação e Disciplina

### Visualização de Progresso
- Gráficos de evolução
- Estatísticas de estudo
- Marcos alcançados
- Comparação temporal

### Gamificação
- Pontos por obras concluídas
- Badges por conquistas especiais
- Níveis de progressão
- Desafios pessoais

### Compartilhamento Social
- Mostre metas para outros usuários
- Inspire-se em listas de outros músicos
- Participe de desafios da comunidade
- Receba encorajamento de colegas
        `,
      },
      {
        id: 'learned-system',
        title: 'Registrando "Já Aprendi"',
        description: 'Como documentar seu progresso e conquistas musicais',
        type: 'article',
        duration: '8 min',
        difficulty: 'intermediate',
        content: `
# Registrando "Já Aprendi"

## Movendo da Lista "Quero Aprender"

### Transição Automática
- Na lista "Quero Aprender", clique em "Marcar como Aprendida"
- Sistema move automaticamente para "Já Aprendi"
- Preserva informações anteriores (data início, notas)
- Solicita informações adicionais sobre o processo

### Adição Direta
- Para obras aprendidas antes de usar a plataforma
- Acesse obra e clique em "Já Aprendi"
- Preencha informações retrospectivas
- Estime período de estudo

## Documentando o Aprendizado

### Informações Básicas
- **Data de Conclusão**: Quando considerou aprendida
- **Tempo de Estudo**: Duração do processo (semanas/meses)
- **Nível de Domínio**: 1-10 (básico a virtuosístico)
- **Dificuldade Percebida**: Como foi o processo para você

### Avaliação Detalhada
- **Aspectos Técnicos**: Dedilhado, velocidade, precisão
- **Musicalidade**: Expressão, fraseado, interpretação
- **Desafios Encontrados**: Principais dificuldades
- **Breakthroughs**: Momentos de descoberta importante

### Contexto do Aprendizado
- **Método Utilizado**: Autodidata, professor, curso
- **Partituras Usadas**: Qual edição estudou
- **Gravações de Referência**: Interpretações que inspiraram
- **Performance**: Se apresentou publicamente

## Sistema de Avaliação

### Nível de Domínio (1-10)
- **1-3 (Básico)**: Conhece a obra superficialmente
- **4-6 (Intermediário)**: Toca com segurança básica
- **7-8 (Avançado)**: Domina tecnicamente
- **9-10 (Virtuosístico)**: Interpretação madura e pessoal

### Aspectos Específicos
- **Técnica**: Precisão, velocidade, articulação
- **Interpretação**: Expressão, estilo, personalidade
- **Segurança**: Confiança na performance
- **Musicalidade**: Compreensão profunda da obra

## Organizando Seu Repertório

### Categorização por Período
- **Aprendizado Recente**: Últimos 6 meses
- **Repertório Ativo**: Ainda toca regularmente
- **Arquivo Pessoal**: Aprendeu mas não toca mais
- **Clássicos Pessoais**: Obras que sempre retoma

### Filtragem por Características
- **Por Instrumento**: Organize seu repertório
- **Por Dificuldade**: Veja sua evolução técnica
- **Por Época Musical**: Diversidade estilística
- **Por Domínio**: Obras que domina melhor

### Status de Manutenção
- **Ativo**: Ainda pratica regularmente
- **Ocasional**: Toca esporadicamente
- **Arquivado**: Não toca mais
- **Para Revisar**: Precisa refrescar a memória

## Acompanhamento da Evolução

### Histórico de Progresso
- Timeline visual do aprendizado
- Gráficos de dificuldade ao longo do tempo
- Velocidade de aprendizado por período
- Padrões de preferência musical

### Análise de Desenvolvimento
- **Crescimento Técnico**: Obras cada vez mais complexas
- **Diversidade Estilística**: Variedade de épocas/compositores
- **Consistência**: Regularidade no aprendizado
- **Especialização**: Áreas de maior desenvoltura

### Metas de Manutenção
- Quantas obras manter ativas
- Frequência de revisão necessária
- Ciclo de renovação do repertório
- Balance entre novo e conhecido

## Performance e Apresentação

### Registro de Apresentações
- **Tipo**: Recital, concurso, informal
- **Data**: Quando apresentou
- **Local**: Onde foi a performance
- **Resultado**: Como foi a experiência
- **Gravação**: Link para áudio/vídeo se disponível

### Preparação para Performance
- Marque obras "prontas para apresentar"
- Identifique obras que precisam polimento
- Planeje programa de recital
- Mantenha repertório atualizado

## Compartilhamento e Inspiração

### Perfil Público
- Mostre seu repertório aprendido
- Inspire outros músicos
- Demonstre sua evolução musical
- Construa reputação na comunidade

### Recomendações para Outros
- Sugira obras baseadas em experiência
- Compartilhe dicas de estudo
- Avalie dificuldade realista
- Contribua com a comunidade

## Funcionalidades Avançadas

### Análise Estatística
- Total de obras aprendidas
- Tempo médio de aprendizado
- Compositores mais estudados
- Evolução de dificuldade
- Produtividade por período

### Integração com Favoritos
- Obras aprendidas automaticamente favoritadas
- Recomendações baseadas em repertório
- Descoberta de obras similares
- Construção de perfil musical

### Planejamento Futuro
- Use repertório atual para planejar próximas metas
- Identifique lacunas no conhecimento
- Desenvolva especialização consistente
- Balance técnica e expressão

## Motivação Contínua

### Celebração de Conquistas
- Marcos por número de obras
- Badges por variedade estilística
- Reconhecimento de dedicação
- Compartilhamento de sucessos

### Revisão e Reflexão
- Análise periódica do progresso
- Identificação de padrões pessoais
- Ajuste de estratégias de estudo
- Definição de novos desafios

### Inspiração para Outros
- Torne-se exemplo na comunidade
- Compartilhe sua jornada musical
- Ajude iniciantes com experiência
- Contribua para cultura de aprendizado
        `,
      },
    ],
  },
  {
    id: 'annotations',
    title: 'Sistema de Anotações',
    description: 'Faça anotações inteligentes sobre as obras',
    icon: FiBookOpen,
    color: 'from-indigo-500 to-purple-500',
    guides: [
      {
        id: 'annotation-basics',
        title: 'Criando anotações musicais',
        description: 'Como fazer anotações sobre obras e passagens específicas',
        type: 'article',
        duration: '8 min',
        difficulty: 'beginner',
        content: `
# Criando Anotações Musicais

## O que são Anotações na Opus Atlas

### Conceito
As anotações no Opus Atlas são comentários sobre **obras musicais**, não marcações diretas no PDF da partitura. Você pode criar anotações sobre:
- **Interpretação**: Como tocar uma passagem específica
- **Técnica**: Dicas de dedilhado, articulação, pedal
- **Teoria**: Análise harmônica, formal, estrutural
- **Contexto**: Informações históricas relevantes
- **Dicas de Estudo**: Métodos e estratégias de prática

### Diferença das Anotações Tradicionais
- **Não são marcas no PDF**: Anotações ficam associadas à obra
- **Compartilháveis**: Podem ser públicas para toda comunidade
- **Categorizadas**: Organizadas por tipo e dificuldade
- **Localizáveis**: Referem-se a compassos, seções ou movimentos
- **Colaborativas**: Outros usuários podem votar como úteis

## Criando sua Primeira Anotação

### Acessando o Sistema
1. Vá para a página de qualquer obra
2. Role até a seção "Anotações da Comunidade"
3. Clique em "Nova Anotação"
4. Sistema abrirá o formulário de criação

### Informações Básicas
- **Título**: Resumo da sua anotação (ex: "Dedilhado para arpejos compassos 15-20")
- **Categoria**: Técnica, Interpretação, Teoria, etc.
- **Nível**: Para quem é direcionada (Iniciante, Intermediário, Avançado)
- **Público/Privado**: Se outros podem ver

## Categorias de Anotações

### Técnica
- Dedilhados específicos
- Uso de pedal
- Articulação e fraseado
- Postura e movimento
- Exercícios preparatórios

**Exemplo**: "No compasso 23, use dedilhado 1-2-4-5 na mão direita para facilitar o legato."

### Interpretação
- Dinâmicas expressivas
- Agógica e rubato
- Caráter da obra
- Estilo histórico
- Escolhas interpretativas

**Exemplo**: "O tema principal deve ser tocado com caráter melancólico, usando rubato sutil nos compassos 8-12."

### Teoria Musical
- Análise harmônica
- Estrutura formal
- Progressões importantes
- Modulações
- Contraponto

**Exemplo**: "Modulação para relativo maior no compasso 45, observe a progressão ii-V-I."

### Dicas de Estudo
- Métodos de prática
- Exercícios específicos
- Divisão em seções
- Velocidade de estudo
- Memorização

**Exemplo**: "Pratique mãos separadas até 80 BPM antes de juntar. Foque no baixo da mão esquerda."

### Contexto Histórico
- Informações sobre a composição
- Influências do compositor
- Tradições interpretativas
- Curiosidades históricas

**Exemplo**: "Esta sonata foi composta durante o período em que Beethoven estava perdendo a audição."

## Especificando Localização

### Obra Inteira
- Comentários gerais sobre a peça
- Caráter geral e estilo
- Contexto histórico amplo
- Preparação global

### Movimento Específico
- Indique qual movimento (ex: "Allegro", "Andante")
- Características específicas do movimento
- Transições entre seções

### Seção Específica
- Nome da seção (ex: "Exposição", "Desenvolvimento")
- Características formais
- Tratamento específico

### Compassos Específicos
- Indique compasso inicial e final
- Para trechos técnicos específicos
- Passagens problemáticas
- Momentos interpretativos especiais

## Boas Práticas

### Seja Específico
- Use números de compasso quando relevante
- Descreva exatamente o que quer dizer
- Evite termos vagos como "aqui" ou "esta parte"
- Forneça contexto suficiente

### Use Linguagem Clara
- Escreva para seu público-alvo
- Evite jargão desnecessário
- Explique termos técnicos se necessário
- Use exemplos práticos

### Adicione Valor
- Compartilhe descobertas pessoais
- Ofereça soluções para problemas comuns
- Baseie-se em experiência prática
- Seja construtivo e útil

## Sistema de Tags

### Tags Sugeridas por Categoria
O sistema sugere tags automaticamente baseadas na categoria:
- **Técnica**: #dedilhado #pedal #articulação
- **Interpretação**: #dinâmica #fraseado #rubato  
- **Teoria**: #harmonia #modulação #forma
- **Estudo**: #prática #exercícios #memorização

### Tags Personalizadas
- Crie suas próprias tags descritivas
- Use palavras-chave relevantes
- Máximo 10 tags por anotação
- Ajudam outros usuários a encontrar

## Privacidade e Compartilhamento

### Anotações Públicas
- Visíveis para toda a comunidade
- Podem receber votos de utilidade
- Contribuem para reputação
- Ajudam outros músicos

### Anotações Privadas
- Apenas você pode ver
- Ideais para notas pessoais
- Não aparecem em buscas públicas
- Sempre editáveis

### Mudando Privacidade
- Pode alterar de privada para pública
- Público para privado também permitido
- Sem perda de informações
- Flexibilidade total

## Interação com a Comunidade

### Sistema de Votos
- Outros usuários podem marcar como "útil"
- Anotações úteis aparecem primeiro
- Builds reputação do autor
- Feedback da qualidade

### Comentários e Discussões
- Usuários podem comentar anotações
- Discussões construtivas sobre interpretação
- Troca de experiências
- Aprendizado colaborativo

### Moderação
- Conteúdo inadequado é moderado
- Reportar anotações problemáticas
- Manutenção de qualidade
- Ambiente respeitoso
        `,
      },
      {
        id: 'annotation-advanced',
        title: 'Anotações avançadas',
        description:
          'Técnicas avançadas de anotação e contribuição para comunidade',
        type: 'article',
        duration: '12 min',
        difficulty: 'advanced',
        content: `
# Anotações Avançadas

## Estratégias de Anotação Eficaz

### Análise Profunda
- **Estrutural**: Identifique forma, seções, desenvolvimento temático
- **Harmônica**: Analise progressões, modulações, cromatismos
- **Textural**: Examine vozes, contraponto, densidades
- **Rítmica**: Explore padrões, métricas, sincopes

### Contexto Interpretativo
- **Tradições Históricas**: Como era tocada na época
- **Escolas Interpretativas**: Diferentes abordagens nacionais
- **Grandes Intérpretes**: Referências de gravações importantes
- **Evolução Estilística**: Mudanças ao longo do tempo

### Aspecto Pedagógico
- **Progressão de Dificuldade**: Como abordar gradualmente
- **Pré-requisitos**: O que estudar antes desta obra
- **Habilidades Desenvolvidas**: Que técnicas a obra ensina
- **Transferência**: Como aplicar em outras peças

## Técnicas de Localização Precisa

### Sistema de Referência Musical
- **Compassos**: Use numeração precisa (ex: "compassos 23-27")
- **Sistemas**: Referência por sistema quando relevante
- **Páginas**: Indique página da partitura específica
- **Anacruses**: Inclua tempos de preparação

### Múltiplas Localizações
- **Padrões Recorrentes**: "Este dedilhado aparece nos compassos 12, 24 e 67"
- **Desenvolvimentos**: "O tema se desenvolve do c. 8 ao 45"
- **Comparações**: "Compare com passagem similar no c. 156"

### Referências Cruzadas
- **Entre Movimentos**: "Retoma tema do primeiro movimento"
- **Com Outras Obras**: "Similar ao Op. 27 No. 1"
- **Variações**: "Variação do tema principal"

## Categorização Especializada

### Técnica Instrumental Específica

#### Piano
- **Pedal**: Indicações precisas de pedalização
- **Dedilhado**: Digitações alternativas e eficazes
- **Vozes**: Condução de linhas melódicas múltiplas
- **Articulação**: Toques específicos para texturas diferentes

#### Cordas
- **Arcadas**: Distribuição e direção do arco
- **Dedilhado de Mão Esquerda**: Posições e mudanças
- **Cordas Soltas**: Uso expressivo
- **Vibrato**: Aplicação interpretativa

#### Sopros
- **Respiração**: Pontos estratégicos
- **Embocadura**: Técnicas específicas
- **Dinâmicas**: Controle de intensidade
- **Articulação**: Ataques e ligaduras

### Análise Teórica Avançada

#### Harmonia Funcional
- **Funções**: Identificação T, S, D
- **Substituições**: Acordes alternativos
- **Extensões**: Tensões e cores harmônicas
- **Progressões**: Análise de caminhos harmônicos

#### Contraponto
- **Condução de Vozes**: Movimento melódico
- **Dissonâncias**: Preparação e resolução
- **Imitações**: Técnicas canônicas
- **Especies**: Classificação contrapontística

#### Forma Musical
- **Macro-estrutura**: Divisões principais
- **Micro-estrutura**: Frases e períodos
- **Desenvolvimentos**: Técnicas motivicas
- **Proporções**: Relacionamentos dimensionais

## Contribuições Especializadas

### Para Estudantes Avançados
- **Masterclasses Escritas**: Anotações detalhadas como aulas
- **Problemas Comuns**: Identificação e soluções para dificuldades típicas
- **Refinamentos**: Detalhes para interpretação madura
- **Preparação para Concursos**: Aspectos competitivos

### Para Professores
- **Estratégias Pedagógicas**: Como ensinar passagens específicas
- **Progressão Curricular**: Onde encaixar no programa
- **Exercícios Preparatórios**: O que estudar antes
- **Avaliação**: Critérios para medir progresso

### Para Intérpretes Profissionais
- **Insights Interpretativos**: Descobertas pessoais
- **Variantes Textuais**: Comparação de edições
- **Decisões Artísticas**: Justificativas para escolhas
- **Performance Practice**: Prática histórica informada

## Colaboração e Revisão

### Anotações Colaborativas
- **Builds em Anotações Existentes**: Adicione informações complementares
- **Correções Respeitosas**: Sugira melhorias educadamente
- **Perspectivas Diferentes**: Ofereça pontos de vista alternativos
- **Especialização**: Contribua com sua área de expertise

### Processo de Peer Review
- **Verificação Factual**: Confirme informações técnicas
- **Teste Prático**: Experimente sugestões na prática
- **Feedback Construtivo**: Ofereça melhorias específicas
- **Reconhecimento**: Valorize contribuições úteis

### Manutenção de Qualidade
- **Atualização Regular**: Revise suas anotações antigas
- **Correção de Erros**: Corrija quando descobrir equívocos
- **Incorporação de Novos Insights**: Adicione descobertas recentes
- **Responsividade**: Responda a comentários e questões

## Uso de Evidências e Fontes

### Referências Acadêmicas
- **Edições Críticas**: Cite urtext e edições scholarly
- **Pesquisa Musicológica**: Referencie estudos relevantes
- **Manuscritos**: Mencione fontes primárias quando disponíveis
- **Documentação Histórica**: Use cartas, diários, críticas da época

### Evidências Práticas
- **Gravações Históricas**: Referencie intérpretes importantes
- **Tradições Orais**: Documente práticas transmitidas
- **Experiência Pessoal**: Baseie-se em estudo aprofundado
- **Consenso Profissional**: Indique práticas aceitas

### Transparência nas Fontes
- **Cite Referências**: Mencione fontes consultadas
- **Admita Incertezas**: Seja honesto sobre limitações
- **Convide Discussão**: Encoraje feedback de experts
- **Atualize com Novas Informações**: Mantenha-se aberto a correções

## Impacto na Comunidade

### Construindo Reputação
- **Consistência**: Mantenha qualidade alta
- **Especialização**: Desenvolva expertise reconhecida
- **Generosidade**: Compartilhe conhecimento livremente
- **Humildade**: Aceite feedback e corrija erros

### Mentoria através de Anotações
- **Guie Iniciantes**: Ofereça caminhos claros
- **Inspire Intermediários**: Mostre possibilidades avançadas
- **Desafie Avançados**: Apresente questões profundas
- **Conecte Níveis**: Crie pontes entre dificuldades

### Preservação de Conhecimento
- **Documenta Tradições**: Registre práticas interpretativas
- **Compartilhe Insights**: Preserve descobertas pessoais
- **Facilite Acesso**: Torne conhecimento mais acessível
- **Cultive Comunidade**: Construa ambiente de aprendizado

## Ferramentas Avançadas

### Integração com Outras Funcionalidades
- **Links para Favoritos**: Conecte com suas obras preferidas
- **Referência em Listas de Estudo**: Use em planejamento
- **Compartilhamento Social**: Promova discussões
- **Exportação**: Mantenha backup pessoal

### Análise de Impacto
- **Estatísticas de Visualização**: Veja alcance das anotações
- **Feedback da Comunidade**: Monitore votos e comentários
- **Influência Educacional**: Observe uso por professores
- **Evolução da Discussão**: Acompanhe desenvolvimento de tópicos

### Otimização de Conteúdo
- **SEO Interno**: Use palavras-chave relevantes
- **Estruturação Clara**: Organize informação logicamente
- **Atualizações Regulares**: Mantenha conteúdo atual
- **Interconexão**: Crie redes de anotações relacionadas
        `,
      },
    ],
  },
  {
    id: 'newsletter',
    title: 'Newsletter',
    description: 'Mantenha-se atualizado com novidades musicais',
    icon: FiMail,
    color: 'from-teal-500 to-green-500',
    guides: [
      {
        id: 'newsletter-subscription',
        title: 'Assinando a newsletter',
        description: 'Como se inscrever e receber atualizações do Opus Atlas',
        type: 'article',
        duration: '3 min',
        difficulty: 'beginner',
        content: `
# Assinando a Newsletter

## Como se Inscrever

### Durante o Cadastro
- Ao criar sua conta, você pode marcar a opção para receber newsletters
- Esta é a forma mais simples de se inscrever
- Não há configurações adicionais necessárias

### Através do Perfil
- Acesse "Meu Perfil" > "Configurações"
- Encontre a seção "Comunicações"
- Marque "Receber newsletter do Opus Atlas"
- Salve as alterações

### Via Formulário no Site
- Encontre o formulário de newsletter no rodapé do site
- Digite seu email
- Clique em "Inscrever-se"
- Confirmação será enviada imediatamente

## O que Você Recebe

### Conteúdo Semanal
- **Novos Compositores**: Últimas adições à enciclopédia
- **Obras em Destaque**: Peças populares e descobertas interessantes
- **Contribuições da Comunidade**: Melhores uploads e anotações
- **Dicas de Estudo**: Conselhos práticos para músicos

### Atualizações Especiais
- **Novas Funcionalidades**: Quando lançamos recursos
- **Melhorias na Plataforma**: Atualizações importantes
- **Eventos da Comunidade**: Concursos, desafios, celebrações
- **Parcerias e Colaborações**: Novos parceiros e projetos

### Conteúdo Personalizado
- **Baseado em Seus Favoritos**: Relacionado aos seus compositores preferidos
- **Nível de Experiência**: Adequado ao seu perfil musical
- **Instrumentos**: Focado nos seus instrumentos principais
- **Atividade Recente**: Relacionado ao que você tem estudado

## Frequência de Envio

### Newsletter Principal
- **Uma vez por semana**: Às quintas-feiras pela manhã
- **Conteúdo Compilado**: Resumo da semana na plataforma
- **Não Spam**: Apenas conteúdo relevante e de qualidade

### Atualizações Especiais
- **Quando Necessário**: Para anúncios importantes
- **Máximo 2 por mês**: Não sobrecarregamos sua caixa de entrada
- **Sempre Relevante**: Apenas informações realmente importantes

## Gerenciando sua Assinatura

### Cancelando a Inscrição
- Clique em "Descadastrar" no final de qualquer email
- Ou desmarque a opção nas configurações do perfil
- Cancelamento é imediato e definitivo
- Pode se reinscrever a qualquer momento

### Alterando Email
- Atualize seu email principal no perfil
- Newsletter será enviada automaticamente para o novo endereço
- Sem necessidade de reinscrição
- Mudança efetiva no próximo envio

## Problemas Comuns

### Não Recebendo Emails
1. **Verifique Spam/Lixo Eletrônico**: Emails podem ser filtrados
2. **Adicione à Lista de Contatos**: Marque como seguro
3. **Verifique Configurações**: Confirme que está inscrito
4. **Problemas de Email**: Tente com outro endereço

### Email Chegando Cortado
- **Cliente de Email**: Alguns cortam emails longos
- **Visualização Web**: Use "Ver no navegador"
- **Email Alternativo**: Tente provedor diferente
- **Suporte**: Entre em contato se persistir

## Dicas para Melhor Experiência

### Organização
- **Pasta Específica**: Crie pasta para newsletters do Opus Atlas
- **Filtros Automáticos**: Configure regras no seu email
- **Marcação de Favoritos**: Salve edições interessantes
- **Arquivo Pessoal**: Mantenha histórico para referência

### Engajamento
- **Leia Regularmente**: Aproveite o conteúdo selecionado
- **Clique nos Links**: Explore obras e compositores mencionados
- **Compartilhe**: Encaminhe para amigos músicos
- **Feedback**: Responda com sugestões e comentários

### Aproveitamento Máximo
- **Planeje Estudos**: Use sugestões para organizar prática
- **Descubra Novidades**: Explore compositores menos conhecidos
- **Participe**: Engaje-se com a comunidade
- **Aprenda**: Use dicas e informações musicais

## Privacidade e Dados

### Uso de Informações
- **Apenas para Newsletter**: Email não é compartilhado
- **Personalização**: Usamos seus favoritos para relevância
- **Segurança**: Dados protegidos e criptografados
- **Transparência**: Uso claro e objetivo

### Controle Total
- **Cancele a Qualquer Momento**: Sem complicações
- **Seus Dados**: Controle total sobre informações pessoais
- **Sem Vendas**: Nunca vendemos ou alugamos listas
- **Respeito**: Valorizamos sua privacidade

## Valor da Newsletter

### Para Estudantes
- **Descoberta**: Novas obras para estudar
- **Motivação**: Inspiração para prática regular
- **Comunidade**: Conexão com outros músicos
- **Aprendizado**: Dicas e técnicas úteis

### Para Professores
- **Material Didático**: Obras para usar com alunos
- **Tendências**: O que está popular na plataforma
- **Recursos**: Novas ferramentas para ensino
- **Inspiração**: Ideias para aulas e programas

### Para Apreciadores
- **Cultura Musical**: Conhecimento sobre música clássica
- **Descobertas**: Compositores e obras interessantes
- **Contexto**: Informações históricas e culturais
- **Apreciação**: Desenvolve gosto musical refinado
        `,
      },
    ],
  },
  {
    id: 'moderation',
    title: 'Moderação e Qualidade',
    description: 'Sistema de moderação e controle de qualidade',
    icon: FiFlag,
    color: 'from-red-500 to-pink-500',
    guides: [
      {
        id: 'report-content',
        title: 'Como reportar conteúdo',
        description:
          'Sistema para reportar problemas e manter qualidade da plataforma',
        type: 'article',
        duration: '6 min',
        difficulty: 'beginner',
        content: `
# Como Reportar Conteúdo

## Quando Reportar

### Informações Incorretas
- **Dados Biográficos**: Datas, locais, fatos históricos errados
- **Atribuições**: Obras atribuídas ao compositor errado
- **Classificações**: Época, gênero, instrumento incorretos
- **Links**: URLs quebradas ou que levam a lugar errado

### Conteúdo Inadequado
- **Duplicatas**: Mesmo compositor/obra já existente
- **Qualidade Baixa**: Informações incompletas ou muito básicas
- **Spam**: Conteúdo promocional inappropriado
- **Vandalism**: Alterações maliciosas ou brincadeiras

### Problemas Técnicos
- **Partituras Ilegíveis**: Scans de baixa qualidade
- **Arquivos Corrompidos**: PDFs que não abrem corretamente
- **Links Quebrados**: URLs que não funcionam
- **Formatação**: Problemas de exibição

### Violações de Direitos
- **Copyright**: Partituras ainda protegidas por direitos autorais
- **Imagens**: Fotos com direitos reservados
- **Texto**: Cópias literais de fontes protegidas
- **Atribuições**: Falta de créditos obrigatórios

## Como Fazer um Report

### Localizando o Botão
- **Compositores**: Botão na página principal do compositor
- **Obras**: Na página de detalhes da obra
- **Partituras**: Em cada partitura individual
- **Anotações**: Em cada anotação específica

### Preenchendo o Formulário

#### Categoria do Problema
- **Informação Incorreta**: Para erros factuais
- **Conteúdo Inadequado**: Para material inapropriado
- **Problema Técnico**: Para falhas de funcionamento
- **Violação de Direitos**: Para questões legais
- **Spam/Abuso**: Para conteúdo malicioso

#### Descrição Detalhada
- **Seja Específico**: Explique exatamente qual é o problema
- **Forneça Evidências**: Cite fontes que comprovem erro
- **Localize o Problema**: Indique onde está o erro (página, seção, compasso)
- **Sugira Correção**: Se souber a informação correta, inclua

#### Informações de Contato
- **Email**: Para seguimento do report (opcional)
- **Disponibilidade**: Se está disposto a ajudar com correção
- **Expertise**: Sua qualificação no assunto (opcional)

## Processo de Moderação

### Primeira Análise (24-48h)
- **Triagem Automática**: Sistema verifica duplicatas
- **Análise Inicial**: Moderador avalia gravidade
- **Categorização**: Define prioridade do caso
- **Feedback Inicial**: Confirmação de recebimento

### Investigação Detalhada (3-7 dias)
- **Verificação de Fontes**: Consulta a bases confiáveis
- **Análise Técnica**: Especialistas verificam conteúdo
- **Discussão Interna**: Equipe decide ação necessária
- **Documentação**: Registro de decisão e justificativa

### Resolução e Feedback
- **Ação Tomada**: Correção, remoção ou arquivamento
- **Notificação**: Informação sobre decisão
- **Agradecimento**: Reconhecimento da contribuição
- **Seguimento**: Verificação se problema foi resolvido

## Tipos de Ação

### Correções Simples
- **Edição Direta**: Moderador corrige informação
- **Atualização de Links**: URLs são corrigidos
- **Melhorias de Formatação**: Ajustes de apresentação
- **Adição de Informações**: Complementação de dados

### Remoções Necessárias
- **Conteúdo Ilegal**: Violações de direitos autorais
- **Duplicatas**: Entradas repetidas
- **Qualidade Insuficiente**: Conteúdo muito básico
- **Spam/Vandalism**: Material malicioso

### Suspensões Temporárias
- **Pendente Verificação**: Aguardando confirmação
- **Necessita Revisão**: Requer análise especializada
- **Aguardando Fontes**: Faltam evidências
- **Em Discussão**: Caso complexo sob debate

## Boas Práticas para Reports

### Seja Construtivo
- **Foque no Problema**: Não ataque pessoas
- **Ofereça Soluções**: Sugira melhorias quando possível
- **Seja Respeitoso**: Mantenha tom profissional
- **Seja Paciente**: Moderação leva tempo

### Forneça Contexto
- **Explique a Importância**: Por que o erro é significativo
- **Cite Fontes**: Referências confiáveis
- **Detalhe o Problema**: Informações completas
- **Seja Preciso**: Localização exata do erro

### Evite Reports Desnecessários
- **Verifique Antes**: Confirme se realmente é erro
- **Não Duplicate**: Veja se já foi reportado
- **Seja Objetivo**: Foque em fatos, não opiniões
- **Priorize Gravidade**: Problemas sérios primeiro

## Reconhecimento de Contribuição

### Sistema de Reputação
- **Pontos por Reports Válidos**: Builds credibilidade
- **Badges de Qualidade**: Reconhecimento especial
- **Status de Colaborador**: Para contribuidores frequentes
- **Menção de Crédito**: Nome em correções importantes

### Benefícios para Reportadores
- **Prioridade em Análises**: Reports de usuários confiáveis
- **Acesso Antecipado**: Novos recursos para beta testers
- **Comunicação Direta**: Canal para grandes contribuidores
- **Reconhecimento Público**: Menção em newsletters

## Moderação de Anotações

### Critérios Específicos
- **Relevância Musical**: Deve ser útil para músicos
- **Precisão Técnica**: Informações corretas
- **Linguagem Apropriada**: Tom respeitoso e educativo
- **Ausência de Spam**: Não pode ser promocional

### Processo Especial
- **Votação da Comunidade**: Usuários avaliam utilidade
- **Revisão por Pares**: Músicos experientes verificam
- **Moderação Reativa**: Baseada em reports
- **Qualidade Contínua**: Monitoramento constante

## Transparência do Processo

### Comunicação Clara
- **Status Updates**: Informações sobre andamento
- **Justificativas**: Explicação das decisões
- **Appeals**: Processo para contestar decisões
- **Feedback Loop**: Melhoria contínua do sistema

### Dados Públicos
- **Estatísticas Gerais**: Números de reports e resoluções
- **Tendências**: Tipos de problemas mais comuns
- **Melhorias**: Ações tomadas para qualidade
- **Agradecimentos**: Reconhecimento de contribuidores
        `,
      },
      {
        id: 'verification-system',
        title: 'Sistema de verificação',
        description: 'Como funciona a verificação de conteúdo pela moderação',
        type: 'article',
        duration: '8 min',
        difficulty: 'intermediate',
        content: `
# Sistema de Verificação

## O que é Verificação

### Conceito
A verificação é um processo pelo qual nossa equipe de moderação especializada confirma a precisão e qualidade de compositores e obras na plataforma. Conteúdo verificado recebe um selo especial que indica confiabilidade.

### Quem Pode Verificar
- **Apenas Moderadores**: Equipe especializada do Opus Atlas
- **Músicos Qualificados**: Profissionais com expertise reconhecida
- **Pesquisadores**: Musicólogos e acadêmicos credenciados
- **Não é Automático**: Processo sempre manual e criterioso

## Tipos de Verificação

### Compositores Verificados
- **Dados Biográficos**: Datas, locais, fatos confirmados
- **Catálogo de Obras**: Lista completa e precisa
- **Informações Históricas**: Contexto verificado
- **Fontes Múltiplas**: Confirmação em várias referências

### Obras Verificadas
- **Atribuição Correta**: Confirmação de autoria
- **Dados Técnicos**: Instrumentação, tonalidade, estrutura
- **Informações Históricas**: Data, contexto, dedicatória
- **Classificação**: Gênero, época, dificuldade

### Partituras Verificadas
- **Domínio Público**: Confirmação legal
- **Qualidade**: Legibilidade e completude
- **Precisão**: Correspondência com original
- **Edição Confiável**: Fonte respeitável

## Critérios de Verificação

### Para Compositores

#### Documentação Histórica
- **Fontes Primárias**: Documentos da época
- **Biografia Acadêmica**: Pesquisas universitárias
- **Consenso Musicológico**: Acordo entre especialistas
- **Evidências Múltiplas**: Confirmação cruzada

#### Qualidade de Informação
- **Completude**: Dados essenciais presentes
- **Precisão**: Informações corretas
- **Atualização**: Baseado em pesquisa recente
- **Contextualização**: Informações relevantes

### Para Obras

#### Autenticidade
- **Atribuição Confirmada**: Autoria indiscutível
- **Catálogos Oficiais**: Presença em listas reconhecidas
- **Manuscritos**: Evidência documental quando possível
- **Tradição**: Aceitação histórica

#### Dados Técnicos
- **Instrumentação Precisa**: Formação correta
- **Informações Estruturais**: Movimentos, seções
- **Dados Históricos**: Datas e contexto
- **Classificação Adequada**: Gênero e período

## Processo de Verificação

### Solicitação
- **Uploads Automáticos**: Novos conteúdos entram na fila
- **Requests da Comunidade**: Usuários podem solicitar
- **Revisão Periódica**: Conteúdo antigo é reavaliado
- **Priorização**: Baseada em importância e uso

### Análise Técnica
- **Pesquisa Documental**: Consulta a fontes primárias
- **Verificação Cruzada**: Múltiplas fontes consultadas
- **Análise Musical**: Aspectos técnicos examinados
- **Contextualização**: Situação histórica verificada

### Decisão Final
- **Aprovação**: Selo de verificação concedido
- **Aprovação Condicional**: Verificação parcial
- **Pendência**: Aguardando mais informações
- **Negação**: Critérios não atendidos

## Benefícios da Verificação

### Para a Comunidade
- **Confiabilidade**: Informações precisas garantidas
- **Qualidade**: Padrão elevado de conteúdo
- **Referência**: Fonte confiável para estudos
- **Credibilidade**: Reputação acadêmica

### Para Buscas
- **Priorização**: Conteúdo verificado aparece primeiro
- **Filtros**: Opção de ver apenas verificado
- **Recomendações**: Sistema prioriza verificado
- **Qualidade**: Resultados mais relevantes

### Para Educação
- **Material Didático**: Seguro para uso em ensino
- **Pesquisa Acadêmica**: Adequado para trabalhos
- **Referência Profissional**: Confiável para músicos
- **Padrão Educacional**: Atende critérios acadêmicos

## Como Identificar Conteúdo Verificado

### Selo Visual
- **Ícone Especial**: Marca distintiva verde
- **Tooltip Informativo**: Explicação ao passar mouse
- **Localização Consistente**: Sempre no mesmo lugar
- **Destaque Sutil**: Visível mas não invasivo

### Informações Adicionais
- **Data de Verificação**: Quando foi confirmado
- **Verificado Por**: Identificação do moderador
- **Nível de Verificação**: Completa, parcial, básica
- **Última Revisão**: Data da última checagem

## Revisão e Atualização

### Monitoramento Contínuo
- **Novas Descobertas**: Incorporação de pesquisas recentes
- **Correções**: Ajustes quando necessário
- **Atualizações**: Informações adicionais incluídas
- **Reavaliação**: Revisão periódica de critérios

### Processo de Appeal
- **Contestação**: Como discordar de decisão
- **Evidências**: Apresentação de novas fontes
- **Reavaliação**: Nova análise por equipe diferente
- **Transparência**: Explicação de decisões

## Limitações da Verificação

### Escopo
- **Não é Absoluta**: Baseada no conhecimento atual
- **Evolução**: Pode mudar com novas descobertas
- **Especialização**: Focada em aspectos específicos
- **Recursos**: Limitada por tempo e pessoal

### Não Verificado ≠ Incorreto
- **Aguardando Análise**: Pode estar na fila
- **Recursos Limitados**: Nem tudo pode ser verificado imediatamente
- **Priorização**: Conteúdo popular verificado primeiro
- **Qualidade**: Pode ser bom mesmo sem verificação

## Contribuindo para Verificação

### Como Ajudar
- **Reports de Qualidade**: Sinalize conteúdo duvidoso
- **Forneça Fontes**: Compartilhe referências confiáveis
- **Expertise**: Ofereça conhecimento especializado
- **Paciência**: Entenda que processo leva tempo

### Tornando-se Colaborador
- **Demonstre Expertise**: Contribuições consistentemente boas
- **Construa Reputação**: Histórico de reports precisos
- **Formação Relevante**: Background em música/musicologia
- **Compromisso**: Disponibilidade para revisões regulares

## Futuro da Verificação

### Melhorias Planejadas
- **Automação Parcial**: IA para triagem inicial
- **Crowdsourcing**: Participação ampliada da comunidade
- **Especialização**: Times focados por período/região
- **Integração**: Conexão com bases de dados acadêmicas

### Metas de Qualidade
- **Cobertura**: Verificar todo conteúdo principal
- **Velocidade**: Reduzir tempo de processamento
- **Precisão**: Aumentar accuracy das verificações
- **Transparência**: Processos mais claros para usuários
        `,
      },
    ],
  },
];

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner':
      return 'text-accent-green';
    case 'intermediate':
      return 'text-accent-amber';
    case 'advanced':
      return 'text-accent-red';
    default:
      return 'text-theme-secondary';
  }
};

const getDifficultyLabel = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner':
      return 'Iniciante';
    case 'intermediate':
      return 'Intermediário';
    case 'advanced':
      return 'Avançado';
    default:
      return difficulty;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'article':
      return FiBook;
    case 'video':
      return FiVideo;
    case 'interactive':
      return FiPlay;
    default:
      return FiBook;
  }
};

// Componente para exibir cards de guias
interface GuideCardProps {
  guide: Guide;
}

function renderInlineBold(text: string) {
  if (!text.includes('**')) {
    return text;
  }

  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-theme-primary">
          {part.substring(2, part.length - 2)}
        </strong>
      );
    }
    return part;
  });
}
function renderMarkdownInline(line: string, lineIndex: number) {
  const parts = line.split(/(\*\*.*?\*\*)/g);

  return (
    <p key={lineIndex} className="mb-2 leading-relaxed">
      {parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong
              key={`${lineIndex}-${partIndex}`}
              className="font-semibold text-theme-primary"
            >
              {part.substring(2, part.length - 2)}
            </strong>
          );
        }
        return part;
      })}
    </p>
  );
}
function GuideCard({ guide }: GuideCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const IconComponent = getTypeIcon(guide.type);

  console.log('GUIDE', { guide, isExpanded });
  return (
    <div className="classical-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left focus:outline-none hover:bg-theme-elevated/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-6 h-6 text-theme-primary" />
            </div>
            <div className="flex-grow">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-lg font-semibold classical-title text-theme-primary">
                  {guide.title}
                </h4>
                <span className="text-sm text-brand-primary font-medium">
                  {isExpanded ? 'Fechar' : 'Ver Guia'}
                </span>
              </div>
              <p className="text-theme-secondary text-sm mt-1 classical-body">
                {guide.description}
              </p>
              <div className="flex items-center space-x-3 mt-2">
                {guide.duration && (
                  <span className="text-sm text-theme-tertiary">
                    📖 {guide.duration}
                  </span>
                )}
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full bg-theme-elevated ${getDifficultyColor(
                    guide.difficulty
                  )}`}
                >
                  {getDifficultyLabel(guide.difficulty)}
                </span>
                <span className="text-xs text-theme-tertiary">
                  {guide.type === 'article' ? '📄 Artigo' : '🎯 Interativo'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div className="flex flex-col items-center space-y-1">
              {isExpanded ? (
                <FiArrowRight className="w-5 h-5 text-brand-primary rotate-90 transition-transform duration-300" />
              ) : (
                <FiArrowRight className="w-5 h-5 text-brand-primary transition-transform duration-300" />
              )}
              <span className="text-xs text-theme-tertiary">
                {isExpanded ? 'Fechar' : 'Abrir'}
              </span>
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-theme-secondary/20">
          <div className="pt-4">
            <div className="border-brand-primary/20 pl-4">
              <div className="prose prose-sm max-w-none text-theme-secondary classical-body">
                {guide.content.split('\n').map((line, index) => {
                  if (line.trim() === '') return <br key={index} />;

                  if (line.startsWith('# ')) {
                    return (
                      <h3
                        key={index}
                        className="text-lg font-bold text-theme-primary mt-4 mb-2 classical-title"
                      >
                        {line.substring(2)}
                      </h3>
                    );
                  }

                  if (line.startsWith('## ')) {
                    return (
                      <h4
                        key={index}
                        className="text-base font-semibold text-theme-primary mt-3 mb-2"
                      >
                        {line.substring(3)}
                      </h4>
                    );
                  }

                  if (line.startsWith('### ')) {
                    return (
                      <h5
                        key={index}
                        className="text-sm font-semibold text-theme-primary mt-2 mb-1"
                      >
                        {line.substring(4)}
                      </h5>
                    );
                  }

                  if (line.startsWith('- ')) {
                    return (
                      <li key={index} className="ml-4 mb-1 list-disc">
                        {renderInlineBold(line.substring(2))}
                      </li>
                    );
                  }

                  if (line.match(/^\d+\./)) {
                    return (
                      <div key={index} className="ml-4 mb-1 font-medium">
                        {renderInlineBold(line)}
                      </div>
                    );
                  }

                  // NOVA LÓGICA PARA NEGRITO
                  // Linha inteira em negrito (título/destaque)
                  if (
                    line.startsWith('**') &&
                    line.endsWith('**') &&
                    line.length > 4
                  ) {
                    return (
                      <p
                        key={index}
                        className="font-semibold mb-2 text-theme-primary"
                      >
                        {line.substring(2, line.length - 2)}
                      </p>
                    );
                  }

                  // Linha com markdown inline
                  if (line.includes('**')) {
                    return renderMarkdownInline(line, index);
                  }

                  // Parágrafo normal
                  return (
                    <p key={index} className="mb-2 leading-relaxed">
                      {line}
                    </p>
                  );
                })}
              </div>

              {/* Botão para fechar */}
              <div className="mt-6 pt-4 border-t border-theme-secondary/10">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium transition-colors"
                >
                  ← Fechar Guia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HelpPage(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const renderStep = (): JSX.Element => {
    if (!selectedCategory) {
      return (
        <section className="py-8">
          <AnimatedContainer delay={0.1} staggerSpeed="fast">
            <div className="section-wrap">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-4">
                    Categorias de Ajuda
                  </h2>
                  <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
                    Escolha a categoria que melhor se adequa à sua necessidade
                  </p>
                </div>

                <SequentialGrid cols={3} gap={8} delayBetweenItems={0.1}>
                  {helpCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`classical-card p-6 group flex flex-col items-center justify-center cursor-pointer transition-all ${
                        selectedCategory === category.id
                          ? 'ring-2 ring-brand-primary'
                          : ''
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div
                        className={`w-16 h-16 bg-gradient-to-br  rounded-2xl flex items-center justify-center mb-6`}
                      >
                        <category.icon className="w-8 h-8 text-theme-primary" />
                      </div>

                      <h3 className="text-xl font-semibold classical-title text-theme-primary mb-3">
                        {category.title}
                      </h3>

                      <p className="text-theme-secondary text-center classical-body mb-4">
                        {category.description}
                      </p>

                      <div className="text-brand-primary font-medium flex items-center">
                        <span>{category.guides.length} guias</span>
                        <FiArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  ))}
                </SequentialGrid>
              </div>
            </div>
          </AnimatedContainer>
        </section>
      );
    }

    const category = helpCategories.find((cat) => cat.id === selectedCategory);
    if (!category) return <div></div>;

    return (
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="fast">
          <div className="section-wrap">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="inline-flex items-center text-brand-primary hover:text-brand-primary/80 mb-4 transition-colors"
                >
                  <FiArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  Voltar às categorias
                </button>
                <h3 className="text-2xl font-bold classical-title text-theme-primary mb-2">
                  {category.title}
                </h3>
                <p className="text-theme-secondary">{category.description}</p>
              </div>

              <div className="space-y-4">
                {category.guides.map((guide, index) => (
                  <AnimatedItem
                    key={guide.id}
                    direction="up"
                    springType="gentle"
                    delay={index * 0.1}
                  >
                    <GuideCard guide={guide} />
                  </AnimatedItem>
                ))}
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </section>
    );
  };

  return (
    <PageContainer showBackground={true} className="classical-theme">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-accent-purple/5 to-accent-blue/5"></div>
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative section-wrap">
            <div className="text-center max-w-4xl mx-auto">
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full mb-8">
                  <FiHelpCircle className="w-5 h-5 text-brand-primary mr-2" />
                  <span className="text-brand-primary font-medium">
                    Tutoriais e Guias
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  Central de
                  <span className="text-gradient-brand block lg:inline lg:ml-4">
                    Ajuda
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  Guias completos e dicas práticas para dominar todas as
                  funcionalidades do Opus Atlas.
                </p>
              </AnimatedItem>
            </div>
          </div>
          <AnimatedMusicalNotes />
        </AnimatedContainer>
      </section>

      {/* Quick Access */}
      <section className="">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="">
            <div className="max-w-4xl mx-auto">
              <AnimatedCard hover="lift" className="classical-card p-8 mb-12">
                <div className="text-center">
                  <h2 className="text-2xl font-bold classical-title text-theme-primary mb-6">
                    Acesso Rápido
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link
                      href="/faq"
                      className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-accent-blue/20 rounded-lg hover:border-accent-blue/40 transition-all"
                    >
                      <FiHelpCircle className="w-5 h-5 text-accent-blue" />
                      <span className="text-theme-primary font-medium">
                        Perguntas Frequentes
                      </span>
                    </Link>

                    <Link
                      href="/contact"
                      className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border border-accent-green/20 rounded-lg hover:border-accent-green/40 transition-all"
                    >
                      <FiMessageCircle className="w-5 h-5 text-accent-green" />
                      <span className="text-theme-primary font-medium">
                        Fale Conosco
                      </span>
                    </Link>

                    <Link
                      href="/support"
                      className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-accent-red/10 to-accent-amber/10 border border-accent-red/20 rounded-lg hover:border-accent-red/40 transition-all"
                    >
                      <FiUser className="w-5 h-5 text-accent-red" />
                      <span className="text-theme-primary font-medium">
                        Suporte Técnico
                      </span>
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* Main Content */}
      {renderStep()}

      {/* Contact Section */}
      <section className="py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 via-accent-purple/5 to-accent-blue/10"></div>

        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative section-wrap">
            <AnimatedCard
              hover="lift"
              className="classical-card p-12 text-center max-w-4xl mx-auto"
            >
              <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-8">
                <FiMessageCircle className="w-10 h-10 text-theme-primary" />
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                Ainda precisa de ajuda?
              </h2>

              <p className="text-xl text-theme-secondary mb-12 classical-body">
                Nossa equipe de suporte está sempre pronta para ajudar você a
                aproveitar ao máximo o Opus Atlas.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/contact"
                  className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                >
                  <FiMessageCircle className="w-5 h-5" />
                  <span>Fale Conosco</span>
                </Link>

                <Link
                  href="/support"
                  className="btn-classical-secondary flex items-center justify-center space-x-3 px-10 py-4 text-lg"
                >
                  <FiUser className="w-5 h-5" />
                  <span>Suporte Técnico</span>
                </Link>
              </div>
            </AnimatedCard>
          </div>
        </AnimatedContainer>
      </section>

      {/* Floating Elements */}
      <FloatingElement
        className="top-16 left-16 text-6xl text-brand-primary/5"
        delay={0}
      >
        <GiMusicalNotes />
      </FloatingElement>
      <FloatingElement
        className="bottom-16 right-16 text-5xl text-accent-purple/5"
        delay={2}
      >
        <GiGrandPiano />
      </FloatingElement>
      <FloatingElement
        className="top-1/3 right-24 text-4xl text-accent-blue/5"
        delay={1}
      >
        <FiBook />
      </FloatingElement>
      <FloatingElement
        className="bottom-1/3 left-24 text-4xl text-brand-secondary/5"
        delay={3}
      >
        <GiScrollQuill />
      </FloatingElement>
    </PageContainer>
  );
}
