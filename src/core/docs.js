/**
 * Documentation Generator
 *
 * Extracts requirements from SPECIFICATION.md, parses JSDoc from source code,
 * generates documentation in Markdown and HTML formats
 *
 * Zero dependencies - uses only Node.js built-ins
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { join, extname } from 'path';

/**
 * Parse SPECIFICATION.md to extract requirements
 * @param {string} content - Specification file content
 * @returns {Object} Parsed requirements
 */
export function parseSpecification(content) {
  const result = {
    functionalRequirements: [],
    nonFunctionalRequirements: [],
    userStories: []
  };

  if (!content || content.trim() === '') {
    return result;
  }

  // Extract functional requirements (FR###)
  const frPattern = /###\s+(FR\d+):\s+(.+?)\n([\s\S]*?)(?=###|##|$)/g;
  let match;

  while ((match = frPattern.exec(content)) !== null) {
    result.functionalRequirements.push({
      id: match[1],
      title: match[2].trim(),
      description: match[3].trim()
    });
  }

  // Extract non-functional requirements (NFR###)
  const nfrPattern = /###\s+(NFR\d+):\s+(.+?)\n([\s\S]*?)(?=###|##|$)/g;

  while ((match = nfrPattern.exec(content)) !== null) {
    result.nonFunctionalRequirements.push({
      id: match[1],
      title: match[2].trim(),
      description: match[3].trim()
    });
  }

  // Extract user stories (US###)
  const usPattern = /###\s+(US\d+):\s+(.+?)\n([\s\S]*?)(?=###|##|$)/g;

  while ((match = usPattern.exec(content)) !== null) {
    const storyContent = match[3].trim();
    result.userStories.push({
      id: match[1],
      title: match[2].trim(),
      story: storyContent
    });
  }

  return result;
}

/**
 * Parse JSDoc comments from source code
 * @param {string} source - Source code content
 * @returns {Array} Array of parsed JSDoc blocks
 */
export function parseJSDoc(source) {
  const result = [];

  // Match JSDoc comments
  const jsdocPattern = /\/\*\*([\s\S]*?)\*\//g;
  let match;

  while ((match = jsdocPattern.exec(source)) !== null) {
    const comment = match[1];
    const jsdocEnd = match.index + match[0].length;

    // Find the function signature after this JSDoc
    const afterComment = source.slice(jsdocEnd);
    const funcMatch = afterComment.match(/export\s+(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/);

    if (!funcMatch) continue;

    const functionName = funcMatch[1];
    const params = funcMatch[2];

    // Parse description (first non-tag line)
    const lines = comment.split('\n').map(l => l.replace(/^\s*\*\s?/, ''));
    const descriptionLines = [];
    let i = 0;

    while (i < lines.length && !lines[i].startsWith('@')) {
      const line = lines[i].trim();
      if (line) descriptionLines.push(line);
      i++;
    }

    const description = descriptionLines.join(' ');

    // Parse @param tags
    const paramTags = [];
    const paramPattern = /@param\s+\{([^}]+)\}\s+(\w+)\s*-?\s*(.*)/g;
    let paramMatch;

    while ((paramMatch = paramPattern.exec(comment)) !== null) {
      paramTags.push({
        name: paramMatch[2],
        type: paramMatch[1],
        description: paramMatch[3].trim()
      });
    }

    // Parse @returns tag
    const returnsMatch = comment.match(/@returns?\s+\{([^}]+)\}\s*(.*)/);
    const returns = returnsMatch ? {
      type: returnsMatch[1],
      description: returnsMatch[2].trim()
    } : null;

    result.push({
      signature: `${functionName}(${params})`,
      description,
      params: paramTags,
      returns
    });
  }

  return result;
}

/**
 * Scan directory recursively for JavaScript files
 * @param {string} dir - Directory to scan
 * @param {Array} fileList - Accumulated file list
 * @returns {Array} List of JS file paths
 */
function scanForJSFiles(dir, fileList = []) {
  if (!existsSync(dir)) return fileList;

  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .git, etc.
      if (!file.startsWith('.') && file !== 'node_modules') {
        scanForJSFiles(filePath, fileList);
      }
    } else if (extname(file) === '.js') {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Generate markdown documentation from parsed data
 * @param {Object} data - Parsed requirements and API data
 * @returns {string} Markdown content
 */
export function generateMarkdown(data) {
  const sections = [];

  // Title
  sections.push('# Documentation\n');

  // Table of Contents
  const toc = ['## Table of Contents\n'];
  if (data.requirements.functionalRequirements.length > 0 ||
      data.requirements.nonFunctionalRequirements.length > 0 ||
      data.requirements.userStories.length > 0) {
    toc.push('- [Requirements](#requirements)');
  }
  if (data.api.length > 0) {
    toc.push('- [API Reference](#api-reference)');
  }
  sections.push(toc.join('\n') + '\n');

  // Requirements Section
  if (data.requirements.functionalRequirements.length > 0 ||
      data.requirements.nonFunctionalRequirements.length > 0 ||
      data.requirements.userStories.length > 0) {
    sections.push('## Requirements\n');

    // Functional Requirements
    if (data.requirements.functionalRequirements.length > 0) {
      sections.push('### Functional Requirements\n');
      for (const fr of data.requirements.functionalRequirements) {
        sections.push(`#### ${fr.id}: ${fr.title}\n`);
        sections.push(`${fr.description}\n`);
      }
    }

    // Non-Functional Requirements
    if (data.requirements.nonFunctionalRequirements.length > 0) {
      sections.push('### Non-Functional Requirements\n');
      for (const nfr of data.requirements.nonFunctionalRequirements) {
        sections.push(`#### ${nfr.id}: ${nfr.title}\n`);
        sections.push(`${nfr.description}\n`);
      }
    }

    // User Stories
    if (data.requirements.userStories.length > 0) {
      sections.push('### User Stories\n');
      for (const us of data.requirements.userStories) {
        sections.push(`#### ${us.id}: ${us.title}\n`);
        sections.push(`${us.story}\n`);
      }
    }
  }

  // API Reference Section
  if (data.api.length > 0) {
    sections.push('## API Reference\n');

    for (const func of data.api) {
      sections.push(`### ${func.signature}\n`);
      sections.push(`${func.description}\n`);

      if (func.params && func.params.length > 0) {
        sections.push('**Parameters:**\n');
        for (const param of func.params) {
          sections.push(`- \`${param.name}\` (${param.type}): ${param.description}`);
        }
        sections.push('');
      }

      if (func.returns) {
        sections.push(`**Returns:** ${func.returns.type}${func.returns.description ? ' - ' + func.returns.description : ''}\n`);
      }
    }
  }

  return sections.join('\n');
}

/**
 * Convert Markdown to HTML
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content with styling
 */
export function convertToHTML(markdown) {
  let html = markdown;

  // Convert headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Convert code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || '';
    return `<pre><code class="language-${language}">${code.trim()}</code></pre>`;
  });

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Convert lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Convert paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Clean up extra tags
  html = html.replace(/<p>(<h[123]>)/g, '$1');
  html = html.replace(/(<\/h[123]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');

  // Add basic styling
  const style = `
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    line-height: 1.6;
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    color: #333;
  }
  h1 { border-bottom: 2px solid #eee; padding-bottom: 0.3rem; }
  h2 { border-bottom: 1px solid #eee; padding-bottom: 0.3rem; margin-top: 2rem; }
  h3 { margin-top: 1.5rem; }
  code {
    background: #f6f8fa;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 85%;
  }
  pre {
    background: #f6f8fa;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
  }
  pre code {
    background: none;
    padding: 0;
  }
  ul { padding-left: 2rem; }
  li { margin: 0.5rem 0; }
  a { color: #0366d6; text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation</title>
  ${style}
</head>
<body>
  ${html}
</body>
</html>`;
}

/**
 * Generate documentation from project
 * @param {Object} options - Generation options
 * @param {string} options.projectPath - Path to project root
 * @param {Array<string>} options.formats - Formats to generate (markdown, html)
 * @param {string} options.outputDir - Output directory (default: .speckit/docs)
 * @param {boolean} options.incremental - Enable incremental updates
 * @returns {Promise<Object>} Result object with success status and file list
 */
export async function generateDocs(options) {
  try {
    const {
      projectPath,
      formats = ['markdown', 'html'],
      outputDir = join(projectPath, '.speckit/docs'),
      incremental = false
    } = options;

    // Validate project path
    if (!existsSync(projectPath)) {
      return {
        success: false,
        error: `Project path does not exist: ${projectPath}`
      };
    }

    const speckitDir = join(projectPath, '.speckit');
    if (!existsSync(speckitDir)) {
      return {
        success: false,
        error: 'No .speckit directory found. Run speckit init first.'
      };
    }

    // Parse specification if it exists
    let requirements = {
      functionalRequirements: [],
      nonFunctionalRequirements: [],
      userStories: []
    };

    const specPath = join(speckitDir, 'SPECIFICATION.md');
    if (existsSync(specPath)) {
      const specContent = readFileSync(specPath, 'utf8');
      requirements = parseSpecification(specContent);
    }

    // Parse JSDoc from source files
    const api = [];
    const srcDir = join(projectPath, 'src');
    if (existsSync(srcDir)) {
      const jsFiles = scanForJSFiles(srcDir);

      for (const filePath of jsFiles) {
        const source = readFileSync(filePath, 'utf8');
        const docs = parseJSDoc(source);
        api.push(...docs);
      }
    }

    // Generate documentation
    const data = { requirements, api };
    const markdown = generateMarkdown(data);

    // Write output files
    const generatedFiles = [];

    for (const format of formats) {
      const formatDir = join(outputDir, format);
      mkdirSync(formatDir, { recursive: true });

      if (format === 'markdown') {
        const mdPath = join(formatDir, 'documentation.md');
        writeFileSync(mdPath, markdown, 'utf8');
        generatedFiles.push(mdPath);
      } else if (format === 'html') {
        const html = convertToHTML(markdown);
        const htmlPath = join(formatDir, 'documentation.html');
        writeFileSync(htmlPath, html, 'utf8');
        generatedFiles.push(htmlPath);
      }
    }

    return {
      success: true,
      files: generatedFiles
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
