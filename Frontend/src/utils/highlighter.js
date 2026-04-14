/**
 * Simple syntax highlighter for code snippets
 * Designed to be lightweight and dependency-free.
 * @param {string} code 
 * @returns {string} HTML string with spans for styling
 */
export const highlightCode = (code) => {
  if (!code) return '';

  // 1. Escape HTML
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Highlighting patterns (Ordered by priority)
  const patterns = [
    // Comments: // or #
    { class: 'comment', regex: /(\/\/.*|#.*)/g },
    
    // Strings: "..." or '...'
    { class: 'string', regex: /("[^"]*"|'[^']*')/g },
    
    // Keywords: C/C++/Python/JS common keywords
    { class: 'keyword', regex: /\b(int|float|double|char|long|short|void|bool|if|else|while|for|do|return|break|continue|switch|case|default|struct|union|enum|typedef|sizeof|goto|static|extern|const|volatile|true|false|NULL|def|class|import|from|input|print|printf|scanf|main|include|#include|self|None|lambda|with|as|try|except|finally|raise|yield|async|await|var|let|const|function|=>|new|delete|type|public|private|protected)\b/g },
    
    // Numbers: 123, 0x12, 0b10, 1.2
    { class: 'number', regex: /\b(\d+\.?\d*|0x[0-9a-fA-F]+|0b[01]+)\b/g },
    
    // Functions: func_name(...)
    { class: 'function', regex: /\b([a-zA-Z_]\w*)(?=\s*\()/g },
    
    // Operators & Braces (Optional for extra color)
    { class: 'operator', regex: /(&amp;&amp;|\|\||&lt;=|&gt;=|==|!=|\+=|-=|\*=|\/=|%=|=&gt;|[&lt;&gt;=+\-*/%&|^!~?:]+)/g }
  ];

  // Placeholder strategy to avoid nested wrapping
  const placeholders = [];
  let result = escaped;

  patterns.forEach((p, index) => {
    result = result.replace(p.regex, (match) => {
      // Don't wrap if it's already a placeholder
      if (match.startsWith('__HL_')) return match;
      
      const id = `__HL_${index}_${placeholders.length}__`;
      placeholders.push({ id, html: `<span class="${p.class}">${match}</span>` });
      return id;
    });
  });

  // Restore placeholders in reverse order (to handle nested-like replacements correctly if any)
  placeholders.reverse().forEach(p => {
    result = result.split(p.id).join(p.html);
  });

  return result;
};
