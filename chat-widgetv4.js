/**
 * Chat Widget - Versión mejorada con conversión de enlaces
 */
(function() {
  'use strict';

  // Configuración por defecto
  const defaultConfig = {
    branding: {
      title: 'Asistente IA',
      logo: 'https://cloud.sedicom.es/s/wTQozTH3inMKSHQ/preview',
      primaryColor: '#00416A',
      secondaryColor: '#005a87',
      greeting: '👋 Soy tu asistente de IA. ¿Puedo ayudarte?',
      buttonText: 'Habla conmigo'
    },
    shortcuts: [
      'Necesito soporte',
      'Información de servicios',
      '¿Qué puedes hacer?'
    ],
    webhook: {
      url: '',
      route: 'general'
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

  // Función para convertir URLs en enlaces clicables
  function convertUrlsToLinks(text) {
    if (!text) return text;
    
    // Expresión regular para encontrar URLs
    const urlRegex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    
    // Reemplazar URLs con enlaces HTML
    return text.replace(urlRegex, function(url) {
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" style="color: #ffffff; text-decoration: underline;">' + url + '</a>';
    });
  }

  // Gestión de persistencia
  function saveConversation(messages) {
    sessionStorage.setItem('chatConversation', JSON.stringify(messages));
  }

  function loadConversation() {
    return JSON.parse(sessionStorage.getItem('chatConversation') || '[]');
  }

  function getChatId() {
    let id = sessionStorage.getItem('chatId');
    if (!id) {
      id = 'chat_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('chatId', id);
    }
    return id;
  }

  // Inyección de estilos
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://cdnjs.cloudflare.com/ajax/libs/geist-font/1.0.0/fonts/geist-sans/style.min.css');
      
      #chat-widget-container {
        position: fixed; bottom: 20px; right: 20px;
        width: 90%; max-width: 350px;
        height: 80%; max-height: 500px;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.1);
        display: none; flex-direction: column;
        z-index: 999999; overflow: hidden;
        transition: all 0.3s ease;
        font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      }
      
      #chat-widget-header {
        background: #fff;
        color: ${config.branding.primaryColor};
        padding: 12px 16px;
        display: flex; align-items: center; justify-content: space-between;
        border-top-left-radius: 16px; border-top-right-radius: 16px;
        border-bottom: 1px solid #ddd;
      }
      
      #chat-widget-header .title {
        display: flex; align-items: center; gap: 8px;
        font-weight: 600; font-size: 16px;
      }
      
      #chat-widget-header img { width: 24px; height: 24px; }
      
      #chat-widget-header button {
        background: transparent; border: none;
        color: ${config.branding.primaryColor};
        font-size: 20px; cursor: pointer;
        transition: transform 0.2s ease;
      }
      
      #chat-widget-header button:hover { transform: scale(1.1); }
      
      #chat-widget-body {
        flex: 1; padding: 20px;
        overflow-y: auto; scroll-behavior: smooth;
      }
      
      #chat-widget-body p {
        margin-bottom: 15px;
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 14px; line-height: 1.4;
        word-wrap: break-word;
      }
      
      .chat-shortcuts {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin: 8px 16px;
      }
      
      .chat-shortcuts button {
        background: ${config.branding.primaryColor};
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
        background: ${config.branding.secondaryColor};
      }
      
      #chat-widget-footer {
        padding: 16px;
        border-top: 1px solid #ddd;
        background: #f9f9f9;
        display: flex; gap: 12px;
      }
      
      #chat-widget-input {
        flex: 1;
        padding: 10px 16px;
        border: 1px solid #ddd;
        border-radius: 20px;
        outline: none;
        font-size: 14px;
        transition: border-color 0.2s ease;
        font-family: inherit;
      }
      
      #chat-widget-input:focus {
        border-color: ${config.branding.primaryColor};
      }
      
      #chat-widget-send {
        background: ${config.branding.primaryColor};
        color: #fff; border: none;
        padding: 10px 20px; border-radius: 20px;
        cursor: pointer; font-weight: 500;
        transition: background 0.2s ease, transform 0.1s ease;
        font-family: inherit;
      }
      
      #chat-widget-send:hover {
        background: ${config.branding.secondaryColor};
        transform: scale(1.05);
      }
      
      #chat-widget-send:active { transform: scale(0.95); }
      
      .typing-indicator {
        display: flex; align-items: center;
        padding: 0 16px; margin-bottom: 15px;
        color: ${config.branding.primaryColor};
        font-size: 14px;
      }
      
      .typing-dots {
        display: inline-block; margin-left: 8px;
      }
      
      .typing-dots span {
        display: inline-block;
        width: 4px; height: 4px;
        background: ${config.branding.primaryColor};
        border-radius: 50%;
        margin: 0 2px;
        animation: blink 1.4s infinite ease-in-out;
      }
      
      .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
      .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
      
      @keyframes blink {
        0%,60%,100% { opacity: 0.3; }
        30% { opacity: 1; }
      }
      
      #chat-widget-button {
        position: fixed; bottom: 20px; right: 20px;
        background: linear-gradient(135deg, ${config.branding.primaryColor} 0%, ${config.branding.secondaryColor} 100%);
        color: #fff; border: none;
        padding: 12px 20px; border-radius: 25px;
        cursor: pointer; font-size: 14px; font-weight: 500;
        z-index: 999999;
        box-shadow: 0 4px 20px rgba(0,4,106,0.3);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      }
      
      #chat-widget-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 30px rgba(0,4,106,0.4);
      }
      
      #chat-widget-greeting {
        position: fixed; bottom: 90px; right: 20px;
        width: 280px;
        background: #fff;
        border: 2px solid ${config.branding.primaryColor};
        border-radius: 24px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        padding: 16px;
        color: ${config.branding.primaryColor};
        font-size: 14px;
        line-height: 1.4;
        z-index: 999999;
        font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      }
      
      #chat-widget-greeting::before {
        content: "";
        position: absolute;
        bottom: -18px; right: 58px;
        border-width: 18px 18px 0 18px;
        border-style: solid;
        border-color: ${config.branding.primaryColor} transparent transparent transparent;
      }
      
      #chat-widget-greeting::after {
        content: "";
        position: absolute;
        bottom: -16px; right: 58px;
        border-width: 16px 16px 0 16px;
        border-style: solid;
        border-color: #fff transparent transparent transparent;
      }
      
      #chat-widget-greeting .greeting-close {
        position: absolute; top: 8px; right: 8px;
        background: transparent; border: none;
        color: ${config.branding.primaryColor};
        font-size: 16px;
        cursor: pointer;
      }
      
      @media (max-width: 480px) {
        #chat-widget-container {
          width: 100%; height: 100%;
          bottom: 0; right: 0; border-radius: 0;
          max-width: 100%; max-height: 100%;
        }
        #chat-widget-body { padding: 16px; }
        #chat-widget-footer { padding: 12px; }
        #chat-widget-greeting {
          top: 20px; bottom: auto;
          right: 20px;
          width: calc(100% - 40px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Construcción del HTML
  function buildWidget() {
    const container = document.createElement('div');
    container.id = 'chat-widget-root';
    
    // Burbuja de saludo
    const greeting = document.createElement('div');
    greeting.id = 'chat-widget-greeting';
    greeting.innerHTML = `
      <button class="greeting-close">✕</button>
      <p>${config.branding.greeting}</p>
    `;
    
    // Botón flotante
    const button = document.createElement('button');
    button.id = 'chat-widget-button';
    button.textContent = config.branding.buttonText;
    
    // Widget principal
    const widget = document.createElement('div');
    widget.id = 'chat-widget-container';
    
    // Generar shortcuts HTML
    const shortcutsHTML = config.shortcuts
      .map(s => `<button data-shortcut="${s}">${s}</button>`)
      .join('');
    
    widget.innerHTML = `
      <div id="chat-widget-header">
        <div class="title">
          <img src="${config.branding.logo}" alt="Logo"/>
          <span id="chat-widget-title">${config.branding.title}</span>
        </div>
        <button id="chat-widget-close">✕</button>
      </div>
      <div id="chat-widget-body">
        <p style="margin-bottom:20px;color:#fff;background:${config.branding.primaryColor};
                  padding:12px 16px;border-radius:12px;">
          <strong>Hola 👋🏻, ¿puedo ayudarte?</strong>
        </p>
      </div>
      <div id="chat-widget-shortcuts" class="chat-shortcuts">
        ${shortcutsHTML}
      </div>
      <div id="chat-widget-footer">
        <input type="text" id="chat-widget-input" placeholder="Escribe aquí…"/>
        <button id="chat-widget-send">Enviar</button>
      </div>
    `;
    
    container.appendChild(greeting);
    container.appendChild(button);
    container.appendChild(widget);
    document.body.appendChild(container);
  }

  // Renderizado de conversación
  function renderConversation(body) {
    const msgs = loadConversation();
    body.innerHTML = `
      <p style="margin-bottom:20px;color:#fff;background:${config.branding.primaryColor};
                padding:12px 16px;border-radius:12px;">
        <strong>Hola 👋🏻, ¿puedo ayudarte?</strong>
      </p>
    `;
    
    msgs.forEach(m => {
      const p = document.createElement('p');
      if (m.type === 'user') {
        p.textContent = m.text;
        p.style.color = '#333';
        p.style.background = '#F1F1F1';
      } else {
        // Convertir URLs a enlaces antes de mostrar el mensaje
        p.innerHTML = convertUrlsToLinks(m.html);
        p.style.color = '#fff';
        p.style.background = config.branding.primaryColor;
        p.style.marginTop = '10px';
      }
      body.appendChild(p);
    });
    
    body.scrollTop = body.scrollHeight;
  }

  // Envío de mensajes
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
    up.style.color = '#333';
    up.style.background = '#F1F1F1';
    chatBody.appendChild(up);
    inputEl.value = '';
    
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.innerHTML = '<span></span><span class="typing-dots"><span></span><span></span><span></span></span>';
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    fetch(config.webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: getChatId(),
        message: txt,
        route: config.webhook.route
      })
    })
    .then(r => r.json())
    .then(data => {
      if (typing.parentNode) chatBody.removeChild(typing);
      
      const botP = document.createElement('p');
      // Convertir URLs a enlaces antes de mostrar el mensaje
      const html = convertUrlsToLinks(data.output || 'Lo siento, no entendí eso.');
      conv.push({ type: 'bot', html });
      saveConversation(conv);
      
      botP.innerHTML = html;
      botP.style.color = '#fff';
      botP.style.background = config.branding.primaryColor;
      botP.style.marginTop = '10px';
      chatBody.appendChild(botP);
      chatBody.scrollTop = chatBody.scrollHeight;
    })
    .catch(err => {
      console.error('Chat Widget Error:', err);
      if (typing.parentNode) chatBody.removeChild(typing);
      
      const errP = document.createElement('p');
      errP.textContent = 'Lo siento, hubo un error.';
      errP.style.color = '#fff';
      errP.style.background = '#FF0000';
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
    shortcuts.style.display = 'none';
  }

  function openWidget() {
    document.getElementById('chat-widget-container').style.display = 'flex';
    document.getElementById('chat-widget-button').style.display = 'none';
    document.getElementById('chat-widget-title').textContent = config.branding.title.split(' ')[0];
    closeGreeting();
    
    if (loadConversation().length > 0) {
      hideShortcuts();
    }
  }

  function closeWidget() {
    document.getElementById('chat-widget-container').style.display = 'none';
    document.getElementById('chat-widget-button').style.display = 'flex';
    document.getElementById('chat-widget-title').textContent = config.branding.title;
  }

  // Inicialización
  function init() {
    injectStyles();
    buildWidget();
    
    const greeting = document.getElementById('chat-widget-greeting');
    const chatBody = document.getElementById('chat-widget-body');
    const inputEl = document.getElementById('chat-widget-input');
    const sendBtn = document.getElementById('chat-widget-send');
    const shortcuts = document.getElementById('chat-widget-shortcuts');
    
    // Ocultar saludo si ya fue visto
    if (localStorage.getItem('chatGreetingHidden')) {
      greeting.style.display = 'none';
    }
    
    // Cargar conversación existente
    renderConversation(chatBody);
    
    // Ocultar shortcuts si hay conversación previa
    if (loadConversation().length > 0) {
      shortcuts.style.display = 'none';
    }
    
    // Event listeners
    document.querySelector('#chat-widget-greeting .greeting-close').addEventListener('click', closeGreeting);
    document.getElementById('chat-widget-button').addEventListener('click', openWidget);
    document.getElementById('chat-widget-close').addEventListener('click', closeWidget);
    
    sendBtn.addEventListener('click', () => sendMessage());
    inputEl.addEventListener('keypress', e => {
      if (e.key === 'Enter') sendMessage();
    });
    
    // Shortcuts
    shortcuts.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        hideShortcuts();
        inputEl.value = btn.dataset.shortcut;
        sendMessage();
      });
    });
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
