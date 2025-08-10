const markdownInput = document.getElementById("markdownInput");
const htmlPreview = document.getElementById("htmlPreview");
const toggleTheme = document.getElementById("toggleTheme");
const downloadHTML = document.getElementById("downloadHTML");
const clearEditor = document.getElementById("clearEditor");
const voiceBtn = document.getElementById("voiceBtn"); // Add this line to get voice button

// Restore saved markdown
if (localStorage.getItem("markdownContent")) {
  markdownInput.value = localStorage.getItem("markdownContent");
  renderMarkdown();
}

// Live rendering
markdownInput.addEventListener("input", renderMarkdown);

function renderMarkdown() {
  let text = markdownInput.value;

  // Save to localStorage
  localStorage.setItem("markdownContent", text);

  // Headings
  text = text.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  text = text.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold & Italic
  text = text.replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>');
  text = text.replace(/\*(.*?)\*/gim, '<i>$1</i>');

  
  // Blockquotes
  text = text.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Links
  text = text.replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank'>$1</a>");

  // Images
    text = text.replace(/!\[([^\]]*?)\]\(([^ )]+)(?: "([^"]*)")?\)/gim, function(match, alt, url, title) {
    let imgTag = `<img src="${url}" alt="${alt}"`;
    if (title) imgTag += ` title="${title}"`;
    imgTag += " />";
    return imgTag;
  });
  

  // Ordered Lists
  text = text.replace(/^\d+\.\s+(.*$)/gim, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/gim, '<ol>$1</ol>');

  // Unordered Lists
  text = text.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

  // Code blocks
  text = text.replace(/```([\s\S]*?)```/gim, function(match, code) {
    return `<pre><code class="language-javascript">${code}</code></pre>`;
  });
  text = text.replace(/\`(.*?)\`/gim, '<code>$1</code>');

  // Highlight
text = text.replace(/==(.+?)==/gim, '<mark>$1</mark>');

// Subscript
text = text.replace(/~(.*?)~/gim, '<sub>$1</sub>');

// Superscript
text = text.replace(/\^(.*?)\^/gim, '<sup>$1</sup>');

// Inline math
text = text.replace(/\$(.+?)\$/gim, '<span class="math-inline">\\($1\\)</span>');

// Block math
text = text.replace(/\$\$(.+?)\$\$/gims, '<div class="math-block">\\[$1\\]</div>');


// Strikethrough
text = text.replace(/~~(.*?)~~/gim, '<del>$1</del>');

// Comments (GitHub-style)
text = text.replace(/\[\/\/\]:\s?#\s?\((.*?)\)/gim, '');
text = text.replace(/\[comment\]:\s?#\s?\((.*?)\)/gim, '');

  // Horizontal Rule (---, ***, ___)
text = text.replace(/^(\-\s?-\s?-|_\s?_\s?_)\s*$/gim, '<hr />');

  // Tables
text = text.replace(
    /^((\|.+)+)\n((\|[-:]+)+)\n((\|.+\n?)+)/gim,
    function (match, headerRow, _, separatorRow, __, dataRows) {
      const headers = headerRow.trim().split('|').filter(Boolean);
      const rows = dataRows.trim().split('\n').map(row =>
        row.trim().split('|').filter(Boolean)
      );
  
      let tableHTML = '<table><thead><tr>';
      headers.forEach(h => {
        tableHTML += `<th>${h.trim()}</th>`;
      });
      tableHTML += '</tr></thead><tbody>';
      rows.forEach(cells => {
        tableHTML += '<tr>';
        cells.forEach(cell => {
          tableHTML += `<td>${cell.trim()}</td>`;
        });
        tableHTML += '</tr>';
      });
      tableHTML += '</tbody></table>';
      return tableHTML;
    }
  );
  

  // Line breaks
  text = text.replace(/\n/g, '<br />');

  htmlPreview.innerHTML = text;

  // Apply syntax highlighting
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
}

// Dark mode toggle
toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Download HTML
downloadHTML.addEventListener("click", () => {
  const blob = new Blob([htmlPreview.innerHTML], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "markdown.html";
  link.click();
});

// Clear editor
clearEditor.addEventListener("click", () => {
  markdownInput.value = "";
  localStorage.removeItem("markdownContent");
  renderMarkdown();
});

// About modal logic
const aboutModal = document.getElementById("aboutModal");
const showAbout = document.getElementById("showAbout");
const closeAbout = document.getElementById("closeAbout");

showAbout.addEventListener("click", () => {
  aboutModal.classList.remove("hidden");
});

closeAbout.addEventListener("click", () => {
  aboutModal.classList.add("hidden");
});

// Optional: Close modal on outside click
window.addEventListener("click", (e) => {
  if (e.target === aboutModal) {
    aboutModal.classList.add("hidden");
  }
});

// 📋 Copy rendered HTML to clipboard
document.getElementById("copyHtml").addEventListener("click", () => {
    const html = document.getElementById("htmlPreview").innerHTML;
  
    // Create a temporary textarea to hold the HTML
    const tempTextarea = document.createElement("textarea");
    tempTextarea.value = html;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextarea);
  
    alert("HTML copied to clipboard!");
  });
  
  if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
    voiceBtn.disabled = true;
    voiceBtn.title = "Speech Recognition not supported in this browser.";
  } else {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
  
    voiceBtn.addEventListener('click', () => {
      recognition.start();
      voiceBtn.textContent = '🎙️ Listening...';
    });
  
    recognition.addEventListener('result', (event) => {
      let transcript = event.results[0][0].transcript.toLowerCase();
  
      // Replace spoken commands with markdown syntax
      transcript = transcript.replace(/\bhashtag\b/g, '# ');
      transcript = transcript.replace(/\bbold\b/g, '**');
      transcript = transcript.replace(/\bitalic\b/g, '*');
      transcript = transcript.replace(/\bnew line\b/g, '\n');
      transcript = transcript.replace(/\bquote\b/g, '> ');
      transcript = transcript.replace(/\blink\b/g, '[link](url)');
  
      insertAtCursor(markdownInput, transcript + ' ');
      renderMarkdown();
  
      voiceBtn.textContent = '🎤 Voice';
    });
  
    recognition.addEventListener('end', () => {
      voiceBtn.textContent = '🎤 Voice';
    });
  
    recognition.addEventListener('error', (e) => {
      alert('Speech recognition error: ' + e.error);
      voiceBtn.textContent = '🎤 Voice';
    });
  }
  
  // Helper to insert text at cursor
  function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    textarea.value = val.substring(0, start) + text + val.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
  }
  
// Initial render
renderMarkdown();
