/**
 * Ahsan Portfolio — AI Chatbot Widget (v2)
 * Features: global fixed position, contact flow, feedback collection,
 *           visitor data saved to admin, session tracking, rich suggestions.
 */
(function () {
  'use strict';

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const toggleBtn   = document.getElementById('chat-toggle-btn');
  const panel       = document.getElementById('chat-panel');
  const closeBtn    = document.getElementById('chat-close-btn');
  const messagesEl  = document.getElementById('chat-messages');
  const form        = document.getElementById('chat-form');
  const input       = document.getElementById('chat-input');
  const sendBtn     = document.getElementById('chat-send-btn');
  const suggestionsEl = document.getElementById('chat-suggestions');
  const unreadBadge = document.getElementById('chat-unread-badge');
  const openIcon    = toggleBtn && toggleBtn.querySelector('.chat-icon-open');
  const closeIcon   = toggleBtn && toggleBtn.querySelector('.chat-icon-close');

  if (!toggleBtn || !panel) return;

  // ── Session ID (persisted per browser tab session) ────────────────────────
  let sessionId = sessionStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    sessionStorage.setItem('chat_session_id', sessionId);
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let isOpen          = false;
  let isTyping        = false;
  let history         = [];
  let hasOpened       = false;
  let feedbackAsked   = false;
  let contactFlowStep = 0;   // 0=idle, 1=asked-name, 2=asked-email, 3=asked-msg, 4=done
  let contactData     = {};
  let msgCount        = 0;   // track # of user messages to trigger feedback

  const CSRF_TOKEN = (() => {
    const el = document.querySelector('[name=csrfmiddlewaretoken]');
    return el ? el.value : '';
  })();

  // ── Markdown-lite renderer ────────────────────────────────────────────────
  function mdToHtml(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((https?:\/\/.+?)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--secondary-color)">$1</a>')
      .replace(/^[•\-] (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
      .replace(/<\/ul>\s*<ul>/g, '')
      .replace(/\n/g, '<br>');
  }

  function scrollBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showBadge() { if (!isOpen && unreadBadge) unreadBadge.classList.remove('d-none'); }
  function hideBadge()  { if (unreadBadge) unreadBadge.classList.add('d-none'); }

  // ── Append message bubble ─────────────────────────────────────────────────
  function appendMessage(role, text, opts = {}) {
    const row = document.createElement('div');
    row.className = `chat-bubble-row ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-bubble-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.innerHTML = role === 'bot'
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>'
      : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    if (opts.html) bubble.innerHTML = text;
    else bubble.innerHTML = mdToHtml(text);

    // Quick-action buttons inside bot messages
    if (opts.actions) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'chat-quick-actions';
      opts.actions.forEach(({ label, fn }) => {
        const btn = document.createElement('button');
        btn.className = 'chat-quick-btn';
        btn.textContent = label;
        btn.addEventListener('click', () => { actionsDiv.remove(); fn(); });
        actionsDiv.appendChild(btn);
      });
      bubble.appendChild(actionsDiv);
    }

    row.appendChild(avatar);
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollBottom();
    return row;
  }

  // ── Typing indicator ──────────────────────────────────────────────────────
  let typingRow = null;
  function showTyping() {
    if (typingRow) return;
    const row = document.createElement('div');
    row.className = 'chat-bubble-row bot';
    row.innerHTML = `
      <div class="chat-bubble-avatar" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
      </div>
      <div class="chat-typing"><span></span><span></span><span></span></div>`;
    messagesEl.appendChild(row);
    typingRow = row;
    scrollBottom();
  }
  function hideTyping() { if (typingRow) { typingRow.remove(); typingRow = null; } }

  // ── Save message to backend ───────────────────────────────────────────────
  function saveMsg(role, content, isFeedback = false) {
    fetch('/chatbot/save/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
      body: JSON.stringify({ session_id: sessionId, role, content, is_feedback: isFeedback }),
    }).catch(() => {}); // fire-and-forget
  }

  // ── Contact flow ──────────────────────────────────────────────────────────
  function startContactFlow() {
    contactFlowStep = 1;
    contactData = {};
    botSay("Sure! Let's help you get in touch with Ahsan. 😊\n\nWhat's **your name**?");
  }

  function handleContactFlow(text) {
    if (contactFlowStep === 1) {
      contactData.name = text;
      contactFlowStep = 2;
      botSay(`Nice to meet you, **${text}**! 👋\n\nWhat's your **email address**?`);
      return true;
    }
    if (contactFlowStep === 2) {
      if (!text.includes('@')) {
        botSay("That doesn't look like a valid email. Please enter a valid **email address**.");
        return true;
      }
      contactData.email = text;
      contactFlowStep = 3;
      botSay("Got it! Now, what's your **message** for Ahsan?\n_(Describe your project, query, or just say hello!)_");
      return true;
    }
    if (contactFlowStep === 3) {
      contactData.message = text;
      contactFlowStep = 4;
      submitContactForm(contactData);
      return true;
    }
    return false;
  }

  function submitContactForm(data) {
    showTyping();
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('subject', 'Contact via Portfolio Chatbot');
    formData.append('message', data.message);
    formData.append('csrfmiddlewaretoken', CSRF_TOKEN);

    fetch('/contact/', { method: 'POST', body: formData })
      .then(r => r.json())
      .then(() => {
        hideTyping();
        botSay(
          `✅ **Message sent successfully!**\n\nThank you, **${data.name}**! Ahsan will get back to you soon at **${data.email}**.\n\n` +
          `In the meantime you can also reach him directly:\n` +
          `• 💬 [WhatsApp](https://wa.me/923436052116)\n` +
          `• 🔗 [LinkedIn](https://www.linkedin.com/in/ahsan-manzoor-7b2075427)`
        );
        saveMsg('user', `[Contact Form] Name: ${data.name}, Email: ${data.email}, Message: ${data.message}`);
        contactFlowStep = 0;
        // Ask for feedback after contact
        setTimeout(askFeedback, 1800);
      })
      .catch(() => {
        hideTyping();
        botSay("Hmm, there was a problem sending. Please try the **Contact form** on the page directly, or reach out on WhatsApp.");
        contactFlowStep = 0;
      });
  }

  // ── Feedback flow ─────────────────────────────────────────────────────────
  function askFeedback() {
    if (feedbackAsked) return;
    feedbackAsked = true;
    botSay(
      "By the way — **how do you like this portfolio website?** 😊\n" +
      "Your feedback means a lot!",
      {
        actions: [
          { label: '⭐⭐⭐⭐⭐ Excellent!', fn: () => collectFeedback('⭐⭐⭐⭐⭐ Excellent!') },
          { label: '⭐⭐⭐⭐ Very Good',   fn: () => collectFeedback('⭐⭐⭐⭐ Very Good') },
          { label: '⭐⭐⭐ Good',          fn: () => collectFeedback('⭐⭐⭐ Good') },
          { label: '💬 Write feedback',   fn: () => askWrittenFeedback() },
        ]
      }
    );
  }

  function collectFeedback(rating) {
    saveMsg('user', `[Feedback] Rating: ${rating}`, true);
    botSay(`Thank you for the **${rating}** rating! 🎉\nYour feedback has been saved. Is there anything else I can help you with?`);
    setTimeout(askDetailedFeedback, 1200);
  }

  function askDetailedFeedback() {
    botSay(
      "Would you like to share any specific thoughts about:\n" +
      "• **Design & UI** 🎨\n• **Features & Projects** 💻\n• **Skills & Experience** 🧠\n• **Overall Impression** ✨\n\nFeel free to type anything!",
      {
        actions: [
          { label: 'Skip', fn: () => botSay("No problem! Feel free to ask anything else. 😊") },
        ]
      }
    );
  }

  let awaitingWrittenFeedback = false;
  function askWrittenFeedback() {
    awaitingWrittenFeedback = true;
    botSay("Please type your feedback below and I'll make sure Ahsan sees it! ✍️");
  }

  // ── Bot say helper (with typing delay) ───────────────────────────────────
  function botSay(text, opts = {}, delay = 600) {
    showTyping();
    return new Promise(resolve => {
      setTimeout(() => {
        hideTyping();
        appendMessage('bot', text, opts);
        history.push({ role: 'assistant', content: text });
        scrollBottom();
        resolve();
      }, delay);
    });
  }

  // ── Welcome message ───────────────────────────────────────────────────────
  function injectWelcome() {
    if (messagesEl.children.length > 0) return;
    appendMessage('bot',
      "Hi! 👋 I'm **Ahsan's AI Assistant**.\n\n" +
      "I can help you with:\n" +
      "• **Skills & Technologies** 💻\n" +
      "• **Projects & Work** 🚀\n" +
      "• **Experience & Journey** 📈\n" +
      "• **Hiring & Contact** 📩\n\n" +
      "What would you like to know?"
    );
  }

  // ── Open / Close ──────────────────────────────────────────────────────────
  function openChat() {
    isOpen = true;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    openIcon  && openIcon.classList.add('d-none');
    closeIcon && closeIcon.classList.remove('d-none');
    hideBadge();
    if (!hasOpened) { injectWelcome(); hasOpened = true; }
    setTimeout(() => input && input.focus(), 320);
  }

  function closeChat() {
    isOpen = false;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    openIcon  && openIcon.classList.remove('d-none');
    closeIcon && closeIcon.classList.add('d-none');
  }

  toggleBtn.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn  && closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeChat(); });

  // ── Suggestion pills ──────────────────────────────────────────────────────
  suggestionsEl && suggestionsEl.querySelectorAll('.chat-suggestion-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const prompt = pill.getAttribute('data-prompt');
      if (prompt) sendMessage(prompt);
      if (suggestionsEl) suggestionsEl.style.display = 'none';
    });
  });

  // ── Core send message ─────────────────────────────────────────────────────
  async function sendMessage(text) {
    if (!text || isTyping) return;
    text = text.trim();
    if (!text) return;

    if (suggestionsEl) suggestionsEl.style.display = 'none';

    appendMessage('user', text);
    saveMsg('user', text);
    history.push({ role: 'user', content: text });
    msgCount++;

    if (input) { input.value = ''; input.style.height = 'auto'; }
    isTyping = true;
    sendBtn && (sendBtn.disabled = true);

    // ── Written feedback intercept ────────────────────────────────────────
    if (awaitingWrittenFeedback) {
      awaitingWrittenFeedback = false;
      saveMsg('user', `[Written Feedback] ${text}`, true);
      await botSay("Thank you so much for your feedback! 💖 Ahsan really appreciates it. Anything else I can help with?");
      isTyping = false;
      sendBtn && (sendBtn.disabled = false);
      return;
    }

    // ── Contact flow intercept ────────────────────────────────────────────
    if (contactFlowStep > 0 && contactFlowStep < 4) {
      if (handleContactFlow(text)) {
        isTyping = false;
        sendBtn && (sendBtn.disabled = false);
        return;
      }
    }

    // ── Keyword shortcuts (no API call needed) ────────────────────────────
    const lower = text.toLowerCase();
    if (/\b(contact|hire|reach|whatsapp|email me|get in touch)\b/.test(lower)) {
      await botSay(
        "I can help you contact Ahsan right now! 📩",
        {
          actions: [
            { label: '📝 Fill contact form via chat', fn: () => startContactFlow() },
            { label: '💬 WhatsApp directly',          fn: () => window.open('https://wa.me/923436052116', '_blank') },
            { label: '🔗 LinkedIn',                   fn: () => window.open('https://www.linkedin.com/in/ahsan-manzoor-7b2075427', '_blank') },
          ]
        }
      );
      isTyping = false;
      sendBtn && (sendBtn.disabled = false);
      // Ask feedback after 5 messages
      if (msgCount >= 4 && !feedbackAsked) setTimeout(askFeedback, 2000);
      return;
    }

    if (/\b(feedback|review|rate|rating|opinion|like|dislike|thoughts?)\b/.test(lower)) {
      await botSay(''); // clear typing
      askFeedback();
      isTyping = false;
      sendBtn && (sendBtn.disabled = false);
      return;
    }

    if (/\b(cv|resume|download)\b/.test(lower)) {
      await botSay(
        "You can **view or download** Ahsan's CV from the **About** section! 📄",
        {
          actions: [
            { label: '📄 Go to About section', fn: () => { closeChat(); document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }); } },
          ]
        }
      );
      isTyping = false;
      sendBtn && (sendBtn.disabled = false);
      return;
    }

    if (/\b(project|portfolio|work|built|demo)\b/.test(lower)) {
      await botSay(
        "Check out Ahsan's projects in the **Projects** section! 🚀",
        {
          actions: [
            { label: '🚀 View Projects', fn: () => { closeChat(); document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }); } },
          ]
        }
      );
      isTyping = false;
      sendBtn && (sendBtn.disabled = false);
      return;
    }

    if (/\b(skill|tech|stack|technology|language|framework|tool)\b/.test(lower)) {
      await botSay(
        "See all of Ahsan's skills in the **Skills** section! 💻",
        {
          actions: [
            { label: '💻 View Skills', fn: () => { closeChat(); document.querySelector('#skills')?.scrollIntoView({ behavior: 'smooth' }); } },
          ]
        }
      );
      isTyping = false;
      sendBtn && (sendBtn.disabled = false);
      return;
    }

    // ── Call backend AI ───────────────────────────────────────────────────
    showTyping();
    try {
      const res = await fetch('/chatbot/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
        body: JSON.stringify({ message: text, history, session_id: sessionId }),
      });
      const data = await res.json();
      hideTyping();

      if (data.reply) {
        appendMessage('bot', data.reply);
        saveMsg('assistant', data.reply);
        history.push({ role: 'assistant', content: data.reply });
        if (!isOpen) showBadge();
      } else {
        appendMessage('bot', 'Hmm, I had trouble with that. Try rephrasing!');
      }
    } catch {
      hideTyping();
      appendMessage('bot', 'Connection issue. Please try again in a moment.');
    } finally {
      isTyping = false;
      sendBtn && (sendBtn.disabled = false);
      input && input.focus();
    }

    // Auto-trigger feedback after 5 user messages
    if (msgCount >= 5 && !feedbackAsked) setTimeout(askFeedback, 2000);
  }

  // ── Form & keyboard ───────────────────────────────────────────────────────
  form && form.addEventListener('submit', e => { e.preventDefault(); if (input) sendMessage(input.value); });

  input && input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
  });

  input && input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  });

  // ── Show badge after 5s if not opened ────────────────────────────────────
  setTimeout(() => { if (!hasOpened) showBadge(); }, 5000);

})();
