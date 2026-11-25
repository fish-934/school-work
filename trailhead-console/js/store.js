/* =============================================================
   Trailhead Guide Console —— 数据层
   用 localStorage 模拟后端：首次打开写入种子数据，之后所有改动都落盘
   ============================================================= */

var Store = (function () {
    var KEY = 'trailheadConsoleBookings';
    var VERSION = 1;

    var STATUS_LABEL = {
        pending: '待确认',
        confirmed: '已确认',
        completed: '已完成',
        cancelled: '已取消'
    };

    /* ---------- 日期工具 ---------- */

    function pad2(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    function isoDate(date) {
        return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
    }

    function addDays(date, days) {
        var d = new Date(date.getTime());
        d.setDate(d.getDate() + days);
        return d;
    }

    function todayISO() {
        return isoDate(new Date());
    }

    function parseISO(iso) {
        var parts = String(iso).split('-');
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }

    var DOW = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    function formatDateCN(iso) {
        var d = parseISO(iso);
        return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + DOW[d.getDay()];
    }

    function formatDateShort(iso) {
        var d = parseISO(iso);
        return (d.getMonth() + 1) + '/' + d.getDate();
    }

    /* ---------- 种子数据 ---------- */

    function buildSeed() {
        var now = new Date();
        var rows = [
            { off: 0,  time: '09:30', route: 'Woodland Loop',        name: 'Emma Clarke',     email: 'emma.clarke@example.com',   phone: '07700 900112', party: 4, status: 'confirmed', notes: '有一位走得很慢的成员，请把节奏放慢。', guide: '杨旭' },
            { off: 0,  time: '13:00', route: 'Lakeside Circuit',     name: 'James Whitmore',  email: 'j.whitmore@example.com',    phone: '07700 900334', party: 2, status: 'confirmed', notes: '',                                        guide: '杨旭' },
            { off: 1,  time: '09:30', route: 'Hill Pass Circuit',    name: 'Priya Nair',      email: 'priya.nair@example.com',    phone: '07700 900556', party: 6, status: 'pending',   notes: '公司团建，需要发票。',                     guide: '' },
            { off: 2,  time: '09:30', route: 'Heritage Quarter Loop', name: 'Tom Beckett',    email: 'tom.beckett@example.com',   phone: '07700 900778', party: 3, status: 'pending',   notes: '带一个 8 岁小孩。',                        guide: '' },
            { off: 2,  time: '14:00', route: 'City Avenue Walk',     name: 'Sarah Lynton',    email: 's.lynton@example.com',      phone: '07700 900990', party: 2, status: 'confirmed', notes: '',                                        guide: '杨旭' },
            { off: 3,  time: '09:30', route: 'Ridge and Tarn',       name: 'Daniel Okafor',   email: 'd.okafor@example.com',      phone: '07700 901122', party: 2, status: 'confirmed', notes: '两位都有山地经验。',                       guide: '李雷' },
            { off: 5,  time: '09:30', route: 'Canal Towpath',        name: 'Lucy Fenwick',    email: 'lucy.f@example.com',        phone: '07700 901334', party: 7, status: 'pending',   notes: '团队里有一人膝盖不好，需要平路。',          guide: '' },
            { off: -1, time: '09:30', route: 'Woodland Loop',        name: 'Mark Ellery',     email: 'mark.ellery@example.com',   phone: '07700 901556', party: 5, status: 'completed', notes: '',                                        guide: '杨旭' },
            { off: -2, time: '13:00', route: 'Evening Streets Walk', name: 'Hannah Reid',     email: 'hannah.reid@example.com',   phone: '07700 901778', party: 4, status: 'completed', notes: '问了关于塔楼历史的问题。',                  guide: '李雷' },
            { off: -4, time: '09:30', route: 'Beacon Hill Short',    name: 'Chris Dalton',    email: 'chris.d@example.com',       phone: '07700 901990', party: 3, status: 'completed', notes: '',                                        guide: '杨旭' },
            { off: -6, time: '09:30', route: 'Lakeside Circuit',     name: 'Rachel Mason',    email: 'rachel.m@example.com',      phone: '07700 902112', party: 2, status: 'cancelled', notes: '天气原因，客户取消。',                      guide: '' },
            { off: -8, time: '09:30', route: 'Woodland Loop',        name: 'Peter Graves',    email: 'peter.graves@example.com',  phone: '07700 902334', party: 8, status: 'completed', notes: '',                                        guide: '杨旭' }
        ];

        var out = [];
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            var date = isoDate(addDays(now, r.off));
            var seq = 100 + i;
            out.push({
                id: 'bk-' + date.replace(/-/g, '') + '-' + seq,
                ref: 'TH-' + date.replace(/-/g, '') + '-' + seq,
                name: r.name,
                email: r.email,
                phone: r.phone,
                route: r.route,
                date: date,
                time: r.time,
                party: r.party,
                status: r.status,
                notes: r.notes,
                guide: r.guide,
                createdAt: new Date(addDays(now, r.off - 3).getTime()).toISOString()
            });
        }
        return out;
    }

    /* ---------- 读写 ---------- */

    function read() {
        var raw = null;
        try {
            raw = window.localStorage.getItem(KEY);
        } catch (e) {
            return null;
        }
        if (!raw) {
            return null;
        }
        try {
            var parsed = JSON.parse(raw);
            if (parsed && parsed.version === VERSION && parsed.items instanceof Array) {
                return parsed.items;
            }
            return null;
        } catch (e2) {
            return null;
        }
    }

    function write(items) {
        try {
            window.localStorage.setItem(KEY, JSON.stringify({ version: VERSION, items: items }));
            return true;
        } catch (e) {
            return false;
        }
    }

    function ensure() {
        var items = read();
        if (items === null) {
            items = buildSeed();
            write(items);
        }
        return items;
    }

    /* ---------- 查询 ---------- */

    function all() {
        return ensure().slice(0);
    }

    function get(id) {
        var items = ensure();
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                return items[i];
            }
        }
        return null;
    }

    function update(id, patch) {
        var items = ensure();
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                for (var k in patch) {
                    if (Object.prototype.hasOwnProperty.call(patch, k)) {
                        items[i][k] = patch[k];
                    }
                }
                write(items);
                return items[i];
            }
        }
        return null;
    }

    function add(booking) {
        var items = ensure();
        items.unshift(booking);
        write(items);
        return booking;
    }

    function remove(id) {
        var items = ensure();
        var kept = [];
        for (var i = 0; i < items.length; i++) {
            if (items[i].id !== id) {
                kept.push(items[i]);
            }
        }
        write(kept);
    }

    function reset() {
        write(buildSeed());
    }

    /* ---------- 统计 ---------- */

    function stats() {
        var items = ensure();
        var today = todayISO();
        var weekEnd = isoDate(addDays(new Date(), 6));

        var s = {
            todayWalks: 0,
            todayPeople: 0,
            pending: 0,
            weekPeople: 0,
            completed: 0,
            active: 0,
            byStatus: { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
        };

        for (var i = 0; i < items.length; i++) {
            var b = items[i];
            s.byStatus[b.status] = (s.byStatus[b.status] || 0) + 1;

            if (b.status === 'pending') {
                s.pending++;
            }
            if (b.status !== 'cancelled') {
                s.active++;
            }
            if (b.status === 'completed') {
                s.completed++;
            }
            if (b.date === today && (b.status === 'pending' || b.status === 'confirmed')) {
                s.todayWalks++;
                s.todayPeople += Number(b.party) || 0;
            }
            if (b.date >= today && b.date <= weekEnd && b.status !== 'cancelled') {
                s.weekPeople += Number(b.party) || 0;
            }
        }

        s.completionRate = s.active === 0 ? 0 : Math.round(s.completed / s.active * 100);
        return s;
    }

    function byDate(dateISO) {
        var items = ensure();
        var out = [];
        for (var i = 0; i < items.length; i++) {
            if (items[i].date === dateISO && items[i].status !== 'cancelled') {
                out.push(items[i]);
            }
        }
        out.sort(function (a, b) {
            return (a.time + a.ref) > (b.time + b.ref) ? 1 : -1;
        });
        return out;
    }

    /* ---------- 与主站联动 ---------- */

    /* 读取主站 booking.html 提交到 localStorage 的 trailheadBooking，
       转换成工作台的一条预约；重复导入会被跳过。 */
    function importFromMainSite() {
        var raw = null;
        try {
            raw = window.localStorage.getItem('trailheadBooking');
        } catch (e) {
            return { ok: false, reason: 'storage' };
        }
        if (!raw) {
            return { ok: false, reason: 'empty' };
        }

        var src = null;
        try {
            src = JSON.parse(raw);
        } catch (e2) {
            return { ok: false, reason: 'bad' };
        }
        if (!src || !src.name) {
            return { ok: false, reason: 'bad' };
        }

        var items = ensure();
        if (src.reference) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].ref === src.reference) {
                    return { ok: false, reason: 'duplicate' };
                }
            }
        }

        var date = src.date || todayISO();
        var booking = {
            id: 'bk-import-' + new Date().getTime(),
            ref: src.reference || ('TH-' + date.replace(/-/g, '') + '-IMP'),
            name: src.name,
            email: src.email || '',
            phone: src.phone || '',
            route: src.route || '',
            date: date,
            time: '09:30',
            party: Number(src.party) || 1,
            status: 'pending',
            notes: src.notes || '',
            guide: '',
            createdAt: new Date().toISOString()
        };

        items.unshift(booking);
        write(items);
        return { ok: true, booking: booking };
    }

    ensure();

    return {
        STATUS_LABEL: STATUS_LABEL,
        all: all,
        get: get,
        update: update,
        add: add,
        remove: remove,
        reset: reset,
        stats: stats,
        byDate: byDate,
        importFromMainSite: importFromMainSite,
        todayISO: todayISO,
        isoDate: isoDate,
        addDays: addDays,
        parseISO: parseISO,
        formatDateCN: formatDateCN,
        formatDateShort: formatDateShort,
        pad2: pad2
    };
})();
