// Accept an array or a JSON string; message content is always rendered as text.
function renderMessages(data) {
  const sections = typeof data === 'string' ? JSON.parse(data) : data;
  if (!Array.isArray(sections)) throw new Error('Messages must be an array.');
  const escape = (value) => {
    if (typeof value !== 'string') throw new Error('Message text must be a string.');
    return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  };
  const renderText = (part) => {
    if (typeof part === 'string') return escape(part).replace(/\n/g, '<br>');
    if (!part || typeof part.url !== 'string') throw new Error('A link needs text and a URL.');
    const url = new URL(part.url);
    if (!['https:', 'http:', 'mailto:'].includes(url.protocol)) throw new Error('Unsupported link protocol.');
    return `<a href="${escape(url.href)}">${escape(part.text)}</a>`;
  };
  const ids = new Set();
  return sections.map((section) => {
    if (!/^[a-z][a-z0-9-]*$/.test(section.id) || ids.has(section.id)) {
      throw new Error('Each section needs a unique lowercase ID.');
    }
    ids.add(section.id);
    let date = escape(section.dateLabel);
    if (section.date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(section.date) ||
          new Date(section.date).toISOString().slice(0, 10) !== section.date) {
        throw new Error('Dates must be valid YYYY-MM-DD dates.');
      }
      date = `<time datetime="${escape(section.date)}">${date}</time>`;
    }
    if (!Array.isArray(section.messages)) throw new Error('A section needs a messages array.');
    const messages = section.messages.map((message) => {
      if (!['incoming', 'outgoing'].includes(message.type)) throw new Error('Unknown message type.');
      if (!Array.isArray(message.paragraphs)) throw new Error('A message needs a paragraphs array.');
      return `<div class="message ${message.type}${message.tail ? ' tail' : ''}">
        ${message.label ? `<span class="message-label">${escape(message.label)}</span>` : ''}
        ${message.title ? `<h2>${escape(message.title)}</h2>` : ''}
        ${message.paragraphs.map((text) => `<p>${(Array.isArray(text) ? text : [text]).map(renderText).join('')}</p>`).join('')}
        ${message.footerLabel ? `<span class="message-label placeholder-label">${escape(message.footerLabel)}</span>` : ''}
      </div>`;
    }).join('');
    return `<section id="${escape(section.id)}" aria-label="${escape(section.label)}">
      <p class="date">${date}${section.sample ? `<span class="sample-label">${escape(section.sample)}</span>` : ''}</p>
      ${messages}
      ${section.receipt ? `<p class="receipt">${escape(section.receipt)}</p>` : ''}
    </section>`;
  }).join('');
}

async function loadMessages() {
  const thread = document.getElementById('message-thread');
  try {
    thread.textContent = 'Loading messages…';
    const response = await fetch('messages.json');
    if (!response.ok) throw new Error(`Messages request failed: ${response.status}`);
    thread.innerHTML = renderMessages(await response.json());
  } catch (error) {
    thread.textContent = location.protocol === 'file:'
      ? 'To load messages, open this site at http://127.0.0.1:8000 using the local preview server.'
      : 'Messages could not load. Please check messages.json and reload.';
    console.error(error);
  }
}

if (typeof document !== 'undefined') loadMessages();
