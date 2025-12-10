// -----------------------------------------------------------------------------
// UI AND EXECUTION
// -----------------------------------------------------------------------------
const EXAMPLES = {
  HELLO: `ΑΛΓΟΡΙΘΜΟΣ Hello
ΑΡΧΗ
  ΤΥΠΩΣΕ("Hello World")
ΤΕΛΟΣ`,
  FIBONACCI: `ΑΛΓΟΡΙΘΜΟΣ Fibonacci
ΔΕΔΟΜΕΝΑ N, A, B, TEMP, I : ΑΚΕΡΑΙΟΣ;
ΑΡΧΗ
  ΤΥΠΩΣΕ("Δώσε αριθμό όρων:")
  ΔΙΑΒΑΣΕ(N)
  A := 0; B := 1;
  ΤΥΠΩΣΕ(A)
  ΤΥΠΩΣΕ(B)
  ΓΙΑ I := 3 ΕΩΣ N ΕΠΑΝΑΛΑΒΕ
    TEMP := A + B;
    ΤΥΠΩΣΕ(TEMP);
    A := B;
    B := TEMP
  ΓΙΑ-ΤΕΛΟΣ
ΤΕΛΟΣ`,
  BUBBLE_SORT: `ΑΛΓΟΡΙΘΜΟΣ BubbleSort
ΣΤΑΘΕΡΕΣ
  N = 5;
ΔΕΔΟΜΕΝΑ
  A: ARRAY[1..N] OF INTEGER;
  I, J, TEMP: INTEGER;
ΑΡΧΗ
  /* Είσοδος */
  ΓΙΑ I:=1 ΕΩΣ N ΕΠΑΝΑΛΑΒΕ
    A[I] := (N - I + 1) * 10
  ΓΙΑ-ΤΕΛΟΣ;
  /* Ταξινόμηση */
  ΓΙΑ I:=2 ΕΩΣ N ΕΠΑΝΑΛΑΒΕ
    ΓΙΑ J:=N ΕΩΣ I ΜΕ ΒΗΜΑ -1 ΕΠΑΝΑΛΑΒΕ
      ΕΑΝ A[J-1] > A[J] ΤΟΤΕ
        TEMP := A[J-1];
        A[J-1] := A[J];
        A[J] := TEMP
      ΕΑΝ-ΤΕΛΟΣ
    ΓΙΑ-ΤΕΛΟΣ
  ΓΙΑ-ΤΕΛΟΣ;
  /* Εκτύπωση */
  ΓΙΑ I:=1 ΕΩΣ N ΕΠΑΝΑΛΑΒΕ
    ΤΥΠΩΣΕ(A[I])
  ΓΙΑ-ΤΕΛΟΣ
ΤΕΛΟΣ`,
  AVERAGE: `ΑΛΓΟΡΙΘΜΟΣ Average
ΔΕΔΟΜΕΝΑ SUM, COUNT, NUM : ΠΡΑΓΜΑΤΙΚΟΣ;
ΑΡΧΗ
  SUM := 0; COUNT := 0;
  ΤΥΠΩΣΕ("Δώσε αριθμούς (0 για τέλος):")
  ΕΠΑΝΑΛΑΒΕ
    ΔΙΑΒΑΣΕ(NUM);
    ΕΑΝ NUM <> 0 ΤΟΤΕ
      SUM := SUM + NUM;
      COUNT := COUNT + 1
    ΕΑΝ-ΤΕΛΟΣ
  ΜΕΧΡΙ NUM = 0;
  ΕΑΝ COUNT > 0 ΤΟΤΕ
    ΤΥΠΩΣΕ("Μέσος Όρος:", SUM / COUNT)
  ΑΛΛΙΩΣ
    ΤΥΠΩΣΕ("Δεν δόθηκαν αριθμοί.")
  ΕΑΝ-ΤΕΛΟΣ
ΤΕΛΟΣ`
};

document.addEventListener('DOMContentLoaded', () => {
  const codeEditor = document.getElementById('code-editor');
  const highlighting = document.getElementById('highlighting');
  const highlightingContent = document.getElementById('highlighting-content');
  const lineNumbers = document.getElementById('line-numbers');
  const runButton = document.getElementById('run-button');
  const saveButton = document.getElementById('save-button');
  const clearButton = document.getElementById('clear-button');
  const loadButton = document.getElementById('load-button');   // NEW
  const fileInput = document.getElementById('file-input');     // NEW
  const exampleSelector = document.getElementById('example-selector');
  const themeToggle = document.getElementById('theme-toggle');

  // Terminal Elements
  const terminalOutput = document.getElementById('terminal-output');
  const terminalInputLine = document.getElementById('terminal-input-line');
  const terminalInput = document.getElementById('terminal-input');
  const terminalPrompt = document.getElementById('terminal-prompt');
  const outputContainer = document.querySelector('.output-container');
  const dragHandle = document.getElementById('drag-handle');

  // -----------------------------------
  // SETTINGS MANAGER
  // -----------------------------------
  const SettingsManager = {
    get: (key, defaultValue) => {
      try {
        const val = localStorage.getItem(key);
        return val !== null ? val : defaultValue;
      } catch (e) {
        console.warn('LocalStorage access failed:', e);
        return defaultValue;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('LocalStorage write failed:', e);
      }
    }
  };

  // -----------------------------------
  // AUTOCOMPLETE CONFIG
  // -----------------------------------
  const AUTOCOMPLETE_KEYWORDS = [
    'ΑΛΓΟΡΙΘΜΟΣ', 'ΣΤΑΘΕΡΕΣ', 'ΔΕΔΟΜΕΝΑ', 'ΑΡΧΗ', 'ΤΕΛΟΣ',
    'ΕΑΝ', 'ΤΟΤΕ', 'ΑΛΛΙΩΣ', 'ΕΑΝ-ΤΕΛΟΣ',
    'ΓΙΑ', 'ΕΩΣ', 'ΜΕ', 'ΒΗΜΑ', 'ΓΙΑ-ΤΕΛΟΣ',
    'ΕΝΟΣΩ', 'ΕΝΟΣΩ-ΤΕΛΟΣ', 'ΜΕΧΡΙ',
    'ΤΥΠΩΣΕ', 'ΔΙΑΒΑΣΕ',
    'ΔΙΑΔΙΚΑΣΙΑ', 'ΤΕΛΟΣ-ΔΙΑΔΙΚΑΣΙΑΣ',
    'ΣΥΝΑΡΤΗΣΗ', 'ΤΕΛΟΣ-ΣΥΝΑΡΤΗΣΗΣ',
    'ΑΚΕΡΑΙΟΣ', 'ΠΡΑΓΜΑΤΙΚΟΣ', 'ΛΟΓΙΚΟΣ', 'ΧΑΡΑΚΤΗΡΑΣ', 'ΣΥΜΒΟΛΟΣΕΙΡΑ',
    'ALGORITHM', 'CONSTANTS', 'DATA', 'BEGIN', 'END',
    'IF', 'THEN', 'ELSE', 'ENDIF',
    'FOR', 'TO', 'STEP', 'ENDFOR',
    'WHILE', 'ENDWHILE',
    'REPEAT', 'UNTIL',
    'PRINT', 'READ',
    'PROCEDURE', 'ENDPROCEDURE',
    'FUNCTION', 'ENDFUNCTION',
    'INTEGER', 'REAL', 'BOOLEAN', 'CHAR', 'STRING'
  ];

  const autocompleteBox = document.getElementById('autocomplete-box');
  const syntaxHelpButton = document.getElementById('syntax-help-button');

  function getCurrentWord(text, pos) {
    const left = text.slice(0, pos);
    const match = left.match(/([A-Za-zΑ-Ωα-ω]+)$/u);
    return match ? match[1] : '';
  }

  function showAutocomplete(prefix) {
    if (!prefix || prefix.length < 2) {
      autocompleteBox.style.display = 'none';
      return;
    }
    const upper = prefix.toUpperCase();
    const matches = AUTOCOMPLETE_KEYWORDS.filter(k => k.startsWith(upper));
    if (!matches.length) {
      autocompleteBox.style.display = 'none';
      return;
    }

    autocompleteBox.innerHTML = matches
      .map((m, i) =>
        `<div class="autocomplete-item${i === 0 ? ' selected' : ''}">${m}</div>`
      )
      .join('');

    const rect = codeEditor.getBoundingClientRect();
    const textUpToCursor = codeEditor.value.slice(0, codeEditor.selectionStart);
    const lineIndex = textUpToCursor.split('\n').length - 1;
    const lineHeight = 18;

    autocompleteBox.style.left = rect.left + window.scrollX + 60 + 'px';
    autocompleteBox.style.top =
      rect.top + window.scrollY + 10 + lineIndex * lineHeight + 'px';
    autocompleteBox.style.display = 'block';
  }

  function hideAutocomplete() {
    autocompleteBox.style.display = 'none';
  }

  function acceptAutocomplete() {
    if (autocompleteBox.style.display === 'none') return false;
    const selected = autocompleteBox.querySelector('.autocomplete-item.selected');
    if (!selected) return false;
    const word = getCurrentWord(codeEditor.value, codeEditor.selectionStart);
    if (!word) return false;

    const start = codeEditor.selectionStart - word.length;
    const end = codeEditor.selectionEnd;
    const insert = selected.textContent;

    codeEditor.value =
      codeEditor.value.slice(0, start) +
      insert +
      codeEditor.value.slice(end);

    const newPos = start + insert.length;
    codeEditor.selectionStart = codeEditor.selectionEnd = newPos;
    hideAutocomplete();
    onInput();
    return true;
  }

  // -----------------------------------
  // SYNTAX HIGHLIGHTING
  // -----------------------------------
  const escapeHTML = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const updateHighlighting = () => {
    const text = codeEditor.value;
    let html = '';
    try {
      // Regex-based highlighter for visual only.
      let i = 0;
      while (i < text.length) {
        let match = null;
        let matchType = '';
        let matchLength = 0;
        let matchText = '';

        const isBoundary = (idx) => {
          if (idx < 0 || idx >= text.length) return true;
          const c = text[idx];
          return /[^a-zA-Z\d\u0370-\u03ff_]/.test(c);
        };

        const keywords = [
          'ΑΛΓΟΡΙΘΜΟΣ', 'ΣΤΑΘΕΡΕΣ', 'ΔΕΔΟΜΕΝΑ', 'ΑΡΧΗ', 'ΤΕΛΟΣ',
          'ΕΑΝ', 'ΤΟΤΕ', 'ΑΛΛΙΩΣ', 'ΕΑΝ-ΤΕΛΟΣ',
          'ΓΙΑ', 'ΕΩΣ', 'ΜΕ', 'ΒΗΜΑ', 'ΕΠΑΝΑΛΑΒΕ', 'ΓΙΑ-ΤΕΛΟΣ',
          'ΕΝΟΣΩ', 'ΕΝΟΣΩ-ΤΕΛΟΣ', 'ΜΕΧΡΙ',
          'ΤΥΠΩΣΕ', 'ΔΙΑΒΑΣΕ', 'ΥΠΟΛΟΓΙΣΕ',
          'ΔΙΑΔΙΚΑΣΙΑ', 'ΤΕΛΟΣ-ΔΙΑΔΙΚΑΣΙΑΣ',
          'ΣΥΝΑΡΤΗΣΗ', 'ΤΕΛΟΣ-ΣΥΝΑΡΤΗΣΗΣ',
          'ΕΠΙΣΤΡΕΨΕ',
          'ΑΚΕΡΑΙΟΣ', 'ΠΡΑΓΜΑΤΙΚΟΣ', 'ΛΟΓΙΚΟΣ', 'ΧΑΡΑΚΤΗΡΑΣ', 'ΣΥΜΒΟΛΟΣΕΙΡΑ',
          'ALGORITHM', 'CONSTANTS', 'DATA', 'BEGIN', 'END',
          'IF', 'THEN', 'ELSE', 'END_IF',
          'FOR', 'TO', 'STEP', 'REPEAT', 'END_FOR',
          'WHILE', 'END_WHILE', 'UNTIL',
          'PRINT', 'READ', 'CALCULATE',
          'PROCEDURE', 'END_PROCEDURE',
          'FUNCTION', 'END_FUNCTION',
          'RETURN', 'INTEGER', 'REAL', 'BOOLEAN', 'CHAR', 'STRING'
        ];

        // 1. Keywords
        if (isBoundary(i - 1)) {
          for (const kw of keywords) {
            if (
              text.substr(i, kw.length).toUpperCase() === kw &&
              isBoundary(i + kw.length)
            ) {
              if (!match || kw.length > matchLength) {
                matchText = text.substr(i, kw.length);
                matchLength = kw.length;
                matchType = 'token-keyword';
                match = true;
              }
            }
          }
        }

        // 2. Comments
        const commentRegex = /\/\*[\s\S]*?\*\/|\/\/.*/y;
        commentRegex.lastIndex = i;
        let m = commentRegex.exec(text);
        if (m && (!match || m[0].length > matchLength)) {
          match = true;
          matchType = 'token-comment';
          matchText = m[0];
          matchLength = m[0].length;
        }

        // 3. Strings
        const stringRegex = /\"[^\"]*\"/y;
        stringRegex.lastIndex = i;
        m = stringRegex.exec(text);
        if (m && (!match || m[0].length > matchLength)) {
          match = true;
          matchType = 'token-string';
          matchText = m[0];
          matchLength = m[0].length;
        }

        // 4. Numbers
        const numberRegex = /\b\d+(\.\d+)?\b/y;
        numberRegex.lastIndex = i;
        m = numberRegex.exec(text);
        if (m && (!match || m[0].length > matchLength)) {
          match = true;
          matchType = 'token-number';
          matchText = m[0];
          matchLength = m[0].length;
        }

        // 5. Operators
        const operators = [
          ':=', '+', '-', '*', '/', '<>', '<=', '>=', '<', '>', '=',
          ':', ';', ',', '.', '[', ']', '(', ')'
        ];
        for (const op of operators) {
          if (text.startsWith(op, i)) {
            if (!match || op.length > matchLength) {
              match = true;
              matchType = 'token-operator';
              matchText = op;
              matchLength = op.length;
            }
          }
        }

        if (match) {
          html += `<span class="${matchType}">${escapeHTML(matchText)}</span>`;
          i += matchLength;
        } else {
          html += escapeHTML(text[i]);
          i++;
        }
      }
      if (text[text.length - 1] === '\n') {
        html += ' ';
      }
    } catch (e) {
      html = escapeHTML(text);
    }
    highlightingContent.innerHTML = html;
  };

  const updateLineNumbers = () => {
    const lines = codeEditor.value.split('\n').length;
    lineNumbers.innerHTML = Array(lines)
      .fill(0)
      .map((_, i) => i + 1)
      .map((n) => `<div class="line-num">${n}</div>`)
      .join('');
  };

  const syncScroll = () => {
    highlighting.scrollTop = codeEditor.scrollTop;
    highlighting.scrollLeft = codeEditor.scrollLeft;
    lineNumbers.scrollTop = codeEditor.scrollTop;
  };

  const onInput = () => {
    updateHighlighting();
    updateLineNumbers();
  };

  codeEditor.addEventListener('scroll', syncScroll);

  // Initial
  updateLineNumbers();
  updateHighlighting();

  // -----------------------------------
  // KEYBOARD HANDLING: TAB + INDENT + AUTOCOMPLETE
  // -----------------------------------
 // AUTO-INDENTATION + AUTO-FORMAT HANDLER
// Replace the entire keydown event listener in app.v6.js

// Auto-format function
function autoFormatCode() {
  const code = codeEditor.value;
  const lines = code.split('\n');
  const formatted = [];
  let currentIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const trimmedUpper = trimmed.toUpperCase();

    // Skip empty lines
    if (trimmed === '') {
      formatted.push('');
      continue;
    }

    // Closing keywords: decrease indent BEFORE adding line
    const isClosing = 
      trimmedUpper.startsWith('ΤΕΛΟΣ') ||
      trimmedUpper.startsWith('ΕΑΝ-ΤΕΛΟΣ') ||
      trimmedUpper.startsWith('ΓΙΑ-ΤΕΛΟΣ') ||
      trimmedUpper.startsWith('ΕΝΟΣΩ-ΤΕΛΟΣ') ||
      trimmedUpper.startsWith('ΤΕΛΟΣ-ΔΙΑΔΙΚΑΣΙΑΣ') ||
      trimmedUpper.startsWith('ΤΕΛΟΣ-ΣΥΝΑΡΤΗΣΗΣ') ||
      trimmedUpper.startsWith('END') ||
      trimmedUpper.startsWith('ENDIF') ||
      trimmedUpper.startsWith('ENDFOR') ||
      trimmedUpper.startsWith('ENDWHILE') ||
      trimmedUpper.startsWith('END_IF') ||
      trimmedUpper.startsWith('END_FOR') ||
      trimmedUpper.startsWith('END_WHILE') ||
      trimmedUpper.startsWith('ENDPROCEDURE') ||
      trimmedUpper.startsWith('ENDFUNCTION') ||
      trimmedUpper.startsWith('END_PROCEDURE') ||
      trimmedUpper.startsWith('END_FUNCTION') ||
      trimmedUpper.startsWith('ΜΕΧΡΙ') ||
      trimmedUpper.startsWith('UNTIL');

    // ΑΛΛΙΩΣ/ELSE: decrease then add line
    const isElse = 
      trimmedUpper.startsWith('ΑΛΛΙΩΣ') ||
      trimmedUpper.startsWith('ELSE');

    if (isClosing && currentIndent > 0) {
      currentIndent--;
    }

    if (isElse && currentIndent > 0) {
      currentIndent--;
    }

    // Add line with current indentation
    const indent = '  '.repeat(currentIndent);
    formatted.push(indent + trimmed);

    // Opening keywords: increase indent AFTER adding line
    const shouldIncrease = 
      trimmedUpper.endsWith('ΑΡΧΗ') ||
      trimmedUpper.endsWith('ΤΟΤΕ') ||
      trimmedUpper.endsWith('ΑΛΛΙΩΣ') ||
      trimmedUpper.endsWith('ΕΠΑΝΑΛΑΒΕ') ||
      trimmedUpper.endsWith('BEGIN') ||
      trimmedUpper.endsWith('THEN') ||
      trimmedUpper.endsWith('ELSE') ||
      trimmedUpper.endsWith('REPEAT');

    if (shouldIncrease) {
      currentIndent++;
    }
  }

  return formatted.join('\n');
}

codeEditor.addEventListener('keydown', (e) => {
  const start = codeEditor.selectionStart;
  const end = codeEditor.selectionEnd;
  const value = codeEditor.value;

  // AUTO-FORMAT: Ctrl+Shift+F (or Cmd+Shift+F on Mac)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
    e.preventDefault();
    
    // Store cursor position
    const cursorPos = codeEditor.selectionStart;
    
    // Format code
    const formatted = autoFormatCode();
    codeEditor.value = formatted;
    
    // Restore cursor position (approximately)
    codeEditor.selectionStart = Math.min(cursorPos, formatted.length);
    codeEditor.selectionEnd = codeEditor.selectionStart;
    
    // Update UI
    onInput();
    
    // Show notification (optional)
    const notification = document.createElement('div');
    notification.textContent = '✓ Code formatted!';
    notification.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      background: var(--button-bg);
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: bold;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
    
    return;
  }

  // Accept autocomplete with Enter or Tab if box visible
  if (
    (e.key === 'Enter' || e.key === 'Tab') &&
    autocompleteBox &&
    autocompleteBox.style.display === 'block'
  ) {
    const accepted = acceptAutocomplete();
    if (accepted) {
      e.preventDefault();
      return;
    }
  }

  // TAB: insert indentation
  if (e.key === 'Tab') {
    e.preventDefault();
    const insert = '  '; // 2 spaces
    codeEditor.value = value.slice(0, start) + insert + value.slice(end);
    codeEditor.selectionStart = codeEditor.selectionEnd = start + insert.length;
    onInput();
    return;
  }

  // ENTER: auto indentation
  if (e.key === 'Enter') {
    e.preventDefault();

    // Find the start of the current line
    let lineStart = start;
    while (lineStart > 0 && value[lineStart - 1] !== '\n') {
      lineStart--;
    }

    // Get the current line up to cursor
    const currentLine = value.substring(lineStart, start);
    
    // Extract current indentation
    const indentMatch = currentLine.match(/^[ \t]*/);
    let indent = indentMatch ? indentMatch[0] : '';

    // Get the trimmed, uppercase version for keyword matching
    const trimmedLine = currentLine.trim().toUpperCase();

    // Check if line ends with keywords that increase indent
    const shouldIncreaseIndent = 
      trimmedLine.endsWith('ΑΡΧΗ') ||
      trimmedLine.endsWith('ΤΟΤΕ') ||
      trimmedLine.endsWith('ΑΛΛΙΩΣ') ||
      trimmedLine.endsWith('ΕΠΑΝΑΛΑΒΕ') ||
      trimmedLine.endsWith('BEGIN') ||
      trimmedLine.endsWith('THEN') ||
      trimmedLine.endsWith('ELSE') ||
      trimmedLine.endsWith('REPEAT');

    // Check if line starts with closing keywords
    const isClosingKeyword = 
      trimmedLine.startsWith('ΤΕΛΟΣ') ||
      trimmedLine.startsWith('ΕΑΝ-ΤΕΛΟΣ') ||
      trimmedLine.startsWith('ΓΙΑ-ΤΕΛΟΣ') ||
      trimmedLine.startsWith('ΕΝΟΣΩ-ΤΕΛΟΣ') ||
      trimmedLine.startsWith('ΤΕΛΟΣ-ΔΙΑΔΙΚΑΣΙΑΣ') ||
      trimmedLine.startsWith('ΤΕΛΟΣ-ΣΥΝΑΡΤΗΣΗΣ') ||
      trimmedLine.startsWith('END') ||
      trimmedLine.startsWith('ENDIF') ||
      trimmedLine.startsWith('ENDFOR') ||
      trimmedLine.startsWith('ENDWHILE') ||
      trimmedLine.startsWith('END_IF') ||
      trimmedLine.startsWith('END_FOR') ||
      trimmedLine.startsWith('END_WHILE') ||
      trimmedLine.startsWith('ENDPROCEDURE') ||
      trimmedLine.startsWith('ENDFUNCTION') ||
      trimmedLine.startsWith('END_PROCEDURE') ||
      trimmedLine.startsWith('END_FUNCTION');

    // Adjust indent for next line
    if (isClosingKeyword && indent.length >= 2) {
      indent = indent.substring(0, indent.length - 2);
    }

    if (shouldIncreaseIndent) {
      indent = indent + '  ';
    }

    // Insert newline with indentation
    const insertText = '\n' + indent;
    codeEditor.value = value.substring(0, start) + insertText + value.substring(end);
    
    // Position cursor
    const newPos = start + insertText.length;
    codeEditor.selectionStart = newPos;
    codeEditor.selectionEnd = newPos;

    onInput();
    return;
  }

  // Navigate autocomplete with arrows
  if (
    autocompleteBox &&
    autocompleteBox.style.display === 'block' &&
    (e.key === 'ArrowDown' || e.key === 'ArrowUp')
  ) {
    e.preventDefault();
    const items = Array.from(
      autocompleteBox.querySelectorAll('.autocomplete-item')
    );
    if (!items.length) return;
    let idx = items.findIndex((it) => it.classList.contains('selected'));
    if (idx === -1) idx = 0;
    items[idx].classList.remove('selected');
    if (e.key === 'ArrowDown') {
      idx = (idx + 1) % items.length;
    } else {
      idx = (idx - 1 + items.length) % items.length;
    }
    items[idx].classList.add('selected');
    return;
  }

  if (e.key === 'Escape') {
    hideAutocomplete();
  }
});

// Add CSS animation for notification
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

  codeEditor.addEventListener('input', () => {
    onInput();
    const word = getCurrentWord(codeEditor.value, codeEditor.selectionStart);
    showAutocomplete(word);
  });

  codeEditor.addEventListener('blur', hideAutocomplete);

  // -----------------------------------
  // EXAMPLE SELECTOR
  // -----------------------------------
  exampleSelector.addEventListener('change', (e) => {
    const key = e.target.value;
    if (EXAMPLES[key]) {
      codeEditor.value = EXAMPLES[key];
      onInput();
    }
  });

  // -----------------------------------
  // TERMINAL EXECUTION
  // -----------------------------------
  const clearErrorHighlights = () => {
    const lineNumsEls = document.querySelectorAll('.line-num');
    lineNumsEls.forEach((el) => el.classList.remove('error-line'));
  };

  const highlightErrorLine = (errorMsg) => {
    const match =
      errorMsg.match(/Line\s+(\d+)/i) || errorMsg.match(/γραμμή\s+(\d+)/i);
    if (match) {
      const line = parseInt(match[1], 10);
      const lineElement = lineNumbers.children[line - 1];
      if (lineElement) {
        lineElement.classList.add('error-line');
      }
    }
  };

  const printToTerminal = (text, type = 'output') => {
    const line = document.createElement('div');
    line.textContent = text;
    line.className = `term-${type}`;
    terminalOutput.appendChild(line);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    const terminalWindow = document.getElementById('terminal-window');
    if (terminalWindow) {
      setTimeout(() => {
        terminalWindow.scrollTop = terminalWindow.scrollHeight;
      }, 0);
    }
  };

  const clearTerminal = () => {
    terminalOutput.innerHTML = '';
    terminalInputLine.style.display = 'none';
  };

  const inputProvider = (promptMsg) =>
    new Promise((resolve) => {
      printToTerminal(promptMsg, 'info');
      terminalInputLine.style.display = 'flex';
      scrollToBottom();
      terminalInput.value = '';
      terminalInput.focus();

      const handleEnter = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = terminalInput.value;
          terminalInputLine.style.display = 'none';
          terminalInput.removeEventListener('keydown', handleEnter);
          printToTerminal(val, 'input-echo');
          resolve(val);
        }
      };
      terminalInput.addEventListener('keydown', handleEnter);
    });

  runButton.addEventListener('click', async () => {
    const pseudocode = codeEditor.value;
    clearTerminal();
    clearErrorHighlights();
    printToTerminal('Compiling...', 'info');
    try {
      const tokens = tokenize(pseudocode);
      const parser = new Parser(tokens);
      const ast = parser.parse();
      printToTerminal('Running...', 'info');
      const interpreter = new Interpreter();
      interpreter.setInputProvider(inputProvider);
      interpreter.setOutputCallback((text) => printToTerminal(text, 'output'));
      const result = await interpreter.interpret(ast);
      if (result.error) {
        printToTerminal(`Error: ${result.error}`, 'error');
        highlightErrorLine(result.error);
      } else {
        printToTerminal('finished.', 'success');
      }
    } catch (error) {
      printToTerminal(`Error: ${error.message}`, 'error');
      highlightErrorLine(error.message);
      console.error(error);
    }
  });

  // -----------------------------------
  // CONTROLS Save / Clear
  // -----------------------------------
  saveButton.addEventListener('click', () => {
    const code = codeEditor.value;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pseudocode.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  clearButton.addEventListener('click', () => {
    if (confirm('Καθαρισμός κώδικα;')) {
      codeEditor.value = '';
      onInput();
      exampleSelector.value = '';
    }
  });

  // --- FORMAT BUTTON: same behavior as Ctrl+Shift+F ---
const formatButton = document.getElementById('format-button');
if (formatButton) {
  formatButton.addEventListener('click', () => {
    try {
      // Save approximate cursor position
      const cursorPos = codeEditor.selectionStart;

      // Format code using the same function used by keyboard handler
      const formatted = autoFormatCode();
      codeEditor.value = formatted;

      // Restore cursor (approximate)
      const newPos = Math.min(cursorPos, formatted.length);
      codeEditor.selectionStart = codeEditor.selectionEnd = newPos;

      // Refresh highlighting / lines
      onInput();

      // Optional: show same notification used by keyboard handler
      const notification = document.createElement('div');
      notification.textContent = '✓ Code formatted!';
      notification.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: var(--button-bg);
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.25s ease-out;
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 1600);
    } catch (err) {
      // Defensive: if something unexpectedly missing, log it
      console.error('Format button failed:', err);
      alert('Formatting failed — open console for details.');
    }
  });
}

    // -----------------------------------
    // LOAD (.eap) FILE
    // -----------------------------------
    loadButton.addEventListener('click', () => {
      fileInput.value = ''; // reset so selecting same file again works
      fileInput.click();
    });
    
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.eap') &&
          !file.name.toLowerCase().endsWith('.txt')) {
        alert('Παρακαλώ επιλέξτε αρχείο .eap ή .txt');
        return;
      }
    
      const reader = new FileReader();
      reader.onload = (e) => {
        codeEditor.value = e.target.result || '';
        onInput();           // refresh highlighting + line numbers
        exampleSelector.value = '';  // clear example selection
      };
      reader.onerror = () => {
        alert('Αποτυχία ανάγνωσης αρχείου.');
      };
      reader.readAsText(file, 'utf-8');
    });
    

  // -----------------------------------
  // DARK MODE
  // -----------------------------------
  const applyTheme = (isDark) => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    SettingsManager.set('theme', theme);

    const url = new URL(window.location);
    url.searchParams.set('theme', theme);
    window.history.replaceState({}, '', url);

    const homeLink = document.querySelector('.home-link');
    if (homeLink) {
      homeLink.href = `index.html?theme=${theme}`;
    }
  };

  const currentTheme =
    document.documentElement.getAttribute('data-theme') ||
    SettingsManager.get('theme', 'light');
  const isDarkMode = currentTheme === 'dark';
  applyTheme(isDarkMode);

  themeToggle.addEventListener('click', () => {
    const nowDark =
      document.documentElement.getAttribute('data-theme') !== 'dark';
    applyTheme(nowDark);
  });

  // -----------------------------------
  // TERMINAL RESIZING & FOCUS
  // -----------------------------------
  const MIN_TERMINAL_HEIGHT = 150; // px
  const DEFAULT_EXPANDED_HEIGHT = '40vh';
  let preferredHeight = SettingsManager.get(
    'terminalExpandedHeight',
    DEFAULT_EXPANDED_HEIGHT
  );

  const expandTerminal = () => {
    outputContainer.style.height = preferredHeight;
  };
  const collapseTerminal = () => {
    outputContainer.style.height = MIN_TERMINAL_HEIGHT + 'px';
  };

  outputContainer.style.height = preferredHeight;

  codeEditor.addEventListener('focus', collapseTerminal);
  document
    .querySelector('.editor-container')
    .addEventListener('click', collapseTerminal);
  outputContainer.addEventListener('click', expandTerminal);
  terminalInput.addEventListener('focus', expandTerminal);
  runButton.addEventListener('click', expandTerminal);

  let isResizing = false;

  dragHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const containerRect = document
      .querySelector('.container')
      .getBoundingClientRect();
    const newHeight = containerRect.bottom - e.clientY;
    const maxHeight = containerRect.height * 0.8;
    if (newHeight > 100 && newHeight < maxHeight) {
      outputContainer.style.height = newHeight + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      preferredHeight = outputContainer.style.height;
      SettingsManager.set('terminalExpandedHeight', preferredHeight);
    }
  });

  // -----------------------------------
  // SYNTAX HELP
  // -----------------------------------
  if (syntaxHelpButton) {
    syntaxHelpButton.addEventListener('click', () => {
      const msg =
        'Βασικές λέξεις-κλειδιά:\n' +
        'ΑΛΓΟΡΙΘΜΟΣ ... ΤΕΛΟΣ, ΣΤΑΘΕΡΕΣ, ΔΕΔΟΜΕΝΑ, ΑΡΧΗ.\n' +
        'ΕΑΝ <συνθήκη> ΤΟΤΕ ... ΑΛΛΙΩΣ ... ΕΑΝ-ΤΕΛΟΣ\n' +
        'ΓΙΑ / ΕΩΣ / ΜΕ ΒΗΜΑ ... ΓΙΑ-ΤΕΛΟΣ\n' +
        'ΕΝΟΣΩ ... ΕΝΟΣΩ-ΤΕΛΟΣ, ΜΕΧΡΙ ...\n\n' +
        'Τύποι: ΑΚΕΡΑΙΟΣ, ΠΡΑΓΜΑΤΙΚΟΣ, ΛΟΓΙΚΟΣ, ΧΑΡΑΚΤΗΡΑΣ, ΣΥΜΒΟΛΟΣΕΙΡΑ.\n\n' +
        'Υποστηρίζονται επίσης οι αγγλικές μορφές: ALGORITHM, BEGIN, END κ.λπ.';
      alert(msg);
    });
  }
});
