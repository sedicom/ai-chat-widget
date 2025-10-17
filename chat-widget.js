/**
 * Chat Widget - Versión con estilos del widget n8n, logo y footer "Powered by" (texto configurable)
 */
(function() {
  'use strict';

  // Cargar DOMPurify para seguridad (muy recomendado)
  const purifyScript = document.createElement('script');
  purifyScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js';
  purifyScript.async = true;
  document.head.appendChild(purifyScript);

  // Configuración por defecto
  const defaultConfig = {
    branding: {
      title: 'Asistente IA',
      logo: 'https://cloud.sedicom.es/s/wTQozTH3inMKSHQ/preview',
      primaryColor: '#00416A',
      secondaryColor: '#005a87',
      greeting: '👋 Soy tu asistente de IA. ¿Puedo ayudarte?',
      buttonText: 'Habla conmigo',
      poweredBy: {
        text: 'Powered by Sedicom', // Ahora el texto es configurable
        link: 'https://www.sedicom.es' 
      }
    },
    shortcuts: [
      'Necesito soporte',
      'Información de servicios',
      '¿Qué puedes hacer?'
    ],
    webhook: {
      url: 'https://n8n0.sedicom.es/webhook/bf0bdec6-995b-4a6c-bb8c-cf2b613948ab/chat',
      route: 'general'
    },
    settings: {
      openOnLoad: false,
      rememberConversation: true,
      rememberSession: true,
      allowFileUpload: false,
      showSources: false
    }
  };

  // Merge de configuración
  const config = window.ChatWidgetConfig 
    ? deepMerge(defaultConfig, window.ChatWidgetConfig) 
    : defaultConfig;

  function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) Object.assign(output, { [key]: source[key] });
          else output[key] = deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // Gestión de persistencia mejorada
  function saveConversation(messages) {
    if (config.settings.rememberConversation) {
      try {
        sessionStorage.setItem('chatConversation', JSON.stringify(messages));
      } catch (e) {
        console.error('Error saving conversation:', e);
      }
    }
  }

  function loadConversation() {
    if (!config.settings.rememberConversation) return [];
    try {
      return JSON.parse(sessionStorage.getItem('chatConversation') || '[]');
    } catch (e) {
      console.error('Error loading conversation:', e);
      return [];
    }
  }

  function getChatId() {
    if (!config.settings.rememberSession) return 'session_' + Date.now();
    let id = sessionStorage.getItem('chatId');
    if (!id) {
      id = 'chat_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('chatId', id);
    }
    return id;
  }

  // Inyección de estilos del widget n8n adaptados
  function injectStyles() {
    if (document.getElementById('chat-widget-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'chat-widget-styles';
    style.textContent = `
      @import url('https://cdnjs.cloudflare.com/ajax/libs/geist-font/1.0.0/fonts/geist-sans/style.min.css');
      
      #chat-widget-root {
        --chat--color-primary: ${config.branding.primaryColor};
        --chat--color-secondary: ${config.branding.secondaryColor};
        --chat--color-background: #ffffff;
        --chat--color-font: #333333;
        font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
      
      #chat-widget-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        display: none;
        width: 380px;
        height: 600px;
        background: var(--chat--color-background);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
        border: 1px solid rgba(133, 79, 255, 0.2);
        overflow: hidden;
        font-family: inherit;
        flex-direction: column;
      }
      
      #chat-widget-container.position-left {
        right: auto;
        left: 20px;
      }
      
      #chat-widget-container.open {
        display: flex;
        flex-direction: column;
      }
      
      #chat-widget-header {
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid rgba(133, 79, 255, 0.1);
        position: relative;
      }
      
      #chat-widget-header .title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        font-size: 18px;
        color: var(--chat--color-font);
      }
      
      #chat-widget-header img {
        width: 32px;
        height: 32px;
        border-radius: 4px;
      }
      
      #chat-widget-header button {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--chat--color-font);
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
        font-size: 20px;
        opacity: 0.6;
      }
      
      #chat-widget-header button:hover {
        opacity: 1;
      }
      
      #chat-widget-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: var(--chat--color-background);
        display: flex;
        flex-direction: column;
      }
      
      #chat-widget-body p {
        padding: 12px 16px;
        margin: 8px 0;
        border-radius: 12px;
        max-width: 80%;
        word-wrap: break-word;
        font-size: 14px;
        line-height: 1.5;
      }
      
      #chat-widget-body p[role="user-message"] {
        background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
        color: white;
        align-self: flex-end;
        box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2);
        border: none;
      }
      
      #chat-widget-body p[role="bot-message"] {
        background: var(--chat--color-background);
        border: 1px solid rgba(133, 79, 255, 0.2);
        color: var(--chat--color-font);
        align-self: flex-start;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      
      #chat-widget-body p[role="bot-message"] a {
        display: inline-block;
        background: var(--chat--color-primary);
        color: white;
        padding: 10px 16px;
        text-decoration: none;
        border-radius: 6px;
        font-size: 14px;
        margin: 4px;
        transition: background 0.2s;
      }
      
      #chat-widget-body p[role="bot-message"] a:hover {
        background: var(--chat--color-secondary);
      }
      
      .chat-shortcuts {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin: 8px 16px;
      }
      
      .chat-shortcuts button {
        background: var(--chat--color-primary);
        color: #fff;
        border: none;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.2s ease;
        font-family: inherit;
      }
      
      .chat-shortcuts button:hover {
        background: var(--chat--color-secondary);
      }
      
      #chat-widget-input-area {
        padding: 16px;
        background: var(--chat--color-background);
        border-top: 1px solid rgba(133, 79, 255, 0.1);
        display: flex;
        gap: 8px;
      }
      
      #chat-widget-input {
        flex: 1;
        padding: 12px;
        border: 1px solid rgba(133, 79, 255, 0.2);
        border-radius: 8px;
        background: var(--chat--color-background);
        color: var(--chat--color-font);
        resize: none;
        font-family: inherit;
        font-size: 14px;
      }
      
      #chat-widget-input::placeholder {
        color: var(--chat--color-font);
        opacity: 0.6;
      }
      
      #chat-widget-send {
        background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0 20px;
        cursor: pointer;
        transition: transform 0.2s;
        font-family: inherit;
        font-weight: 500;
      }
      
      #chat-widget-send:hover {
        transform: scale(1.05);
      }
      
      #chat-widget-powered-by {
        padding: 8px;
        text-align: center;
        background: var(--chat--color-background);
        border-top: 1px solid rgba(133, 79, 255, 0.1);
      }
      
      #chat-widget-powered-by a {
        color: var(--chat--color-primary);
        text-decoration: none;
        font-size: 12px;
        opacity: 0.8;
        transition: opacity 0.2s;
        font-family: inherit;
      }
      
      #chat-widget-powered-by a:hover {
        opacity: 1;
      }
      
      #chat-widget-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 30px;
        background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
        z-index: 999;
        transition: transform 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      #chat-widget-button.position-left {
        right: auto;
        left: 20px;
      }
      
      #chat-widget-button:hover {
        transform: scale(1.05);
      }
      
      #chat-widget-button svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
      }
      
      #chat-widget-greeting {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 280px;
        background: #fff;
        border: 2px solid var(--chat--color-primary);
        border-radius: 24px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        padding: 16px;
        color: var(--chat--color-primary);
        font-size: 14px;
        line-height: 1.4;
        z-index: 999999;
        font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      }
      
      #chat-widget-greeting::before {
        content: "";
        position: absolute;
        bottom: -18px;
        right: 58px;
        border-width: 18px 18px 0 18px;
        border-style: solid;
        border-color: var(--chat--color-primary) transparent transparent transparent;
      }
      
      #chat-widget-greeting::after {
        content: "";
        position: absolute;
        bottom: -16px;
        right: 58px;
        border-width: 16px 16px 0 16px;
        border-style: solid;
        border-color: #fff transparent transparent transparent;
      }
      
      #chat-widget-greeting .greeting-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: transparent;
        border: none;
        color: var(--chat--color-primary);
        font-size: 16px;
        cursor: pointer;
      }
      
      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        background: var(--chat--color-background);
        border: 1px solid rgba(133, 79, 255, 0.2);
        border-radius: 12px;
        align-self: flex-start;
        margin: 8px 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      
      .typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--chat--color-primary);
        animation: typing-bounce 1.4s infinite ease-in-out;
      }
      
      .typing-dot:nth-child(1) {
        animation-delay: -0.32s;
      }
      
      .typing-dot:nth-child(2) {
        animation-delay: -0.16s;
      }
      
      @keyframes typing-bounce {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      @media (max-width: 480px) {
        #chat-widget-container {
          width: 100%;
          height: 100%;
          bottom: 0;
          right: 0;
          border-radius: 0;
          max-width: 100%;
          max-height: 100%;
        }
        
        #chat-widget-body {
          padding: 16px;
        }
        
        #chat-widget-input-area {
          padding: 12px;
        }
        
        #chat-widget-greeting {
          top: 20px;
          bottom: auto;
          right: 20px;
          width: calc(100% - 40px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Construcción del HTML mejorada
  function buildWidget() {
    if (document.getElementById('chat-widget-root')) return;
    
    const container = document.createElement('div');
    container.id = 'chat-widget-root';
    
    const greeting = document.createElement('div');
    greeting.id = 'chat-widget-greeting';
    greeting.innerHTML = `<button class="greeting-close" aria-label="Cerrar saludo">✕</button><p>${config.branding.greeting}</p>`;
    
    const button = document.createElement('button');
    button.id = 'chat-widget-button';
    button.textContent = config.branding.buttonText;
    button.setAttribute('aria-label', 'Abrir chat');
    
    const widget = document.createElement('div');
    widget.id = 'chat-widget-container';
    widget.setAttribute('role', 'dialog');
    widget.setAttribute('aria-labelledby', 'chat-widget-title');
    widget.setAttribute('aria-modal', 'true');
    
    const shortcutsHTML = config.shortcuts.map(s => `<button data-shortcut="${s}" aria-label="${s}">${s}</button>`).join('');
    
    widget.innerHTML = `
      <div id="chat-widget-header">
        <div class="title">
          <img src="${config.branding.logo}" alt="Logo"/>
          <span id="chat-widget-title">${config.branding.title}</span>
        </div>
        <button id="chat-widget-close" aria-label="Cerrar chat">✕</button>
      </div>
      <div id="chat-widget-body" role="log" aria-live="polite" aria-label="Mensajes del chat"></div>
      <div id="chat-widget-shortcuts" class="chat-shortcuts" role="group" aria-label="Atajos">${shortcutsHTML}</div>
      <div id="chat-widget-input-area">
        <input type="text" id="chat-widget-input" placeholder="Escribe aquí…" aria-label="Mensaje"/>
        <button id="chat-widget-send" aria-label="Enviar mensaje">Enviar</button>
      </div>
      <div id="chat-widget-powered-by">
        <a href="${config.branding.poweredBy.link}" target="_blank" rel="noopener noreferrer">
          ${config.branding.poweredBy.text}
        </a>
      </div>
    `;
    
    container.appendChild(greeting);
    container.appendChild(button);
    container.appendChild(widget);
    document.body.appendChild(container);
  }

  // Función para aplicar estilos a los enlaces en los mensajes del bot
  function applyLinkStyles(element) {
    const links = element.querySelectorAll('a');
    links.forEach(link => {
      // Aplicar estilos directamente para asegurar que se usen los colores configurados
      link.style.display = 'inline-block';
      link.style.background = config.branding.primaryColor;
      link.style.color = 'white';
      link.style.padding = '10px 16px';
      link.style.textDecoration = 'none';
      link.style.borderRadius = '6px';
      link.style.fontSize = '14px';
      link.style.margin = '4px';
      link.style.transition = 'background 0.2s';
      
      // Añadir eventos hover
      link.addEventListener('mouseenter', function() {
        this.style.background = config.branding.secondaryColor;
      });
      
      link.addEventListener('mouseleave', function() {
        this.style.background = config.branding.primaryColor;
      });
    });
  }

  // Renderizado de conversación mejorado
  function renderConversation(body) {
    const msgs = loadConversation();
    body.innerHTML = '';
    
    if (msgs.length === 0) {
      const welcomeP = document.createElement('p');
      welcomeP.style.color = '#fff';
      welcomeP.style.background = config.branding.primaryColor;
      welcomeP.innerHTML = '<strong>Hola 👋🏻, ¿puedo ayudarte?</strong>';
      body.appendChild(welcomeP);
    } else {
      msgs.forEach(m => {
        const p = document.createElement('p');
        if (m.type === 'user') {
          p.textContent = m.text;
          p.setAttribute('role', 'user-message');
        } else {
          const safeHtml = window.DOMPurify ? DOMPurify.sanitize(m.html) : m.html;
          p.innerHTML = safeHtml;
          p.setAttribute('role', 'bot-message');
          // Aplicar estilos a los enlaces
          applyLinkStyles(p);
        }
        body.appendChild(p);
      });
    }
    body.scrollTop = body.scrollHeight;
  }

  // FUNCIÓN PARA INICIAR SESIÓN
  async function startNewSession() {
    sessionStorage.removeItem('chatConversation');
    const chatId = getChatId();

    const chatBody = document.getElementById('chat-widget-body');
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.setAttribute('aria-label', 'Escribiendo');
    typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    chatBody.appendChild(typing);

    try {
      const response = await fetch(config.webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "startChat", chatId: chatId, route: config.webhook.route })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (typing.parentNode) chatBody.removeChild(typing);

      const botP = document.createElement('p');
      const safeHtml = window.DOMPurify ? DOMPurify.sanitize(data.output || '¡Hola! ¿En qué puedo ayudarte?') : data.output || '¡Hola! ¿En qué puedo ayudarte?';
      saveConversation([{ type: 'bot', html: safeHtml }]);
      
      botP.innerHTML = safeHtml;
      botP.setAttribute('role', 'bot-message');
      // Aplicar estilos a los enlaces
      applyLinkStyles(botP);
      chatBody.appendChild(botP);
      chatBody.scrollTop = chatBody.scrollHeight;

    } catch (err) {
      if (typing.parentNode) chatBody.removeChild(typing);
      console.error('Chat Widget Start Error:', err);
      const errP = document.createElement('p');
      errP.textContent = 'Error al conectar. Por favor, recarga la página.';
      errP.style.color = '#fff';
      errP.style.background = '#FF0000';
      chatBody.appendChild(errP);
    }
  }

  // Envío de mensajes mejorado
  function sendMessage(text) {
    const inputEl = document.getElementById('chat-widget-input');
    const chatBody = document.getElementById('chat-widget-body');
    
    const txt = text || inputEl.value.trim();
    if (!txt) return;
    
    const conv = loadConversation();
    conv.push({ type: 'user', text: txt });
    saveConversation(conv);
    
    const up = document.createElement('p');
    up.textContent = txt;
    up.setAttribute('role', 'user-message');
    chatBody.appendChild(up);
    inputEl.value = '';
    
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.setAttribute('aria-label', 'Escribiendo');
    typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    const timeoutId = setTimeout(() => {
      if (typing.parentNode) {
        chatBody.removeChild(typing);
        const timeoutP = document.createElement('p');
        timeoutP.textContent = 'La respuesta está tardando más de lo esperado.';
        timeoutP.style.color = '#fff';
        timeoutP.style.background = '#FF9800';
        chatBody.appendChild(timeoutP);
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }, 30000);
    
    fetch(config.webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: getChatId(), message: txt, route: config.webhook.route })
    })
    .then(response => {
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (typing.parentNode) chatBody.removeChild(typing);
      
      const botP = document.createElement('p');
      const safeHtml = window.DOMPurify ? DOMPurify.sanitize(data.output || 'Lo siento, no entendí eso.') : data.output || 'Lo siento, no entendí eso.';
      
      const conv = loadConversation();
      // Si la conversación solo tiene el mensaje del usuario (longitud 1), esta es la primera respuesta del bot.
      const isFirstResponse = conv.length === 1; 
      
      conv.push({ type: 'bot', html: safeHtml });
      saveConversation(conv);
      
      botP.innerHTML = safeHtml;
      botP.setAttribute('role', 'bot-message');
      // Aplicar estilos a los enlaces
      applyLinkStyles(botP);
      chatBody.appendChild(botP);
      chatBody.scrollTop = chatBody.scrollHeight;

      // --- CORRECCIÓN AQUÍ ---
      // Ocultar los atajos después de la primera respuesta del bot para limpiar la interfaz.
      if (isFirstResponse) {
        hideShortcuts();
      }
    })
    .catch(err => {
      clearTimeout(timeoutId);
      console.error('Chat Widget Error:', err);
      if (typing.parentNode) chatBody.removeChild(typing);
      
      const errP = document.createElement('p');
      errP.textContent = 'Lo siento, hubo un error. Inténtalo de nuevo.';
      errP.style.color = '#fff';
      errP.style.background = '#FF0000';
      errP.setAttribute('role', 'error-message');
      chatBody.appendChild(errP);
      chatBody.scrollTop = chatBody.scrollHeight;
    });
  }

  // Event handlers
  function closeGreeting() {
    const greeting = document.getElementById('chat-widget-greeting');
    greeting.style.display = 'none';
    localStorage.setItem('chatGreetingHidden', 'true');
  }

  function hideShortcuts() {
    const shortcuts = document.getElementById('chat-widget-shortcuts');
    if (shortcuts) {
        shortcuts.style.display = 'none';
    }
  }

  function openWidget() {
    document.getElementById('chat-widget-container').style.display = 'flex';
    document.getElementById('chat-widget-button').style.display = 'none';
    document.getElementById('chat-widget-title').textContent = config.branding.title.split(' ')[0];
    closeGreeting();
    
    const chatBody = document.getElementById('chat-widget-body');
    const conv = loadConversation();

    if (conv.length > 0) {
      hideShortcuts();
      renderConversation(chatBody);
    } else {
      startNewSession();
    }
    
    setTimeout(() => { document.getElementById('chat-widget-input').focus(); }, 300);
  }

  function closeWidget() {
    document.getElementById('chat-widget-container').style.display = 'none';
    document.getElementById('chat-widget-button').style.display = 'flex';
    document.getElementById('chat-widget-title').textContent = config.branding.title;
  }

  // Inicialización mejorada
  function init() {
    injectStyles();
    buildWidget();
    
    const greeting = document.getElementById('chat-widget-greeting');
    const inputEl = document.getElementById('chat-widget-input');
    const sendBtn = document.getElementById('chat-widget-send');
    const shortcuts = document.getElementById('chat-widget-shortcuts');
    
    if (localStorage.getItem('chatGreetingHidden')) {
      greeting.style.display = 'none';
    }
    
    document.querySelector('#chat-widget-greeting .greeting-close').addEventListener('click', closeGreeting);
    document.getElementById('chat-widget-button').addEventListener('click', openWidget);
    document.getElementById('chat-widget-close').addEventListener('click', closeWidget);
    
    sendBtn.addEventListener('click', () => sendMessage());
    inputEl.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
    
    shortcuts.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        hideShortcuts();
        inputEl.value = btn.dataset.shortcut;
        sendMessage();
      });
    });
    
    if (config.settings.openOnLoad) {
      setTimeout(openWidget, 1000);
    }
    
    window.ChatWidgetAPI = { open: openWidget, close: closeWidget, sendMessage: sendMessage, isOpen: () => document.getElementById('chat-widget-container').style.display === 'flex' };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
