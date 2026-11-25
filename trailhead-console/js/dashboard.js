/* =============================================================
   Trailhead Guide Console —— 工作台首页
   KPI、今日日程、待确认、最近活动
   ============================================================= */

$(function () {
    function renderKpi() {
        var s = Store.stats();
        $('#todayLabel').text(Store.formatDateCN(Store.todayISO()) + ' · 今天 ' + s.todayWalks +
            ' 个团，共 ' + s.todayPeople + ' 人');

        $('#kpiToday').text(s.todayWalks);
        $('#kpiTodaySub').text(s.todayPeople + ' 人 · ' + Store.formatDateCN(Store.todayISO()));

        $('#kpiPending').text(s.pending);
        $('#kpiPendingSub').text(s.pending === 0 ? '全部处理完毕' : '需要尽快回复客户');
        $('#kpiPendingCard').toggleClass('is-warn', s.pending > 0);

        $('#kpiWeek').text(s.weekPeople);
        $('#kpiWeekSub').text('未来 7 天已确认与待确认合计');

        $('#kpiDone').text(s.completionRate + '%');
        $('#kpiDoneSub').text('已完成 ' + s.byStatus.completed + ' / 有效 ' + s.active + ' 单');
    }

    function renderToday() {
        var today = Store.todayISO();
        var items = Store.byDate(today);
        var $list = $('#todayList');

        if (items.length === 0) {
            $list.html('<li class="empty" style="display:block;border:none;">今天没有排团。可以去 <a href="bookings.html">预约管理</a> 看看接下来的安排。</li>');
            return;
        }

        var html = '';
        for (var i = 0; i < items.length; i++) {
            var b = items[i];
            html += '<li>';
            html += '<span class="time">' + CO.escapeHtml(b.time) + '</span>';
            html += '<span class="what"><strong>' + CO.escapeHtml(b.route) + '</strong>';
            html += '<small>' + CO.escapeHtml(b.name) + ' · ' + CO.people(b.party) +
                    (b.guide ? ' · 向导 ' + CO.escapeHtml(b.guide) : ' · 未指派向导') + '</small></span>';
            html += '<span>' + CO.badge(b.status) + '</span>';
            html += '</li>';
        }
        $list.html(html);
    }

    function renderPending() {
        var items = Store.all();
        var pending = [];
        for (var i = 0; i < items.length; i++) {
            if (items[i].status === 'pending') {
                pending.push(items[i]);
            }
        }
        CO.sortByDateTime(pending);

        var $list = $('#pendingList');
        if (pending.length === 0) {
            $list.html('<li style="border:none;"><span><strong>没有待确认的预约</strong><small>新的预约会出现在这里。</small></span></li>');
            return;
        }

        var html = '';
        for (var j = 0; j < pending.length; j++) {
            var b = pending[j];
            html += '<li data-id="' + CO.escapeHtml(b.id) + '">';
            html += '<span><strong>' + CO.escapeHtml(b.name) + ' · ' + CO.people(b.party) + '</strong>';
            html += '<small>' + CO.escapeHtml(b.route) + ' · ' + Store.formatDateCN(b.date) + ' ' + CO.escapeHtml(b.time) + '</small></span>';
            html += '<span class="todo-actions">';
            html += '<button class="btn btn-primary btn-sm" type="button" data-confirm="' + CO.escapeHtml(b.id) + '">确认</button>';
            html += '<button class="btn btn-danger btn-sm" type="button" data-cancel="' + CO.escapeHtml(b.id) + '">取消</button>';
            html += '</span>';
            html += '</li>';
        }
        $list.html(html);
    }

    function renderRecent() {
        var items = Store.all();
        items.sort(function (a, b) {
            return a.createdAt > b.createdAt ? -1 : 1;
        });
        items = items.slice(0, 5);

        var html = '';
        for (var i = 0; i < items.length; i++) {
            var b = items[i];
            html += '<li>';
            html += '<span class="what"><strong>' + CO.escapeHtml(b.name) + ' 预约了 ' + CO.escapeHtml(b.route) + '</strong>';
            html += '<small>' + Store.formatDateCN(b.date) + ' ' + CO.escapeHtml(b.time) + ' · ' + CO.people(b.party) + '</small></span>';
            html += '<span>' + CO.badge(b.status) + '</span>';
            html += '</li>';
        }
        $('#recentList').html(html);
    }

    function refreshAll() {
        renderKpi();
        renderToday();
        renderPending();
        renderRecent();
    }

    /* 待确认列表上的快捷操作 */
    $('#pendingList').on('click', '[data-confirm]', function () {
        var id = $(this).attr('data-confirm');
        var b = Store.update(id, { status: 'confirmed' });
        if (b) {
            CO.toast('已确认：' + b.name + ' · ' + b.route);
            refreshAll();
        }
    });

    $('#pendingList').on('click', '[data-cancel]', function () {
        var id = $(this).attr('data-cancel');
        var b = Store.update(id, { status: 'cancelled' });
        if (b) {
            CO.toast('已取消：' + b.name);
            refreshAll();
        }
    });

    /* 从主站导入最新一条预约 */
    $('#importBtn').on('click', function () {
        var result = Store.importFromMainSite();
        if (result.ok) {
            CO.toast('已导入主站预约：' + result.booking.name);
            refreshAll();
            return;
        }
        if (result.reason === 'duplicate') {
            CO.toast('这条预约已经导入过了');
        } else if (result.reason === 'empty') {
            CO.toast('主站还没有提交过预约，先去 booking.html 提交一条');
        } else {
            CO.toast('没有读到有效的预约数据');
        }
    });

    /* 重置演示数据 */
    $('#resetBtn').on('click', function () {
        if (window.confirm('重置为初始演示数据？当前所有改动都会丢失。')) {
            Store.reset();
            refreshAll();
            CO.toast('已重置演示数据');
        }
    });

    refreshAll();
});
