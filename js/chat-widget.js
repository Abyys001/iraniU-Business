/**
 * ویجت گفتگوی سایت: پیام‌ها در localStorage ذخیره می‌شوند (کلید iraniu_site_chat_log_v1)
 * تا در admin-chat-log.html قابل مشاهده باشند.
 *
 * برای نمایش ویجت، حتماً enabled را true کنید:
 *   window.IRANIU_CHAT = { enabled: true, relayUrl: 'http://localhost:3847/relay' };
 * برای ارسال واقعی به تلگرام، سرور رله را اجرا کنید.
 * (توکن ربات هرگز در مرورگر قرار نگیرد — فقط در سرور.)
 */
(function () {
  'use strict';

  var LOG_KEY = 'iraniu_site_chat_log_v1';
  var MAX_LOCAL = 800;

  var cfg = window.IRANIU_CHAT || {};
  var relayUrl = (cfg.relayUrl || '').trim();
  var title = cfg.widgetTitle || 'گفتگو';
  var placeholder = cfg.placeholder || 'پیام…';
  var welcome = cfg.welcome !== undefined && cfg.welcome !== null ? String(cfg.welcome) : '';

  function loadLog() {
    try {
      var raw = localStorage.getItem(LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLog(entries) {
    try {
      var trimmed = entries.slice(0, MAX_LOCAL);
      localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
    } catch (e) {
      /* ignore quota */
    }
  }

  function pushEntry(entry) {
    var all = loadLog();
    all.unshift(entry);
    saveLog(all);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderMessages(container, entries) {
    var visitor = entries.filter(function (e) {
      return e.role === 'visitor';
    });
    var recent = visitor.slice(0, 40).reverse();
    container.innerHTML = recent
      .map(function (e) {
        return (
          '<div class="site-chat__msg site-chat__msg--out" data-id="' +
          escapeHtml(e.id) +
          '"><p class="site-chat__msg-text">' +
          escapeHtml(e.text || '') +
          '</p><time class="site-chat__msg-time" datetime="' +
          escapeHtml(e.ts || '') +
          '">' +
          escapeHtml(formatTime(e.ts)) +
          '</time></div>'
        );
      })
      .join('');
    container.scrollTop = container.scrollHeight;
  }

  function formatTime(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      return d.toLocaleString('fa-IR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
    } catch (err) {
      return '';
    }
  }

  function buildUi() {
    var root = document.createElement('div');
    root.className = 'site-chat site-chat--minimal';
    root.setAttribute('dir', 'rtl');
    root.innerHTML =
      '<div class="site-chat__panel" id="site-chat-panel" hidden role="dialog" aria-modal="true" aria-labelledby="site-chat-title">' +
      '<div class="site-chat__head">' +
      '<h2 class="site-chat__title" id="site-chat-title">' +
      escapeHtml(title) +
      '</h2>' +
      '<button type="button" class="site-chat__close" aria-label="بستن">×</button>' +
      '</div>' +
      (welcome
        ? '<p class="site-chat__welcome">' + escapeHtml(welcome) + '</p>'
        : '') +
      '<div class="site-chat__messages" id="site-chat-messages" aria-live="polite"></div>' +
      '<form class="site-chat__form" id="site-chat-form">' +
      '<label class="visually-hidden" for="site-chat-name">نام (اختیاری)</label>' +
      '<input type="text" class="site-chat__input site-chat__input--name" id="site-chat-name" name="name" maxlength="80" placeholder="نام (اختیاری)" autocomplete="name" />' +
      '<label class="visually-hidden" for="site-chat-text">متن پیام</label>' +
      '<textarea class="site-chat__input site-chat__textarea" id="site-chat-text" name="text" rows="2" required placeholder="' +
      escapeHtml(placeholder) +
      '"></textarea>' +
      '<div class="site-chat__status" id="site-chat-status" role="status"></div>' +
      '<button type="submit" class="btn btn--primary site-chat__send">ارسال</button>' +
      '</form>' +
      '</div>' +
      '<button type="button" class="site-chat__fab" aria-expanded="false" aria-controls="site-chat-panel" aria-label="باز کردن گفتگو">' +
      '<span class="site-chat__fab-ico" aria-hidden="true">💬</span>' +
      '</button>';

    document.body.appendChild(root);
    return root;
  }

  function init() {
    var chatCfg = window.IRANIU_CHAT || {};
    if (chatCfg.enabled !== true) return;
    if (document.body.dataset.iraniuChatDisabled === 'true') return;

    var root = buildUi();
    var panel = root.querySelector('#site-chat-panel');
    var fab = root.querySelector('.site-chat__fab');
    var closeBtn = root.querySelector('.site-chat__close');
    var form = root.querySelector('#site-chat-form');
    var msgBox = root.querySelector('#site-chat-messages');
    var statusEl = root.querySelector('#site-chat-status');
    var nameInput = root.querySelector('#site-chat-name');
    var textInput = root.querySelector('#site-chat-text');

    function openPanel() {
      panel.hidden = false;
      fab.setAttribute('aria-expanded', 'true');
      renderMessages(msgBox, loadLog());
      textInput.focus();
    }

    function closePanel() {
      panel.hidden = true;
      fab.setAttribute('aria-expanded', 'false');
    }

    fab.addEventListener('click', function () {
      if (panel.hidden) openPanel();
      else closePanel();
    });
    closeBtn.addEventListener('click', closePanel);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) closePanel();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = (textInput.value || '').trim();
      if (!text) return;

      var name = (nameInput.value || '').trim();
      var id =
        'v-' +
        Date.now().toString(36) +
        '-' +
        Math.random().toString(36).slice(2, 8);
      var ts = new Date().toISOString();
      var page = window.location.href;
      var payload = {
        id: id,
        role: 'visitor',
        name: name,
        text: text,
        page: page,
        ts: ts,
        userAgent: navigator.userAgent || '',
      };

      pushEntry(payload);
      textInput.value = '';
      statusEl.textContent = 'ذخیره شد.';
      renderMessages(msgBox, loadLog());

      if (!relayUrl) {
        statusEl.textContent += ' رلهٔ سرور برای تلگرام.';
        return;
      }

      statusEl.textContent = 'در حال ارسال…';
      fetch(relayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().catch(function () {
            return {};
          });
        })
        .then(function (data) {
          if (data && data.ok) {
            statusEl.textContent = 'ارسال شد (تلگرام).';
            pushEntry({
              id: 'sys-' + id,
              role: 'system',
              text: 'ارسال به سرور موفق بود.',
              page: page,
              ts: new Date().toISOString(),
            });
          } else {
            statusEl.textContent = 'خطای سرور؛ فقط محلی.';
          }
        })
        .catch(function () {
          statusEl.textContent = 'خطای شبکه؛ محلی ذخیره شد.';
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
