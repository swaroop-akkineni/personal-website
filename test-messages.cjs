// Run with: node test-messages.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({ URL });
vm.runInContext(fs.readFileSync(`${__dirname}/render-messages.js`, 'utf8'), context);
const data = JSON.parse(fs.readFileSync(`${__dirname}/messages.json`, 'utf8'));
const render = context.renderMessages;
const html = render(data);
assert.equal(render(JSON.stringify(data)), html);
assert.equal((html.match(/<section /g) || []).length, 3);
assert.equal((html.match(/class="message /g) || []).length, 8);
assert.ok(html.includes('<time datetime="2026-09-08">Sep 8, 2026</time>'));
assert.ok(html.includes('href="https://docs.github.com/en/pages"'));
assert.ok(html.includes('Every new chapter gets a message.<br>'));
const malicious = structuredClone(data);
malicious[0].messages[0].paragraphs = ['<img src=x onerror="alert(1)">'];
assert.ok(render(malicious).includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
malicious[1].messages[2].url = 'javascript:alert(1)';
assert.throws(() => render(malicious), /protocol/);
assert.throws(() => render({}), /array/);
assert.throws(() => render('{'));
assert.throws(() => render([data[0], data[0]]), /unique/);
assert.throws(() => render([{ ...data[1], date: '2026-02-30' }]), /Dates/);
assert.equal(render([]), '');
async function checkLoading() {
  const thread = { textContent: '', innerHTML: '' };
  context.document = { getElementById: () => thread };
  context.location = { protocol: 'http:' };
  context.console = { error: () => {} };
  context.fetch = async (url) => {
    assert.equal(url, 'messages.json');
    return { ok: true, json: async () => data };
  };
  await context.loadMessages();
  assert.equal(thread.innerHTML, html);
  context.fetch = async () => ({ ok: false, status: 404 });
  await context.loadMessages();
  assert.match(thread.textContent, /could not load/);
  context.fetch = async () => ({ ok: true, json: async () => JSON.parse('{') });
  await context.loadMessages();
  assert.match(thread.textContent, /could not load/);
  context.location.protocol = 'file:';
  context.fetch = async () => { throw new Error('Failed to fetch'); };
  await context.loadMessages();
  assert.match(thread.textContent, /127\.0\.0\.1:8000/);
  console.log('Passed: rendering, safe content, JSON loading, and HTTP/parse/local-file errors.');
}
checkLoading().catch((error) => { console.error(error); process.exitCode = 1; });
