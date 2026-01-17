// Chatbot Logic
const chatWidget = {
  isOpen: false,

  init() {
    this.createStyles();
    this.createDOM();
    this.attachEvents();
  },

  createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .chat-widget-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: var(--primary);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(211, 47, 47, 0.4);
        z-index: 1000;
        transition: transform 0.2s;
      }
      .chat-widget-btn:hover {
        transform: scale(1.1);
      }
      .chat-window {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 5px 25px rgba(0,0,0,0.15);
        display: flex;
        flex-direction: column;
        z-index: 1001;
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
        transition: all 0.3s ease;
        border: 1px solid #eee;
      }
      .chat-window.open {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
      }
      .chat-header {
        background: var(--primary);
        color: white;
        padding: 15px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .chat-body {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        background: #f9f9f9;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .chat-input-area {
        padding: 15px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 10px;
      }
      .chat-input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 20px;
        outline: none;
      }
      .chat-send {
        background: var(--primary);
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 20px;
        cursor: pointer;
      }
      .msg {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 14px;
        line-height: 1.4;
      }
      .msg-bot {
        background: white;
        align-self: flex-start;
        border-bottom-left-radius: 2px;
        border: 1px solid #eee;
      }
      .msg-user {
        background: var(--primary);
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 2px;
      }
    `;
    document.head.appendChild(style);
  },

  createDOM() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="chat-widget-btn" id="chatBtn">💬</div>
      <div class="chat-window" id="chatWindow">
        <div class="chat-header">
          <div style="font-weight:600">🤖 Rakt Assistant</div>
          <div style="cursor:pointer" id="chatClose">✕</div>
        </div>
        <div class="chat-body" id="chatBody">
          <div class="msg msg-bot">Namaste! I am <strong>Rakt</strong>. How can I help you find a blood bank today?</div>
        </div>
        <div class="chat-input-area">
          <input type="text" class="chat-input" id="chatInput" placeholder="Type a message...">
          <button class="chat-send" id="chatSend">➤</button>
        </div>
      </div>
    `;
    document.body.appendChild(div);
  },

  attachEvents() {
    const btn = document.getElementById('chatBtn');
    const win = document.getElementById('chatWindow');
    const close = document.getElementById('chatClose');
    const input = document.getElementById('chatInput');
    const send = document.getElementById('chatSend');

    const toggle = () => {
      this.isOpen = !this.isOpen;
      win.classList.toggle('open', this.isOpen);
    };

    btn.onclick = toggle;
    close.onclick = toggle;

    const sendMessage = () => {
      const txt = input.value.trim();
      if (!txt) return;

      this.addMessage(txt, 'user');
      input.value = '';

      // Bot Logic
      setTimeout(() => {
        this.botReply(txt);
      }, 600);
    };

    send.onclick = sendMessage;
    input.onkeypress = (e) => {
      if (e.key === 'Enter') sendMessage();
    };
  },

  async botReply(txt) {
    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    this.addMessage('<span class="typing-dots">...</span>', 'bot', typingId);

    try {
      const res = await fetch('/.netlify/functions/chat_bot', {
        method: 'POST',
        body: JSON.stringify({ message: txt })
      });
      const json = await res.json();

      // Remove typing indicator
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      // Render response (convert newlines to br and links)
      let reply = json.reply || "I am having trouble connecting.";
      reply = reply.replace(/\n/g, '<br>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:var(--primary)">$1</a>'); // basic markdown link support

      this.addMessage(reply, 'bot');
    } catch (e) {
      console.error(e);
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      this.addMessage("Sorry, I am offline right now.", 'bot');
    }
  },

  // Revised addMessage to support ID for removal
  addMessage(txt, sender, id = null) {
    const body = document.getElementById('chatBody');
    const div = document.createElement('div');
    div.className = `msg msg-${sender}`;
    if (id) div.id = id;
    div.innerHTML = txt;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }
};

// Initialize Chatbot when app loads
document.addEventListener('DOMContentLoaded', () => {
  chatWidget.init();
});
