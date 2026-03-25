export function extractHtml(response: string): string {
  const doctypeStart = response.indexOf('<!DOCTYPE html>')
  const htmlTagStart = response.indexOf('<html')
  const start = doctypeStart !== -1 ? doctypeStart : htmlTagStart

  if (start !== -1) {
    const htmlEnd = response.lastIndexOf('</html>')
    if (htmlEnd !== -1) {
      return response.substring(start, htmlEnd + 7)
    }
  }

  const codeBlockMatch = response.match(/\`\`\`(?:html)?\s*([\s\S]*?)\`\`\`/)
  if (codeBlockMatch) {
    const content = codeBlockMatch[1].trim()
    if (content.includes('<html') || content.includes('<!DOCTYPE')) {
      return content
    }
  }

  const trimmed = response.trim()
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return trimmed
  }

  return response
}

export function postProcessHtml(html: string): string {
  const scriptBlocks: string[] = []

  let processed = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, (match) => {
    scriptBlocks.push(match)
    return `__SCRIPT_BLOCK_${scriptBlocks.length - 1}__`
  })

  processed = processed.replace(/\$\$([^$]+)\$\$/g, '\\[$1\\]')
  processed = processed.replace(/\$([^$\n]+?)\$/g, '\\($1\\)')

  for (let i = 0; i < scriptBlocks.length; i++) {
    const placeholder = `__SCRIPT_BLOCK_${i}__`
    const idx = processed.indexOf(placeholder)
    if (idx !== -1) {
      processed =
        processed.substring(0, idx) +
        scriptBlocks[i] +
        processed.substring(idx + placeholder.length)
    }
  }

  const katexInjection = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
<script>
document.addEventListener("DOMContentLoaded", function() {
    const katexOptions = {
        delimiters: [
            {left: '\\\\[', right: '\\\\]', display: true},
            {left: '\\\\(', right: '\\\\)', display: false},
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ],
        throwOnError: false,
        strict: false,
        trust: true
    };

    let renderTimeout;
    function safeRender() {
        if (renderTimeout) clearTimeout(renderTimeout);
        renderTimeout = setTimeout(() => {
            renderMathInElement(document.body, katexOptions);
        }, 100);
    }

    renderMathInElement(document.body, katexOptions);

    const observer = new MutationObserver((mutations) => {
        let shouldRender = false;
        mutations.forEach((mutation) => {
            if (mutation.target &&
                mutation.target.className &&
                typeof mutation.target.className === 'string' &&
                mutation.target.className.includes('katex')) {
                return;
            }
            shouldRender = true;
        });

        if (shouldRender) {
            safeRender();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    setInterval(() => {
        const text = document.body.innerText;
        if (text.includes('\\\\(') || text.includes('$$')) {
            safeRender();
        }
    }, 2000);
});
</script>`

  const headCloseIdx = processed.indexOf('</head>')
  if (headCloseIdx !== -1) {
    return (
      processed.substring(0, headCloseIdx) +
      katexInjection +
      '\n</head>' +
      processed.substring(headCloseIdx + 7)
    )
  }

  const bodyCloseIdx = processed.indexOf('</body>')
  if (bodyCloseIdx !== -1) {
    return (
      processed.substring(0, bodyCloseIdx) +
      katexInjection +
      '\n</body>' +
      processed.substring(bodyCloseIdx + 7)
    )
  }

  return processed + katexInjection
}
