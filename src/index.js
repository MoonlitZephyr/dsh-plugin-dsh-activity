'use strict'

/**
 * DSH 活动统计 — Host half
 *
 * 监控并聚合 DSH 的真实使用数据：
 *  - `llm/stream` 瀑布流：每次真实模型调用的 provider 上报 TokenUsage，
 *    按 供应商(provider) → 模型(model) 归因到按小时/按天桶；
 *  - `session/event`：轮次(turn/start → turn/end) 与步骤(step/end) 计数，
 *    以及最长任务执行时长；
 *  - `tools/result`：工具与技能（skill）调用统计。
 *
 * Client half（client/bundle.js）通过 HTTP 路由
 * `/dsh-activity/snapshot`、`/dsh-activity/models` 与
 * `/dsh-activity/calendar`（任意 YYYY-MM / YYYY 周期）读取快照并渲染
 * 设置页「DSH 活动统计」。
 *
 * 通信刻意不使用动态包专属的 harness.handle / host.call 通道：作为经
 * `dsh plugin add` 安装的静态 bundle，宿主侧通过 webServer 服务暴露 HTTP
 * 端点，浏览器侧用普通 fetch 调用（bundle 运行在真实页面，非沙箱）。
 *
 * 数据持久化：写入 `<DSH_HOME>/storages/dsh-activity-usage.json`
 * （主目录从会话 JSONL 路径推导），重启后日/月/年热力图历史保留。
 */

module.exports = {
  name: 'dsh-activity',
  inject: ['timer', 'webServer'],

  apply(ctx) {
    const fs = ctx.get('fs')
    const sessionPersistence = ctx.get('sessionPersistence')
    const llm = ctx.get('llm')
    const sessionsSvc = ctx.get('sessions')
    const sessionTitle = ctx.get('sessionTitle')

    // state: hours 'YYYY-MM-DDTHH' -> {out,inp,calls,models}; days 'YYYY-MM-DD' -> freshDay()
    const state = { v: 1, hours: {}, days: {} }
    let homePromise = null
    let persistTarget = null
    let dirty = false
    const turnStarts = new Map()

    const HOURS_BACK = 3 * 24
    const HOURS_AHEAD = 3 * 24
    const HOUR_KEEP_MS = 8 * 86400000

    function pad2(n) { return n < 10 ? '0' + n : String(n) }
    function fmtDay(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) }
    function fmtHourKey(d) { return fmtDay(d) + 'T' + pad2(d.getHours()) }
    function daysInMonth(y, m) { return new Date(y, m, 0).getDate() }
    function daysInYear(y) { return ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) ? 366 : 365 }
    function num(v) { return typeof v === 'number' && isFinite(v) && v > 0 ? v : 0 }
    function freshDay() { return { out: 0, inp: 0, calls: 0, turns: 0, steps: 0, tools: 0, skills: 0, maxMs: 0, models: {}, toolsMap: {}, skillsMap: {}, sessions: {} } }
    function ensureDay(key) { let b = state.days[key]; if (!b) { b = state.days[key] = freshDay() } return b }
    function ensureHour(key) { let b = state.hours[key]; if (!b) { b = state.hours[key] = { out: 0, inp: 0, calls: 0, models: {} } } return b }
    function bumpModel(models, provider, model, out, inp, isCall) {
      let pm = models[provider]; if (!pm) pm = models[provider] = {}
      let mm = pm[model]; if (!mm) mm = pm[model] = { out: 0, inp: 0, calls: 0 }
      mm.out += out; mm.inp += inp; if (isCall) mm.calls += 1
    }

    // ---- deep additive merge (never overwrite: accumulate file + memory) ----
    function mergeModelsInto(target, src) {
      if (!src) return
      for (const pid of Object.keys(src)) {
        const sm = src[pid]
        if (!sm || typeof sm !== 'object') continue
        let tm = target[pid]
        if (!tm) tm = target[pid] = {}
        for (const mid of Object.keys(sm)) {
          const srec = sm[mid]
          if (!srec || typeof srec !== 'object') continue
          let trec = tm[mid]
          if (!trec) trec = tm[mid] = { out: 0, inp: 0, calls: 0 }
          trec.out = (trec.out || 0) + (srec.out || 0)
          trec.inp = (trec.inp || 0) + (srec.inp || 0)
          trec.calls = (trec.calls || 0) + (srec.calls || 0)
        }
      }
    }
    function mergeHour(target, src) {
      if (!src) return
      target.out = (target.out || 0) + (src.out || 0)
      target.inp = (target.inp || 0) + (src.inp || 0)
      target.calls = (target.calls || 0) + (src.calls || 0)
      if (!target.models) target.models = {}
      mergeModelsInto(target.models, src.models)
    }
    function mergeDay(target, src) {
      if (!src) return
      target.out = (target.out || 0) + (src.out || 0)
      target.inp = (target.inp || 0) + (src.inp || 0)
      target.calls = (target.calls || 0) + (src.calls || 0)
      target.turns = (target.turns || 0) + (src.turns || 0)
      target.steps = (target.steps || 0) + (src.steps || 0)
      target.tools = (target.tools || 0) + (src.tools || 0)
      target.skills = (target.skills || 0) + (src.skills || 0)
      if (src.maxMs) target.maxMs = Math.max(target.maxMs || 0, src.maxMs)
      if (!target.models) target.models = {}
      mergeModelsInto(target.models, src.models)
      if (!target.toolsMap) target.toolsMap = {}
      if (!target.skillsMap) target.skillsMap = {}
      if (!target.sessions) target.sessions = {}
      for (const k of Object.keys(src.toolsMap || {})) target.toolsMap[k] = (target.toolsMap[k] || 0) + (src.toolsMap[k] || 0)
      for (const k of Object.keys(src.skillsMap || {})) target.skillsMap[k] = (target.skillsMap[k] || 0) + (src.skillsMap[k] || 0)
      for (const sid of Object.keys(src.sessions || {})) {
        const ss = src.sessions[sid]
        if (!ss) continue
        let ts = target.sessions[sid]
        if (!ts) ts = target.sessions[sid] = { out: 0, inp: 0, calls: 0, turns: 0 }
        ts.out = (ts.out || 0) + (ss.out || 0)
        ts.inp = (ts.inp || 0) + (ss.inp || 0)
        ts.calls = (ts.calls || 0) + (ss.calls || 0)
        ts.turns = (ts.turns || 0) + (ss.turns || 0)
      }
    }

    // ---- persistence (private data file under the DSH home) ----
    function resolveHome() {
      if (homePromise) return homePromise
      homePromise = (async () => {
        try {
          if (!sessionPersistence || typeof sessionPersistence.list !== 'function') return null
          const headers = await sessionPersistence.list()
          if (!Array.isArray(headers)) return null
          for (const h of headers) {
            try {
              const loc = sessionPersistence.locate(h)
              if (loc && typeof loc.path === 'string' && loc.path.length) {
                const parts = loc.path.split(/[\\/]sessions[\\/]/)
                if (parts.length >= 2 && parts[0].length) return parts[0]
              }
            } catch (e) { /* try next header */ }
          }
        } catch (e) { /* fall back to memory only */ }
        return null
      })()
      // a FAILED resolution must not be cached for the whole lifetime:
      // reset so the next caller retries once sessionPersistence is ready
      homePromise.then(function (home) {
        if (!home) homePromise = null
      }, function () {
        homePromise = null
      })
      return homePromise
    }
    async function ensurePersistTarget() {
      if (persistTarget) return persistTarget
      const home = await resolveHome()
      if (!home || !fs) return null
      try { persistTarget = await fs.resolve(home + '\\storages\\dsh-activity-usage.json') } catch (e) { persistTarget = null }
      return persistTarget
    }
    let loadPromise = null
    function loadState() {
      // single-flight via shared promise: every caller waits until the file has
      // actually been read and merged, so persist can never write a pre-merge state
      if (!loadPromise) {
        loadPromise = (async () => {
          try {
            const target = await ensurePersistTarget()
            if (!target) return state
            const text = await fs.readText(target)
            if (!text) return state
            let parsed = null
            try {
              parsed = JSON.parse(text)
            } catch (parseErr) {
              // corrupted file (truncated write, disk issue): quarantine a
              // timestamped backup instead of silently wiping the history
              try {
                const home = await resolveHome()
                if (home && fs) {
                  const bak = await fs.resolve(home + '\\storages\\dsh-activity-usage.corrupt-' + Date.now() + '.json')
                  await fs.writeText(bak, text, undefined, undefined, { mode: 'danger-full-access' })
                }
                console.log('dsh-activity: usage file was corrupted; quarantined backup written, starting fresh')
              } catch (bakErr) {
                console.log('dsh-activity: usage file corrupted and backup failed:', bakErr && bakErr.message || bakErr)
              }
              return state
            }
            if (parsed && typeof parsed === 'object') {
              // additive merge: file history + in-memory entries (never overwrite)
              if (parsed.hours && typeof parsed.hours === 'object') {
                for (const k of Object.keys(parsed.hours)) {
                  if (!state.hours[k]) state.hours[k] = { out: 0, inp: 0, calls: 0, models: {} }
                  mergeHour(state.hours[k], parsed.hours[k])
                }
              }
              if (parsed.days && typeof parsed.days === 'object') {
                for (const k of Object.keys(parsed.days)) {
                  if (!state.days[k]) state.days[k] = freshDay()
                  mergeDay(state.days[k], parsed.days[k])
                }
              }
            }
          } catch (e) { /* unreadable -> memory only */ }
          return state
        })()
      }
      return loadPromise
    }
    function prune() {
      const now = new Date()
      const todayKey = fmtDay(now)
      const hourCutoff = now.getTime() - HOUR_KEEP_MS
      for (const k of Object.keys(state.hours)) {
        if (k.length < 13) { delete state.hours[k]; continue }
        const t = new Date(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1, Number(k.slice(8, 10)), Number(k.slice(11, 13)))
        // malformed keys (NaN time) can never expire — drop them here
        if (isNaN(t.getTime()) || t.getTime() < hourCutoff) delete state.hours[k]
      }
      const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 400).getTime()
      for (const k of Object.keys(state.days)) {
        const t = new Date(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1, Number(k.slice(8, 10)))
        if (isNaN(t.getTime()) || t.getTime() < cutoff) { delete state.days[k]; continue }
        if (k !== todayKey) { const b = state.days[k]; if (b) delete b.sessions }
      }
    }
    let persistChain = Promise.resolve()
    function persist() {
      // single-flight chain: concurrent invocations queue behind the running write
      const run = persistChain.then(doPersist)
      persistChain = run.then(function () {}, function () {})
      return run
    }
    async function doPersist() {
      // claim the current batch up-front so events arriving during the awaits
      // re-arm dirty for the next tick instead of being silently swallowed
      dirty = false
      try {
        const target = await ensurePersistTarget()
        if (!target) { dirty = true; return }
        await loadState()
        prune()
        await fs.writeText(target, JSON.stringify(state), undefined, undefined, { mode: 'danger-full-access' })
      } catch (e) {
        dirty = true
        console.log('dsh-activity persist failed:', e && e.message || e)
      }
    }

    // ---- record: model token usage (llm/stream waterfall) ----
    ctx.on('llm/stream', (options, next) => {
      return (async function* () {
        let saw = false
        const provider = options && typeof options.provider === 'string' ? options.provider : 'unknown'
        const model = options && typeof options.model === 'string' ? options.model : 'unknown'
        const sid = options && options.sessionId != null ? String(options.sessionId) : null
        for await (const chunk of next()) {
          try {
            if (chunk && chunk.type === 'usage' && chunk.usage) {
              const u = chunk.usage
              const out = num(u.outputTokens)
              const inp = num(u.inputTokens) + num(u.cacheReadTokens) + num(u.cacheWriteTokens)
              const now = new Date()
              const dk = fmtDay(now)
              const hk = fmtHourKey(now)
              const db = ensureDay(dk)
              const hb = ensureHour(hk)
              const isCall = !saw
              if (isCall) { db.calls += 1; hb.calls += 1 }
              db.out += out; db.inp += inp; hb.out += out; hb.inp += inp
              bumpModel(db.models, provider, model, out, inp, isCall)
              bumpModel(hb.models, provider, model, out, inp, isCall)
              if (sid) {
                let srec = db.sessions[sid]; if (!srec) srec = db.sessions[sid] = { out: 0, inp: 0, calls: 0, turns: 0 }
                srec.out += out; srec.inp += inp; if (isCall) srec.calls += 1
              }
              saw = true
              dirty = true
            }
          } catch (e) { /* accounting must never break the stream */ }
          yield chunk
        }
      })()
    })

    // ---- record: turns / steps / longest task duration (session/event) ----
    ctx.on('session/event', (session, event) => {
      try {
        if (!event || typeof event.type !== 'string') return
        const sid = session && session.id != null ? String(session.id) : (session && session.header && session.header.id != null ? String(session.header.id) : '')
        const turn = event.data && event.data.turn != null ? event.data.turn : ''
        const key = sid + ':' + turn
        const evTime = typeof event.time === 'number' ? event.time : Date.parse(event.time)
        if (event.type === 'turn/start') {
          if (isFinite(evTime)) turnStarts.set(key, evTime)
          return
        }
        // only the counting events below may create a day bucket, and only
        // with a valid timestamp (never a NaN "NaN-NaN-NaN" bucket)
        if (!isFinite(evTime)) return
        const dk = fmtDay(new Date(evTime))
        const db = ensureDay(dk)
        if (event.type === 'turn/end') {
          db.turns += 1
          const st = turnStarts.get(key)
          if (st != null) {
            const dur = evTime - st
            if (dur > 0 && dur > db.maxMs) db.maxMs = dur
            turnStarts.delete(key)
          }
          const srec = db.sessions[sid]; if (srec) srec.turns += 1
          dirty = true
        } else if (event.type === 'step/end') {
          db.steps += 1
          dirty = true
        }
      } catch (e) { /* never break the event feed */ }
    })

    // ---- record: tool & skill usage (tools/result) ----
    ctx.on('tools/result', (exec) => {
      try {
        const now = new Date()
        const dk = fmtDay(now)
        const db = ensureDay(dk)
        const name = exec && typeof exec.name === 'string' ? exec.name : '(unknown)'
        db.tools += 1
        db.toolsMap[name] = (db.toolsMap[name] || 0) + 1
        if (name === 'skill') {
          const args = exec.arguments
          const skillName = args && typeof args === 'object' && args != null && typeof args.name === 'string' ? args.name : '(unknown)'
          db.skills += 1
          db.skillsMap[skillName] = (db.skillsMap[skillName] || 0) + 1
        }
        dirty = true
      } catch (e) { /* never break the result feed */ }
    })

    // ---- snapshot assembly ----
    function statsOf(db) {
      return { out: db.out, inp: db.inp, calls: db.calls, turns: db.turns, steps: db.steps, tools: db.tools, skills: db.skills, maxMs: db.maxMs }
    }
    function freshTotals() { return { out: 0, inp: 0, calls: 0, turns: 0, steps: 0, activeDays: 0 } }
    function accTotals(totals, b) {
      totals.out += b.out || 0; totals.inp += b.inp || 0; totals.calls += b.calls || 0
      totals.turns += b.turns || 0; totals.steps += b.steps || 0
      if ((b.out || 0) + (b.inp || 0) > 0 || (b.calls || 0) > 0) totals.activeDays += 1
    }
    // month period for any YYYY-MM within the retention window
    function monthPeriod(yy, mm) {
      const dim = daysInMonth(yy, mm)
      const days = []
      const totals = freshTotals()
      for (let d = 1; d <= dim; d++) {
        const b = state.days[yy + '-' + pad2(mm) + '-' + pad2(d)]
        days.push({ d, out: b ? b.out : 0, inp: b ? b.inp : 0, calls: b ? b.calls : 0, used: !!b })
        if (b) accTotals(totals, b)
      }
      return { y: yy, m: mm, daysInMonth: dim, days, totals }
    }
    // year period for any YYYY within the retention window
    function yearPeriod(yy) {
      const months = []
      const totals = freshTotals()
      for (let mm = 1; mm <= 12; mm++) {
        const mdays = daysInMonth(yy, mm)
        const cells = []
        for (let d = 1; d <= mdays; d++) {
          const b = state.days[yy + '-' + pad2(mm) + '-' + pad2(d)]
          cells.push({ d, out: b ? b.out : 0, inp: b ? b.inp : 0, calls: b ? b.calls : 0, used: !!b })
          if (b) accTotals(totals, b)
        }
        months.push({ m: mm, days: cells })
      }
      return { y: yy, daysInYear: daysInYear(yy), months, totals }
    }
    function dayBounds() {
      let mn = null, mx = null
      for (const k of Object.keys(state.days)) {
        if (mn === null || k < mn) mn = k
        if (mx === null || k > mx) mx = k
      }
      return { minDay: mn, maxDay: mx }
    }
    function sortedMap(obj) {
      const out = []
      for (const k of Object.keys(obj || {})) out.push({ name: k, count: obj[k] })
      return out.sort((a, b) => b.count - a.count)
    }
    async function providerNames() {
      const map = {}
      try {
        if (llm && typeof llm.listProviders === 'function') {
          const list = llm.listProviders()
          if (list && Array.isArray(list)) for (const p of list) map[p.id] = p.name || p.id
        }
      } catch (e) { /* best effort */ }
      return map
    }
    async function buildSnapshot() {
      await loadState()
      const now = new Date()
      const dk = fmtDay(now)
      const db = state.days[dk] || freshDay()
      const pnames = await providerNames()
      const sessionsToday = []
      for (const sid of Object.keys(db.sessions || {})) {
        const srec = db.sessions[sid]
        let title = ''
        try {
          if (sessionsSvc && sessionTitle && typeof sessionsSvc.get === 'function' && typeof sessionTitle.get === 'function') {
            const sess = sessionsSvc.get(sid)
            if (sess) { const snap = sessionTitle.get(sess); if (snap && typeof snap.title === 'string') title = snap.title }
          }
        } catch (e) { /* no title */ }
        sessionsToday.push({ id: sid, title, out: srec.out, inp: srec.inp, calls: srec.calls, turns: srec.turns })
      }
      sessionsToday.sort((a, b) => (b.out + b.inp) - (a.out + a.inp))
      // continuous hourly series: [now - 3d, now + 3d]
      const hoursSeries = []
      const nowHourMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).getTime()
      const startMs = nowHourMs - HOURS_BACK * 3600000
      for (let i = 0; i <= HOURS_BACK + HOURS_AHEAD; i++) {
        const ts = startMs + i * 3600000
        const d = new Date(ts)
        const key = fmtDay(d) + 'T' + pad2(d.getHours())
        const hb = state.hours[key]
        hoursSeries.push({ t: ts, day: fmtDay(d), h: d.getHours(), out: hb ? hb.out : 0, inp: hb ? hb.inp : 0, calls: hb ? hb.calls : 0, used: !!hb, models: hb ? hb.models : {} })
      }
      const y = now.getFullYear()
      const month = monthPeriod(y, now.getMonth() + 1)
      const year = yearPeriod(y)
      const bounds = dayBounds()
      return {
        now: now.toISOString(),
        date: dk,
        today: statsOf(db),
        providerNames: pnames,
        hoursSeries, month, year,
        minDay: bounds.minDay, maxDay: bounds.maxDay,
        sessionsToday: sessionsToday.slice(0, 10),
        skillsToday: sortedMap(db.skillsMap).slice(0, 15),
        toolsToday: sortedMap(db.toolsMap).slice(0, 12),
      }
    }
    function mergeModels(target, src) {
      if (!src || typeof src !== 'object') return
      for (const provider of Object.keys(src)) {
        const pm = src[provider]
        if (!pm || typeof pm !== 'object') continue
        let tp = target[provider]; if (!tp) tp = target[provider] = {}
        for (const model of Object.keys(pm)) {
          const mm = pm[model]
          if (!mm || typeof mm !== 'object') continue
          let tm = tp[model]; if (!tm) tm = tp[model] = { out: 0, inp: 0, calls: 0 }
          tm.out += num(mm.out); tm.inp += num(mm.inp); tm.calls += num(mm.calls)
        }
      }
    }
    async function buildModels(unit, key) {
      await loadState()
      const agg = {}
      if (unit === 'hour') {
        const hb = state.hours[key]; if (hb) mergeModels(agg, hb.models)
      } else if (unit === 'day') {
        const db = state.days[key]; if (db) mergeModels(agg, db.models)
      } else if (unit === 'month') {
        const parts = String(key).split('-')
        const yy = Number(parts[0]); const mm = Number(parts[1])
        if (yy > 0 && mm > 0) for (let d = 1; d <= daysInMonth(yy, mm); d++) { const b = state.days[yy + '-' + pad2(mm) + '-' + pad2(d)]; if (b) mergeModels(agg, b.models) }
      } else if (unit === 'year') {
        const yy = Number(String(key).split('-')[0])
        if (yy > 0) for (let mm = 1; mm <= 12; mm++) for (let d = 1; d <= daysInMonth(yy, mm); d++) { const b = state.days[yy + '-' + pad2(mm) + '-' + pad2(d)]; if (b) mergeModels(agg, b.models) }
      }
      const pnames = await providerNames()
      const providers = []
      for (const pid of Object.keys(agg)) {
        const pm = agg[pid]
        let pout = 0, pinp = 0, pcalls = 0
        const models = []
        for (const mid of Object.keys(pm)) {
          const mm = pm[mid]
          pout += mm.out; pinp += mm.inp; pcalls += mm.calls
          models.push({ id: mid, out: mm.out, inp: mm.inp, calls: mm.calls })
        }
        models.sort((a, b) => (b.out + b.inp) - (a.out + a.inp))
        providers.push({ id: pid, name: pnames[pid] || pid, out: pout, inp: pinp, calls: pcalls, models })
      }
      providers.sort((a, b) => (b.out + b.inp) - (a.out + a.inp))
      return { unit, key, providers }
    }

    // ---- HTTP routes for the Client half ----
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-activity/snapshot',
      handler: async (req, res) => {
        try {
          const snapshot = await buildSnapshot()
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(snapshot))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: String((e && e.message) || e) }))
        }
      },
    }))
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-activity/models',
      handler: async (req, res) => {
        try {
          const url = new URL(req.url || '/', 'http://dsh.local')
          const unit = url.searchParams.get('unit') || 'day'
          const key = url.searchParams.get('key') || ''
          const models = await buildModels(unit, key)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(models))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: String((e && e.message) || e) }))
        }
      },
    }))

    ctx.effect(() => ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-activity/calendar',
      handler: async (req, res) => {
        try {
          const url = new URL(req.url || '/', 'http://dsh.local')
          const unit = url.searchParams.get('unit') || ''
          const key = url.searchParams.get('key') || ''
          await loadState()
          let period = null
          if (unit === 'month') {
            const parts = String(key).split('-')
            const yy = Number(parts[0]); const mm = Number(parts[1])
            if (yy >= 1 && mm >= 1 && mm <= 12) period = monthPeriod(yy, mm)
          } else if (unit === 'year') {
            const yy = Number(String(key).split('-')[0])
            if (yy >= 1) period = yearPeriod(yy)
          }
          if (!period) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: false, error: 'bad unit/key: expected unit=month&key=YYYY-MM or unit=year&key=YYYY' }))
            return
          }
          const bounds = dayBounds()
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ unit, key, period, minDay: bounds.minDay, maxDay: bounds.maxDay }))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: String((e && e.message) || e) }))
        }
      },
    }))

    // ---- periodic & final flush ----
    loadState()
    ctx.interval(() => { if (dirty) persist() }, 20000)
    ctx.effect(() => () => { if (dirty) persist() })
  },
}
