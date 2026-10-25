// Loading Screen & Initial Settings
document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    let progress = 0;
    const loadingMessages = [
        "Initializing CodePlay Editor...",
        "Loading HTML Editor...",
        "Setting up CSS Environment...",
        "Preparing JavaScript Engine...",
        "Ready to Code! 🚀"
    ];
    
    const loadingInterval = setInterval(() => {
        progress += 20;
        progressBar.style.width = progress + '%';
        
        if (progress <= 20) progressText.textContent = loadingMessages[0];
        else if (progress <= 40) progressText.textContent = loadingMessages[1];
        else if (progress <= 60) progressText.textContent = loadingMessages[2];
        else if (progress <= 80) progressText.textContent = loadingMessages[3];
        else progressText.textContent = loadingMessages[4];
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.visibility = 'hidden';
            }, 500);
        }
    }, 150);
    
    setDefaultCode();
    updateLineCounters();
    updateCharCount();
    startClock();
    loadSavedCode();
    startAutoSave();
});

// Set default code
function setDefaultCode() {
    document.getElementById('html-code').value = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My App</title>
</head>
<body>
    <div class="card">
        <h1>Hello World! 👋</h1>
        <p>Welcome to CodePlay Editor. Edit the code on the left to test your web app.</p>
        <button class="btn" onclick="sayHello()">Click Me!</button>
    </div>
</body>
</html>`;

    document.getElementById('css-code').value = `body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.card {
    background: white;
    padding: 2.5rem;
    border-radius: 16px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    text-align: center;
    max-width: 400px;
}

h1 {
    color: #1f2937;
    margin-bottom: 1rem;
}

p {
    color: #4b5563;
    line-height: 1.5;
    margin-bottom: 1.5rem;
}

.btn {
    background: #6366f1;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;
}

.btn:hover {
    background: #4f46e5;
}`;

    document.getElementById('js-code').value = `function sayHello() {
    alert("Welcome to CodePlay Editor! 🚀");
}`;

    setTimeout(run, 1000);
}

// Run Code Function
function run() {
    const htmlCode = document.getElementById('html-code').value;
    const cssCode = document.getElementById('css-code').value;
    const jsCode = document.getElementById('js-code').value;
    const output = document.getElementById('output');
    const status = document.getElementById('status');

    status.textContent = 'Running...';
    status.style.background = 'var(--warning)';

    try {
        const doc = output.contentDocument || output.contentWindow.document;
        doc.open();
        doc.write(htmlCode);
        
        const style = doc.createElement('style');
        style.textContent = cssCode;
        doc.head.appendChild(style);
        
        const script = doc.createElement('script');
        script.textContent = jsCode;
        doc.body.appendChild(script);
        
        doc.close();
        
        setTimeout(() => {
            status.textContent = 'Ready';
            status.style.background = 'var(--success)';
            const now = new Date();
            document.getElementById('output-time').textContent = `Last run: ${now.toLocaleTimeString()}`;
        }, 300);

    } catch (error) {
        status.textContent = 'Error';
        status.style.background = 'var(--danger)';
        showToast(`Error: ${error.message}`, 'error');
    }
}

// Clear Code
function clearCode() {
    if (confirm('Are you sure you want to clear all code?')) {
        document.getElementById('html-code').value = '';
        document.getElementById('css-code').value = '';
        document.getElementById('js-code').value = '';
        updateLineCounters();
        updateCharCount();
        showToast('All code cleared!');
    }
}

// Copy Code
function copyCode(editorId) {
    const textarea = document.getElementById(editorId);
    textarea.select();
    document.execCommand('copy');
    showToast('Code copied to clipboard!');
}

// Format Code
function formatCode(editorId) {
    const textarea = document.getElementById(editorId);
    let formatted = textarea.value
        .replace(/\}\s*/g, '}\n\n')
        .replace(/\{\s*/g, '{\n')
        .replace(/;\s*/g, ';\n');
    textarea.value = formatted;
    showToast('Code formatted!');
}

// Toggle Theme
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const themeBtn = document.querySelector('.theme-btn i');
    if (document.body.classList.contains('light-mode')) {
        themeBtn.className = 'fas fa-sun';
        showToast('Light mode activated');
    } else {
        themeBtn.className = 'fas fa-moon';
        showToast('Dark mode activated');
    }
}

// Refresh Output
function refreshOutput() {
    run();
}

// Fullscreen Logic
let currentFullscreen = null;

function toggleFullscreen(editorId) {
    const editor = document.getElementById(editorId);
    const overlay = document.getElementById('fullscreen-overlay');
    
    if (!editor.classList.contains('fullscreen-mode')) {
        if (currentFullscreen) exitFullscreen();
        editor.classList.add('fullscreen-mode');
        overlay.classList.add('active');
        currentFullscreen = editor;
    } else {
        exitFullscreen();
    }
}

function exitFullscreen() {
    if (currentFullscreen) {
        currentFullscreen.classList.remove('fullscreen-mode');
        currentFullscreen = null;
    }
    document.getElementById('fullscreen-overlay').classList.remove('active');
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') exitFullscreen();
});

// Counter Updates
function updateLineCounters() {
    const editors = ['html', 'css', 'js'];
    editors.forEach(editor => {
        const textarea = document.getElementById(`${editor}-code`);
        const lineSpan = document.getElementById(`${editor}-lines`);
        textarea.addEventListener('input', () => {
            const lines = textarea.value.split('\n').length;
            lineSpan.textContent = lines;
            updateCharCount();
        });
    });
}

function updateCharCount() {
    const editors = ['html', 'css', 'js'];
    let totalChars = 0;
    editors.forEach(editor => {
        totalChars += document.getElementById(`${editor}-code`).value.length;
    });
    document.getElementById('char-count').textContent = `Characters: ${totalChars}`;
}

// Real-time Clock
function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('time').textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }, 1000);
}

// Toast Notifications
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Auto Save
function startAutoSave() {
    setInterval(() => {
        localStorage.setItem('codeplay_html', document.getElementById('html-code').value);
        localStorage.setItem('codeplay_css', document.getElementById('css-code').value);
        localStorage.setItem('codeplay_js', document.getElementById('js-code').value);
    }, 10000);
}

function loadSavedCode() {
    const html = localStorage.getItem('codeplay_html');
    const css = localStorage.getItem('codeplay_css');
    const js = localStorage.getItem('codeplay_js');
    if (html) document.getElementById('html-code').value = html;
    if (css) document.getElementById('css-code').value = css;
    if (js) document.getElementById('js-code').value = js;
}

// Auto Run on Typing
const editors = ['html-code', 'css-code', 'js-code'];
editors.forEach(id => {
    document.getElementById(id).addEventListener('input', function() {
        clearTimeout(this.timer);
        this.timer = setTimeout(run, 800);
    });
});