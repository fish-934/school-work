/* =============================================================
   Trailhead Guide Console —— 公共脚本
   ============================================================= */

var CO = (function () {
    var toastTimer = null;

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /* 状态徽标 */
    function badge(status) {
        var label = Store.STATUS_LABEL[status] || status;
        return '<span class="badge badge-' + escapeHtml(status) + '">' + escapeHtml(label) + '</span>';
    }

    /* 提示条 */
    function toast(message) {
        var $t = $('#toast');
        if ($t.length === 0) {
            $t = $('<div id="toast" class="toast" role="status" aria-live="polite"></div>').appendTo('body');
        }
        $t.text(message).addClass('is-visible');
        if (toastTimer) {
            clearTimeout(toastTimer);
        }
        toastTimer = setTimeout(function () {
            $t.removeClass('is-visible');
        }, 2400);
    }

    /* 人数加 s（英文复数，用于拼句子） */
    function people(n) {
        n = Number(n) || 0;
        return n + ' 人';
    }

    /* 把一批预约按日期分组 */
    function groupByDate(items) {
        var map = {};
        for (var i = 0; i < items.length; i++) {
            var d = items[i].date;
            if (!map[d]) {
                map[d] = [];
            }
            map[d].push(items[i]);
        }
        return map;
    }

    function sortByDateTime(items) {
        return items.sort(function (a, b) {
            if (a.date === b.date) {
                return a.time > b.time ? 1 : -1;
            }
            return a.date > b.date ? 1 : -1;
        });
    }

    $(function () {
        $('#year').text(new Date().getFullYear());
    });

    return {
        escapeHtml: escapeHtml,
        badge: badge,
        toast: toast,
        people: people,
        groupByDate: groupByDate,
        sortByDateTime: sortByDateTime
    };
})();
