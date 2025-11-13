// Flexible Case Renderer with Math and Table Support
class FlexibleCaseRenderer {
    constructor() {
        this.renderers = {
            'image': this.renderImage.bind(this),
            'question': this.renderQuestion.bind(this),
            'thinking': this.renderThinking.bind(this),
            'code': this.renderCode.bind(this),
            'generated_images': this.renderGeneratedImages.bind(this),
            'answer': this.renderAnswer.bind(this)
        };
        
        // Initialize MathJax if not already loaded
        this.initMathJax();
    }

    initMathJax() {
        // Check if MathJax is already loaded
        if (window.MathJax) {
            return;
        }

        // Configure MathJax
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                processEscapes: true,
                processEnvironments: true
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
                ignoreHtmlClass: 'tex2jax_ignore',
                processHtmlClass: 'tex2jax_process'
            }
        };

        // Load MathJax script
        const script = document.createElement('script');
        script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6';
        document.head.appendChild(script);

        const mathJaxScript = document.createElement('script');
        mathJaxScript.id = 'MathJax-script';
        mathJaxScript.async = true;
        mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        document.head.appendChild(mathJaxScript);
    }

    renderCase(caseData) {
        if (!caseData || !caseData.sections) {
            return '<div class="error">Invalid case data</div>';
        }

        let html = '<div class="case-container">';
        
        // Group thinking rounds
        const thinkingRounds = this.groupThinkingRounds(caseData.sections);
        
        caseData.sections.forEach((section, index) => {
            if (section.type === 'thinking' && thinkingRounds[section.data.round] && thinkingRounds[section.data.round].length > 1) {
                // Skip if this thinking section is part of a group that's already rendered
                if (thinkingRounds[section.data.round][0] !== section) {
                    return;
                }
                // Render all thinking sections for this round together
                html += this.renderThinkingRound(thinkingRounds[section.data.round]);
            } else if (section.type !== 'thinking') {
                // Render non-thinking sections normally
                html += this.renderSection(section);
            } else {
                // Single thinking section
                html += this.renderSection(section);
            }
        });
        
        html += '</div>';
        
        // Re-render MathJax after content is added
        setTimeout(() => {
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise();
            }
        }, 100);
        
        return html;
    }

    groupThinkingRounds(sections) {
        const rounds = {};
        sections.forEach(section => {
            if (section.type === 'thinking' && section.data.round) {
                if (!rounds[section.data.round]) {
                    rounds[section.data.round] = [];
                }
                rounds[section.data.round].push(section);
            }
        });
        return rounds;
    }

    renderSection(section) {
        const renderer = this.renderers[section.type];
        if (!renderer) {
            console.warn(`No renderer found for section type: ${section.type}`);
            return '';
        }
        return renderer(section.data);
    }

    renderThinkingRound(thinkingSections) {
        let html = '<div class="thinking-round">';
        html += '<h3 class="thinking-round-title">🤔Thinking Process</h3>';
        thinkingSections.forEach(section => {
            html += this.renderThinking(section.data, false);
        });
        html += '</div>';
        return html;
    }

    renderImage(data) {
        return `
            <div class="section image-section">
                <div class="image-container">
                    <img src="${data.src}" alt="${data.caption || 'Image'}" 
                        class="zoomable-image"
                        ${data.width ? `style="max-width: ${data.width}px; width: 100%;"` : ''}
                        onclick="openImageViewer('${data.src}', '${data.caption || 'Image'}')">
                    ${data.caption ? `<p class="image-caption">${data.caption}</p>` : ''}
                </div>
            </div>
        `;
    }

    renderQuestion(data) {
        const processedText = this.processTextWithMathAndTables(data.text);
        return `
            <div class="section question-section">
                <h3 class="section-title">❓User Prompt</h3>
                <div class="question-box tex2jax_process">
                    ${processedText}
                </div>
            </div>
        `;
    }

    renderThinking(data, includeTitle = true) {
        const processedText = this.processTextWithMathAndTables(data.text);
        
        return `
            <div class="section thinking-section">
                ${includeTitle ? '<h3 class="section-title">🤔Thinking Process</h3>' : ''}
                <div class="thinking-process tex2jax_process">${processedText}</div>
            </div>
        `;
    }

    renderCode(data) {
        const language = data.language || 'python';
        return `
            <div class="section code-section">
                <h3 class="section-title">💻Generated Code</h3>
                <div class="code-container">
                    <pre class="line-numbers"><code class="language-${language}">${this.escapeHtml(data.code)}</code></pre>
                </div>
            </div>
        `;
    }

    renderGeneratedImages(data) {
        if (!data.images && !data.results) {
            return '';
        }

        const title = "💡Generated Results";

        let html = `
            <div class="section generated-images-section">
                <h3 class="section-title">${title}</h3>
                <div class="result-images">
        `;

        // Process image
        if (data.images) {
            data.images.forEach(img => {
                html += `
                    <div class="result-image">
                        <img src="${img.src}" 
                            alt="${img.caption || "💡Generated image"}"
                            class="zoomable-image"
                            onclick="openImageViewer('${img.src}', '${img.caption || 'Generated image'}')"
                            ${img.width ? `style="max-width: ${img.width}px; width: 100%;"` : ''}>
                        ${img.caption ? `<p class="result-image-caption">${img.caption}</p>` : ''}
                    </div>
                `;
            });
        }

        if (data.results) {
            data.results.forEach(result => {
                const processedValue = this.processTextWithMathAndTables(result.value);
                html += `
                    <div class="result-item">
                        <div class="code-block tex2jax_process">${processedValue}</div>
                        ${result.caption ? `<p class="result-image-caption">${result.caption}</p>` : ''}
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }

    renderAnswer(data) {
        const processedText = this.processTextWithMathAndTables(data.text);
        return `
            <div class="section answer-section">
                <h3 class="section-title">✅Final Answer</h3>
                <div class="answer-container">
                    <div class="answer-box tex2jax_process">${processedText}</div>
                </div>
            </div>
        `;
    }

    // Process text with math expressions and tables
    processTextWithMathAndTables(text) {
        if (!text) return '';
        
        // First process LaTeX tables
        let processedText = this.processLatexTables(text);
        
        // Then format the text (preserving math expressions)
        processedText = this.formatTextWithMath(processedText);
        
        return processedText;
    }

    // Process LaTeX tables and convert them to HTML
    processLatexTables(text) {
        // Match LaTeX table environments
        const tableRegex = /\\begin{center}\s*\\begin{tabular}\{([^}]+)\}([\s\S]*?)\\end{tabular}\s*\\end{center}/g;
        
        return text.replace(tableRegex, (match, columnDef, tableContent) => {
            return this.convertLatexTableToHtml(columnDef, tableContent);
        });
    }

    convertLatexTableToHtml(columnDef, tableContent) {
        // Parse column definition (e.g., "|c|c|" -> 2 columns with borders)
        const columns = columnDef.match(/[lcr]/g) || [];
        const hasBorders = columnDef.includes('|');
        
        // Split table content into rows
        const rows = tableContent.split('\\\\').map(row => row.trim()).filter(row => row);
        
        let html = `<table class="latex-table ${hasBorders ? 'bordered' : ''}">`;
        
        rows.forEach((row, rowIndex) => {
            if (row === '\\hline') return; // Skip hline commands
            
            // Split row into cells, handling escaped &
            const cells = row.split('&').map(cell => cell.trim());
            
            // Determine if this is a header row (contains \textbf)
            const isHeader = row.includes('\\textbf');
            const tag = isHeader ? 'th' : 'td';
            
            html += '<tr>';
            cells.forEach((cell, cellIndex) => {
                if (cellIndex < columns.length) {
                    // Process cell content (remove LaTeX formatting)
                    let processedCell = cell
                        .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
                        .replace(/\\hline/g, '')
                        .trim();
                    
                    html += `<${tag}>${processedCell}</${tag}>`;
                }
            });
            html += '</tr>';
        });
        
        html += '</table>';
        return html;
    }

    // Format text while preserving math expressions
    formatTextWithMath(text) {
        if (!text) return '';
        
        // Split text by math delimiters while preserving them
        const parts = [];
        let current = text;
        let inMath = false;
        let result = '';
        
        // Simple approach: just replace newlines with <br> but preserve math
        const lines = text.split('\n');
        const processedLines = [];
        
        for (let line of lines) {
            if (line.trim() === '') {
                processedLines.push('');
            } else {
                processedLines.push(line);
            }
        }
        
        // Remove empty lines at start and end
        while (processedLines.length > 0 && processedLines[0].trim() === '') {
            processedLines.shift();
        }
        while (processedLines.length > 0 && processedLines[processedLines.length - 1].trim() === '') {
            processedLines.pop();
        }
        
        return processedLines.join('<br>');
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Format text. Remove empty lines at heads and tails.
    formatText(text) {
        if (!text) return '';
        const lines = text.split('\n');
        while (lines.length > 0 && lines[0].trim() === '') {
            lines.shift();
        }
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
            lines.pop();
        }
        const cleaned = lines.join('\n');
        const escaped = this.escapeHtml(cleaned);
        return escaped.replace(/\n/g, '<br>');
    }
}