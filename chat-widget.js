(function(){
  if(!window.ChatWidgetConfig) window.ChatWidgetConfig={};
  const cfg = window.ChatWidgetConfig;
  const branding = cfg.branding||{};
  const shortcuts = cfg.shortcuts||[];

  /*** UTILS ***/
  const saveConversation = m => sessionStorage.setItem('chatConversation', JSON.stringify(m));
  const loadConversation = () => JSON.parse(sessionStorage.getItem('chatConversation')||'[]');
  const getChatId = () => {
    let id = sessionStorage.getItem("chatId");
    if(!id){ id="chat_"+Math.random().toString(36).substr(2,9); sessionStorage.setItem("chatId",id); }
    return id;
  };

  /*** ESTILOS ***/
  const style = document.createElement('style');
  style.innerHTML = `
    body { font-family:'Geist Sans',-apple-system,BlinkMacSystemFont,system-ui,sans-serif; margin:0;padding:0;background:transparent;}
    #chat-widget-container{position:fixed;bottom:20px;right:20px;width:90%;max-width:350px;height:80%;max-height:500px;background:#fff;border-radius:16px;
      box-shadow:0 8px 32px rgba(0,0,0,0.15),0 0 0 1px rgba(0,0,0,0.1);display:none;flex-direction:column;z-index:1000;overflow:hidden;transition:all 0.3s ease;}
    #chat-widget-header{background:#fff;color:${branding.primaryColor||'#00416A'};padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-top-left-radius:16px;border-top-right-radius:16px;border-bottom:1px solid #ddd;}
    #chat-widget-header .title{display:flex;align-items:center;gap:8px;font-weight:600;font-size:16px;}
    #chat-widget-header img{width:24px;height:24px;}
    #chat-widget-header button{background:transparent;border:none;color:${branding.primaryColor||'#00416A'};font-size:20px;cursor:pointer;transition:transform 0.2s ease;}
    #chat-widget-header button:hover{transform:scale(1.1);}
    #chat-widget-body{flex:1;padding:20px;overflow-y:auto;scroll-behavior:smooth;}
    #chat-widget-body p{margin-bottom:15px;padding:12px 16px;border-radius:12px;font-size:14px;line-height:1.4;word-wrap:break-word;}
    .chat-shortcuts{display:flex;gap:8px;flex-wrap:wrap;margin:8px 16px;}
    .chat-shortcuts button{background:${branding.primaryColor||'#00416A'};color:#fff;border:none;padding:6px 12px;border-radius:16px;font-size:12px;cursor:pointer;transition:background 0.2s ease;}
    .chat-shortcuts button:hover{background:${branding.secondaryColor||'#005a87'};}
    #chat-widget-footer{padding:16px;border-top:1px solid #ddd;background:#f9f9f9;display:flex;gap:12px;}
    #chat-widget-input{flex:1;padding:10px 16px;border:1px solid #ddd;border-radius:20px;outline:none;font-size:14px;transition:border-color 0.2s ease;}
    #chat-widget-input:focus{border-color:${branding.primaryColor||'#00416A'};}
    #chat-widget-send{background:${branding.primaryColor||'#00416A'};color:#fff;border:none;padding:10px 20px;border-radius:20px;cursor:pointer;font-weight:500;transition:background 0.2s ease,transform 0.1s ease;}
    #chat-widget-send:hover{background:${branding.secondaryColor||'#005a87'};transform:scale(1.05);}
    #chat-widget-send:active{transform:scale(0.95);}
    .typing-indicator{display:flex;align-items:center;padding:0 16px;margin-bottom:15px;color:${branding.primaryColor||'#00416A'};font-size:14px;}
    .typing-dots{display:inline-block;margin-left:8px;}
    .typing-dots span{display:inline-block;width:4px;height:4px;background:${branding.primaryColor||'#00416A'};border-radius:50%;margin:0 2px;animation:blink 1.4s infinite ease-in-out;}
    .typing-dots span:nth-child(2){animation-delay:0.2s;}
    .typing-dots span:nth-child(3){animation-delay:0.4s;}
    @keyframes blink{0%,60%,100%{opacity:0.3;}30%{opacity:1;}}
    #chat-widget-button{position:fixed;bottom:20px;right:20px;background:linear-gradient(135deg,${branding.primaryColor||'#00416A'} 0%,${branding.secondaryColor||'#005a87'} 100%);
      color:#fff;border:none;padding:12px 20px;border-radius:25px;cursor:pointer;font-size:14px;font-weight:500;z-index:1001;box-shadow:0 4px 20px rgba(0,4,106,0.3);transition:transform 0.2s ease,box-shadow 0.2s ease;}
    #chat-widget-button:hover{transform:scale(1.05);box-shadow:0 6px 30px rgba(0,4,106,0.4);}
    #chat-widget-greeting{position:fixed;bottom:90px;right:20px;width:280px;background:#fff;border:2px solid ${branding.primaryColor||'#00416A'};border-radius:24px;
      box-shadow:0 4px 16px rgba(0,0,0,0.1);padding:16px;color:${branding.primaryColor||'#00416A'};font-size:14px;line-height:1.4;z-index:1002;}
    #chat-widget-greeting::before{content:"";position:absolute;bottom:-18px;right:58px;border-width:18px 18px 0 18px;border-style:solid;border-color:${branding.primaryColor||'#00416A'} transparent transparent transparent;}
    #chat-widget-greeting::after{content:"";position:absolute;bottom:-16px;right:58px;border-width:16px 16px 0 16px;border-style:solid;border-color:#fff transparent transparent transparent;}
    #chat-widget-greeting .greeting-close{position:absolute;top:8px;right:8px;background:transparent;border:none;color:${branding.primaryColor||'#00416A'};font-size:16px;cursor:pointer;}
    @media (max-width:480px){
      #chat-widget-container{width:100%;height:100%;bottom:0;right:0;border-radius:0;}
      #chat-widget-body{padding:16px;}
      #chat-widget-footer{padding:12px;}
      #chat-widget-greeting{top:20px;bottom:auto;right:20px;width:calc(100% - 40px);}
    }
  `;
  document.head.appendChild(style);

  /*** GREETING ***/
  const greeting = document.createElement('div');
  greeting.id = 'chat-widget-greeting';
  greeting.innerHTML = `
    <button class="greeting-close">✕</button>
    <p>${branding.greeting||'👋 Soy Mia, asistente de IA de Sedicom. ¿Puedo ayudarte?'}</p>
  `;
  document.body.appendChild(greeting);
  const closeGreetingBtn = greeting.querySelector('.greeting-close');
  closeGreetingBtn.onclick = () => { greeting.style.display='none'; localStorage.setItem('chatGreetingHidden','true'); };

  /*** CHAT CONTAINER ***/
  const chatContainer = document.createElement('div');
  chatContainer.id='chat-widget-container';
  chatContainer.innerHTML = `
    <div id="chat-widget-header">
      <div class="title">
        <img src="${branding.logo||'https://cloud.sedicom.es/s/wTQozTH3inMKSHQ/preview'}" alt="Logo"/>
        <span id="chat-widget-title">${branding.title||'Asistente IA Sedicom'}</span>
      </div>
      <button id="chat-widget-close">✕</button>
    </div>
    <div id="chat-widget-body">
      <p style="margin-bottom:20px;color:#fff;background:${branding.primaryColor||'#00416A'};padding:12px 16px;border-radius:12px;">
        <strong>${branding.greeting||'Hola 👋🏻, ¿puedo ayudarte?'}</strong>
      </p>
    </div>
    <div id="chat-widget-shortcuts" class="chat-shortcuts"></div>
    <div id="chat-widget-footer">
      <input type="text" id="chat-widget-input" placeholder="Escribe aquí…"/>
      <button id="chat-widget-send">Enviar</button>
    </div>
  `;
  document.body.appendChild(chatContainer);

  const chatBody = chatContainer.querySelector("#chat-widget-body");
  const scutsContainer = chatContainer.querySelector("#chat-widget-shortcuts");
  const inputEl = chatContainer.querySelector("#chat-widget-input");
  const sendBtn = chatContainer.querySelector("#chat-widget-send");
  const closeBtn = chatContainer.querySelector("#chat-widget-close");

  /*** SHORTCUTS ***/
  shortcuts.forEach(s=>{
    const b=document.createElement('button'); b.textContent=s;
    b.onclick=()=>{ inputEl.value=s; sendMessage(); scutsContainer.style.display='none'; };
    scutsContainer.appendChild(b);
  });
  if(shortcuts.length===0) scutsContainer.style.display='none';

  /*** CHAT LOGIC ***/
  function renderConversation(){
    const msgs=loadConversation();
    chatBody.innerHTML = `<p style="margin-bottom:20px;color:#fff;background:${branding.primaryColor||'#00416A'};padding:12px 16px;border-radius:12px;"><strong>${branding.greeting||'Hola 👋🏻, ¿puedo ayudarte?'}</strong></p>`;
    msgs.forEach(m=>{
      const p=document.createElement('p');
      if(m.type==='user'){ p.textContent=m.text; p.style.color="#333"; p.style.background="#F1F1F1"; }
      else{ p.innerHTML=m.html; p.style.color="#fff"; p.style.background=branding.primaryColor||'#00416A'; p.style.marginTop="10px"; }
      chatBody.appendChild(p);
    });
    chatBody.scrollTop=chatBody.scrollHeight;
  }

  function sendMessage(){
    const txt=inputEl.value.trim(); if(!txt) return;
    const conv=loadConversation(); conv.push({type:'user',text:txt}); saveConversation(conv);
    const up=document.createElement('p'); up.textContent=txt; up.style.color="#333"; up.style
