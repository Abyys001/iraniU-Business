(function () {
  'use strict';

  var LOG_KEY = 'iraniu_site_chat_log_v1';
  var tbody = document.getElementById('admin-chat-log-tbody');
  var countEl = document.getElementById('admin-chat-log-count');
  var filterEl = document.getElementById('admin-chat-log-filter');

  function loadLog() {
    try {
      var raw = localStorage.getItem(LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render() {
    var all = loadLog();
    var q = (filterEl && filterEl.value ? filterEl.value : '').trim().toLowerCase();
    var rows = all.filter(function (e) {
      if (!q) return true;
      var blob = [e.text, e.name, e.page, e.role].join(' ').toLowerCase();
      return blob.indexOf(q) !== -1;
    });

    if (countEl) countEl.textContent = String(rows.length);

    if (!tbody) return;

    tbody.innerHTML = rows
      .map(function (e) {
        var dt = e.ts || '';
        try {
          dt = new Date(e.ts).toLocaleString('fa-IR');
        } catch (err) {
          /* keep raw */
        }
        return (
          '<tr>' +
          '<td>' +
          escapeHtml(dt) +
          '</td>' +
          '<td><span class="status-pill ' +
          (e.role === 'visitor' ? 'status-pill--claimed' : 'status-pill--pending') +
          '">' +
          escapeHtml(e.role || '—') +
          '</span></td>' +
          '<td>' +
          escapeHtml(e.name || '—') +
          '</td>' +
          '<td class="admin-chat-log__msg">' +
          escapeHtml(e.text || '') +
          '</td>' +
          '<td><a class="field-hint" href="' +
          escapeHtml(e.page || '#') +
          '" target="_blank" rel="noopener">صفحه</a></td>' +
          '</tr>'
        );
      })
      .join('');

    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="field-hint">هنوز پیامی ثبت نشده. از سایت عمومی ویجت گفتگو را امتحان کنید.</td></tr>';
    }
  }

  var refreshBtn = document.getElementById('admin-chat-log-refresh');
  if (refreshBtn) refreshBtn.addEventListener('click', render);

  var exportBtn = document.getElementById('admin-chat-log-export-json');
  if (exportBtn)
    exportBtn.addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(loadLog(), null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'iraniu-chat-log.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });

  var clearBtn = document.getElementById('admin-chat-log-clear');
  if (clearBtn)
    clearBtn.addEventListener('click', function () {
      if (window.confirm('همهٔ پیام‌های ذخیره‌شده در این مرورگر پاک شود؟')) {
        localStorage.removeItem(LOG_KEY);
        render();
      }
    });

  if (filterEl)
    filterEl.addEventListener('input', function () {
      window.clearTimeout(filterEl._t);
      filterEl._t = window.setTimeout(render, 200);
    });

  render();
})();
