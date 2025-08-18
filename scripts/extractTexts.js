// scripts/extractTexts.js - VERSÃO COMPLETA CORRIGIDA COM SUPORTE A DIRETÓRIOS
// Uso: node scripts/extractTexts.js <arquivo> <seção> [opções]
// Exemplos:
//   node scripts/extractTexts.js src/app/components/Navbar/index.tsx navbar
//   node scripts/extractTexts.js src/app/components/Navbar/index.tsx components/navbar
//   node scripts/extractTexts.js src/app/components/Works/DetailView.tsx works/detail-view

const fs = require('fs');
const path = require('path');
const { parse } = require('@typescript-eslint/typescript-estree');

class SmartTextExtractor {
  constructor() {
    this.extractedTexts = new Map();
    this.keyCounter = new Map();
    this.sectionName = '';
    this.sectionPath = ''; // ✅ NOVO: Caminho completo da seção
    this.replacements = [];
    this.originalContent = '';
  }

  /**
   * ✅ CORRIGIDO: Extrai textos e aceita seções com diretórios
   */
  async extractFromFile(filePath, sectionInput) {
    console.log(`🔍 Analisando: ${filePath}`);
    console.log(`📁 Seção: ${sectionInput}`);

    // ✅ NOVO: Separar seção e path
    this.sectionPath = sectionInput; // ex: "components/navbar"
    this.sectionName = sectionInput.split('/').pop(); // ex: "navbar"

    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`);
    }

    // Ler conteúdo original
    this.originalContent = fs.readFileSync(filePath, 'utf8');

    // Criar backup
    this.createBackup(filePath);

    try {
      const ast = parse(this.originalContent, {
        jsx: true,
        useJSXTextNode: true,
        range: true,
      });

      // Primeira passada: coletar textos e substituições
      this.traverseAST(ast);

      // Segunda passada: aplicar substituições no código
      const modifiedContent = this.applyReplacements();

      // Terceira passada: adicionar imports e hooks
      const finalContent = this.addImportsAndHooks(modifiedContent);

      // Salvar arquivo modificado
      fs.writeFileSync(filePath, finalContent, 'utf8');

      const result = Object.fromEntries(this.extractedTexts);
      console.log(`✅ Extraídos ${Object.keys(result).length} textos válidos`);
      console.log(
        `🔄 Realizadas ${this.replacements.length} substituições no código`
      );

      return result;
    } catch (error) {
      console.error(`❌ Erro ao analisar ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Cria backup do arquivo original
   */
  createBackup(filePath) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`💾 Backup criado: ${backupPath}`);
  }

  /**
   * Navega pela AST extraindo textos e coletando posições para substituição
   */
  traverseAST(node, context = []) {
    if (!node) return;

    // Texto direto em JSX
    if (node.type === 'JSXText') {
      this.processTextWithReplacement(node, context, 'jsx_text');
    }

    // Strings em atributos JSX específicos
    if (node.type === 'JSXAttribute' && node.value?.type === 'Literal') {
      const attrName = node.name?.name;

      if (
        this.isVisibleAttribute(attrName) &&
        typeof node.value.value === 'string'
      ) {
        this.processTextWithReplacement(
          node.value,
          [...context, attrName],
          'attribute'
        );
      }
    }

    // Strings em propriedades de objetos
    if (
      node.type === 'Property' &&
      node.key?.type === 'Literal' &&
      node.value?.type === 'Literal' &&
      typeof node.value.value === 'string'
    ) {
      const propName = node.key.value;
      if (this.isVisibleProperty(propName)) {
        this.processTextWithReplacement(
          node.value,
          [...context, propName],
          'property'
        );
      }
    }

    // Arrays de objetos (para options de Select)
    if (node.type === 'ArrayExpression') {
      node.elements?.forEach((element) => {
        if (element?.type === 'ObjectExpression') {
          element.properties?.forEach((prop) => {
            if (
              prop.type === 'Property' &&
              prop.key?.type === 'Literal' &&
              prop.value?.type === 'Literal' &&
              typeof prop.value.value === 'string'
            ) {
              const propName = prop.key.value;
              if (this.isVisibleProperty(propName)) {
                this.processTextWithReplacement(
                  prop.value,
                  [...context, 'option', propName],
                  'array_property'
                );
              }
            }
          });
        }
      });
    }

    // Template literals
    if (node.type === 'TemplateLiteral') {
      node.quasis?.forEach((quasi) => {
        if (quasi.value?.raw) {
          const rawText = quasi.value.raw;

          // 🆕 FILTRO: Não processar template literals que contêm código CSS/JS
          if (this.isTemplateWithCode(rawText)) {
            console.log(`🚫 Ignorado (template com código): "${rawText}"`);
            return;
          }

          // Para template literals válidos, criar pseudo-node com posição
          const pseudoNode = {
            type: 'Literal',
            value: rawText,
            range: quasi.range,
          };
          this.processTextWithReplacement(pseudoNode, context, 'template');
        }
      });
    }

    // JSX Elements - capturar contexto do componente
    if (node.type === 'JSXElement') {
      const tagName = node.openingElement?.name?.name;
      if (tagName && this.isRelevantComponent(tagName)) {
        context = [...context, tagName];
      }
    }

    // Recursão para filhos
    for (const key in node) {
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach((item) => this.traverseAST(item, context));
      } else if (child && typeof child === 'object') {
        this.traverseAST(child, context);
      }
    }
  }

  /**
   * Processa texto e adiciona à lista de substituições
   */
  processTextWithReplacement(node, context, type) {
    if (!node || !node.value || typeof node.value !== 'string') return;

    const text = node.value;
    const cleanText = this.cleanText(text);

    if (!this.isValidUserText(cleanText)) return;

    // Verificar se já é uma chamada t() para não substituir
    if (this.isAlreadyTranslated(text)) return;

    // 🆕 FILTRO CRÍTICO: Verificar se faz parte de código CSS/JS
    if (this.isPartOfCode(text, context)) {
      console.log(`🚫 Ignorado (código): "${text}"`);
      return;
    }

    // 🆕 FILTRO: Verificar se é fragmento muito pequeno sem contexto útil
    if (this.isMeaninglessFragment(text)) {
      console.log(`🚫 Ignorado (fragmento): "${text}"`);
      return;
    }

    const key = this.generateKey(cleanText, context, type);
    if (key && !this.extractedTexts.has(key)) {
      this.extractedTexts.set(key, cleanText);

      // Adicionar à lista de substituições
      if (node.range) {
        this.replacements.push({
          start: node.range[0],
          end: node.range[1],
          originalText: text,
          key: key,
          type: type,
          isAttribute: type === 'attribute',
        });
      }

      console.log(`📝 ${key}: "${cleanText}"`);
    }
  }

  /**
   * Verifica se o texto já é uma tradução (contém t() ou similar)
   */
  isAlreadyTranslated(text) {
    return text.includes('t(') || text.includes('{t(');
  }

  /**
   * 🆕 FILTRO CRÍTICO: Detecta se o texto faz parte de código CSS/JS
   */
  isPartOfCode(text, context) {
    const trimmed = text.trim();

    // 🚫 Fragmentos CSS específicos
    const cssFragments = [
      's backwards', // animação CSS
      'ease-out', // timing function
      'ease-in', // timing function
      'ease-in-out', // timing function
      'forwards', // animation-fill-mode
      'backwards', // animation-fill-mode
      'infinite', // animation-iteration-count
      'alternate', // animation-direction
      'reverse', // animation-direction
      'paused', // animation-play-state
      'running', // animation-play-state
      'none', // valores CSS gerais
      'auto', // valores CSS gerais
      'inherit', // valores CSS gerais
      'initial', // valores CSS gerais
      'unset', // valores CSS gerais
      'fadeIn', // nomes de animação comuns
      'fadeOut', // nomes de animação comuns
      'fadeInUp', // nomes de animação comuns
      'slideIn', // nomes de animação comuns
      'slideOut', // nomes de animação comuns
      'transform', // propriedades CSS
      'opacity', // propriedades CSS
      'scale', // valores transform
      'rotate', // valores transform
      'translate', // valores transform
      'matrix', // valores transform
    ];

    // 🚫 Verificar se é exatamente um fragmento CSS
    if (cssFragments.includes(trimmed.toLowerCase())) {
      return true;
    }

    // 🚫 Padrões de código JavaScript
    const jsPatterns = [
      /^[a-z]+[A-Z]/, // camelCase
      /^\d+(\.\d+)?(s|ms|px|rem|em|%)$/, // valores com unidades
      /^[a-z]+(In|Out|Up|Down|Left|Right)$/, // nomes de animação
      /^(true|false|null|undefined)$/, // valores literais JS
      /^[a-zA-Z_$][a-zA-Z0-9_$]*\(.*\)$/, // chamadas de função
      /^\$\{.*\}$/, // template literal expression
      /^[a-z]+([A-Z][a-z]*)*$/, // camelCase strict
    ];

    // 🚫 Verificar padrões JS
    if (jsPatterns.some((pattern) => pattern.test(trimmed))) {
      return true;
    }

    // 🚫 Se está dentro de template literal com código
    const contextStr = context.join(' ').toLowerCase();
    if (
      contextStr.includes('style') ||
      contextStr.includes('animation') ||
      contextStr.includes('class')
    ) {
      return true;
    }

    // 🚫 Se contém apenas letras + números (provavelmente código)
    if (/^[a-zA-Z0-9]+$/.test(trimmed) && trimmed.length < 4) {
      return true;
    }

    return false;
  }

  /**
   * 🆕 FILTRO: Detecta template literals que contêm código
   */
  isTemplateWithCode(text) {
    const trimmed = text.trim();

    // 🚫 Template literals com código CSS
    const cssPatterns = [
      /fadeIn|fadeOut|slideIn|slideOut/i, // animações CSS
      /ease-in|ease-out|ease-in-out/i, // timing functions
      /forwards|backwards|infinite|alternate/i, // animation properties
      /transform|translate|scale|rotate/i, // transform functions
      /duration|delay|iteration/i, // animation timing
      /^\d+(\.\d+)?(s|ms|px|rem|em|%)$/, // valores CSS com unidades
    ];

    // 🚫 Verificar se contém padrões CSS
    if (cssPatterns.some((pattern) => pattern.test(trimmed))) {
      return true;
    }

    // 🚫 Template literals com expressões JavaScript
    if (
      trimmed.includes('${') ||
      trimmed.includes('index') ||
      trimmed.includes('*')
    ) {
      return true;
    }

    // 🚫 Se contém palavras-chave JS/CSS
    const codeKeywords = [
      'animation',
      'transition',
      'transform',
      'opacity',
      'visibility',
      'display',
      'position',
      'zIndex',
      'overflow',
      'cursor',
      'function',
      'const',
      'let',
      'var',
      'return',
      'if',
      'else',
      'index',
      'length',
      'map',
      'filter',
      'reduce',
    ];

    if (
      codeKeywords.some((keyword) => trimmed.toLowerCase().includes(keyword))
    ) {
      return true;
    }

    return false;
  }

  /**
   * 🆕 FILTRO: Detecta fragmentos sem significado
   */
  isMeaninglessFragment(text) {
    const trimmed = text.trim();

    // 🚫 Muito curto para ser útil (exceto pontuação específica)
    if (trimmed.length < 3 && ![':', '!', '?', '.'].includes(trimmed)) {
      return true;
    }

    // 🚫 Só números
    if (/^\d+$/.test(trimmed)) {
      return true;
    }

    // 🚫 Fragmentos de uma só palavra sem contexto útil
    const meaninglessWords = [
      // Artigos e preposições portuguesas
      'a',
      'o',
      'e',
      'de',
      'da',
      'do',
      'das',
      'dos',
      'na',
      'no',
      'nas',
      'nos',
      'para',
      'por',
      'com',
      'em',
      'um',
      'uma',
      'uns',
      'umas',
      'que',
      'se',
      // Artigos e preposições inglesas
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'up',
      'out',
      'off',
      'over',
      'under',
      // Valores CSS/JS comuns
      'auto',
      'none',
      'true',
      'false',
      'left',
      'right',
      'top',
      'bottom',
      'center',
      'middle',
      'start',
      'end',
      'flex',
      'grid',
      'block',
      'inline',
      // Fragmentos técnicos
      'px',
      'rem',
      'em',
      'vh',
      'vw',
      'ms',
      'src',
      'alt',
      'id',
      'css',
      'js',
    ];

    if (meaninglessWords.includes(trimmed.toLowerCase())) {
      return true;
    }

    // 🚫 Fragmentos que parecem código
    if (/^[a-z]+[0-9]$/.test(trimmed) || /^[A-Z][a-z]*[0-9]$/.test(trimmed)) {
      return true;
    }

    return false;
  }

  /**
   * Aplica todas as substituições no código
   */
  applyReplacements() {
    if (this.replacements.length === 0) {
      return this.originalContent;
    }

    // Ordenar substituições por posição (do final para o início para não afetar índices)
    this.replacements.sort((a, b) => b.start - a.start);

    let modifiedContent = this.originalContent;

    for (const replacement of this.replacements) {
      const { start, end, key, isAttribute } = replacement;

      let newText;
      if (isAttribute) {
        // Para atributos: placeholder="texto" → placeholder={t('chave')}
        newText = `{t('${key}')}`;
      } else {
        // Para texto JSX: >texto< → >{t('chave')}<
        newText = `{t('${key}')}`;
      }

      // Aplicar substituição
      modifiedContent =
        modifiedContent.slice(0, start) + newText + modifiedContent.slice(end);
    }

    return modifiedContent;
  }

  /**
   * ✅ CORRIGIDO: Adiciona imports e hooks com o caminho correto da seção
   */
  addImportsAndHooks(content) {
    let modifiedContent = content;

    // 1. Adicionar import se não existir
    if (!content.includes("from '@/app/hooks/useTranslation'")) {
      const importStatement =
        "import { useTranslation } from '@/app/hooks/useTranslation';\n";

      // Encontrar onde inserir o import (após outros imports)
      const importRegex = /import.*from.*['"][^'"]*['"];?\n/g;
      const imports = content.match(importRegex);

      if (imports && imports.length > 0) {
        // Inserir após o último import
        const lastImport = imports[imports.length - 1];
        const lastImportIndex =
          content.lastIndexOf(lastImport) + lastImport.length;
        modifiedContent =
          content.slice(0, lastImportIndex) +
          importStatement +
          content.slice(lastImportIndex);
      } else {
        // Se não há imports, adicionar no início
        modifiedContent = importStatement + content;
      }
    }

    // 2. Adicionar hook se não existir E se há substituições
    if (
      !modifiedContent.includes('useTranslation(') &&
      this.replacements.length > 0
    ) {
      // Encontrar o início do componente principal (função ou arrow function)
      const componentPatterns = [
        /export\s+(default\s+)?function\s+(\w+)/,
        /const\s+(\w+)\s*[:=]\s*\([^)]*\)\s*=>/,
        /function\s+(\w+)\s*\([^)]*\)\s*{/,
      ];

      let componentMatch = null;
      let componentName = '';

      for (const pattern of componentPatterns) {
        componentMatch = modifiedContent.match(pattern);
        if (componentMatch) {
          componentName = componentMatch[2] || componentMatch[1];
          break;
        }
      }

      if (componentMatch) {
        // Encontrar a primeira linha dentro do componente
        const componentStart = componentMatch.index + componentMatch[0].length;
        const openBrace = modifiedContent.indexOf('{', componentStart);

        if (openBrace !== -1) {
          // Procurar por um local apropriado para inserir o hook
          // Evitar inserir no meio de outros hooks
          const hookInsertPoint = this.findHookInsertionPoint(
            modifiedContent,
            openBrace + 1
          );

          // ✅ CORREÇÃO: Usar o caminho completo da seção
          const hookStatement = `  const { t } = useTranslation({ sections: ['${this.sectionPath}'] });\n\n`;

          // Inserir o hook
          modifiedContent =
            modifiedContent.slice(0, hookInsertPoint) +
            hookStatement +
            modifiedContent.slice(hookInsertPoint);
        }
      }
    }

    return modifiedContent;
  }

  /**
   * Encontra o ponto ideal para inserir o hook useTranslation
   */
  findHookInsertionPoint(content, startIndex) {
    // Procurar pela primeira linha não-vazia após a abertura da função
    const lines = content.slice(startIndex).split('\n');
    let insertLineIndex = 0;

    // Pular linhas vazias e comentários
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('//') && !line.startsWith('/*')) {
        // Se é um hook existente, inserir após todos os hooks
        if (
          line.includes('use') &&
          (line.includes('useState') ||
            line.includes('useEffect') ||
            line.includes('useCallback'))
        ) {
          insertLineIndex = i + 1;
        } else {
          // Se não é um hook, inserir aqui
          insertLineIndex = i;
          break;
        }
      }
    }

    // Calcular posição absoluta
    const linesBeforeInsert = lines.slice(0, insertLineIndex);
    const charactersBeforeInsert = linesBeforeInsert.join('\n').length;

    return startIndex + charactersBeforeInsert + (insertLineIndex > 0 ? 1 : 0); // +1 para o \n
  }

  // Métodos de validação
  isVisibleAttribute(attrName) {
    const blacklistedAttributes = [
      'className',
      'style',
      'id',
      'key',
      'ref',
      'href',
      'src',
      'type',
      'name',
      'disabled',
      'required',
      'onClick',
      'onChange',
      'onSubmit',
      'onClose',
      'onOpen',
      'onSelect',
      'onFocus',
      'onBlur',
      'onKeyDown',
      'onKeyUp',
      'onKeyPress',
      'onMouseEnter',
      'onMouseLeave',
      'onMouseDown',
      'onMouseUp',
      'value',
      'defaultValue',
      'checked',
      'defaultChecked',
      'width',
      'height',
      'x',
      'y',
      'cx',
      'cy',
      'r',
      'rx',
      'ry',
      'fill',
      'stroke',
      'strokeWidth',
      'viewBox',
      'd',
      'points',
      'transform',
      'opacity',
      'role',
      'tabIndex',
      'min',
      'max',
      'step',
      'rows',
      'cols',
      'span',
      'colSpan',
      'rowSpan',
      'autoComplete',
      'autoFocus',
      'readOnly',
    ];

    const validAttributes = [
      'title',
      'placeholder',
      'alt',
      'label',
      'ariaLabel',
      'aria-label',
    ];

    return (
      validAttributes.includes(attrName) &&
      !blacklistedAttributes.includes(attrName) &&
      !attrName.startsWith('data-') &&
      !attrName.startsWith('aria-') &&
      !attrName.startsWith('on')
    );
  }

  isVisibleProperty(propName) {
    const validProps = [
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
    ];

    const blacklistedProps = [
      'id',
      'key',
      'className',
      'style',
      'href',
      'src',
      'url',
      'path',
      'pathname',
      'search',
      'hash',
      'protocol',
      'host',
      'hostname',
      'port',
      'origin',
      'onClick',
      'onChange',
      'onSubmit',
      'onSelect',
      'onClose',
      'onOpen',
      'type',
      'format',
      'method',
      'mode',
      'cache',
      'credentials',
      'headers',
      'body',
      'signal',
      'value',
      'defaultValue',
      'checked',
      'defaultChecked',
      'disabled',
      'required',
      'readOnly',
      'autoComplete',
      'autoFocus',
      'tabIndex',
      'role',
      'width',
      'height',
      'x',
      'y',
      'left',
      'top',
      'right',
      'bottom',
      'margin',
      'padding',
      'border',
      'background',
      'color',
      'fontSize',
      'fontWeight',
      'lineHeight',
      'opacity',
      'zIndex',
      'position',
      'display',
      'flexDirection',
      'justifyContent',
      'alignItems',
      'gridTemplate',
      'animation',
      'transition',
      'transform',
      'filter',
      'backdropFilter',
      'icon',
      'Icon',
      'component',
      'Component',
      'variant',
      'size',
      'delay',
      'duration',
      'ease',
      'spring',
      'stagger',
      'index',
      'length',
      'count',
      'total',
      'min',
      'max',
      'step',
      'precision',
      'scale',
      'offset',
      'threshold',
      'debounce',
      'throttle',
    ];

    return (
      validProps.includes(propName) &&
      !blacklistedProps.includes(propName) &&
      !propName.startsWith('on') &&
      !propName.startsWith('css_') &&
      !propName.startsWith('style_') &&
      !propName.startsWith('class_') &&
      !propName.startsWith('attr_')
    );
  }

  isRelevantComponent(tagName) {
    const htmlTags = [
      'div',
      'span',
      'p',
      'a',
      'button',
      'input',
      'textarea',
      'select',
      'option',
      'form',
      'section',
      'article',
      'header',
      'footer',
      'nav',
      'main',
      'aside',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'dl',
      'dt',
      'dd',
      'img',
      'svg',
      'path',
      'circle',
      'rect',
      'line',
      'polygon',
      'polyline',
      'ellipse',
      'g',
      'defs',
      'use',
      'symbol',
      'clipPath',
      'mask',
      'br',
      'hr',
      'strong',
      'em',
      'b',
      'i',
      'u',
      'small',
      'sub',
      'sup',
      'code',
      'pre',
      'blockquote',
      'table',
      'thead',
      'tbody',
      'tfoot',
      'tr',
      'th',
      'td',
      'caption',
      'colgroup',
      'col',
    ];

    const relevantComponents = [
      'Modal',
      'Button',
      'Input',
      'Select',
      'Card',
      'Tab',
      'Panel',
      'Section',
      'Header',
      'Title',
      'Subtitle',
      'Label',
      'Message',
      'Alert',
      'Toast',
      'Tooltip',
      'Badge',
      'AccordionSection',
      'Dropdown',
      'Menu',
      'Popover',
      'Dialog',
      'Drawer',
      'Sidebar',
      'Navbar',
      'Footer',
      'Breadcrumb',
      'Pagination',
      'Stepper',
      'Progress',
      'Slider',
      'Switch',
      'Checkbox',
      'Radio',
      'Calendar',
      'DatePicker',
      'TimePicker',
      'ColorPicker',
      'FileUpload',
      'SearchInput',
      'Table',
      'List',
      'Grid',
      'Carousel',
      'Gallery',
      'Video',
      'Audio',
      'Chart',
      'Graph',
      'Map',
    ];

    return (
      !htmlTags.includes(tagName) &&
      (relevantComponents.includes(tagName) || /^[A-Z]/.test(tagName))
    );
  }

  cleanText(text) {
    return text.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
  }

  isValidUserText(text) {
    if (!text || text.length < 1) return false;

    // 🚫 FILTRO PRINCIPAL: Ignorar URLs, caminhos e query parameters
    if (
      text.includes('/') ||
      text.includes('&') ||
      text.includes('?') ||
      text.includes('=')
    ) {
      console.log(`🚫 Ignorado (URL/parâmetro): "${text}"`);
      return false;
    }

    // 🚫 Ignorar se é apenas números
    if (/^\d+$/.test(text)) return false;
    if (/^[,.\-_:;!?()[\]{}]{1,2}$/.test(text)) return false;

    // 🚫 NOVO: Filtro rigoroso para fragmentos CSS/JS comuns
    const forbiddenFragments = [
      's backwards',
      'ease-out',
      'ease-in',
      'ease-in-out',
      'forwards',
      'backwards',
      'infinite',
      'alternate',
      'reverse',
      'paused',
      'running',
      'none',
      'auto',
      'inherit',
      'initial',
      'unset',
      'fadeIn',
      'fadeOut',
      'fadeInUp',
      'slideIn',
      'slideOut',
      'transform',
      'opacity',
      'scale',
      'rotate',
      'translate',
      'px',
      'rem',
      'em',
      'vh',
      'vw',
      'ms',
      '%',
      'true',
      'false',
      'null',
      'undefined',
    ];

    if (forbiddenFragments.includes(text.trim().toLowerCase())) {
      console.log(`🚫 Ignorado (fragmento CSS/JS): "${text}"`);
      return false;
    }

    // 🚫 NOVO: Filtro para valores CSS com unidades
    if (/^\d+(\.\d+)?(s|ms|px|rem|em|vh|vw|%)$/.test(text.trim())) {
      console.log(`🚫 Ignorado (valor CSS): "${text}"`);
      return false;
    }

    if (this.looksLikeCSSOrCode(text)) {
      console.log(`🚫 Ignorado (CSS/código): "${text}"`);
      return false;
    }

    if (/^\s+$/.test(text)) return false;

    if (this.isLogStatement(text)) {
      console.log(`🚫 Ignorado (log): "${text}"`);
      return false;
    }

    if (this.isFileOrImport(text)) {
      console.log(`🚫 Ignorado (arquivo/import): "${text}"`);
      return false;
    }

    // ✅ VALIDAÇÃO MAIS RIGOROSA: Deve conter pelo menos uma palavra real
    const hasRealWord = /[a-zA-ZÀ-ÿ]{2,}/.test(text);
    if (!hasRealWord) {
      console.log(`🚫 Ignorado (sem palavra real): "${text}"`);
      return false;
    }

    // ✅ ACEITAR apenas textos que fazem sentido para tradução
    if (/[a-zA-ZÀ-ÿ]/.test(text) || /[.,:;!?]/.test(text)) {
      if (this.isTooShortOrMeaningless(text)) {
        console.log(`🚫 Ignorado (muito curto/sem sentido): "${text}"`);
        return false;
      }
      return true;
    }

    return false;
  }

  isTooShortOrMeaningless(text) {
    const trimmed = text.trim();

    if (trimmed.length < 2 && trimmed !== '.') return true;
    if (/^\d+$/.test(trimmed)) return true;
    if (/^(.)\1{2,}$/.test(trimmed)) return true;

    const meaninglessWords = [
      'a',
      'o',
      'e',
      'de',
      'da',
      'do',
      'das',
      'dos',
      'na',
      'no',
      'nas',
      'nos',
      'para',
      'por',
      'com',
      'em',
      'um',
      'uma',
      'uns',
      'umas',
      'que',
      'se',
      'te',
      'me',
      'lhe',
      'nos',
      'vos',
      'lhes',
      'seu',
      'sua',
      'seus',
      'suas',
      'este',
      'esta',
      'estes',
      'estas',
      'esse',
      'essa',
      'esses',
      'essas',
      'aquele',
      'aquela',
      'aqueles',
      'aquelas',
      'isto',
      'isso',
      'aquilo',
      'foi',
      'era',
      'será',
      'seria',
      'está',
      'estava',
      'estará',
      'estaria',
      'há',
      'havia',
      'haverá',
      'haveria',
      'tem',
      'tinha',
      'terá',
      'teria',
    ];

    const words = trimmed.toLowerCase().split(/\s+/);

    if (
      words.length === 1 &&
      meaninglessWords.includes(words[0]) &&
      !/[.,:;!?]/.test(trimmed)
    ) {
      return true;
    }

    if (
      words.length === 2 &&
      words.every((word) =>
        meaninglessWords.includes(word.replace(/[.,:;!?]/g, ''))
      ) &&
      !/[.,:;!?]/.test(trimmed)
    ) {
      return true;
    }

    return false;
  }

  isLogStatement(text) {
    const logPatterns = [
      /^console\./,
      /^console\.log/,
      /^console\.error/,
      /^console\.warn/,
      /^console\.info/,
      /^console\.debug/,
      /^console\.trace/,
      /Erro ao/,
      /Error:/,
      /Warning:/,
      /Debug:/,
      /🔍 Analisando:/,
      /📁 Seção:/,
      /✅ Extraídos/,
      /❌ Erro ao/,
      /📝 /,
      /🚫 Ignorado/,
      /📐 Dimensões obtidas/,
      /🖼️ Obtendo/,
      /✅ Validação/,
      /🎥 Arquivo/,
      /🧹 Preview/,
    ];

    return logPatterns.some((pattern) => pattern.test(text));
  }

  isFileOrImport(text) {
    const filePatterns = [
      /\.(tsx?|jsx?|css|scss|sass|less|json|md|txt|svg|png|jpg|jpeg|gif|webp|mp4|webm|ogg|mp3|wav)$/i,
      /^@\//,
      /^\.\//,
      /^\.\.\//,
      /^[a-z-]+\/[a-z-]+/,
      /^react/,
      /^next/,
      /^node_modules/,
      /^public\//,
      /^src\//,
      /^app\//,
      /^components\//,
      /^hooks\//,
      /^utils\//,
      /^libs\//,
      /^styles\//,
      /^api\//,
    ];

    return filePatterns.some((pattern) => pattern.test(text));
  }

  looksLikeCSSOrCode(text) {
    const tailwindPatterns = [
      /^w-/,
      /^h-/,
      /^min-w-/,
      /^min-h-/,
      /^max-w-/,
      /^max-h-/,
      /^p-/,
      /^px-/,
      /^py-/,
      /^pt-/,
      /^pr-/,
      /^pb-/,
      /^pl-/,
      /^m-/,
      /^mx-/,
      /^my-/,
      /^mt-/,
      /^mr-/,
      /^mb-/,
      /^ml-/,
      /^space-/,
      /^gap-/,
      /^text-/,
      /^bg-/,
      /^border-/,
      /^ring-/,
      /^shadow-/,
      /^font-/,
      /^leading-/,
      /^tracking-/,
      /^break-/,
      /^flex/,
      /^grid/,
      /^block/,
      /^inline/,
      /^hidden/,
      /^visible/,
      /^absolute/,
      /^relative/,
      /^fixed/,
      /^sticky/,
      /^static/,
      /^top-/,
      /^right-/,
      /^bottom-/,
      /^left-/,
      /^inset-/,
      /^z-/,
      /^order-/,
      /^justify-/,
      /^items-/,
      /^content-/,
      /^self-/,
      /^place-/,
      /^flex-/,
      /^grow/,
      /^shrink/,
      /^basis-/,
      /^col-/,
      /^row-/,
      /^opacity-/,
      /^transition/,
      /^duration-/,
      /^ease-/,
      /^delay-/,
      /^transform/,
      /^rotate-/,
      /^scale-/,
      /^translate-/,
      /^skew-/,
      /^hover:/,
      /^focus:/,
      /^active:/,
      /^group-/,
      /^peer-/,
      /^rounded/,
      /^border/,
      /^divide-/,
      /^sm:/,
      /^md:/,
      /^lg:/,
      /^xl:/,
      /^2xl:/,
      /^after:/,
      /^before:/,
      /^first:/,
      /^last:/,
      /^odd:/,
      /^even:/,
      /^disabled:/,
      /^enabled:/,
      /^checked:/,
      /^indeterminate:/,
    ];

    if (text.includes(' ') && text.split(' ').length > 1) {
      const words = text.split(/\s+/);
      const cssLikeWords = words.filter(
        (word) =>
          tailwindPatterns.some((pattern) => pattern.test(word)) ||
          (/^[a-z-]+$/.test(word) && word.includes('-'))
      );

      if (cssLikeWords.length / words.length > 0.3) {
        return true;
      }
    }

    if (tailwindPatterns.some((pattern) => pattern.test(text))) {
      return true;
    }

    if (
      text.includes('@keyframes') ||
      text.includes('transform:') ||
      text.includes('{') ||
      text.includes('}') ||
      text.includes('px') ||
      text.includes('rem') ||
      text.includes('em') ||
      (text.includes('%') && /\d+%/.test(text)) ||
      text.includes('calc(') ||
      text.includes('var(') ||
      text.includes('rgb(') ||
      text.includes('rgba(') ||
      text.includes('hsl(') ||
      text.includes('hsla(')
    ) {
      return true;
    }

    const codePatterns = [
      /^use[A-Z]/,
      /^[a-z]+[A-Z].*[A-Z]/,
      /^\{.*\}$/,
      /^\[.*\]$/,
      /^function/,
      /^const/,
      /^let/,
      /^var/,
      /^import/,
      /^export/,
      /^on[A-Z]/,
      /^\$\{/,
      /^\.[\w-]+/,
      /^#[\w-]+/,
      /^attr_/,
      /^className/,
      /^onChange/,
      /^onClick/,
      /^onSubmit/,
      /true$/,
      /false$/,
      /null$/,
      /undefined$/,
      /^(\d+(\.\d+)?)(px|rem|em|%|vh|vw|fr)$/,
    ];

    return codePatterns.some((pattern) => pattern.test(text));
  }

  generateKey(text, context, type) {
    let keyParts = [];

    if (this.sectionName) {
      keyParts.push(this.sectionName.replace(/[^a-zA-Z0-9]/g, '_'));
    }

    const cleanContext = context
      .filter(
        (c) =>
          !['div', 'span', 'p', 'Fragment', 'attr_className'].includes(c) &&
          !c.startsWith('attr_') &&
          !c.startsWith('css_') &&
          !c.startsWith('style_')
      )
      .slice(-2);

    if (cleanContext.length > 0) {
      keyParts.push(...cleanContext.map((c) => c.toLowerCase()));
    }

    let textKey = this.generateTextKey(text);
    keyParts.push(textKey);

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

    const semanticPatterns = {
      salvar: 'salvar',
      cancelar: 'cancelar',
      confirmar: 'confirmar',
      excluir: 'excluir',
      remover: 'remover',
      editar: 'editar',
      criar: 'criar',
      novo: 'novo',
      adicionar: 'adicionar',
      fechar: 'fechar',
      abrir: 'abrir',
      enviar: 'enviar',
      buscar: 'buscar',
      filtrar: 'filtrar',
      pesquisar: 'pesquisar',
      carregando: 'carregando',
      processando: 'processando',
      enviando: 'enviando',
      sucesso: 'sucesso',
      erro: 'erro',
      aviso: 'aviso',
      atenção: 'atencao',
      informação: 'info',
      concluído: 'concluido',
      voltar: 'voltar',
      próximo: 'proximo',
      anterior: 'anterior',
      início: 'inicio',
      fim: 'fim',
      página: 'pagina',
      título: 'titulo',
      subtítulo: 'subtitulo',
      descrição: 'descricao',
      conteúdo: 'conteudo',
      mensagem: 'mensagem',
      comentário: 'comentario',
      observação: 'observacao',
      anotação: 'anotacao',
      nome: 'nome',
      email: 'email',
      telefone: 'telefone',
      endereço: 'endereco',
      senha: 'senha',
      compositor: 'compositor',
      obra: 'obra',
      partitura: 'partitura',
      música: 'musica',
      melodia: 'melodia',
      harmonia: 'harmonia',
      ritmo: 'ritmo',
      compasso: 'compasso',
      movimento: 'movimento',
      seção: 'secao',
      período: 'periodo',
      época: 'epoca',
      estilo: 'estilo',
      técnica: 'tecnica',
      interpretação: 'interpretacao',
      performance: 'performance',
      prática: 'pratica',
      estudo: 'estudo',
      teoria: 'teoria',
      análise: 'analise',
      iniciante: 'iniciante',
      intermediário: 'intermediario',
      avançado: 'avancado',
      fácil: 'facil',
      médio: 'medio',
      difícil: 'dificil',
      básico: 'basico',
      profissional: 'profissional',
      importante: 'importante',
      essencial: 'essencial',
      fundamental: 'fundamental',
      obrigatório: 'obrigatorio',
      opcional: 'opcional',
      recomendado: 'recomendado',
      popular: 'popular',
      famoso: 'famoso',
      clássico: 'classico',
      moderno: 'moderno',
      tradicional: 'tradicional',
      inovador: 'inovador',
    };

    for (const [pattern, key] of Object.entries(semanticPatterns)) {
      if (cleanText.includes(pattern)) {
        return key;
      }
    }

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
            'uns',
            'umas',
          ].includes(word)
      );

    if (words.length === 0) return 'texto';

    if (words.length === 1) {
      return words[0].slice(0, 20);
    } else {
      return words.slice(0, 3).join('_').slice(0, 40);
    }
  }
}

// ✅ CORREÇÃO: Função saveTranslations adaptada para nova estrutura
function saveTranslations(texts, sectionPath) {
  const translationsDir = path.join(process.cwd(), 'public', 'translations');

  // ✅ NOVO: Criar diretórios se a seção contém caminhos
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

  // ✅ CORREÇÃO: Estrutura { ptBr: {}, en: {} }
  let existingData = { ptBr: {}, en: {} };
  if (fs.existsSync(filePath)) {
    try {
      existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(
        `📖 Carregado arquivo existente com ${
          Object.keys(existingData.ptBr || {}).length
        } textos em português`
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

  const finalData = {
    ptBr: mergedPtBr,
    en: mergedEn,
  };

  fs.writeFileSync(filePath, JSON.stringify(finalData, null, 2), 'utf8');

  const newTextsCount = Object.keys(texts).length;
  const existingTextsCount = Object.keys(existingData.ptBr || {}).length;
  const newEntriesCount = Object.keys(mergedEn).filter(
    (key) => !mergedEn[key]
  ).length;

  console.log(`✅ Salvos textos em: ${filePath}`);
  console.log(`   - ${newTextsCount} novos textos em português`);
  console.log(`   - ${existingTextsCount} textos portugueses mantidos`);
  console.log(`   - ${newEntriesCount} textos aguardando tradução em inglês`);

  return finalData;
}

// ✅ CORREÇÃO: Função translateTexts adaptada para nova estrutura
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
      key.includes('historia') ||
      key.includes('compositor')
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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data[0] && data[0][0] && data[0][0][0]) {
      let result = data[0][0][0];

      result = result.replace(/^\[MUSIC CONTEXT\]\s*/i, '');

      result = result
        .replace(/\bIa\b/g, 'AI')
        .replace(/Brazilian crying/gi, 'Brazilian Choro')
        .replace(/Sagrade of Spring/gi, 'Rite of Spring')
        .replace(/shade changes/gi, 'key changes')
        .replace(/compass/gi, 'measure')
        .replace(/movement name/gi, 'movement title')
        .replace(/section name/gi, 'section title');

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

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
📖 Uso: node scripts/extractTexts.js <arquivo> <seção> [opções]

✅ NOVIDADE: Suporte a diretórios nas seções!

Exemplos:
  node scripts/extractTexts.js src/app/components/Navbar/index.tsx navbar
  node scripts/extractTexts.js src/app/components/Navbar/index.tsx components/navbar  
  node scripts/extractTexts.js src/app/components/Works/DetailView.tsx works/detail-view
  node scripts/extractTexts.js src/app/admin/UserManagement.tsx admin/user-management

Estrutura resultante:
  📁 public/translations/
  ├── navbar.json
  ├── components/
  │   └── navbar.json
  ├── works/
  │   └── detail-view.json
  └── admin/
      └── user-management.json

Opções:
  --no-translate    Não traduzir automaticamente
  --translate-only  Apenas traduzir arquivo existente (não extrair)

🆕 CORREÇÕES DESTA VERSÃO:
  ✅ Um único arquivo JSON por seção (estrutura: {ptBr: {}, en: {}})
  ✅ Zero requests desnecessários
  ✅ Suporte a diretórios nas seções
  ✅ Hook com caminho correto automaticamente
  ✅ Organização melhor dos arquivos de tradução
  ✅ Filtros rigorosos para evitar capturar código CSS/JS
  ✅ Detecção avançada de template literals com código
  ✅ Proteção contra fragmentos de animações CSS
  ✅ Validação rigorosa de contexto
    `);
    process.exit(1);
  }

  const [filePath, sectionPath] = args;
  const noTranslate = args.includes('--no-translate');
  const translateOnly = args.includes('--translate-only');

  try {
    let translationData = { ptBr: {}, en: {} };

    if (!translateOnly) {
      const extractor = new SmartTextExtractor();
      const texts = await extractor.extractFromFile(filePath, sectionPath);

      translationData = saveTranslations(texts, sectionPath);

      console.log(`\n🎉 Código modificado com sucesso!`);
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
    console.log(`\n🆕 Melhorias desta versão:`);
    console.log(`   ✅ Estrutura JSON única: {ptBr: {}, en: {}}`);
    console.log(`   ✅ Zero requests desnecessários`);
    console.log(`   ✅ Suporte a diretórios (ex: components/navbar)`);
    console.log(`   ✅ Hook com caminho correto automaticamente`);
    console.log(`   ✅ Organização melhor dos arquivos`);
    console.log(`   ✅ Filtros rigorosos contra código CSS/JS`);
    console.log(`   ✅ Detecção avançada de template literals`);
    console.log(`   ✅ Proteção contra fragmentos de animações`);
    console.log(`   ✅ Zero trabalho manual necessário!`);
  } catch (error) {
    console.error(`❌ Erro durante processamento:`, error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SmartTextExtractor, saveTranslations, translateTexts };
