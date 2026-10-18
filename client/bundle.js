/* DSH 活动统计 — Client half (web bundle, built by hand to match the
 * client-modules bundle protocol: window.__ModuleLoader__.load registers a
 * factory that receives a CommonJS require). This file is the `./client`
 * exports subpath declared in package.json.
 */
window.__ModuleLoader__.load({
  id: "dsh-plugin-dsh-activity",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })
    var React = require("react")

    var SNAPSHOT_URL = "/dsh-activity/snapshot"
    var MODELS_URL = "/dsh-activity/models"
    var CALENDAR_URL = "/dsh-activity/calendar"

    var CSS = [
      ".dshact { color: var(--dsw-alias-label-primary, #1c1c1e); max-width: 880px; }",
      ".dshact-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; gap:8px; }",
      ".dshact-title { font-size:15px; font-weight:700; }",
      ".dshact-meta { font-size:12px; color:var(--dsw-alias-label-secondary, #888); }",
      ".dshact-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:12px; }",
      ".dshact-card { background:var(--dsw-alias-bg-layer-1, #fff); border:1px solid var(--dsw-alias-border-l1, #e4e4e7); border-radius:10px; padding:12px 14px; min-width:0; }",
      ".dshact-card-label { font-size:12px; color:var(--dsw-alias-label-secondary, #888); margin-bottom:6px; }",
      ".dshact-card-value { font-size:20px; font-weight:700; line-height:1.25; }",
      ".dshact-section { background:var(--dsw-alias-bg-layer-1, #fff); border:1px solid var(--dsw-alias-border-l1, #e4e4e7); border-radius:10px; padding:12px 14px; margin-bottom:12px; }",
      ".dshact-duo { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; min-width:0; }",
      ".dshact-duo .dshact-section { margin-bottom:0; }",
      ".dshact-section h4 { margin:0 0 8px; font-size:13px; font-weight:600; }",
      ".dshact-row { display:flex; justify-content:space-between; align-items:center; gap:12px; font-size:12.5px; padding:5px 0; border-bottom:1px solid var(--dsw-alias-border-l1, #f0f0f2); }",
      ".dshact-row:last-child { border-bottom:none; }",
      ".dshact-row .dshact-row-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }",
      ".dshact-row b { font-weight:600; white-space:nowrap; }",
      ".dshact-row .dshact-row-sub { font-size:11.5px; color:var(--dsw-alias-label-secondary, #888); white-space:nowrap; }",
      ".dshact-empty { font-size:12px; color:var(--dsw-alias-label-secondary, #999); padding:6px 0; }",
      ".dshact-tabs { display:flex; gap:6px; margin-bottom:10px; }",
      ".dshact-tab { padding:4px 14px; border-radius:8px; border:1px solid var(--dsw-alias-border-l1, #e4e4e7); background:transparent; cursor:pointer; font-size:12.5px; color:var(--dsw-alias-label-primary, #222); }",
      ".dshact-tab.on { background:var(--dsw-alias-brand-primary, #4f7cff); color:#fff; border-color:transparent; }",
      ".dshact-heat { background:var(--dsw-alias-bg-layer-1, #fff); border:1px solid var(--dsw-alias-border-l1, #e4e4e7); border-radius:10px; padding:12px 14px; }",
      ".dshact-heat-title { font-size:13px; font-weight:600; margin-bottom:10px; }",
      ".dshact-heat-bar { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:10px; }",
      ".dshact-nav { display:flex; align-items:center; gap:4px; }",
      ".dshact-navbtn { border:1px solid var(--dsw-alias-border-l1, #e4e4e7); background:transparent; border-radius:6px; cursor:pointer; padding:1px 10px; font-size:14px; line-height:20px; color:var(--dsw-alias-label-primary, #333); }",
      ".dshact-navbtn:disabled { opacity:.35; cursor:default; }",
      ".dshact-period-label { font-size:13px; font-weight:600; min-width:92px; text-align:center; }",
      ".dshact-backbtn { border:none; background:transparent; cursor:pointer; font-size:12px; color:var(--dsw-alias-brand-primary, #4f7cff); padding:2px 6px; }",
      ".dshact-seg { display:flex; border:1px solid var(--dsw-alias-border-l1, #e4e4e7); border-radius:8px; overflow:hidden; }",
      ".dshact-seg button { border:none; background:transparent; padding:3px 10px; font-size:12px; cursor:pointer; color:var(--dsw-alias-label-secondary, #666); }",
      ".dshact-seg button.on { background:var(--dsw-alias-bg-layer-2, #f0f0f4); color:var(--dsw-alias-label-primary, #222); font-weight:600; }",
      ".dshact-summary { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; font-size:12.5px; color:var(--dsw-alias-label-secondary, #666); margin:10px 0 2px; }",
      ".dshact-summary b { color:var(--dsw-alias-label-primary, #222); }",
      ".dshact-linkbtn { border:1px solid var(--dsw-alias-border-l1, #e4e4e7); background:transparent; border-radius:6px; cursor:pointer; font-size:12px; padding:3px 10px; color:var(--dsw-alias-label-primary, #333); }",
      ".dshact-mgrid { display:grid; grid-template-columns:repeat(7,1fr); gap:5px; }",
      ".dshact-wd { font-size:11px; color:var(--dsw-alias-label-secondary, #888); text-align:center; padding-bottom:2px; }",
      ".dshact-cell { width:16px; height:16px; border-radius:3px; cursor:pointer; }",
      ".dshact-cell:hover { outline:1px solid var(--dsw-alias-label-primary, #222); }",
      ".dshact-cell.dshact-num { width:auto; height:44px; font-size:12.5px; display:flex; align-items:center; justify-content:center; border-radius:6px; }",
      ".dshact-legend { display:flex; align-items:center; gap:4px; margin-top:10px; justify-content:flex-end; font-size:11px; color:var(--dsw-alias-label-secondary, #888); }",
      ".dshact-legend .dshact-cell { width:12px; height:12px; cursor:default; }",
      ".dshact-legend .dshact-cell:hover { outline:none; }",
      ".dshact-ycard { display:flex; align-items:flex-start; }",
      ".dshact-ydays-fixed { flex:none; width:18px; margin-right:6px; padding-top:18px; }",
      ".dshact-ycard-scroll { overflow-x:auto; flex:1; min-width:0; }",
      ".dshact-ylabels { display:flex; gap:3px; height:14px; margin:0 0 4px; }",
      ".dshact-ym { width:12px; flex:none; font-size:10px; line-height:14px; color:#8a8a8e; white-space:nowrap; }",
      ".dshact-ydays { display:flex; flex-direction:column; gap:3px; }",
      ".dshact-yday { height:12px; line-height:12px; font-size:9px; color:#8a8a8e; text-align:right; width:18px; }",
      ".dshact-ygrid { display:grid; grid-template-rows:repeat(7,12px); grid-auto-flow:column; grid-auto-columns:12px; gap:3px; }",
      ".dshact-ygrid .dshact-cell { width:12px; height:12px; border-radius:2px; }",
      ".dshact-prov { margin-bottom:10px; }",
      ".dshact-prov-head { font-weight:600; font-size:13px; margin-bottom:4px; }",
      ".dshact-model { display:flex; justify-content:space-between; gap:8px; font-size:12.5px; padding:2px 0 2px 10px; color:var(--dsw-alias-label-secondary, #666); }",
      ".dshact-model b { color:var(--dsw-alias-label-primary, #222); font-weight:600; }",
      ".dshact-detail-head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; }",
      ".dshact-x { border:1px solid var(--dsw-alias-border-l1, #e4e4e7); background:transparent; border-radius:6px; cursor:pointer; color:var(--dsw-alias-label-secondary, #888); font-size:11px; padding:2px 8px; }",
      ".dshact-err { color:var(--dsw-alias-state-error-primary, #d33); font-size:12px; padding:8px 0; }",
      ".dshact-loading { font-size:12.5px; color:var(--dsw-alias-label-secondary, #888); padding:12px 0; }",
      ".dshact-chart { position:relative; }",
      ".dshact-cc-legend { display:flex; flex-wrap:wrap; gap:6px 14px; margin-bottom:8px; align-items:center; }",
      ".dshact-cc-item { display:flex; align-items:center; gap:5px; font-size:12px; cursor:pointer; padding:2px 6px; border-radius:6px; border:1px solid transparent; color:var(--dsw-alias-label-secondary, #666); }",
      ".dshact-cc-item.on { border-color:var(--dsw-alias-border-l2, #bbb); background:var(--dsw-alias-bg-layer-2, #f5f5f7); color:var(--dsw-alias-label-primary, #222); }",
      ".dshact-cc-swatch { width:10px; height:10px; border-radius:3px; }",
      ".dshact-cc-window { margin-left:auto; font-size:12px; color:var(--dsw-alias-label-secondary, #888); }",
      ".dshact-cwrap { display:flex; align-items:flex-start; }",
      ".dshact-ycol { position:relative; flex:none; width:52px; }",
      ".dshact-ytick { position:absolute; right:6px; transform:translateY(-50%); font-size:10px; color:#8a8a8e; white-space:nowrap; }",
      ".dshact-scroll { overflow-x:auto; overflow-y:hidden; flex:1; }",
      ".dshact-scroll svg { display:block; }",
      ".dshact-cc-cursor { stroke:var(--dsw-alias-label-primary, #555); stroke-width:1; stroke-dasharray:3 3; }",
      ".dshact-cc-hbar { fill:var(--dsw-alias-label-primary, #222); opacity:.05; }",
      ".dshact-cc-path { cursor:pointer; }",
      ".dshact-chart-tip { position:absolute; pointer-events:none; background:var(--dsw-alias-bg-overlay, #fff); border:1px solid var(--dsw-alias-border-l1, #ddd); border-radius:8px; padding:6px 10px; font-size:12px; line-height:1.6; box-shadow:0 2px 8px rgba(0,0,0,.12); white-space:nowrap; z-index:5; }",
      ".dshact-chart-tip b { color:var(--dsw-alias-label-primary, #222); }"
    ].join("\n")

    var CC_COLORS = ["#4f7cff", "#3fb98c", "#f5a623", "#e05cb1", "#9b5cff", "#e5573e", "#2bb3c0", "#7a8699"]
    var WD_LABELS = ["一", "二", "三", "四", "五", "六", "日"]

    function fmt(n) { return (typeof n === "number" && isFinite(n) ? n : 0).toLocaleString("en-US") }
    function fmtShort(n) {
      if (!n) return "0"
      if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B"
      if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M"
      if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K"
      return String(n)
    }
    function fmtDur(ms) {
      if (!ms || ms <= 0) return "—"
      var s = Math.floor(ms / 1000)
      if (s < 60) return s + " 秒"
      var m = Math.floor(s / 60)
      if (m < 60) return m + " 分 " + (s % 60) + " 秒"
      var h = Math.floor(m / 60)
      return h + " 小时 " + (m % 60) + " 分"
    }
    function pad2(n) { return n < 10 ? "0" + n : String(n) }
    // fixed 4-level green scale
    function levelStyle(level) {
      return { background: "var(--dsw-alias-state-success-primary, #3fb98c)", border: "1px solid var(--dsw-alias-border-l2, #c9c9ce)", opacity: 0.2 + 0.8 * (level / 4) }
    }
    // quantile-based levels; sparse data falls back to max-proportional levels
    function makeScale(values) {
      var vals = values.filter(function (v) { return v > 0 })
      var n = vals.length
      if (n === 0) return function () { return 1 }
      if (n <= 3) {
        var mx = Math.max.apply(null, vals)
        return function (v) { return v <= 0 ? 1 : Math.min(4, 1 + Math.floor(3 * v / mx)) }
      }
      var sorted = vals.slice().sort(function (a, b) { return a - b })
      function pct(p) { return sorted[Math.min(n - 1, Math.floor(p * (n - 1)))] }
      var t1 = pct(0.25), t2 = pct(0.5), t3 = pct(0.75)
      return function (v) {
        if (v <= t1) return 1
        if (v <= t2) return 2
        if (v <= t3) return 3
        return 4
      }
    }
    // heat cell style with future-day dimming and today/selected emphasis
    function heatCellStyle(opts) {
      if (opts.future) return { background: "transparent", border: "1px solid var(--dsw-alias-border-l1, #c9c9ce)", cursor: "default" }
      var st = opts.used ? levelStyle(opts.level) : { background: "transparent", border: "1px solid var(--dsw-alias-border-l1, #c9c9ce)" }
      if (opts.today) st = Object.assign({}, st, { boxShadow: "inset 0 0 0 2px var(--dsw-alias-brand-primary, #4f7cff)" })
      if (opts.selected) st = Object.assign({}, st, { outline: "2px solid var(--dsw-alias-brand-primary, #4f7cff)", outlineOffset: "1px" })
      return st
    }
    function fmtRange(ts) {
      var d = new Date(ts)
      return pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + " " + pad2(d.getHours()) + ":00"
    }
    function shiftMonthKey(key, delta) {
      var ps = String(key).split("-")
      var y = Number(ps[0]), m = Number(ps[1]) + delta
      while (m < 1) { m += 12; y -= 1 }
      while (m > 12) { m -= 12; y += 1 }
      return y + "-" + pad2(m)
    }
    function monthKeyLabel(key) {
      var ps = String(key).split("-")
      return Number(ps[0]) + " 年 " + Number(ps[1]) + " 月"
    }
    // client-side fallback totals when the host does not provide them
    function computeTotals(period) {
      if (period && period.totals) return period.totals
      var t = { out: 0, inp: 0, calls: 0, activeDays: 0 }
      var cells = []
      if (period && period.days) cells = period.days
      else if (period && period.months) period.months.forEach(function (mo) { cells = cells.concat(mo.days) })
      cells.forEach(function (c) {
        t.out += c.out || 0; t.inp += c.inp || 0; t.calls += c.calls || 0
        if (c.used && ((c.out || 0) + (c.inp || 0) > 0 || (c.calls || 0) > 0)) t.activeDays += 1
      })
      return t
    }
    function niceCeil(v) {
      if (v <= 0) return 1
      var exp = Math.pow(10, Math.floor(Math.log10(v)))
      var f = v / exp
      var nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
      return nf * exp
    }

    // Fritsch–Carlson monotone tangents (no overshoot, zero stays zero)
    function monotoneTangents(pts) {
      var n = pts.length
      var m = new Array(n).fill(0)
      if (n < 2) return m
      var dx = new Array(n - 1), dy = new Array(n - 1), s = new Array(n - 1)
      for (var i = 0; i < n - 1; i++) {
        dx[i] = pts[i + 1].x - pts[i].x
        dy[i] = pts[i + 1].y - pts[i].y
        s[i] = dx[i] === 0 ? 0 : dy[i] / dx[i]
      }
      m[0] = s[0]
      m[n - 1] = s[n - 2]
      for (var j = 1; j < n - 1; j++) {
        if (s[j - 1] * s[j] <= 0) { m[j] = 0; continue }
        var w = (dx[j - 1] + 2 * dx[j]) / s[j - 1] + (2 * dx[j - 1] + dx[j]) / s[j]
        m[j] = w === 0 ? 0 : (3 * (dx[j - 1] + dx[j])) / w
      }
      for (var k = 0; k < n - 1; k++) {
        if (s[k] === 0) { m[k] = 0; m[k + 1] = 0; continue }
        var hi = 3 * s[k]
        if (s[k] > 0) {
          if (m[k] < 0) m[k] = 0; else if (m[k] > hi) m[k] = hi
          if (m[k + 1] < 0) m[k + 1] = 0; else if (m[k + 1] > hi) m[k + 1] = hi
        } else {
          if (m[k] > 0) m[k] = 0; else if (m[k] < hi) m[k] = hi
          if (m[k + 1] > 0) m[k + 1] = 0; else if (m[k + 1] < hi) m[k + 1] = hi
        }
      }
      return m
    }
    function smoothSegMono(pts) {
      if (pts.length < 2) return ""
      var m = monotoneTangents(pts)
      var d = ""
      for (var i = 0; i < pts.length - 1; i++) {
        var p1 = pts[i], p2 = pts[i + 1]
        var h = p2.x - p1.x
        var c1x = p1.x + h / 3, c1y = p1.y + (m[i] * h) / 3
        var c2x = p2.x - h / 3, c2y = p2.y - (m[i + 1] * h) / 3
        d += " C " + c1x.toFixed(2) + " " + c1y.toFixed(2) + " " + c2x.toFixed(2) + " " + c2y.toFixed(2) + " " + p2.x.toFixed(2) + " " + p2.y.toFixed(2)
      }
      return d
    }

    var PXH = 44   // pixels per hour
    var H = 230, PADT = 14, PADB = 26, PADR = 8

    function DayChart(props) {
      var series = props.series
      var nowIso = props.nowIso
      var activeState = React.useState(null)
      var activeKey = activeState[0]
      var setActiveKey = activeState[1]
      var hoverState = React.useState(null)
      var hover = hoverState[0]
      var setHover = hoverState[1]
      var visState = React.useState(null)
      var vis = visState[0]
      var setVis = visState[1]
      var sbElState = React.useState(null)
      var sbEl = sbElState[0]
      var setSbEl = sbElState[1]
      var initState = React.useState(false)
      var init = initState[0]
      var setInit = initState[1]

      var len = series ? series.length : 0
      var totalW = len * PXH
      var now = new Date(nowIso)
      var nowIdx = -1
      if (len > 0) {
        var nowH = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).getTime()
        for (var i = 0; i < len; i++) { if (series[i].t <= nowH) nowIdx = i }
        if (nowIdx < 0) nowIdx = 0
      }

      // flatten models across the whole window
      var seriesMap = new Map()
      for (var i = 0; i < len; i++) {
        var ms = series[i].models || {}
        Object.keys(ms).forEach(function (pid) {
          Object.keys(ms[pid]).forEach(function (mid) {
            var key = pid + "\u0000" + mid
            var s = seriesMap.get(key)
            if (!s) { s = { key: key, provider: pid, model: mid, values: new Array(len).fill(0) }; seriesMap.set(key, s) }
            s.values[i] = (ms[pid][mid].out || 0) + (ms[pid][mid].inp || 0)
          })
        })
      }
      function tot(s) { return s.values.reduce(function (x, y) { return x + y }, 0) }
      var seriesList = Array.from(seriesMap.values()).filter(function (s) { return tot(s) > 0 })
        .sort(function (a, b) { return tot(b) - tot(a) })

      // visible range from scroll, clamped to the current series length so a
      // shrinking snapshot can never leave stale out-of-range indices behind
      var vStart = 0, vEnd = len - 1
      if (vis && len > 0) {
        vStart = Math.max(0, Math.min(vis.start, len - 1))
        vEnd = Math.max(vStart, Math.min(vis.end, len - 1))
      }
      var maxY = 0
      for (var i = vStart; i <= vEnd && i < len; i++) {
        var sum = 0
        seriesList.forEach(function (s) { sum += s.values[i] })
        if (sum > maxY) maxY = sum
      }
      var yTop = maxY > 0 ? maxY * 1.1 : 1
      var innerH = H - PADT - PADB
      function y(v) { return PADT + innerH * (1 - v / yTop) }
      var baseY = y(0)
      function xc(i) { return i * PXH + PXH / 2 }

      function refCb(el) {
        if (el && el !== sbEl) setSbEl(el)
      }

      function onScroll(e) {
        var el = e.currentTarget
        var sl = el.scrollLeft
        var cw = el.clientWidth
        var s = Math.max(0, Math.floor(sl / PXH))
        var e2 = Math.min(len - 1, Math.ceil((sl + cw) / PXH))
        setVis({ start: s, end: e2 })
      }

      React.useEffect(function () {
        if (sbEl && !init) {
          setInit(true)
          var target = nowIdx * PXH + PXH / 2 - sbEl.clientWidth / 2
          sbEl.scrollLeft = Math.max(0, Math.min(target, sbEl.scrollWidth - sbEl.clientWidth))
          var sl = sbEl.scrollLeft
          var cw = sbEl.clientWidth
          setVis({ start: Math.max(0, Math.floor(sl / PXH)), end: Math.min(len - 1, Math.ceil((sl + cw) / PXH)) })
        }
      }, [sbEl])

      var defs = React.createElement("defs", null,
        seriesList.map(function (s, idx) {
          return React.createElement("linearGradient", { key: s.key, id: "dshact-grad-" + idx, x1: 0, y1: 0, x2: 0, y2: 1 },
            React.createElement("stop", { offset: "0%", stopColor: CC_COLORS[idx % CC_COLORS.length], stopOpacity: 0.9 }),
            React.createElement("stop", { offset: "100%", stopColor: CC_COLORS[idx % CC_COLORS.length], stopOpacity: 0.3 })
          )
        })
      )

      var paths = []
      seriesList.forEach(function (s, idx) {
        var top = []
        for (var i = 0; i < len; i++) top.push({ x: xc(i), y: y(s.values[i]) })
        var d = "M " + top[0].x.toFixed(2) + " " + top[0].y.toFixed(2)
        d += smoothSegMono(top)
        d += " L " + top[len - 1].x.toFixed(2) + " " + baseY.toFixed(2)
        d += " L " + top[0].x.toFixed(2) + " " + baseY.toFixed(2)
        d += " Z"
        paths.push({ s: s, d: d, idx: idx })
      })

      var gridLines = []
      var yTickEls = []
      // round tick values: pick a nice step (1/2/2.5/5×10^n) covering [0, yTop]
      function niceStep(range, count) {
        var raw = range / count
        if (!(raw > 0)) return 1
        var exp = Math.pow(10, Math.floor(Math.log10(raw)))
        var f = raw / exp
        var nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
        return nf * exp
      }
      var yStep = niceStep(yTop, 4)
      for (var k = 0; k * yStep <= yTop + yStep / 2; k++) {
        var tv = k * yStep
        var gy = y(tv)
        gridLines.push(React.createElement("line", { key: "g" + k, x1: 0, y1: gy, x2: totalW, y2: gy, stroke: "#ececee", strokeWidth: 1 }))
        yTickEls.push(React.createElement("span", { key: "t" + k, className: "dshact-ytick", style: { top: gy + "px" } }, fmtShort(tv)))
      }
      var xTicks = []
      var prevDay = null
      // adaptive label density: keep roughly 4-8 labels across the visible span
      var visHours = Math.max(1, vEnd - vStart + 1)
      var stepCandidates = [1, 2, 3, 4, 6, 8, 12, 24]
      var xStep = 24
      for (var sc = 0; sc < stepCandidates.length; sc++) {
        if (visHours / stepCandidates[sc] <= 8) { xStep = stepCandidates[sc]; break }
      }
      var lastTickIdx = -1e9
      for (var ti = 0; ti < len; ti++) {
        // anchor on the LOCAL hour field so ticks land on local round hours
        var onTick = series[ti].h % xStep === 0
        var isLast = ti === len - 1
        if (!onTick && !isLast) continue
        if (!onTick && ti - lastTickIdx < xStep / 2) continue // avoid crowding the tail label
        var hh = series[ti]
        var lbl = (prevDay !== null && hh.day === prevDay) ? pad2(hh.h) + ":00" : hh.day.slice(5) + " " + pad2(hh.h) + ":00"
        prevDay = hh.day
        lastTickIdx = ti
        xTicks.push(React.createElement("text", { key: "x" + ti, x: xc(ti), y: H - 6, textAnchor: "middle", fontSize: 10, fill: "#8a8a8e" }, lbl))
      }

      // overlay hit-test: topmost series whose value covers the clicked height
      function pickAt(contentX, vy) {
        var i = Math.floor(contentX / PXH)
        if (i < 0 || i >= len) return null
        var value = (1 - (vy - PADT) / innerH) * yTop
        var best = null
        for (var j = seriesList.length - 1; j >= 0; j--) {
          if (seriesList[j].values[i] >= value && seriesList[j].values[i] > 0) {
            if (!best || seriesList[j].values[i] < best.values[i]) best = seriesList[j]
          }
        }
        return { s: best, i: i }
      }

      var cursorLine = null, cursorBar = null, tip = null
      if (hover !== null) {
        var hi = hover.i
        var hx = xc(hi)
        cursorBar = React.createElement("rect", { x: hi * PXH, y: PADT, width: PXH, height: innerH, className: "dshact-cc-hbar" })
        cursorLine = React.createElement("line", { x1: hx, y1: PADT, x2: hx, y2: PADT + innerH, className: "dshact-cc-cursor" })
        var hh = series[hi]
        var lines = []
        if (hh) {
          var activePid = null, activeMid = null, activeRec = null
          if (activeKey !== null) {
            var sp = activeKey.split("\u0000")
            activePid = sp[0]; activeMid = sp[1]
            var am = hh.models && hh.models[activePid]
            if (am && am[activeMid]) activeRec = am[activeMid]
          }
          var headCalls = activeRec ? activeRec.calls : hh.calls
          lines.push(React.createElement("div", { key: "h" }, React.createElement("b", null, hh.day.slice(5) + " " + pad2(hh.h) + ":00 · " + headCalls + " 次调用")))
          var ms = hh.models || {}
          if (activeKey !== null) {
            if (activeRec) {
              lines.push(React.createElement("div", { key: "m" },
                React.createElement("b", null, activeMid), " · " + activePid + " 输出 " + fmtShort(activeRec.out || 0) + " · 输入 " + fmtShort(activeRec.inp || 0)
              ))
            } else {
              lines.push(React.createElement("div", { key: "none" }, "该小时无此模型调用"))
            }
          } else {
            var any = false
            Object.keys(ms).forEach(function (pid) {
              Object.keys(ms[pid]).forEach(function (mid) {
                any = true
                var rec = ms[pid][mid]
                lines.push(React.createElement("div", { key: pid + mid },
                  React.createElement("b", null, mid), " · " + pid + " 输出 " + fmtShort(rec.out || 0) + " · 输入 " + fmtShort(rec.inp || 0)
                ))
              })
            })
            if (!any) lines.push(React.createElement("div", { key: "none" }, "该小时无模型调用"))
          }
        }
        var tipW = 230
        var tipLeft = hover.vx
        if (hover.cw) {
          if (tipLeft + tipW > hover.cw + 52) tipLeft = hover.vx - tipW - 12
          else if (tipLeft < 52) tipLeft = hover.vx + 12
          else tipLeft = hover.vx - tipW / 2
        }
        tip = React.createElement("div", { className: "dshact-chart-tip", style: { left: Math.max(52, tipLeft) + "px", top: (PADT - 6) + "px" } }, lines)
      }

      var legendItems = seriesList.map(function (s, idx) {
        return React.createElement("span", {
          key: s.key,
          className: "dshact-cc-item" + (activeKey === s.key ? " on" : ""),
          onClick: function () { setActiveKey(activeKey === s.key ? null : s.key) }
        },
          React.createElement("span", { className: "dshact-cc-swatch", style: { background: CC_COLORS[idx % CC_COLORS.length] } }),
          s.model + (s.provider !== "unknown" ? " · " + s.provider : "")
        )
      })

      var pathEls = paths.map(function (p) {
        var dim = activeKey !== null && activeKey !== p.s.key
        return React.createElement("path", {
          key: p.s.key,
          d: p.d,
          fill: "url(#dshact-grad-" + p.idx + ")",
          fillOpacity: dim ? 0.12 : 1,
          stroke: dim ? CC_COLORS[p.idx % CC_COLORS.length] : "rgba(0,0,0,0.2)",
          strokeWidth: 1,
          strokeOpacity: dim ? 0.15 : 1,
          className: "dshact-cc-path",
          onClick: function (e) {
            e.stopPropagation()
            var svg = e.currentTarget.ownerSVGElement
            var rect = svg.getBoundingClientRect()
            var contentX = e.clientX - rect.left
            var vy = e.clientY - rect.top
            var hit = pickAt(contentX, vy)
            setActiveKey(hit && hit.s ? (activeKey === hit.s.key ? null : hit.s.key) : null)
          }
        })
      })

      var winLabel = "—"
      if (vis && len > 0) {
        // clamp stale indices against the current series length
        var ws = Math.max(0, Math.min(vis.start, len - 1))
        var we = Math.max(ws, Math.min(vis.end, len - 1))
        winLabel = fmtRange(series[ws].t) + " — " + fmtRange(series[we].t)
      }

      return React.createElement("div", { className: "dshact-chart" },
        React.createElement("div", { className: "dshact-cc-legend" },
          legendItems,
          React.createElement("span", { className: "dshact-cc-window" }, winLabel)
        ),
        React.createElement("div", { className: "dshact-cwrap" },
          React.createElement("div", { className: "dshact-ycol", style: { height: H + "px" } }, yTickEls),
          React.createElement("div", {
            className: "dshact-scroll",
            ref: refCb,
            onScroll: onScroll,
            onMouseMove: function (e) {
              var rect = e.currentTarget.getBoundingClientRect()
              var viewX = e.clientX - rect.left
              var sl = e.currentTarget.scrollLeft
              var contentX = sl + viewX
              var i = Math.floor(contentX / PXH)
              if (i < 0 || i >= len) { setHover(null); return }
              setHover({ i: i, vx: 52 + viewX, cw: e.currentTarget.clientWidth })
            },
            onMouseLeave: function () { setHover(null) },
            onClick: function (e) {
              var rect = e.currentTarget.getBoundingClientRect()
              var viewX = e.clientX - rect.left
              var sl = e.currentTarget.scrollLeft
              var contentX = sl + viewX
              var vy = e.clientY - rect.top
              var hit = pickAt(contentX, vy)
              setActiveKey(hit && hit.s ? (activeKey === hit.s.key ? null : hit.s.key) : null)
            }
          },
            React.createElement("svg", { width: totalW, height: H, viewBox: "0 0 " + totalW + " " + H },
              defs,
              gridLines,
              pathEls,
              cursorBar,
              cursorLine,
              xTicks
            )
          )
        ),
        tip
      )
    }

    // 少→多 legend shared by the month & year heatmaps
    function HeatLegend(props) {
      var items = []
      items.push(React.createElement("span", { key: "t0" }, "少"))
      items.push(React.createElement("span", { key: "l0", className: "dshact-cell", style: { background: "transparent", border: "1px solid var(--dsw-alias-border-l1, #e4e4e7)" } }))
      for (var lvl = 1; lvl <= 4; lvl++) {
        items.push(React.createElement("span", { key: "l" + lvl, className: "dshact-cell", style: levelStyle(lvl) }))
      }
      items.push(React.createElement("span", { key: "t1" }, "多"))
      return React.createElement("div", { className: "dshact-legend" }, items)
    }

    function Activity() {
      var state = React.useState(null)
      var data = state[0]
      var setData = state[1]
      var errState = React.useState(null)
      var err = errState[0]
      var setErr = errState[1]
      var viewState = React.useState("day")
      var view = viewState[0]
      var setView = viewState[1]
      var selState = React.useState(null)
      var sel = selState[0]
      var setSel = selState[1]
      var detailState = React.useState(null)
      var detail = detailState[0]
      var setDetail = detailState[1]
      var monthNavState = React.useState(null)   // null = current month
      var monthNav = monthNavState[0]
      var setMonthNav = monthNavState[1]
      var yearNavState = React.useState(null)         // null = current year
      var yearNav = yearNavState[0]
      var setYearNav = yearNavState[1]
      var metricState = React.useState("tokens")      // tokens | calls
      var metric = metricState[0]
      var setMetric = metricState[1]
      var calMonthState = React.useState(null)        // { key, period|null }
      var calMonth = calMonthState[0]
      var setCalMonth = calMonthState[1]
      var calYearState = React.useState(null)         // { key, period|null }
      var calYear = calYearState[0]
      var setCalYear = calYearState[1]

      React.useEffect(function () {
        var alive = true
        var tick = function () {
          fetch(SNAPSHOT_URL, { cache: "no-store" })
            .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.json() })
            .then(function (d) { if (alive) { setData(d); setErr(null) } })
            .catch(function (e) { if (alive) setErr(String((e && e.message) || e)) })
        }
        tick()
        var id = setInterval(tick, 5000)
        return function () { alive = false; clearInterval(id) }
      }, [])

      React.useEffect(function () {
        if (!sel) { setDetail(null); return }
        var alive = true
        fetch(MODELS_URL + "?unit=" + encodeURIComponent(sel.unit) + "&key=" + encodeURIComponent(sel.key), { cache: "no-store" })
          .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.json() })
          .then(function (d) { if (alive) setDetail(d) })
          .catch(function () { if (alive) setDetail(null) })
        return function () { alive = false }
      }, [sel])

      var dateStr = data ? data.date : null
      var currentMonthKey = dateStr ? dateStr.slice(0, 7) : null
      var currentYearKey = dateStr ? dateStr.slice(0, 4) : null
      var effMonthKey = monthNav || currentMonthKey
      var effYearKey = yearNav || currentYearKey

      // fetch historical periods from the calendar route (current period comes from the snapshot)
      React.useEffect(function () {
        if (!dateStr) return
        var unit = null, key = null
        if (view === "month" && effMonthKey && effMonthKey !== currentMonthKey) { unit = "month"; key = effMonthKey }
        else if (view === "year" && effYearKey && effYearKey !== currentYearKey) { unit = "year"; key = effYearKey }
        if (!unit) return
        var alive = true
        fetch(CALENDAR_URL + "?unit=" + unit + "&key=" + encodeURIComponent(key), { cache: "no-store" })
          .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.json() })
          .then(function (d) {
            if (!alive) return
            if (unit === "month") setCalMonth({ key: key, period: d.period || null })
            else setCalYear({ key: key, period: d.period || null })
          })
          .catch(function () {
            if (!alive) return
            if (unit === "month") setCalMonth({ key: key, period: null })
            else setCalYear({ key: key, period: null })
          })
        return function () { alive = false }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [dateStr, view, monthNav, yearNav])

      if (err) return React.createElement("div", { className: "dshact dshact-err" }, "统计加载失败：" + err)
      if (!data) return React.createElement("div", { className: "dshact dshact-loading" }, "正在加载 DSH 活动统计…")

      var today = data.today || {}
      var cards = [
        { label: "今日对话", value: fmt(today.turns) },
        { label: "今日任务", value: fmt(today.steps) },
        { label: "今日输出 Token", value: fmt(today.out) },
        { label: "今日输入 Token", value: fmt(today.inp) },
        { label: "今日技能调用", value: fmt(today.skills) },
        { label: "最长任务执行时长", value: fmtDur(today.maxMs) }
      ]

      function metricValue(c) { return metric === "calls" ? (c.calls || 0) : ((c.out || 0) + (c.inp || 0)) }

      function metricSeg() {
        return React.createElement("div", { className: "dshact-seg" },
          React.createElement("button", { className: metric === "tokens" ? "on" : "", onClick: function () { setMetric("tokens") } }, "Token"),
          React.createElement("button", { className: metric === "calls" ? "on" : "", onClick: function () { setMetric("calls") } }, "调用次数")
        )
      }

      function summaryBar(period, unit, key) {
        var t = computeTotals(period)
        var left = []
        left.push("合计：输出 ")
        left.push(React.createElement("b", { key: "o" }, fmtShort(t.out)))
        left.push(" · 输入 ")
        left.push(React.createElement("b", { key: "i" }, fmtShort(t.inp)))
        left.push(" · ")
        left.push(React.createElement("b", { key: "c" }, fmt(t.calls)))
        left.push(" 次调用 · ")
        left.push(React.createElement("b", { key: "a" }, String(t.activeDays)))
        left.push(" 天活跃")
        if (t.turns) {
          left.push(" · ")
          left.push(React.createElement("b", { key: "t" }, fmt(t.turns)))
          left.push(" 轮对话")
        }
        return React.createElement("div", { className: "dshact-summary" },
          React.createElement("span", null, left),
          React.createElement("button", {
            className: "dshact-linkbtn",
            onClick: function () { setSel({ unit: unit, key: key, label: key }) }
          }, "查看本期模型明细")
        )
      }

      function dayCellTitle(ck, c) {
        return ck + " · 输出 " + fmt(c.out) + " · 输入 " + fmt(c.inp) + " · " + c.calls + " 次调用"
      }

      function selectDay(ck) {
        setSel(sel && sel.key === ck ? null : { unit: "day", key: ck, label: ck })
      }

      function renderMonth(period) {
        var scale = makeScale(period.days.map(function (c) { return metricValue(c) }))
        var firstDow = (new Date(period.y, period.m - 1, 1).getDay() + 6) % 7  // Monday = 0
        var cells = WD_LABELS.map(function (w, i) {
          return React.createElement("div", { key: "wd" + i, className: "dshact-wd" }, w)
        })
        for (var p = 0; p < firstDow; p++) cells.push(React.createElement("div", { key: "pad" + p }))
        period.days.forEach(function (c) {
          var ck = period.y + "-" + pad2(period.m) + "-" + pad2(c.d)
          var isFuture = ck > dateStr
          var isToday = ck === dateStr
          var isSelected = !!(sel && sel.key === ck)
          cells.push(React.createElement("div", {
            key: ck,
            className: "dshact-cell dshact-num",
            style: heatCellStyle({ used: !isFuture && c.used, level: scale(metricValue(c)), future: isFuture, today: isToday, selected: isSelected }),
            title: dayCellTitle(ck, c),
            onClick: isFuture ? undefined : function () { selectDay(ck) }
          }, String(c.d)))
        })
        return React.createElement("div", { className: "dshact-mgrid" }, cells)
      }

      function renderYear(period) {
        var y = period.y
        var firstDow = (new Date(y, 0, 1).getDay() + 6) % 7  // Monday = 0
        var nWeeks = Math.ceil((firstDow + period.daysInYear) / 7)
        var grid = new Array(nWeeks * 7).fill(null)
        var vals = []
        var doy = 0
        period.months.forEach(function (mo) {
          mo.days.forEach(function (c) {
            vals.push(metricValue(c))
            grid[firstDow + doy] = { c: c, m: mo.m }
            doy += 1
          })
        })
        var scale = makeScale(vals)
        // month labels: week column containing each month's first day
        var labels = {}
        var lastCol = -1
        var acc = 0
        period.months.forEach(function (mo) {
          var col = Math.floor((firstDow + acc) / 7)
          if (col <= lastCol) col = lastCol + 1
          if (col < nWeeks) labels[col] = mo.m
          lastCol = col
          acc += mo.days.length
        })
        var labelRow = []
        for (var w = 0; w < nWeeks; w++) {
          labelRow.push(React.createElement("span", { key: "ml" + w, className: "dshact-ym" }, labels[w] ? labels[w] + "月" : ""))
        }
        var dayLabels = WD_LABELS.map(function (txt, i) {
          return React.createElement("div", { key: "dl" + i, className: "dshact-yday" }, txt)
        })
        var cellEls = []
        grid.forEach(function (item, idx) {
          if (!item) { cellEls.push(React.createElement("div", { key: "p" + idx })); return }
          var ck = y + "-" + pad2(item.m) + "-" + pad2(item.c.d)
          var isFuture = ck > dateStr
          var isToday = ck === dateStr
          var isSelected = !!(sel && sel.key === ck)
          cellEls.push(React.createElement("div", {
            key: ck,
            className: "dshact-cell",
            style: heatCellStyle({ used: !isFuture && item.c.used, level: scale(metricValue(item.c)), future: isFuture, today: isToday, selected: isSelected }),
            title: dayCellTitle(ck, item.c),
            onClick: isFuture ? undefined : function () { selectDay(ck) }
          }))
        })
        return React.createElement("div", { className: "dshact-ycard" },
          React.createElement("div", { className: "dshact-ydays-fixed" },
            React.createElement("div", { className: "dshact-ydays" }, dayLabels)
          ),
          React.createElement("div", { className: "dshact-ycard-scroll" },
            React.createElement("div", { className: "dshact-ylabels" }, labelRow),
            React.createElement("div", { className: "dshact-ygrid" }, cellEls)
          )
        )
      }

      var heatBody = null
      if (view === "day") {
        heatBody = React.createElement(DayChart, { series: data.hoursSeries, nowIso: data.now })
      } else if (view === "month") {
        var isCurMonth = effMonthKey === currentMonthKey
        var mPeriod = isCurMonth ? data.month : (calMonth && calMonth.key === effMonthKey ? calMonth.period : undefined)
        var mPrevDisabled = !data.minDay || shiftMonthKey(effMonthKey, -1) < data.minDay.slice(0, 7)
        var mNextDisabled = effMonthKey >= currentMonthKey
        var mBar = React.createElement("div", { className: "dshact-heat-bar" },
          React.createElement("div", { className: "dshact-nav" },
            React.createElement("button", {
              className: "dshact-navbtn", disabled: mPrevDisabled, title: "上个月",
              onClick: function () { setMonthNav(shiftMonthKey(effMonthKey, -1)); setSel(null) }
            }, "‹"),
            React.createElement("span", { className: "dshact-period-label" }, monthKeyLabel(effMonthKey)),
            React.createElement("button", {
              className: "dshact-navbtn", disabled: mNextDisabled, title: "下个月",
              onClick: function () { setMonthNav(shiftMonthKey(effMonthKey, 1)); setSel(null) }
            }, "›"),
            isCurMonth ? null : React.createElement("button", { className: "dshact-backbtn", onClick: function () { setMonthNav(null); setSel(null) } }, "回到本月")
          ),
          metricSeg()
        )
        if (mPeriod === undefined) {
          heatBody = React.createElement("div", null, mBar, React.createElement("div", { className: "dshact-loading" }, "加载中…"))
        } else if (mPeriod === null) {
          heatBody = React.createElement("div", null, mBar,
            React.createElement("div", { className: "dshact-empty" }, "无法加载该月份数据"))
        } else {
          heatBody = React.createElement("div", null,
            mBar,
            renderMonth(mPeriod),
            summaryBar(mPeriod, "month", effMonthKey),
            React.createElement(HeatLegend, { metric: metric })
          )
        }
      } else {
        var isCurYear = effYearKey === currentYearKey
        var yPeriod = isCurYear ? data.year : (calYear && calYear.key === effYearKey ? calYear.period : undefined)
        var yPrevDisabled = !data.minDay || (Number(effYearKey) - 1) < Number(data.minDay.slice(0, 4))
        var yNextDisabled = effYearKey >= currentYearKey
        var yBar = React.createElement("div", { className: "dshact-heat-bar" },
          React.createElement("div", { className: "dshact-nav" },
            React.createElement("button", {
              className: "dshact-navbtn", disabled: yPrevDisabled, title: "上一年",
              onClick: function () { setYearNav(String(Number(effYearKey) - 1)); setSel(null) }
            }, "‹"),
            React.createElement("span", { className: "dshact-period-label" }, Number(effYearKey) + " 年"),
            React.createElement("button", {
              className: "dshact-navbtn", disabled: yNextDisabled, title: "下一年",
              onClick: function () { setYearNav(String(Number(effYearKey) + 1)); setSel(null) }
            }, "›"),
            isCurYear ? null : React.createElement("button", { className: "dshact-backbtn", onClick: function () { setYearNav(null); setSel(null) } }, "回到今年")
          ),
          metricSeg()
        )
        if (yPeriod === undefined) {
          heatBody = React.createElement("div", null, yBar, React.createElement("div", { className: "dshact-loading" }, "加载中…"))
        } else if (yPeriod === null) {
          heatBody = React.createElement("div", null, yBar,
            React.createElement("div", { className: "dshact-empty" }, "无法加载该年份数据"))
        } else {
          heatBody = React.createElement("div", null,
            yBar,
            renderYear(yPeriod),
            summaryBar(yPeriod, "year", effYearKey),
            React.createElement(HeatLegend, { metric: metric })
          )
        }
      }

      var providersEl = []
      var provs = detail && detail.providers ? detail.providers : []
      if (provs.length === 0) {
        providersEl.push(React.createElement("div", { key: "none", className: "dshact-empty" }, "该时段暂无模型调用"))
      } else {
        provs.forEach(function (p) {
          var modelRows = p.models.map(function (mm) {
            return React.createElement("div", { key: mm.id, className: "dshact-model" },
              React.createElement("span", null, mm.id),
              React.createElement("span", null, "输出 " + fmt(mm.out) + " · 输入 " + fmt(mm.inp) + " · " + mm.calls + " 次")
            )
          })
          providersEl.push(React.createElement("div", { key: p.id, className: "dshact-prov" },
            React.createElement("div", { className: "dshact-prov-head" }, p.name + "　输出 " + fmt(p.out) + " · 输入 " + fmt(p.inp) + " · " + p.calls + " 次"),
            modelRows
          ))
        })
      }

      var skillRows = (data.skillsToday || []).map(function (s) {
        return React.createElement("div", { key: s.name, className: "dshact-row" },
          React.createElement("span", { className: "dshact-row-name" }, s.name),
          React.createElement("b", null, s.count + " 次")
        )
      })
      var toolRows = (data.toolsToday || []).map(function (s) {
        return React.createElement("div", { key: s.name, className: "dshact-row" },
          React.createElement("span", { className: "dshact-row-name" }, s.name),
          React.createElement("b", null, s.count + " 次")
        )
      })
      var sessionRows = (data.sessionsToday || []).map(function (s) {
        return React.createElement("div", { key: s.id, className: "dshact-row" },
          React.createElement("span", { className: "dshact-row-name" }, s.title || (s.id.length > 20 ? s.id.slice(0, 20) + "…" : s.id)),
          React.createElement("span", { className: "dshact-row-sub" }, fmtShort(s.out) + " 输出 · " + fmtShort(s.inp) + " 输入 · " + s.calls + " 次 · " + s.turns + " 轮")
        )
      })

      return React.createElement("div", { className: "dshact" },
        React.createElement("div", { className: "dshact-head" },
          React.createElement("div", { className: "dshact-title" }, "DSH 活动统计"),
          React.createElement("div", { className: "dshact-meta" }, "更新于 " + new Date(data.now).toLocaleTimeString("zh-CN", { hour12: false }))
        ),
        React.createElement("div", { className: "dshact-grid" },
          cards.map(function (c) {
            return React.createElement("div", { key: c.label, className: "dshact-card" },
              React.createElement("div", { className: "dshact-card-label" }, c.label),
              React.createElement("div", { className: "dshact-card-value" }, c.value)
            )
          })
        ),
        React.createElement("div", { className: "dshact-duo" },
          React.createElement("div", { className: "dshact-section" },
            React.createElement("h4", null, "技能使用情况"),
            skillRows.length ? skillRows : React.createElement("div", { className: "dshact-empty" }, "今日暂无技能调用")
          ),
          React.createElement("div", { className: "dshact-section" },
            React.createElement("h4", null, "工具调用情况"),
            toolRows.length ? toolRows : React.createElement("div", { className: "dshact-empty" }, "今日暂无工具调用")
          )
        ),
        React.createElement("div", { className: "dshact-section" },
          React.createElement("h4", null, "对话用量"),
          sessionRows.length ? sessionRows : React.createElement("div", { className: "dshact-empty" }, "今日暂无对话")
        ),
        React.createElement("div", { className: "dshact-heat" },
          React.createElement("div", { className: "dshact-heat-title" }, "使用量热力图"),
          React.createElement("div", { className: "dshact-tabs" },
            React.createElement("button", { className: "dshact-tab" + (view === "day" ? " on" : ""), onClick: function () { setView("day"); setSel(null) } }, "日"),
            React.createElement("button", { className: "dshact-tab" + (view === "month" ? " on" : ""), onClick: function () { setView("month"); setSel(null) } }, "月"),
            React.createElement("button", { className: "dshact-tab" + (view === "year" ? " on" : ""), onClick: function () { setView("year"); setSel(null) } }, "年")
          ),
          heatBody,
          React.createElement("div", { style: { marginTop: 12 } },
            sel ? React.createElement("div", { className: "dshact-section" },
              React.createElement("div", { className: "dshact-detail-head" },
                React.createElement("h4", { style: { margin: 0 } }, "模型使用量 · " + sel.label),
                React.createElement("button", { className: "dshact-x", onClick: function () { setSel(null) } }, "关闭")
              ),
              providersEl
            ) : null
          )
        )
      )
    }

    // render-error boundary: a crash inside Activity renders a placeholder
    // instead of blanking the whole settings section. Built defensively —
    // if React.Component is unavailable the page registers Activity directly.
    var SafeActivity = Activity
    try {
      var ActivityBoundary = class extends React.Component {
        constructor(props) {
          super(props)
          this.state = { err: null }
        }
        static getDerivedStateFromError(err) {
          return { err: err }
        }
        render() {
          if (this.state.err) {
            return React.createElement("div", { className: "dshact-empty" },
              "统计渲染失败：" + String((this.state.err && this.state.err.message) || this.state.err))
          }
          return this.props.children
        }
      }
      SafeActivity = function (props) {
        return React.createElement(ActivityBoundary, null, React.createElement(Activity, props))
      }
    } catch (e) { /* boundary unavailable: fall back to bare Activity */ }

    var inject = ["slots"]

    function apply(ctx) {
      var style = document.createElement("style")
      style.setAttribute("data-plugin", "dsh-plugin-dsh-activity")
      style.textContent = CSS
      document.head.append(style)
      ctx.effect(function () {
        return function () {
          if (style.parentNode) style.parentNode.removeChild(style)
        }
      })

      var slots = ctx.get("slots")
      if (slots === undefined) return
      slots.inject("settings.section", function () {
        return slots.register(
          { name: "settings.section", id: "dsh-activity", order: 35, label: "DSH 活动统计" },
          function () { return React.createElement(SafeActivity) }
        )
      })
    }

    exports.inject = inject
    exports.apply = apply
    return module.exports
  }
})
