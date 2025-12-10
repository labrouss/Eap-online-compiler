// -----------------------------------------------------------------------------
// UI AND EXECUTION
// -----------------------------------------------------------------------------

const EXAMPLES = {
    HELLO: `ΑΛΓΟΡΙΘΜΟΣ Hello
ΑΡΧΗ
    ΤΥΠΩΣΕ("Hello World")
ΤΕΛΟΣ`,
    FIBONACCI: `ΑΛΓΟΡΙΘΜΟΣ Fibonacci
ΔΕΔΟΜΕΝΑ
    N, A, B, TEMP, I : ΑΚΕΡΑΙΟΣ;
ΑΡΧΗ
    ΤΥΠΩΣΕ("Δώσε αριθμό όρων:")
    ΔΙΑΒΑΣΕ(N)
    A := 0;
    B := 1;
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
ΣΤΑΘΕΡΕΣ N = 5;
ΔΕΔΟΜΕΝΑ A: ARRAY[1..N] OF INTEGER; I, J, TEMP: INTEGER;
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
ΔΕΔΟΜΕΝΑ
    SUM, COUNT, NUM : ΠΡΑΓΜΑΤΙΚΟΣ;
ΑΡΧΗ
    SUM := 0;
    COUNT := 0;
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
    const escapeHTML = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

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

                const keywords = ["ΑΛΓΟΡΙΘΜΟΣ","ΣΤΑΘΕΡΕΣ","ΔΕΔΟΜΕΝΑ","ΑΡΧΗ","ΤΕΛΟΣ","ΕΑΝ","ΤΟΤΕ","ΑΛΛΙΩΣ","ΕΑΝ-ΤΕΛΟΣ","ΓΙΑ","ΕΩΣ","ΜΕ","ΒΗΜΑ","ΕΠΑΝΑΛΑΒΕ","ΓΙΑ-ΤΕΛΟΣ","ΕΝΟΣΩ","ΕΝΟΣΩ-ΤΕΛΟΣ","ΜΕΧΡΙ","ΤΥΠΩΣΕ","ΔΙΑΒΑΣΕ","ΥΠΟΛΟΓΙΣΕ","ΔΙΑΔΙΚΑΣΙΑ","ΤΕΛΟΣ-ΔΙΑΔΙΚΑΣΙΑΣ","ΣΥΝΑΡΤΗΣΗ","ΤΕΛΟΣ-ΣΥΝΑΡΤΗΣΗΣ","ΕΠΙΣΤΡΕΨΕ","ΑΚΕΡΑΙΟΣ","ΠΡΑΓΜΑΤΙΚΟΣ","ΛΟΓΙΚΟΣ","ΧΑΡΑΚΤΗΡΑΣ","ΣΥΜΒΟΛΟΣΕΙΡΑ","ALGORITHM","CONSTANTS","DATA","BEGIN","END","IF","THEN","ELSE","END_IF","FOR","TO","STEP","REPEAT","END_FOR","WHILE","END_WHILE","UNTIL","PRINT","READ","CALCULATE","PROCEDURE","END_PROCEDURE","FUNCTION","END_FUNCTION","RETURN","INTEGER","REAL","BOOLEAN","CHAR","STRING"];

                // 1. Check Keywords (must be at boundary)
                if (isBoundary(i - 1)) {
                    for (const kw of keywords) {
                        // Check if text starts with keyword at current position
                        if (text.substr(i, kw.length).toUpperCase() === kw && isBoundary(i + kw.length)) {
                             if (!match || kw.length > matchLength) {
                                matchText = text.substr(i, kw.length);
                                matchLength = kw.length;
                                matchType = 'token-keyword';
                                match = true;
                            }
                        }
                    }
                }

                // 2. Check other patterns
                // Comments
                const commentRegex = /\/\*[\s\S]*?\*\/|\/\/.*/y;
                commentRegex.lastIndex = i;
                let m = commentRegex.exec(text);
                if (m && (!match || m[0].length > matchLength)) {
                     match = true; matchType = 'token-comment'; matchText = m[0]; matchLength = m[0].length;
                }

                // Strings
                const stringRegex = /"[^"]*"/y;
                stringRegex.lastIndex = i;
                m = stringRegex.exec(text);
                 if (m && (!match || m[0].length > matchLength)) {
                     match = true; matchType = 'token-string'; matchText = m[0]; matchLength = m[0].length;
                }

                // Numbers
                const numberRegex = /\b\d+(\.\d+)?\b/y; // \b works for numbers usually
                numberRegex.lastIndex = i;
                m = numberRegex.exec(text);
                 if (m && (!match || m[0].length > matchLength)) {
                     match = true; matchType = 'token-number'; matchText = m[0]; matchLength = m[0].length;
                }

                // Operators
                // Sort operators by length desc to match ':=' before ':'
                const operators = [":=", "+", "-", "*", "/", "<>", "<=", ">=", "<", ">", "=", ":", ";", ",", ".", "[", "]", "(", ")"];
                for (const op of operators) {
                     if (text.startsWith(op, i)) {
                         if (!match || op.length > matchLength) {
                             match = true; matchType = 'token-operator'; matchText = op; matchLength = op.length;
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

            // Handle trailing newline for textarea match
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
        lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => i + 1).map(n => `<div class="line-num">${n}</div>`).join('');
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

    codeEditor.addEventListener('input', () => {
      onInput();
      const word = getCurrentWord(codeEditor.value, codeEditor.selectionStart);
      showAutocomplete(word);
    });
    
	codeEditor.addEventListener('blur', hideAutocomplete);
    codeEditor.addEventListener('scroll', syncScroll);

    // Initial update
    updateLineNumbers();
    updateHighlighting();

    // Enable Tab key support
    //codeEditor.addEventListener('keydown', (e) => {
    //    if (e.key === 'Tab') {
    //        e.preventDefault();
    //        const start = codeEditor.selectionStart;
    //        const end = codeEditor.selectionEnd;
    //        codeEditor.value = codeEditor.value.substring(0, start) + "\t" + codeEditor.value.substring(end);
    //        codeEditor.selectionStart = codeEditor.selectionEnd = start + 1;
    //        onInput();
    //    }
    //});
   codeEditor.addEventListener('keydown', (e) => {
     const start = codeEditor.selectionStart;
     const end = codeEditor.selectionEnd;
     const value = codeEditor.value;
   
     // Accept autocomplete with Enter or Tab
     if ((e.key === 'Enter' || e.key === 'Tab') &&
         autocompleteBox.style.display === 'block') {
       const accepted = acceptAutocomplete();
       if (accepted) {
         e.preventDefault();
         return;
       }
     }
   
     // TAB = indent
     if (e.key === 'Tab') {
       e.preventDefault();
       const insert = '  '; // 2 spaces; change to '\t' if you prefer
       codeEditor.value =
         value.slice(0, start) + insert + value.slice(end);
       codeEditor.selectionStart = codeEditor.selectionEnd =
         start + insert.length;
       onInput();
       return;
     }
   
     // ENTER = auto-indent
  // ENTER: auto indentation
  if (e.key === 'Enter') {
    e.preventDefault();

    // Find current line start/end
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const currentLine =
      lineEnd === -1 ? value.slice(lineStart) : value.slice(lineStart, lineEnd);

    // Existing indentation (spaces/tabs at the very start of the line)
    const indentMatch = currentLine.match(/^[ \t]*/);
    let indent = indentMatch ? indentMatch[0] : '';

    // If current line closes a block, reduce indent on the new line
    // Greek: ΤΕΛΟΣ, ΕΑΝ-ΤΕΛΟΣ, ΓΙΑ-ΤΕΛΟΣ, ΕΝΟΣΩ-ΤΕΛΟΣ
    // English: END, ENDIF, ENDFOR, ENDWHILE
    const trimmed = currentLine.trim().toUpperCase();
    const closingKeywords = [
      'ΤΕΛΟΣ',
      'ΕΑΝ-ΤΕΛΟΣ',
      'ΓΙΑ-ΤΕΛΟΣ',
      'ΕΝΟΣΩ-ΤΕΛΟΣ',
      'END',
      'ENDIF',
      'ENDFOR',
      'ENDWHILE'
    ];
    if (closingKeywords.some(kw => trimmed.startsWith(kw)) && indent.length >= 2) {
      indent = indent.slice(0, indent.length - 2);
    }

    // If current line starts a block, increase indent for the next line
    // Greek: ΑΡΧΗ, ΤΟΤΕ, ΑΛΛΙΩΣ, ΓΙΑ, ΕΝΟΣΩ, ΜΕΧΡΙ
    // English: BEGIN, THEN, ELSE, FOR, WHILE, REPEAT
    if (/\b(ΑΡΧΗ|ΤΟΤΕ|ΑΛΛΙΩΣ|ΓΙΑ|ΕΝΟΣΩ|ΜΕΧΡΙ|BEGIN|THEN|ELSE|FOR|WHILE|REPEAT)\b\s*$/i
      .test(currentLine)) {
      indent += '  ';
    }

    const insert = '\n' + indent;
    codeEditor.value =
      value.slice(0, start) + insert + value.slice(end);

    const newPos = start + insert.length;
    codeEditor.selectionStart = codeEditor.selectionEnd = newPos;

    onInput();
    return;
  }
   
     // Navigate autocomplete with arrows
     if (autocompleteBox.style.display === 'block' &&
         (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
       e.preventDefault();
       const items = Array.from(
         autocompleteBox.querySelectorAll('.autocomplete-item')
       );
       if (!items.length) return;
       let idx = items.findIndex(it => it.classList.contains('selected'));
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
   
     // Escape hides autocomplete
     if (e.key === 'Escape') {
       hideAutocomplete();
     }
   });
   

    // Example Selector
    exampleSelector.addEventListener('change', (e) => {
        const key = e.target.value;
        if (EXAMPLES[key]) {
            codeEditor.value = EXAMPLES[key];
            onInput();
        }
    });

    // -----------------------------------
    // TERMINAL & EXECUTION
    // -----------------------------------
    const clearErrorHighlights = () => {
        const lineNums = document.querySelectorAll('.line-num');
        lineNums.forEach(el => el.classList.remove('error-line'));
    };

    const highlightErrorLine = (errorMsg) => {
        // Updated regex to support both "line X" (old) and "Line: X" (new)
        const match = errorMsg.match(/Line:? (\d+)/i) || errorMsg.match(/line (\d+)/);
        if (match) {
            const line = parseInt(match[1]);
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

        // Scroll the window container, not the output div
        scrollToBottom();
    };

    const scrollToBottom = () => {
        const terminalWindow = document.getElementById('terminal-window');
        if (terminalWindow) {
            // Use setTimeout to ensure DOM update is complete before scrolling
            setTimeout(() => {
                terminalWindow.scrollTop = terminalWindow.scrollHeight;
            }, 0);
        }
    };

    const clearTerminal = () => {
        terminalOutput.innerHTML = '';
        terminalInputLine.style.display = 'none';
    };

    // Async Input Provider
    const inputProvider = (promptMsg) => {
        return new Promise((resolve) => {
            printToTerminal(promptMsg, 'info');
            terminalInputLine.style.display = 'flex';
            // Scroll again because displaying the input line changes scrollHeight
            scrollToBottom();
            terminalInput.value = '';
            terminalInput.focus();

            const handleEnter = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = terminalInput.value;
                    terminalInputLine.style.display = 'none';
                    terminalInput.removeEventListener('keydown', handleEnter);
                    printToTerminal(`> ${val}`, 'input-echo');
                    resolve(val);
                }
            };

            terminalInput.addEventListener('keydown', handleEnter);
        });
    };

    runButton.addEventListener('click', async () => {
        const pseudocode = codeEditor.value;
        clearTerminal();
        clearErrorHighlights();
        printToTerminal('Compiling...', 'info');

        try {
            // Use timeout to allow UI to update if sync parsing is slow, though parsing is usually fast.
            // But interpret is now async.
            const tokens = tokenize(pseudocode);
            const parser = new Parser(tokens);
            const ast = parser.parse();

            printToTerminal('Running...', 'info');

            const interpreter = new Interpreter();
            interpreter.setInputProvider(inputProvider);
            interpreter.setOutputCallback((text) => {
                printToTerminal(text, 'output');
            });

            const result = await interpreter.interpret(ast);

            if (result.error) {
                 printToTerminal(`\nExecution Error: ${result.error}`, 'error');
                 highlightErrorLine(result.error);
            } else {
                 printToTerminal('\nExecution finished.', 'success');
            }

        } catch (error) {
            printToTerminal(`\nCompilation Error: ${error.message}`, 'error');
            highlightErrorLine(error.message);
            console.error(error);
        }
    });

    // -----------------------------------
    // CONTROLS (Save & Clear)
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
        if (confirm('Είστε σίγουροι ότι θέλετε να καθαρίσετε τον κώδικα;')) {
            codeEditor.value = '';
            onInput(); // Update highlighting and line numbers
            exampleSelector.value = ""; // Reset selector
        }
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

        // Update URL to reflect state (clean history)
        const url = new URL(window.location);
        url.searchParams.set('theme', theme);
        window.history.replaceState({}, '', url);

        // Update Home Link to pass theme state via URL (Reverse Sync)
        const homeLink = document.querySelector('.home-link');
        if (homeLink) {
            homeLink.href = `index.html?theme=${theme}`;
        }
    };

    // Initialize from current state (set by inline script) or storage
    // We prioritize the data-theme set by the inline script (which handled URL param priority)
    const currentTheme = document.documentElement.getAttribute('data-theme') || SettingsManager.get('theme', 'light');
    let isDarkMode = currentTheme === 'dark';

    // Update UI to match
    applyTheme(isDarkMode);

    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        applyTheme(isDarkMode);
    });

    // -----------------------------------
    // TERMINAL RESIZING & FOCUS LOGIC
    // -----------------------------------
    const MIN_TERMINAL_HEIGHT = '150px';
    const DEFAULT_EXPANDED_HEIGHT = '40vh';

    // Get saved expanded height or default
    let preferredHeight = SettingsManager.get('terminalExpandedHeight', DEFAULT_EXPANDED_HEIGHT);

    const expandTerminal = () => {
        outputContainer.style.height = preferredHeight;
    };

    const collapseTerminal = () => {
        outputContainer.style.height = MIN_TERMINAL_HEIGHT;
    };

    // Initial State: Collapsed or Expanded?
    // Maybe start expanded if it was saved?
    // For now, let's start with preferred height if it exists, else default.
    outputContainer.style.height = preferredHeight;

    // Events for dynamic resizing
    codeEditor.addEventListener('focus', collapseTerminal);
    document.querySelector('.editor-container').addEventListener('click', collapseTerminal);

    outputContainer.addEventListener('click', expandTerminal);
    terminalInput.addEventListener('focus', expandTerminal);

    // Run button expands terminal to show output
    runButton.addEventListener('click', expandTerminal);


    // Resizing Logic
    let isResizing = false;

    dragHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const containerRect = document.querySelector('.container').getBoundingClientRect();
        const newHeight = containerRect.bottom - e.clientY;
        const maxHeight = containerRect.height * 0.8;

        if (newHeight > 100 && newHeight < maxHeight) {
            outputContainer.style.height = `${newHeight}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            // When user manually resizes, that becomes the new "Preferred" height
            preferredHeight = outputContainer.style.height;
            SettingsManager.set('terminalExpandedHeight', preferredHeight);
        }
    });
	
	if (syntaxHelpButton) {
  syntaxHelpButton.addEventListener('click', () => {
    const msg =
      'Βασικές λέξεις-κλειδιά:\n' +
      'ΑΛΓΟΡΙΘΜΟΣ ... ΤΕΛΟΣ\n' +
      'ΣΤΑΘΕΡΕΣ, ΔΕΔΟΜΕΝΑ για δηλώσεις.\n' +
      'ΕΑΝ <συνθήκη> ΤΟΤΕ ... ΑΛΛΙΩΣ ... ΕΑΝ-ΤΕΛΟΣ\n' +
      'ΓΙΑ / ΕΩΣ / ΜΕ ΒΗΜΑ ... ΓΙΑ-ΤΕΛΟΣ\n' +
      'ΕΝΟΣΩ ... ΕΝΟΣΩ-ΤΕΛΟΣ, ΜΕΧΡΙ ...\n\n' +
      'Τύποι: ΑΚΕΡΑΙΟΣ, ΠΡΑΓΜΑΤΙΚΟΣ, ΛΟΓΙΚΟΣ, ΧΑΡΑΚΤΗΡΑΣ, ΣΥΜΒΟΛΟΣΕΙΡΑ.\n\n' +
      'Οι αγγλικές λέξεις-κλειδιά ALGORITHM, BEGIN, END κ.λπ. υποστηρίζονται επίσης.';
    alert(msg);
  });
}

});
