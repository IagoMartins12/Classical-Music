// scripts/extractTexts.js - VERSÃO ROBUSTA E SEGURA COMPLETA
// Uso: node scripts/extractTexts.js <arquivo> <seção> [opções]

const fs = require('fs');
const path = require('path');
const { parse } = require('@typescript-eslint/typescript-estree');

class RobustTextExtractor {
  constructor() {
    this.extractedTexts = new Map();
    this.keyCounter = new Map();
    this.sectionName = '';
    this.sectionPath = '';
    this.replacements = [];
    this.originalContent = '';
    this.backupPath = '';

    // Sistema de logs e métricas avançado
    this.stats = {
      totalNodesVisited: 0,
      textNodesFound: 0,
      validTextsExtracted: 0,
      skippedByContext: 0,
      skippedByContent: 0,
      skippedByPattern: 0,
      dangerousContextsDetected: 0,
      safetyViolations: 0,
      replacementsApplied: 0,
      ignoredReasons: new Map(),
    };

    // Padrões de segurança baseados em produção
    this.DANGEROUS_CONTEXTS = new Set([
      'className',
      'style',
      'key',
      'ref',
      'href',
      'src',
      'action',
      'method',
      'onClick',
      'onChange',
      'onSubmit',
      'onFocus',
      'onBlur',
      'onMouseOver',
      'data-testid',
      'data-cy',
      'aria-label',
      'role',
      'tabIndex',
      'console',
      'import',
      'export',
      'require',
      'from',
    ]);

    this.TECHNICAL_PATTERNS = [
      /^[a-z]+-[a-z-]+$/, // kebab-case (CSS classes)
      /^[A-Z_][A-Z0-9_]*$/, // CONSTANTS
      /^use[A-Z][a-zA-Z]*$/, // React hooks
      /^on[A-Z][a-zA-Z]*$/, // Event handlers
      /^[a-z]+([A-Z][a-z]*){3,}$/, // camelCase muito longo
      /^\$[a-zA-Z]/, // Template variables
      /^\/[\/\w.-]*$/, // Paths
      /^https?:\/\//, // URLs
      /^#[a-fA-F0-9]{3,8}$/, // Colors
      /^\d+(\.\d+)?(px|em|rem|vh|vw|%|s|ms)$/, // CSS units
      /^(absolute|relative|fixed|static|sticky)$/, // CSS positions
      /^(flex|grid|block|inline|none)$/, // CSS display
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, // UUIDs
    ];

    this.CODE_KEYWORDS = new Set([
      'function',
      'const',
      'let',
      'var',
      'if',
      'else',
      'return',
      'import',
      'export',
      'class',
      'interface',
      'type',
      'enum',
      'namespace',
      'module',
      'declare',
      'async',
      'await',
      'Promise',
      'Observable',
      'useState',
      'useEffect',
      'useCallback',
      'useMemo',
      'useRef',
      'useContext',
      'useReducer',
      'true',
      'false',
      'null',
      'undefined',
      'NaN',
      'Infinity',
    ]);

    this.SAFE_JSX_PARENTS = new Set([
      'JSXElement',
      'JSXFragment',
      'JSXExpressionContainer',
    ]);
  }

  /**
   * Método principal de extração com validação robusta
   */
  async extractFromFile(filePath, sectionInput) {
    console.log(`🔍 Iniciando análise robusta: ${filePath}`);
    console.log(`📁 Seção: ${sectionInput}`);

    this.sectionPath = sectionInput;
    this.sectionName = sectionInput.split('/').pop();

    // Validações iniciais
    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ Arquivo não encontrado: ${filePath}`);
    }

    this.originalContent = fs.readFileSync(filePath, 'utf8');

    // Validar se é um arquivo React/TypeScript válido
    if (!this.isValidReactFile()) {
      throw new Error(`❌ Arquivo não é um componente React válido`);
    }

    this.createBackup(filePath);

    try {
      // Parse com configuração robusta
      const ast = parse(this.originalContent, {
        jsx: true,
        useJSXTextNode: true,
        range: true,
        loc: true,
        comment: true,
        attachComments: true,
        errorOnUnknownASTType: false,
        errorOnTypeScriptSyntacticAndSemanticIssues: false,
      });

      console.log('\n🔍 FASE 1: Análise estrutural do AST...');
      this.analyzeASTStructure(ast);

      console.log('\n🔍 FASE 2: Extração segura de textos...');
      this.traverseASTSafely(ast);

      console.log('\n📊 FASE 3: Validação e análise de qualidade...');
      this.validateExtractions();

      console.log('\n🔄 FASE 4: Aplicação segura de modificações...');
      const modifiedContent = this.applyReplacementsSafely();

      console.log('\n📦 FASE 5: Inserção de imports e hooks...');
      const finalContent = this.addImportsAndHooksSafely(modifiedContent);

      console.log('\n✅ FASE 6: Validação final e salvamento...');
      this.validateFinalContent(finalContent);

      fs.writeFileSync(filePath, finalContent, 'utf8');

      const result = Object.fromEntries(this.extractedTexts);
      this.printFinalStats();

      return result;
    } catch (error) {
      console.error(`❌ Erro durante processamento:`, error.message);
      this.restoreFromBackup(filePath);
      throw error;
    }
  }

  /**
   * Validar se é um arquivo React válido
   */
  isValidReactFile() {
    const content = this.originalContent;

    // Verificar se tem imports do React ou JSX
    const hasReactImport = /import.*React|import.*from\s+['"]react['"]/.test(
      content
    );
    const hasJSX = /<[A-Z]/.test(content) || /<\w+/.test(content);
    const hasExport = /export\s+(default\s+)?(function|const|class)/.test(
      content
    );

    return (hasReactImport || hasJSX) && hasExport;
  }

  /**
   * Análise estrutural do AST para detectar padrões perigosos
   */
  analyzeASTStructure(ast) {
    let componentCount = 0;
    let hookCount = 0;
    let complexityScore = 0;

    const analyzer = (node, depth = 0) => {
      if (depth > 50) {
        console.warn(`⚠️ Profundidade excessiva detectada (${depth})`);
        this.stats.safetyViolations++;
        return;
      }

      // Detectar componentes
      if (this.isReactComponent(node)) {
        componentCount++;
      }

      // Detectar hooks
      if (this.isHookCall(node)) {
        hookCount++;
      }

      // Calcular complexidade
      if (
        node.type === 'ConditionalExpression' ||
        node.type === 'IfStatement'
      ) {
        complexityScore += 2;
      }
      if (node.type === 'CallExpression') {
        complexityScore += 1;
      }

      // Recursão segura
      for (const key in node) {
        const child = node[key];
        if (Array.isArray(child)) {
          child.forEach(
            (item) =>
              item && typeof item === 'object' && analyzer(item, depth + 1)
          );
        } else if (child && typeof child === 'object') {
          analyzer(child, depth + 1);
        }
      }
    };

    analyzer(ast);

    console.log(`📊 Análise estrutural:`);
    console.log(`   • Componentes: ${componentCount}`);
    console.log(`   • Hooks: ${hookCount}`);
    console.log(`   • Complexidade: ${complexityScore}`);

    // Determinar se é seguro para transformação
    if (complexityScore > 100) {
      console.warn(`⚠️ Componente muito complexo (score: ${complexityScore})`);
      this.stats.safetyViolations++;
    }
  }

  /**
   * Travessia segura do AST com validação em múltiplas camadas
   */
  traverseASTSafely(node, context = [], depth = 0, parentNode = null) {
    if (!node || depth > 50) {
      if (depth > 50) this.stats.safetyViolations++;
      return;
    }

    this.stats.totalNodesVisited++;

    // Log detalhado para debug
    if (depth < 3 && process.env.DEBUG_AST) {
      console.log(
        `${'  '.repeat(depth)}📍 ${node.type} (${context.join(' → ')})`
      );
    }

    // 1. Textos diretos em JSX (mais seguros)
    if (node.type === 'JSXText') {
      this.processTextNodeSafely(node, context, 'jsx_text', parentNode);
    }

    // 2. Atributos JSX seguros
    if (node.type === 'JSXAttribute' && node.value?.type === 'Literal') {
      const attrName = node.name?.name;
      if (this.isAttributeSafe(attrName)) {
        this.processTextNodeSafely(
          node.value,
          [...context, `attr:${attrName}`],
          'jsx_attribute',
          node
        );
      }
    }

    // 3. Propriedades de objetos (validação rigorosa)
    if (
      node.type === 'Property' &&
      node.value?.type === 'Literal' &&
      typeof node.value.value === 'string'
    ) {
      const propName = this.getPropertyName(node.key);
      if (this.isPropertySafe(propName, context)) {
        this.processTextNodeSafely(
          node.value,
          [...context, `prop:${propName}`],
          'object_property',
          node
        );
      }
    }

    // 4. Arrays de objetos (contexto específico)
    if (node.type === 'ArrayExpression') {
      this.processArrayExpressionSafely(node, context, depth);
    }

    // 5. Objetos standalone
    if (node.type === 'ObjectExpression') {
      this.processObjectExpressionSafely(node, context, depth);
    }

    // 6. Template literals (muito cuidadoso)
    if (node.type === 'TemplateLiteral') {
      this.processTemplateLiteralSafely(node, context);
    }

    // 7. Variáveis com strings (contexto validado)
    if (
      (node.type === 'VariableDeclarator' ||
        node.type === 'AssignmentExpression') &&
      node.init?.type === 'Literal' &&
      typeof node.init.value === 'string'
    ) {
      const varName = node.id?.name || 'variable';
      if (this.isVariableSafe(varName, context)) {
        this.processTextNodeSafely(
          node.init,
          [...context, `var:${varName}`],
          'variable',
          node
        );
      }
    }

    // Atualizar contexto para elementos JSX
    let newContext = context;
    if (node.type === 'JSXElement') {
      const tagName = node.openingElement?.name?.name;
      if (tagName) {
        newContext = [...context, `jsx:${tagName}`];
      }
    }

    // Recursão segura com validação de contexto
    for (const key in node) {
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach((item, index) => {
          if (item && typeof item === 'object') {
            this.traverseASTSafely(
              item,
              [...newContext, `${key}[${index}]`],
              depth + 1,
              node
            );
          }
        });
      } else if (child && typeof child === 'object') {
        this.traverseASTSafely(child, [...newContext, key], depth + 1, node);
      }
    }
  }

  /**
   * Processamento seguro de nós de texto com validação em múltiplas camadas
   */
  processTextNodeSafely(node, context, type, parentNode) {
    if (!node?.value || typeof node.value !== 'string') return;

    const text = node.value;
    const cleanText = this.cleanText(text);

    this.stats.textNodesFound++;

    console.log(
      `\n🔍 Analisando: "${cleanText.substring(0, 60)}${
        cleanText.length > 60 ? '...' : ''
      }"`
    );
    console.log(`   📍 Contexto: ${context.slice(-3).join(' → ')}`);
    console.log(`   🏷️  Tipo: ${type}`);

    // LAYER 1: Verificações básicas de segurança
    if (this.isAlreadyTranslated(text)) {
      this.logSkipped(cleanText, 'já traduzido', 'content');
      return;
    }

    if (this.isEmptyOrWhitespace(cleanText)) {
      this.logSkipped(cleanText, 'vazio/whitespace', 'content');
      return;
    }

    // LAYER 2: Validação de contexto perigoso
    if (this.isDangerousContext(context, parentNode)) {
      this.logSkipped(cleanText, 'contexto perigoso', 'context');
      this.stats.dangerousContextsDetected++;
      return;
    }

    // LAYER 3: Validação de padrões técnicos
    if (this.isTechnicalPattern(cleanText)) {
      this.logSkipped(cleanText, 'padrão técnico', 'pattern');
      return;
    }

    // LAYER 4: Validação de conteúdo
    const contentValidation = this.validateTextContent(
      cleanText,
      context,
      type
    );
    if (!contentValidation.isValid) {
      this.logSkipped(cleanText, contentValidation.reason, 'content');
      return;
    }

    // LAYER 5: Validação de posição segura no AST
    if (!this.isSafeTextPosition(node, parentNode, context)) {
      this.logSkipped(cleanText, 'posição insegura', 'context');
      return;
    }

    // SUCESSO: Texto aprovado para extração
    const key = this.generateKey(cleanText, context, type);
    if (key && !this.extractedTexts.has(key)) {
      this.extractedTexts.set(key, cleanText);
      this.stats.validTextsExtracted++;

      // Validar que o range está disponível antes de adicionar substituição
      if (node.range && node.range.length === 2) {
        this.replacements.push({
          start: node.range[0],
          end: node.range[1],
          originalText: text,
          key: key,
          type: type,
          isAttribute: type === 'jsx_attribute',
          context: context.join('.'),
          validated: true,
        });
      }

      console.log(`   ✅ EXTRAÍDO: ${key}`);
    } else if (this.extractedTexts.has(key)) {
      console.log(`   🔁 DUPLICADO: ${key}`);
    }
  }

  /**
   * Validações de segurança específicas
   */
  isDangerousContext(context, parentNode) {
    const contextStr = context.join(' ').toLowerCase();

    // Verificar contextos explicitamente perigosos
    for (const dangerous of this.DANGEROUS_CONTEXTS) {
      if (contextStr.includes(dangerous.toLowerCase())) {
        return true;
      }
    }

    // Verificar se está dentro de um contexto de definição
    if (contextStr.includes('import') || contextStr.includes('export')) {
      return true;
    }

    // Verificar nó pai
    if (
      parentNode?.type === 'ImportDeclaration' ||
      parentNode?.type === 'ExportDeclaration'
    ) {
      return true;
    }

    return false;
  }

  isTechnicalPattern(text) {
    const trimmed = text.trim();

    // Verificar padrões técnicos conhecidos
    return (
      this.TECHNICAL_PATTERNS.some((pattern) => pattern.test(trimmed)) ||
      this.CODE_KEYWORDS.has(trimmed.toLowerCase()) ||
      this.isPathLike(trimmed) ||
      this.isURLLike(trimmed) ||
      this.isColorCode(trimmed) ||
      this.isCSSValue(trimmed)
    );
  }

  isPathLike(text) {
    return (
      /^[\.\/]/.test(text) ||
      /\.(tsx?|jsx?|css|scss|json|png|jpg|svg)$/i.test(text)
    );
  }

  isURLLike(text) {
    return (
      /^https?:\/\//.test(text) ||
      /^www\./.test(text) ||
      /\.(com|org|net|io)/.test(text)
    );
  }

  isColorCode(text) {
    return (
      /^#[a-fA-F0-9]{3,8}$/.test(text) ||
      /^rgb\(/.test(text) ||
      /^hsl\(/.test(text)
    );
  }

  isCSSValue(text) {
    return (
      /^\d+(\.\d+)?(px|em|rem|vh|vw|%|s|ms)$/.test(text) ||
      /^(auto|none|inherit|initial|unset)$/.test(text)
    );
  }

  validateTextContent(text, context, type) {
    // 1. Comprimento mínimo
    if (text.length < 1) {
      return { isValid: false, reason: 'muito curto' };
    }

    // 2. Validação específica para propriedades de objetos
    if (type === 'object_property') {
      return this.validateObjectPropertyText(text, context);
    }

    // 3. Números com símbolo + são válidos para UI (ex: "1000+", "5000+")
    if (/^\d+\+$/.test(text.trim())) {
      return { isValid: true, reason: 'número com + válido para UI' };
    }

    // 4. Deve ter pelo menos uma letra ou pontuação útil
    if (
      !/[a-zA-ZÀ-ÿ\u4e00-\u9fff\u0400-\u04ff]/.test(text) &&
      !/[.,:;!?—–\+]/.test(text)
    ) {
      return { isValid: false, reason: 'sem caracteres válidos' };
    }

    // 5. Não deve ser apenas números simples (mas aceitar números com formatação)
    if (/^\d+$/.test(text.trim()) && text.length > 10) {
      return { isValid: false, reason: 'apenas números grandes' };
    }

    // 6. Verificar se parece ser texto de interface
    if (this.looksLikeUIText(text, context)) {
      return { isValid: true, reason: 'texto de interface válido' };
    }

    // 7. Verificar se tem estrutura de linguagem natural
    if (this.hasNaturalLanguageStructure(text)) {
      return { isValid: true, reason: 'estrutura de linguagem natural' };
    }

    // 8. Textos muito curtos precisam de validação extra
    if (text.length <= 3) {
      return this.validateShortText(text, context);
    }

    return { isValid: true, reason: 'validação padrão aprovada' };
  }

  /**
   * Validação específica para textos de propriedades de objetos
   */
  validateObjectPropertyText(text, context) {
    const trimmed = text.trim();

    // Aceitar números com + para estatísticas (1000+, 5000+)
    if (/^\d+\+$/.test(trimmed)) {
      return { isValid: true, reason: 'estatística numérica em objeto' };
    }

    // Textos em objetos tendem a ser mais estruturados
    // Aceitar textos mais curtos se estão em contexto de UI
    if (trimmed.length >= 1) {
      // Verificar se tem pelo menos uma letra
      if (/[a-zA-ZÀ-ÿ]/.test(trimmed)) {
        return {
          isValid: true,
          reason: 'texto em propriedade de objeto válido',
        };
      }

      // Aceitar pontuação comum
      if (/^[.,:;!?—–\-+]+$/.test(trimmed)) {
        return { isValid: true, reason: 'pontuação em objeto válida' };
      }

      // Aceitar números formatados para UI
      if (/^\d+[\.\,]?\d*[%\+\-]?$/.test(trimmed)) {
        return { isValid: true, reason: 'número formatado em objeto' };
      }
    }

    // Rejeitar se parece ser código
    if (this.isTechnicalPattern(trimmed)) {
      return { isValid: false, reason: 'padrão técnico em objeto' };
    }

    return {
      isValid: false,
      reason: 'texto em objeto muito curto ou inválido',
    };
  }

  looksLikeUIText(text, context) {
    const contextStr = context.join(' ').toLowerCase();

    // Indicadores de texto de UI
    const uiIndicators = [
      'button',
      'label',
      'title',
      'heading',
      'text',
      'message',
      'error',
      'success',
      'warning',
      'info',
      'tooltip',
      'placeholder',
    ];

    return uiIndicators.some((indicator) => contextStr.includes(indicator));
  }

  hasNaturalLanguageStructure(text) {
    // Verificar se tem características de linguagem natural
    const hasSpaces = /\s/.test(text);
    const hasCapitalization = /[A-Z]/.test(text) && /[a-z]/.test(text);
    const hasPunctuation = /[.,:;!?]/.test(text);
    const hasWords = text.split(/\s+/).length > 1;

    return hasSpaces && (hasCapitalization || hasPunctuation || hasWords);
  }

  validateShortText(text, context) {
    const trimmed = text.trim();

    // Permitir números com + (estatísticas de UI)
    if (/^\d+\+$/.test(trimmed)) {
      return { isValid: true, reason: 'estatística numérica válida' };
    }

    // Permitir pontuação comum
    if (/^[.,:;!?—–]+$/.test(trimmed)) {
      return { isValid: true, reason: 'pontuação válida' };
    }

    // Permitir palavras comuns de UI
    const commonUIWords = [
      'ok',
      'yes',
      'no',
      'hi',
      'bye',
      'new',
      'add',
      'edit',
      'save',
      'go',
      'ver',
      'mais',
    ];
    if (commonUIWords.includes(trimmed.toLowerCase())) {
      return { isValid: true, reason: 'palavra comum de UI' };
    }

    // Rejeitar códigos muito curtos sem vogais
    if (
      trimmed.length <= 2 &&
      !/[aeiouAEIOU]/.test(trimmed) &&
      !/\d/.test(trimmed)
    ) {
      return { isValid: false, reason: 'código muito curto' };
    }

    return { isValid: true, reason: 'texto curto aprovado' };
  }

  isSafeTextPosition(node, parentNode, context) {
    // Verificar se está em uma posição segura do JSX
    if (parentNode?.type && this.SAFE_JSX_PARENTS.has(parentNode.type)) {
      return true;
    }

    // Verificar se não está em contexto de definição
    const contextStr = context.join(' ').toLowerCase();
    const unsafeContexts = ['import', 'export', 'declare', 'interface', 'type'];

    return !unsafeContexts.some((unsafe) => contextStr.includes(unsafe));
  }

  isAttributeSafe(attrName) {
    if (!attrName) return false;

    // Lista branca de atributos seguros
    const safeAttributes = ['title', 'alt', 'placeholder', 'label'];

    return (
      safeAttributes.includes(attrName) &&
      !this.DANGEROUS_CONTEXTS.has(attrName)
    );
  }

  isPropertySafe(propName, context) {
    if (!propName) return false;

    // Lista expandida de propriedades seguras
    const safeProperties = [
      'label',
      'title',
      'subtitle',
      'description',
      'message',
      'text',
      'content',
      'placeholder',
      'tooltip',
      'error',
      'success',
      'warning',
      'info',
      'name',
      'fullName',
      'displayName',
      'caption',
      'summary',
      'heading',
      'buttonText',
      'linkText',
      'menuText',
      'tabTitle',
      'sectionTitle',
    ];

    // Lista expandida de propriedades perigosas
    const dangerousProperties = [
      'id',
      'key',
      'className',
      'style',
      'href',
      'src',
      'url',
      'path',
      'onClick',
      'onChange',
      'onSubmit',
      'type',
      'method',
      'value',
      'width',
      'height',
      'icon',
      'Icon',
      'component',
      'Component',
      'variant',
      'size',
      'delay',
      'duration',
      'config',
      'options',
      'props',
      'ref',
      'data',
      'aria',
      'role',
      'tabIndex',
    ];

    // Verificar se está na whitelist
    const isSafeProperty = safeProperties.includes(propName);

    // Verificar se está na blacklist
    const isDangerousProperty =
      dangerousProperties.includes(propName) ||
      propName.startsWith('on') ||
      propName.startsWith('css') ||
      propName.startsWith('style') ||
      propName.startsWith('data-') ||
      propName.startsWith('aria-');

    // Se está na whitelist e não está na blacklist, é seguro
    const isSafe =
      isSafeProperty &&
      !isDangerousProperty &&
      !this.isDangerousContext(context, null);

    if (!isSafe && isSafeProperty) {
      console.log(
        `   ⚠️ Propriedade "${propName}" está na whitelist mas foi rejeitada por contexto`
      );
    }

    return isSafe;
  }

  isVariableSafe(varName, context) {
    // Evitar variáveis que parecem técnicas
    return (
      !this.TECHNICAL_PATTERNS.some((pattern) => pattern.test(varName)) &&
      !this.CODE_KEYWORDS.has(varName) &&
      !this.isDangerousContext(context, null)
    );
  }

  /**
   * Processamento seguro de arrays
   */
  processArrayExpressionSafely(node, context, depth) {
    if (depth > 10) {
      console.warn(`⚠️ Array muito profundo, pulando (depth: ${depth})`);
      return;
    }

    console.log(`📋 Array com ${node.elements?.length || 0} elementos`);

    node.elements?.forEach((element, index) => {
      if (element?.type === 'ObjectExpression') {
        // Processar objeto dentro do array
        this.processObjectInArray(element, context, index);

        // Também continuar a travessia normal
        this.traverseASTSafely(
          element,
          [...context, `array[${index}]`],
          depth + 1,
          node
        );
      }
    });
  }

  /**
   * Processamento específico para objetos dentro de arrays
   */
  processObjectInArray(objectNode, context, arrayIndex) {
    if (!objectNode || objectNode.type !== 'ObjectExpression') return;

    console.log(`📦 Processando objeto ${arrayIndex} em array`);

    objectNode.properties?.forEach((prop, propIndex) => {
      if (
        prop.type === 'Property' &&
        prop.value?.type === 'Literal' &&
        typeof prop.value.value === 'string'
      ) {
        const propName = this.getPropertyName(prop.key);
        console.log(
          `   🔑 Propriedade "${propName}": "${prop.value.value?.substring(
            0,
            50
          )}..."`
        );

        if (this.isPropertySafe(propName, context)) {
          this.processTextNodeSafely(
            prop.value,
            [...context, `obj[${arrayIndex}].${propName}`],
            'object_property',
            prop
          );
        } else {
          this.logSkipped(
            prop.value.value,
            `propriedade não segura: ${propName}`,
            'context'
          );
        }
      }
    });
  }

  /**
   * Processamento seguro de objetos standalone
   */
  processObjectExpressionSafely(node, context, depth) {
    if (depth > 10) {
      console.warn(`⚠️ Objeto muito profundo, pulando (depth: ${depth})`);
      return;
    }

    console.log(`📦 Objeto com ${node.properties?.length || 0} propriedades`);

    node.properties?.forEach((prop, index) => {
      if (
        prop.type === 'Property' &&
        prop.value?.type === 'Literal' &&
        typeof prop.value.value === 'string'
      ) {
        const propName = this.getPropertyName(prop.key);
        console.log(
          `   🔑 Propriedade "${propName}": "${prop.value.value?.substring(
            0,
            50
          )}..."`
        );

        if (this.isPropertySafe(propName, context)) {
          this.processTextNodeSafely(
            prop.value,
            [...context, `obj.${propName}`],
            'object_property',
            prop
          );
        } else {
          this.logSkipped(
            prop.value.value,
            `propriedade não segura: ${propName}`,
            'context'
          );
        }
      }
    });
  }

  /**
   * Processamento seguro de template literals
   */
  processTemplateLiteralSafely(node, context) {
    node.quasis?.forEach((quasi, index) => {
      if (quasi.value?.raw) {
        const rawText = quasi.value.raw.trim();

        // Pular se tem interpolação complexa
        if (this.hasComplexInterpolation(node)) {
          this.logSkipped(rawText, 'interpolação complexa', 'pattern');
          return;
        }

        // Pular se é claramente código
        if (this.isTemplateCode(rawText)) {
          this.logSkipped(rawText, 'código em template', 'pattern');
          return;
        }

        // Criar pseudo-node para processamento
        const pseudoNode = {
          type: 'Literal',
          value: rawText,
          range: quasi.range,
        };

        this.processTextNodeSafely(
          pseudoNode,
          [...context, `template[${index}]`],
          'template_literal',
          node
        );
      }
    });
  }

  hasComplexInterpolation(templateNode) {
    return templateNode.expressions?.some(
      (expr) =>
        expr.type === 'CallExpression' ||
        expr.type === 'ConditionalExpression' ||
        expr.type === 'BinaryExpression'
    );
  }

  isTemplateCode(text) {
    return (
      /^\$\{/.test(text) ||
      /animation|keyframes|transform|transition/i.test(text) ||
      /opacity|visibility|z-index|position/i.test(text)
    );
  }

  /**
   * Validação das extrações realizadas
   */
  validateExtractions() {
    console.log('🔍 Validando extrações realizadas...');

    // Validar chaves duplicadas
    const keyFrequency = new Map();
    for (const [key, value] of this.extractedTexts) {
      keyFrequency.set(key, (keyFrequency.get(key) || 0) + 1);
    }

    const duplicates = [...keyFrequency.entries()].filter(
      ([key, count]) => count > 1
    );
    if (duplicates.length > 0) {
      console.warn(`⚠️ Chaves duplicadas encontradas: ${duplicates.length}`);
      duplicates.forEach(([key, count]) => {
        console.warn(`   - ${key}: ${count}x`);
      });
    }

    // Validar textos muito curtos ou suspeitos
    const suspiciousTexts = [];
    for (const [key, text] of this.extractedTexts) {
      if (text.length < 2 && !/[a-zA-ZÀ-ÿ]/.test(text)) {
        suspiciousTexts.push({ key, text });
      }
      if (this.TECHNICAL_PATTERNS.some((pattern) => pattern.test(text))) {
        suspiciousTexts.push({ key, text });
      }
    }

    if (suspiciousTexts.length > 0) {
      console.warn(
        `⚠️ Textos suspeitos encontrados: ${suspiciousTexts.length}`
      );
      suspiciousTexts.slice(0, 5).forEach(({ key, text }) => {
        console.warn(`   - ${key}: "${text}"`);
      });
    }

    // Validar ranges das substituições
    const invalidReplacements = this.replacements.filter(
      (r) =>
        !r.start ||
        !r.end ||
        r.start >= r.end ||
        r.end > this.originalContent.length
    );

    if (invalidReplacements.length > 0) {
      console.warn(
        `⚠️ Substituições com range inválido: ${invalidReplacements.length}`
      );
      this.replacements = this.replacements.filter(
        (r) =>
          r.start &&
          r.end &&
          r.start < r.end &&
          r.end <= this.originalContent.length
      );
    }

    console.log(
      `✅ Validação concluída: ${this.extractedTexts.size} textos válidos`
    );
  }

  /**
   * Aplicação segura das substituições com validação
   */
  applyReplacementsSafely() {
    if (this.replacements.length === 0) {
      console.log('📝 Nenhuma substituição para aplicar');
      return this.originalContent;
    }

    console.log(`🔄 Aplicando ${this.replacements.length} substituições...`);

    // Validar todas as substituições antes de aplicar
    const validReplacements = this.validateReplacements();
    if (validReplacements.length === 0) {
      console.warn('⚠️ Nenhuma substituição é segura para aplicar');
      return this.originalContent;
    }

    // Ordenar por posição (do final para o início)
    validReplacements.sort((a, b) => b.start - a.start);

    let modifiedContent = this.originalContent;
    let appliedCount = 0;

    for (const replacement of validReplacements) {
      try {
        const { start, end, key, isAttribute } = replacement;

        // Validar range antes de aplicar
        if (start >= 0 && end > start && end <= modifiedContent.length) {
          const newText = isAttribute ? `{t('${key}')}` : `{t('${key}')}`;

          modifiedContent =
            modifiedContent.slice(0, start) +
            newText +
            modifiedContent.slice(end);

          appliedCount++;
          this.stats.replacementsApplied++;
        } else {
          console.warn(`⚠️ Range inválido para substituição: ${start}-${end}`);
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao aplicar substituição: ${error.message}`);
      }
    }

    console.log(`✅ ${appliedCount} substituições aplicadas com sucesso`);
    return modifiedContent;
  }

  validateReplacements() {
    return this.replacements.filter((replacement) => {
      // Validar range
      if (
        !replacement.start ||
        !replacement.end ||
        replacement.start >= replacement.end
      ) {
        console.warn(
          `⚠️ Range inválido: ${replacement.start}-${replacement.end}`
        );
        return false;
      }

      // Validar se o texto original ainda existe na posição
      const originalText = this.originalContent.slice(
        replacement.start,
        replacement.end
      );
      if (originalText !== replacement.originalText) {
        console.warn(
          `⚠️ Texto original não confere na posição ${replacement.start}`
        );
        return false;
      }

      return true;
    });
  }

  /**
   * Inserção segura de imports e hooks
   */
  addImportsAndHooksSafely(content) {
    let modifiedContent = content;

    try {
      // 1. Adicionar import se necessário e não existir
      if (this.replacements.length > 0 && !this.hasTranslationImport(content)) {
        modifiedContent = this.addTranslationImport(modifiedContent);
      }

      // 2. Adicionar hook se necessário e seguro
      if (
        this.replacements.length > 0 &&
        !this.hasTranslationHook(modifiedContent)
      ) {
        modifiedContent = this.addTranslationHook(modifiedContent);
      }

      return modifiedContent;
    } catch (error) {
      console.warn(`⚠️ Erro ao adicionar imports/hooks: ${error.message}`);
      console.warn('📝 Retornando conteúdo sem modificações de imports/hooks');
      return content;
    }
  }

  hasTranslationImport(content) {
    return /import.*useTranslation.*from.*['"]@\/app\/hooks\/useTranslation['"]/.test(
      content
    );
  }

  hasTranslationHook(content) {
    return /useTranslation\s*\(/.test(content);
  }

  addTranslationImport(content) {
    const importStatement =
      "import { useTranslation } from '@/app/hooks/useTranslation';\n";

    // Encontrar onde inserir o import
    const importRegex = /import.*from.*['"][^'"]*['"];?\n/g;
    const imports = [...content.matchAll(importRegex)];

    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportEnd = lastImport.index + lastImport[0].length;

      return (
        content.slice(0, lastImportEnd) +
        importStatement +
        content.slice(lastImportEnd)
      );
    } else {
      return importStatement + content;
    }
  }

  addTranslationHook(content) {
    // Encontrar componente React
    const componentMatch = this.findReactComponent(content);
    if (!componentMatch) {
      console.warn(
        '⚠️ Não foi possível encontrar componente React para inserir hook'
      );
      return content;
    }

    const hookStatement = `  const { t } = useTranslation({ sections: ['${this.sectionPath}'] });\n\n`;
    const insertionPoint = this.findSafeHookInsertionPoint(
      content,
      componentMatch
    );

    if (insertionPoint === -1) {
      console.warn(
        '⚠️ Não foi possível encontrar ponto seguro para inserir hook'
      );
      return content;
    }

    return (
      content.slice(0, insertionPoint) +
      hookStatement +
      content.slice(insertionPoint)
    );
  }

  findReactComponent(content) {
    const patterns = [
      /export\s+default\s+function\s+(\w+)/,
      /const\s+(\w+)\s*[:=]\s*\([^)]*\)\s*=>/,
      /function\s+(\w+)\s*\([^)]*\)\s*{/,
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match;
    }

    return null;
  }

  findSafeHookInsertionPoint(content, componentMatch) {
    const componentStart = componentMatch.index + componentMatch[0].length;
    const openBrace = content.indexOf('{', componentStart);

    if (openBrace === -1) return -1;

    // Encontrar ponto depois de outros hooks mas antes do resto do código
    const lines = content.slice(openBrace + 1).split('\n');
    let insertLineIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line || line.startsWith('//') || line.startsWith('/*')) {
        continue;
      }

      if (this.isHookLine(line)) {
        insertLineIndex = i + 1;
      } else if (line && !this.isDeclarationLine(line)) {
        break;
      }
    }

    const linesBeforeInsert = lines.slice(0, insertLineIndex);
    const charactersBeforeInsert = linesBeforeInsert.join('\n').length;

    return (
      openBrace + 1 + charactersBeforeInsert + (insertLineIndex > 0 ? 1 : 0)
    );
  }

  isHookLine(line) {
    return /const\s+.*=\s*use[A-Z]/.test(line) || /use[A-Z]\w*\s*\(/.test(line);
  }

  isDeclarationLine(line) {
    return /^(const|let|var|function)\s/.test(line);
  }

  /**
   * Validação final do conteúdo modificado
   */
  validateFinalContent(content) {
    try {
      // Tentar fazer parse do conteúdo modificado
      parse(content, {
        jsx: true,
        useJSXTextNode: true,
        errorOnUnknownASTType: true,
      });

      console.log('✅ Validação sintática: APROVADA');
    } catch (error) {
      console.error('❌ Validação sintática: FALHOU');
      throw new Error(
        `Conteúdo modificado contém erros de sintaxe: ${error.message}`
      );
    }

    // Validar se os imports estão corretos
    if (this.replacements.length > 0) {
      if (!this.hasTranslationImport(content)) {
        console.warn('⚠️ Import de tradução não encontrado no conteúdo final');
      }
      if (!this.hasTranslationHook(content)) {
        console.warn('⚠️ Hook de tradução não encontrado no conteúdo final');
      }
    }
  }

  /**
   * Utilitários e helpers
   */
  isReactComponent(node) {
    return (
      (node.type === 'FunctionDeclaration' ||
        node.type === 'ArrowFunctionExpression') &&
      /^[A-Z]/.test(node.id?.name || node.parent?.id?.name || '')
    );
  }

  isHookCall(node) {
    return (
      node.type === 'CallExpression' && node.callee?.name?.startsWith('use')
    );
  }

  cleanText(text) {
    return text.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
  }

  isAlreadyTranslated(text) {
    return /\{?\s*t\s*\(/.test(text);
  }

  isEmptyOrWhitespace(text) {
    return !text || !text.trim() || /^\s*$/.test(text);
  }

  getPropertyName(keyNode) {
    if (keyNode.type === 'Literal') return keyNode.value;
    if (keyNode.type === 'Identifier') return keyNode.name;
    return 'unknown';
  }

  generateKey(text, context, type) {
    let keyParts = [];

    // Seção base
    if (this.sectionName) {
      keyParts.push(this.sectionName.replace(/[^a-zA-Z0-9]/g, '_'));
    }

    // Contexto limpo (últimos 2 elementos significativos)
    const cleanContext = context
      .filter((c) => !c.startsWith('attr:') && !c.startsWith('prop:'))
      .filter((c) => !['div', 'span', 'p', 'Fragment'].includes(c))
      .slice(-2);

    if (cleanContext.length > 0) {
      keyParts.push(
        ...cleanContext.map((c) =>
          c.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')
        )
      );
    }

    // Chave baseada no texto
    const textKey = this.generateTextKey(text);
    keyParts.push(textKey);

    // Gerar chave final com contador para evitar duplicatas
    let finalKey = keyParts.join('_');
    const baseKey = finalKey;
    let counter = this.keyCounter.get(baseKey) || 0;

    if (counter > 0) {
      finalKey = `${baseKey}_${counter}`;
    }

    this.keyCounter.set(baseKey, counter + 1);
    return finalKey;
  }

  generateTextKey(text) {
    const cleanText = text.toLowerCase().trim();

    // Palavras-chave semânticas específicas do domínio (expandida)
    const semanticPatterns = {
      // Ações
      salvar: 'save',
      salvo: 'saved',
      cancelar: 'cancel',
      confirmar: 'confirm',
      excluir: 'delete',
      editar: 'edit',
      criar: 'create',
      adicionar: 'add',
      fechar: 'close',
      abrir: 'open',
      enviar: 'send',
      buscar: 'search',
      pesquisar: 'search',
      pesquisa: 'search',

      // Estados
      carregando: 'loading',
      processando: 'processing',
      sucesso: 'success',
      erro: 'error',
      aviso: 'warning',

      // Contexto musical
      compositor: 'composer',
      compositores: 'composers',
      obra: 'work',
      obras: 'works',
      partitura: 'score',
      partituras: 'scores',
      música: 'music',
      musica: 'music',
      musical: 'music',
      musicais: 'music',
      estudo: 'study',
      estudos: 'studies',
      prática: 'practice',
      pratica: 'practice',

      // Navegação
      início: 'home',
      inicio: 'home',
      página: 'page',
      pagina: 'page',
      próximo: 'next',
      proximo: 'next',
      anterior: 'previous',

      // Interface comum
      título: 'title',
      titulo: 'title',
      subtítulo: 'subtitle',
      subtitulo: 'subtitle',
      descrição: 'description',
      descricao: 'description',
      nome: 'name',
      email: 'email',
      senha: 'password',
      usuário: 'user',
      usuario: 'user',
      perfil: 'profile',

      // Feedback
      bem: 'welcome',
      vindo: 'welcome',
      'bem-vindo': 'welcome',
      obrigado: 'thanks',
      obrigada: 'thanks',
      parabéns: 'congratulations',
      parabens: 'congratulations',
    };

    for (const [pattern, key] of Object.entries(semanticPatterns)) {
      if (cleanText.includes(pattern)) {
        return key;
      }
    }

    // Extrair palavras significativas
    const words = cleanText
      .replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .filter(
        (word) =>
          ![
            'para',
            'com',
            'por',
            'sem',
            'dos',
            'das',
            'uma',
            'the',
            'and',
            'for',
            'que',
            'você',
            'voce',
          ].includes(word)
      );

    if (words.length === 0) return 'text';
    if (words.length === 1) return words[0].slice(0, 20);

    return words.slice(0, 3).join('_').slice(0, 40);
  }

  logSkipped(text, reason, category) {
    this.stats[
      `skippedBy${category.charAt(0).toUpperCase() + category.slice(1)}`
    ]++;

    const reasonKey = reason.split(':')[0];
    this.stats.ignoredReasons.set(
      reasonKey,
      (this.stats.ignoredReasons.get(reasonKey) || 0) + 1
    );

    console.log(
      `   🚫 IGNORADO (${reason}): "${text.substring(0, 50)}${
        text.length > 50 ? '...' : ''
      }"`
    );
  }

  createBackup(filePath) {
    this.backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copyFileSync(filePath, this.backupPath);
    console.log(`💾 Backup criado: ${this.backupPath}`);
  }

  restoreFromBackup(filePath) {
    if (this.backupPath && fs.existsSync(this.backupPath)) {
      fs.copyFileSync(this.backupPath, filePath);
      console.log(`🔄 Arquivo restaurado do backup`);
    }
  }

  printFinalStats() {
    console.log('\n📊 ESTATÍSTICAS FINAIS:');
    console.log(`   🔍 Nós visitados: ${this.stats.totalNodesVisited}`);
    console.log(`   📝 Textos encontrados: ${this.stats.textNodesFound}`);
    console.log(`   ✅ Textos extraídos: ${this.stats.validTextsExtracted}`);
    console.log(
      `   🔄 Substituições aplicadas: ${this.stats.replacementsApplied}`
    );
    console.log(`   🚫 Ignorados por contexto: ${this.stats.skippedByContext}`);
    console.log(`   🚫 Ignorados por conteúdo: ${this.stats.skippedByContent}`);
    console.log(`   🚫 Ignorados por padrão: ${this.stats.skippedByPattern}`);
    console.log(
      `   ⚠️ Contextos perigosos: ${this.stats.dangerousContextsDetected}`
    );
    console.log(`   ⚠️ Violações de segurança: ${this.stats.safetyViolations}`);

    if (this.stats.ignoredReasons.size > 0) {
      console.log('\n📋 PRINCIPAIS RAZÕES PARA IGNORAR:');
      const sortedReasons = [...this.stats.ignoredReasons.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      for (const [reason, count] of sortedReasons) {
        console.log(`   • ${reason}: ${count}x`);
      }
    }

    // Calcular taxa de sucesso
    const totalCandidates = this.stats.textNodesFound;
    const successRate =
      totalCandidates > 0
        ? ((this.stats.validTextsExtracted / totalCandidates) * 100).toFixed(1)
        : 0;

    console.log(
      `\n📈 TAXA DE SUCESSO: ${successRate}% (${this.stats.validTextsExtracted}/${totalCandidates})`
    );
  }
}

// ===================================================================
// FUNÇÕES DE TRADUÇÃO E SALVAMENTO (mantidas do script original)
// ===================================================================

function saveTranslations(texts, sectionPath) {
  const translationsDir = path.join(process.cwd(), 'public', 'translations');

  const sectionDir = path.dirname(sectionPath);
  if (sectionDir !== '.') {
    const fullSectionDir = path.join(translationsDir, sectionDir);
    if (!fs.existsSync(fullSectionDir)) {
      fs.mkdirSync(fullSectionDir, { recursive: true });
      console.log(`📁 Diretório criado: ${fullSectionDir}`);
    }
  } else if (!fs.existsSync(translationsDir)) {
    fs.mkdirSync(translationsDir, { recursive: true });
  }

  const filePath = path.join(translationsDir, `${sectionPath}.json`);

  let existingData = { ptBr: {}, en: {} };
  if (fs.existsSync(filePath)) {
    try {
      existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(
        `📖 Carregado arquivo existente com ${
          Object.keys(existingData.ptBr || {}).length
        } textos`
      );
    } catch (error) {
      console.warn(`⚠️ Erro ao ler arquivo existente: ${error.message}`);
    }
  }

  const mergedPtBr = { ...(existingData.ptBr || {}), ...texts };
  const mergedEn = { ...(existingData.en || {}) };

  Object.keys(texts).forEach((key) => {
    if (!mergedEn[key]) {
      mergedEn[key] = '';
    }
  });

  const finalData = { ptBr: mergedPtBr, en: mergedEn };
  fs.writeFileSync(filePath, JSON.stringify(finalData, null, 2), 'utf8');

  console.log(`✅ Salvos textos em: ${filePath}`);
  console.log(`   - ${Object.keys(texts).length} novos textos em português`);
  console.log(
    `   - ${
      Object.keys(existingData.ptBr || {}).length
    } textos portugueses mantidos`
  );

  return finalData;
}

async function translateTexts(data, sectionPath) {
  console.log(
    `\n🌍 Traduzindo textos da seção "${sectionPath}" para inglês...`
  );

  const { ptBr, en } = data;
  let translatedCount = 0;
  let skippedCount = 0;

  for (const [key, ptText] of Object.entries(ptBr)) {
    if (en[key] && en[key].trim()) {
      skippedCount++;
      continue;
    }

    try {
      console.log(`🔄 Traduzindo: ${key}`);
      const cleanedText = ptText
        .replace(/\n\s*/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const translatedText = await translateWithGoogle(cleanedText, key);
      en[key] = translatedText;
      translatedCount++;
      await delay(200);
    } catch (error) {
      console.error(`❌ Erro ao traduzir "${key}": ${error.message}`);
      en[key] = ptText;
    }
  }

  const filePath = path.join(
    process.cwd(),
    'public',
    'translations',
    `${sectionPath}.json`
  );
  fs.writeFileSync(filePath, JSON.stringify({ ptBr, en }, null, 2), 'utf8');

  console.log(`✅ Tradução concluída:`);
  console.log(`   - ${translatedCount} novas traduções`);
  console.log(`   - ${skippedCount} traduções mantidas`);

  return { ptBr, en };
}

async function translateWithGoogle(text, key = '') {
  try {
    let contextualText = text;
    if (
      key.includes('music') ||
      key.includes('composer') ||
      key.includes('work')
    ) {
      contextualText = `[MUSIC CONTEXT] ${text}`;
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=${encodeURIComponent(
      contextualText
    )}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      let result = data[0][0][0];
      result = result.replace(/^\[MUSIC CONTEXT\]\s*/i, '');

      // Correções específicas
      result = result
        .replace(/\bIa\b/g, 'AI')
        .replace(/Brazilian crying/gi, 'Brazilian Choro')
        .replace(/compass/gi, 'measure');

      return result;
    }

    throw new Error('Resposta inválida do Google Translate');
  } catch (error) {
    console.warn(`Tradução falhou: ${error.message}`);
    return text;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===================================================================
// FUNÇÃO PRINCIPAL
// ===================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
📖 EXTRATOR ROBUSTO DE TEXTOS PARA i18n

Uso: node scripts/extractTexts.js <arquivo> <seção> [opções]

Exemplos:
  node scripts/extractTexts.js src/app/components/Navbar/index.tsx components/navbar
  node scripts/extractTexts.js src/app/main/about-us/pageClient.tsx pages/aboutUs

Opções:
  --no-translate    Não traduzir automaticamente
  --translate-only  Apenas traduzir arquivo existente
  --debug-ast       Logs detalhados da navegação AST
  --dry-run         Executar sem fazer modificações

🚀 RECURSOS DESTA VERSÃO:
  ✅ Análise robusta com TypeScript AST
  ✅ Validação em múltiplas camadas
  ✅ Sistema de backup e rollback automático
  ✅ Detecção de contextos perigosos
  ✅ Geração inteligente de chaves
  ✅ Inserção segura de hooks
  ✅ Logs detalhados para debug
  ✅ Preservação da integridade do código
  ✅ Tradução de textos em objetos e arrays
    `);
    process.exit(1);
  }

  const [filePath, sectionPath] = args;
  const noTranslate = args.includes('--no-translate');
  const translateOnly = args.includes('--translate-only');
  const dryRun = args.includes('--dry-run');

  if (args.includes('--debug-ast')) {
    process.env.DEBUG_AST = 'true';
  }

  try {
    let translationData = { ptBr: {}, en: {} };

    if (!translateOnly) {
      console.log(`🚀 Iniciando extração robusta...`);
      console.log(`📁 Arquivo: ${filePath}`);
      console.log(`📂 Seção: ${sectionPath}`);

      if (dryRun) {
        console.log(`🔍 Modo DRY RUN - nenhuma modificação será feita`);
      }

      const extractor = new RobustTextExtractor();

      if (dryRun) {
        // Simular extração sem modificar arquivo
        const originalPath = filePath + '.temp';
        fs.copyFileSync(filePath, originalPath);
        const texts = await extractor.extractFromFile(
          originalPath,
          sectionPath
        );
        fs.unlinkSync(originalPath);

        console.log(`\n📋 RESULTADO DO DRY RUN:`);
        console.log(
          `   📝 ${Object.keys(texts).length} textos seriam extraídos`
        );
        Object.entries(texts).forEach(([key, value]) => {
          console.log(`   ${key}: "${value}"`);
        });

        return;
      } else {
        const texts = await extractor.extractFromFile(filePath, sectionPath);
        translationData = saveTranslations(texts, sectionPath);
      }

      console.log(`\n🎉 Extração concluída com sucesso!`);
      console.log(`   🔄 Textos substituídos por {t('chave')}`);
      console.log(`   📦 Import adicionado automaticamente`);
      console.log(
        `   🎣 Hook useTranslation inserido com seção: ['${sectionPath}']`
      );
    } else {
      const translationFilePath = path.join(
        process.cwd(),
        'public',
        'translations',
        `${sectionPath}.json`
      );
      if (fs.existsSync(translationFilePath)) {
        translationData = JSON.parse(
          fs.readFileSync(translationFilePath, 'utf8')
        );
      } else {
        console.error(`❌ Arquivo não encontrado: ${translationFilePath}`);
        process.exit(1);
      }
    }

    if (!noTranslate && Object.keys(translationData.ptBr).length > 0) {
      await translateTexts(translationData, sectionPath);
    }

    console.log(`\n🎉 Processamento da seção "${sectionPath}" concluído!`);
    console.log(`📁 Arquivo salvo em: public/translations/${sectionPath}.json`);
  } catch (error) {
    console.error(`❌ Erro durante processamento:`, error.message);
    console.error('🔄 Verificando se há backup para restaurar...');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RobustTextExtractor, saveTranslations, translateTexts };
