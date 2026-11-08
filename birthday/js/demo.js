/* ============================================================================
   生日礼物 · 演示版 v0.1
   纯 Canvas 手写，零外部依赖。

   三幕：
     1. text  星尘从四面汇聚成「娇娇 / 生日快乐」，悬停后散开成浮尘
     2. cake  三层蛋糕自下方升起，缓慢自转，蜡烛燃烧
     3. wish  吹灭（麦克风真吹 / 长按降级）→ 烟 + 钟声 + 烟花 + 文案

   所有几何体在物体空间（y 轴向上）定义，经 yaw/pitch 旋转后做透视投影，
   按旋转后的 z 做画家算法排序，背面用旋转后的法线剔除。
   ========================================================================== */
(function () {
	'use strict';

	var TAU = Math.PI * 2;
	var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

	/* ---------------------------------------------------------------------
	   画布 / 视图
	   --------------------------------------------------------------------- */
	var canvas = document.getElementById('stage');
	var ctx = canvas.getContext('2d', { alpha: false });
	var W = 0, H = 0, DPR = 1;

	// 相机：yaw 绕 y 轴、pitch 绕 x 轴（负值＝俯视）、dist/fov 决定透视强度、K 是把物体单位换成像素的整体缩放
	var cam = { yaw: 0.85, pitch: -0.38, dist: 760, fov: 900, cx: 0, cy: 0, K: 3 };
	var CAKE_TOP_Y = 262;   // 蜡烛顶端，用来算画面纵向占位
	var CAKE_BOT_Y = -18;
	var CAKE_MAX_R = 150;
	var CAKE_H = CAKE_TOP_Y - CAKE_BOT_Y;

	function sZero() { return cam.fov / (cam.fov + cam.dist); }

	function layout() {
		DPR = Math.min(window.devicePixelRatio || 1, 2);
		W = window.innerWidth;
		H = window.innerHeight;
		canvas.width = Math.round(W * DPR);
		canvas.height = Math.round(H * DPR);
		canvas.style.width = W + 'px';
		canvas.style.height = H + 'px';
		ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

		cam.cx = W / 2;
		cam.cy = H * 0.72;

		var s0 = sZero();
		var fitW = (W * 0.90) / (2 * CAKE_MAX_R * s0);
		var fitH = (H * 0.54) / (CAKE_H * s0);
		cam.K = Math.min(fitW, fitH);

		buildStars();
		if (textParticles.length) buildTextTargets();
		relayoutSmoke();
	}

	// 物体空间坐标 → 屏幕坐标
	// 返回 { x, y, z, s }，z 越大离相机越远（用 s = fov/(fov+z+dist) 保证一致）
	function project(px, py, pz) {
		var cyw = Math.cos(cam.yaw), syw = Math.sin(cam.yaw);
		var x1 = px * cyw - pz * syw;
		var z1 = px * syw + pz * cyw;
		var cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
		var y1 = py * cp - z1 * sp;
		var z2 = py * sp + z1 * cp;
		var s = cam.fov / (cam.fov + z2 + cam.dist);
		return {
			x: cam.cx + x1 * s * cam.K,
			y: cam.cy - y1 * s * cam.K,
			z: z2,
			s: s * cam.K
		};
	}

	/* ---------------------------------------------------------------------
	   全局状态
	   --------------------------------------------------------------------- */
	var phase = 'text';          // text | cake | blow | wish
	var started = false;         // 聊天幕结束后才置 true，第三幕从这里开始计时
	var tStart = 0;              // 本幕开始时刻（秒）
	var time = 0;
	var last = 0;
	var T = 0;                   // 全局时间（秒）

	/* ---------------------------------------------------------------------
	   星空背景
	   --------------------------------------------------------------------- */
	var stars = [];

	function buildStars() {
		var n = isMobile ? 90 : 180;
		stars = [];
		for (var i = 0; i < n; i++) {
			stars.push({
				x: Math.random() * W,
				y: Math.random() * H,
				r: Math.random() * 1.4 + 0.35,
				ph: Math.random() * TAU,
				sp: Math.random() * 1.6 + 0.5,
				hue: Math.random() < 0.22 ? 335 : (Math.random() < 0.5 ? 45 : 210)
			});
		}
	}

	function drawStars(dt) {
		var g = ctx.createLinearGradient(0, 0, W * 0.35, H);
		g.addColorStop(0, '#04030b');
		g.addColorStop(0.45, '#0a0718');
		g.addColorStop(0.78, '#140a24');
		g.addColorStop(1, '#1d0b26');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, W, H);

		// 中央的暖光晕，把视线压到蛋糕位置
		var glow = ctx.createRadialGradient(W / 2, H * 0.62, 0, W / 2, H * 0.62, Math.max(W, H) * 0.62);
		glow.addColorStop(0, 'rgba(255,86,132,0.16)');
		glow.addColorStop(0.45, 'rgba(120,40,140,0.07)');
		glow.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = glow;
		ctx.fillRect(0, 0, W, H);

		ctx.globalCompositeOperation = 'lighter';
		for (var i = 0; i < stars.length; i++) {
			var s = stars[i];
			var a = 0.32 + 0.68 * (0.5 + 0.5 * Math.sin(T * s.sp + s.ph));
			ctx.fillStyle = 'hsla(' + s.hue + ',90%,88%,' + (a * 0.85) + ')';
			ctx.beginPath();
			ctx.arc(s.x, s.y, s.r, 0, TAU);
			ctx.fill();
		}
		ctx.globalCompositeOperation = 'source-over';
	}

	/* ---------------------------------------------------------------------
	   星尘文字
	   --------------------------------------------------------------------- */
	var textParticles = [];
	var textPoints = [];          // 归一化点阵（以文字包围盒中心为原点）
	var textOut = 0;              // 0→1，散开进度
	var textDone = false;

	var TEXT_LINES = ['娇娇', '生日快乐'];

	function sampleText() {
		var off = document.createElement('canvas');
		var oc = off.getContext('2d');
		var FS = 120;
		var font = '700 ' + FS + 'px "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
		oc.font = font;

		var maxW = 0;
		for (var i = 0; i < TEXT_LINES.length; i++) {
			maxW = Math.max(maxW, oc.measureText(TEXT_LINES[i]).width);
		}
		var lineH = FS * 1.24;
		var w = Math.ceil(maxW) + 48;
		var h = Math.ceil(lineH * TEXT_LINES.length) + 48;

		off.width = w;
		off.height = h;
		oc.font = font;
		oc.fillStyle = '#fff';
		oc.textAlign = 'center';
		oc.textBaseline = 'middle';
		for (var j = 0; j < TEXT_LINES.length; j++) {
			oc.fillText(TEXT_LINES[j], w / 2, 24 + lineH * (j + 0.5));
		}

		var data = oc.getImageData(0, 0, w, h).data;
		var gap = isMobile ? 5 : 4;
		var raw = [];
		for (var y = 0; y < h; y += gap) {
			for (var x = 0; x < w; x += gap) {
				if (data[(y * w + x) * 4 + 3] > 140) {
					raw.push([x - w / 2, y - h / 2]);
				}
			}
		}

		// 封顶，超量就等距抽稀，保证点数与粒子数一一对应
		var cap = isMobile ? 1700 : 3000;
		if (raw.length > cap) {
			var stride = raw.length / cap;
			var thin = [];
			for (var k = 0; k < cap; k++) thin.push(raw[Math.floor(k * stride)]);
			raw = thin;
		}
		textPoints = raw;
	}

	function createTextParticles() {
		textParticles = [];
		for (var i = 0; i < textPoints.length; i++) {
			var a = Math.random() * TAU;
			var d = Math.max(W, H) * (0.55 + Math.random() * 0.5);
			textParticles.push({
				x: W / 2 + Math.cos(a) * d,
				y: H * 0.42 + Math.sin(a) * d,
				tx: 0, ty: 0,
				vx: 0, vy: 0,
				r: Math.random() * (isMobile ? 1.3 : 1.7) + 0.85,
				hue: 336 + Math.random() * 22,
				ph: Math.random() * TAU,
				driftX: 0, driftY: 0
			});
		}
	}

	function buildTextTargets() {
		if (!textPoints.length || !textParticles.length) return;
		var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
		for (var i = 0; i < textPoints.length; i++) {
			var p = textPoints[i];
			if (p[0] < minX) minX = p[0];
			if (p[0] > maxX) maxX = p[0];
			if (p[1] < minY) minY = p[1];
			if (p[1] > maxY) maxY = p[1];
		}
		var bw = Math.max(1, maxX - minX);
		var bh = Math.max(1, maxY - minY);
		var scale = Math.min((W * 0.82) / bw, (H * 0.46) / bh);
		var ox = W / 2 - ((minX + maxX) / 2) * scale;
		var oy = H * 0.38 - ((minY + maxY) / 2) * scale;

		for (var j = 0; j < textParticles.length; j++) {
			var pt = textPoints[j % textPoints.length];
			var tp = textParticles[j];
			tp.tx = ox + pt[0] * scale;
			tp.ty = oy + pt[1] * scale;
		}
	}

	function updateTextParticles(dt) {
		var spring = textDone ? 0.002 : 0.085;
		var damp = textDone ? 0.965 : 0.80;

		for (var i = 0; i < textParticles.length; i++) {
			var p = textParticles[i];

			if (textDone) {
				// 散开：目标改成缓慢漂移的浮尘
				p.driftX += (Math.random() - 0.5) * 6 * dt;
				p.driftY += (Math.random() - 0.5) * 6 * dt - 3 * dt;
				p.tx += p.driftX * dt;
				p.ty += p.driftY * dt;
				p.driftX *= 0.985;
				p.driftY *= 0.985;
				if (p.ty < -30) { p.ty = H + 30; }
				if (p.tx < -30) p.tx = W + 30;
				if (p.tx > W + 30) p.tx = -30;
			}

			p.vx += (p.tx - p.x) * spring;
			p.vy += (p.ty - p.y) * spring;
			p.vx *= damp;
			p.vy *= damp;
			p.x += p.vx;
			p.y += p.vy;
		}
	}

	function drawTextParticles() {
		ctx.globalCompositeOperation = 'lighter';
		for (var i = 0; i < textParticles.length; i++) {
			var p = textParticles[i];
			var tw = 0.55 + 0.45 * Math.sin(T * 2.2 + p.ph);
			var a = textDone ? 0.22 * tw : (0.55 + 0.45 * tw);
			ctx.fillStyle = 'hsla(' + p.hue + ',95%,' + (textDone ? 72 : 80) + '%,' + a + ')';
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.r * (textDone ? 0.8 : 1), 0, TAU);
			ctx.fill();
		}
		ctx.globalCompositeOperation = 'source-over';
	}

	/* ---------------------------------------------------------------------
	   蛋糕几何
	   每层是一个圆柱：side 是侧面，top 是带中心点的三角扇（俯视时可见）
	   --------------------------------------------------------------------- */
	var C = {
		plate: '#c9a44c',
		plateTop: '#e8c972',
		c1: '#ff9ebb', c1t: '#ffd0de',
		c2: '#ff7ba6', c2t: '#ffc2d6',
		c3: '#ffd7e3', c3t: '#fff0f5',
		cream: '#fff6ea', creamTop: '#fffdf8'
	};

	var LAYERS = [
		{ r: 150, y0: -18, y1: -6, side: C.plate, top: C.plateTop, kind: 'plate' },
		{ r: 122, y0: -6, y1: 70, side: C.c1, top: C.c1t, kind: 'cake' },
		{ r: 128, y0: 70, y1: 84, side: C.cream, top: C.creamTop, kind: 'cream' },
		{ r: 98, y0: 84, y1: 148, side: C.c2, top: C.c2t, kind: 'cake' },
		{ r: 104, y0: 148, y1: 160, side: C.cream, top: C.creamTop, kind: 'cream' },
		{ r: 76, y0: 160, y1: 212, side: C.c3, top: C.c3t, kind: 'cake' },
		{ r: 82, y0: 212, y1: 224, side: C.cream, top: C.creamTop, kind: 'cream' }
	];

	// 三根蜡烛，角度：270° 正对镜头，30°/150° 在后方
	var CANDLE_R = 34;
	var CANDLE_Y0 = 224;
	var CANDLE_Y1 = 262;
	var CANDLE_RAD = 5;
	var candles = [
		{ a: Math.PI * 1.5, col: '#ff6b9d', alive: 1, dying: false },
		{ a: Math.PI * 0.1667, col: '#ffd76b', alive: 1, dying: false },
		{ a: Math.PI * 0.8333, col: '#7ee0c8', alive: 1, dying: false }
	];

	// 奶油花边：每层奶油顶沿一圈小球
	// 奶油裱花球开关。
	// 打开会在每层奶油顶沿加一圈挤出来的奶油球（buttercream border）。
	// 默认关：「挂一圈球」这个形态在缩小的画面上容易读成碎边/马赛克，
	// 现在退回一条干净的奶油带。想要就设成 true，其它都不用动。
	var SHOW_CREAM_BALLS = false;

	// 奶油裱花：每层奶油顶沿挤一圈球。
	// 关键：整圈作为一个整体来画（见 projectLayers），不是一个个圆堆上去 ——
	// 逐个画会互相压边、深度排序每帧抖动，边缘碎成马赛克。
	var creamRings = [];
	(function buildRings() {
		if (!SHOW_CREAM_BALLS) return;
		for (var li = 0; li < LAYERS.length; li++) {
			var L = LAYERS[li];
			if (L.kind !== 'cream') continue;
			var rad = L.r * 0.082;
			var n = Math.max(10, Math.round(Math.PI * L.r / rad));
			var ringR = L.r - rad * 0.22;
			var pts = [];
			for (var i = 0; i < n; i++) {
				var a = (i + 0.5) / n * TAU;
				pts.push({ a: a, x: Math.cos(a) * ringR, z: Math.sin(a) * ringR });
			}
			creamRings.push({ L: L, rad: rad, pts: pts, y: L.y1 - rad * 0.52 });
		}
	})();

	// 糖粒：撒在三层蛋糕侧面
	var sprinkles = [];
	(function buildSprinkles() {
		var cols = ['#ffffff', '#ffe27a', '#ff9ec0', '#8ee6d0', '#c9a6ff'];
		var tiers = [
			{ r: 122, y0: -6, y1: 70, n: 15 },
			{ r: 98, y0: 84, y1: 148, n: 12 },
			{ r: 76, y0: 160, y1: 212, n: 9 }
		];
		for (var t = 0; t < tiers.length; t++) {
			var tr = tiers[t];
			for (var i = 0; i < tr.n; i++) {
				sprinkles.push({
					a: Math.random() * TAU,
					y: tr.y0 + 9 + Math.random() * (tr.y1 - tr.y0 - 18),
					r: tr.r + 0.6,
					col: cols[(Math.random() * cols.length) | 0],
					len: 3.2 + Math.random() * 2.6
				});
			}
		}
	})();

	// 顶层樱桃
	var cherries = [];
	(function buildCherries() {
		var spots = [[0, 0, -40], [46, 0, 12], [-40, 0, 16], [8, 0, 46], [-16, 0, -34]];
		for (var i = 0; i < spots.length; i++) {
			cherries.push({ x: spots[i][0] * 0.9, y: 224 + 8, z: spots[i][2] * 0.9, rad: 9 });
		}
	})();

	// ---- 光照 --------------------------------------------------------------
	// 主光从左上前方来；三根蜡烛各算一盏暖色点光，会真的把蛋糕照亮。
	var KEY = (function () {
		var x = -0.46, y = 0.54, z = -0.70;
		var l = Math.sqrt(x * x + y * y + z * z);
		return { x: x / l, y: y / l, z: z / l };
	})();
	// 半程向量（主光 + 视线 (0,0,-1)），算高光用
	var HALF = (function () {
		var x = KEY.x, y = KEY.y, z = KEY.z - 1;
		var l = Math.sqrt(x * x + y * y + z * z) || 1;
		return { x: x / l, y: y / l, z: z / l };
	})();

	function clamp255(v) { return v < 0 ? 0 : (v > 255 ? 255 : Math.round(v)); }

	function rgbOf(hex) {
		return [
			parseInt(hex.substr(1, 2), 16),
			parseInt(hex.substr(3, 2), 16),
			parseInt(hex.substr(5, 2), 16)
		];
	}

	// 简单的线性明暗，留给蜡烛 / 奶油球 / 樱桃这些小件
	function shade(hex, k) {
		var c = rgbOf(hex);
		return 'rgb(' + clamp255(c[0] * k) + ',' + clamp255(c[1] * k) + ',' + clamp255(c[2] * k) + ')';
	}

	// 完整着色：主光漫反射 + 三盏烛光 + 高光 + 压暗系数
	function lightFace(hex, px, py, pz, nx, ny, nz, opt) {
		opt = opt || {};
		var c = rgbOf(hex);

		var lam = nx * KEY.x + ny * KEY.y + nz * KEY.z;
		if (lam < 0) lam = 0;
		var k = 0.40 + 0.58 * lam;   // 上限 0.98，不发白；发白只留给高光和烛光

		// 烛光：逐盏算 距离衰减 × 法线朝向
		var warm = 0;
		for (var i = 0; i < candles.length; i++) {
			var cd = candles[i];
			if (cd.alive <= 0.01) continue;
			var lx = Math.cos(cd.a) * CANDLE_R - px;
			var ly = CANDLE_Y1 - py;
			var lz = Math.sin(cd.a) * CANDLE_R - pz;
			var d2 = lx * lx + ly * ly + lz * lz;
			var d = Math.sqrt(d2) || 1;
			var ndl = (nx * lx + ny * ly + nz * lz) / d;
			if (ndl <= 0) continue;
			warm += ndl * cd.alive / (1 + d2 / 13000);
		}

		// 高光
		var sp = 0;
		if (opt.spec) {
			var sd = nx * HALF.x + ny * HALF.y + nz * HALF.z;
			if (sd > 0) sp = Math.pow(sd, opt.shin || 20) * opt.spec;
		}

		var dim = opt.dim == null ? 1 : opt.dim;

		var r = (c[0] * k + 152 * warm) * dim + 255 * sp;
		var g = (c[1] * k + 98 * warm) * dim + 248 * sp;
		var b = (c[2] * k + 46 * warm) * dim + 232 * sp;

		return 'rgb(' + clamp255(r) + ',' + clamp255(g) + ',' + clamp255(b) + ')';
	}

	/* ---------------------------------------------------------------------
	   粒子：烟 / 烟花
	   --------------------------------------------------------------------- */
	var smoke = [];
	var fireParticles = [];
	var rockets = [];
	var flash = 0;
	var cakeSquash = 0;      // 点蛋糕时的弹性形变 0→1，自然衰减

	function relayoutSmoke() { /* 烟是屏幕空间粒子，换尺寸无需重建 */ }

	function spawnSmoke(x, y) {
		for (var i = 0; i < (isMobile ? 6 : 10); i++) {
			smoke.push({
				x: x + (Math.random() - 0.5) * 8,
				y: y,
				vx: (Math.random() - 0.5) * 26,
				vy: -26 - Math.random() * 34,
				r: 3 + Math.random() * 5,
				life: 1,
				decay: 0.5 + Math.random() * 0.45
			});
		}
	}

	function updateSmoke(dt) {
		for (var i = smoke.length - 1; i >= 0; i--) {
			var p = smoke[i];
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.vx *= 0.97;
			p.vy = p.vy * 0.985 - 6 * dt;
			p.r += 16 * dt;
			p.life -= p.decay * dt;
			if (p.life <= 0) smoke.splice(i, 1);
		}
	}

	function drawSmoke() {
		for (var i = 0; i < smoke.length; i++) {
			var p = smoke[i];
			var a = Math.max(0, p.life) * 0.30;
			var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
			g.addColorStop(0, 'rgba(226,220,235,' + a + ')');
			g.addColorStop(1, 'rgba(160,150,180,0)');
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.r, 0, TAU);
			ctx.fill();
		}
	}

	// ---- mua~ 弹幕彩蛋 ----
	// 吹灭蜡烛那一刻从蛋糕上方冒出来，往上飘、旋转、淡出
	var muaTexts = [];
	var MUA_WORDS = ['mua~', 'mua~', 'mua~', 'mua~❤', 'muamuamua~'];

	function spawnMua(x, y) {
		var word = MUA_WORDS[(Math.random() * MUA_WORDS.length) | 0];
		muaTexts.push({
			x: x + (Math.random() - 0.5) * (isMobile ? 120 : 190),
			y: y + (Math.random() - 0.5) * 46,
			vx: (Math.random() - 0.5) * 34,
			vy: -50 - Math.random() * 42,
			life: 1,
			decay: 0.34 + Math.random() * 0.2,
			size: (isMobile ? 14 : 17) + Math.random() * 13,
			rot: (Math.random() - 0.5) * 0.5,
			spin: (Math.random() - 0.5) * 0.7,
			hue: 328 + Math.random() * 26,
			word: word
		});
		// 上限保护：连点也不让粒子无限堆
		if (muaTexts.length > 40) muaTexts.shift();
	}

	// 从蛋糕顶上方冒
	function spawnMuaAtCake() {
		var yOff = -110 * (1 - easeOutCubic(cakeRise));
		var p = project(0, CAKE_TOP_Y + yOff, 0);
		spawnMua(p.x, p.y);
	}

	function updateMua(dt) {
		for (var i = muaTexts.length - 1; i >= 0; i--) {
			var m = muaTexts[i];
			m.x += m.vx * dt;
			m.y += m.vy * dt;
			m.vy += 26 * dt;          // 上升慢慢减速
			m.vx *= 0.986;
			m.rot += m.spin * dt;
			m.life -= m.decay * dt;
			if (m.life <= 0) muaTexts.splice(i, 1);
		}
	}

	function drawMua() {
		if (!muaTexts.length) return;
		ctx.save();
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.shadowColor = 'rgba(255, 107, 157, 0.85)';
		for (var i = 0; i < muaTexts.length; i++) {
			var m = muaTexts[i];
			var a = Math.max(0, m.life);
			ctx.globalAlpha = a;
			ctx.shadowBlur = 16 * a;
			ctx.fillStyle = 'hsl(' + m.hue + ',92%,80%)';
			ctx.font = '700 ' + m.size.toFixed(1) + 'px "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
			ctx.translate(m.x, m.y);
			ctx.rotate(m.rot);
			ctx.fillText(m.word, 0, 0);
			ctx.rotate(-m.rot);
			ctx.translate(-m.x, -m.y);
		}
		ctx.restore();
	}

	function launchRocket() {
		var hue = [335, 45, 285, 190, 20][Math.floor(Math.random() * 5)];
		rockets.push({
			x: W * (0.12 + Math.random() * 0.76),
			y: H + 20,
			targetY: H * (0.08 + Math.random() * 0.34),
			vy: -(H * 0.62 + Math.random() * H * 0.2),
			hue: hue
		});
	}

	function explode(x, y, hue) {
		var n = isMobile ? 46 : 80;
		var power = (isMobile ? 130 : 210) * (0.7 + Math.random() * 0.6);
		for (var i = 0; i < n; i++) {
			var a = Math.random() * TAU;
			var sp = power * (0.35 + Math.random() * 0.85);
			fireParticles.push({
				x: x, y: y,
				vx: Math.cos(a) * sp,
				vy: Math.sin(a) * sp,
				life: 1,
				decay: 0.42 + Math.random() * 0.45,
				hue: hue + (Math.random() - 0.5) * 40,
				r: 1.4 + Math.random() * 1.6
			});
		}
		flash = Math.min(1, flash + 0.5);
	}

	function updateFire(dt) {
		for (var i = rockets.length - 1; i >= 0; i--) {
			var r = rockets[i];
			r.y += r.vy * dt;
			r.vy += 340 * dt;
			if (r.y <= r.targetY || r.vy > -30) {
				explode(r.x, r.y, r.hue);
				rockets.splice(i, 1);
			}
		}
		for (var j = fireParticles.length - 1; j >= 0; j--) {
			var p = fireParticles[j];
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.vy += 190 * dt;
			p.vx *= 0.985;
			p.vy *= 0.985;
			p.life -= p.decay * dt;
			if (p.life <= 0) fireParticles.splice(j, 1);
		}
		flash *= 0.90;
		if (cakeSquash > 0) cakeSquash = Math.max(0, cakeSquash - dt * 3.4);
	}

	function drawFire() {
		ctx.globalCompositeOperation = 'lighter';

		for (var i = 0; i < rockets.length; i++) {
			var r = rockets[i];
			var g = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 14);
			g.addColorStop(0, 'hsla(' + r.hue + ',100%,90%,0.95)');
			g.addColorStop(1, 'hsla(' + r.hue + ',100%,70%,0)');
			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.arc(r.x, r.y, 14, 0, TAU);
			ctx.fill();
		}

		for (var j = 0; j < fireParticles.length; j++) {
			var p = fireParticles[j];
			var a = Math.max(0, p.life);
			ctx.fillStyle = 'hsla(' + p.hue + ',100%,' + (62 + 30 * a) + '%,' + (a * 0.95) + ')';
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.r * (0.5 + a), 0, TAU);
			ctx.fill();
		}

		if (flash > 0.01) {
			ctx.fillStyle = 'rgba(255,220,235,' + (flash * 0.06) + ')';
			ctx.fillRect(0, 0, W, H);
		}

		ctx.globalCompositeOperation = 'source-over';
	}

	/* ---------------------------------------------------------------------
	   烘焙：蛋糕每帧重建一次面列表（数量小，几十个面，够用）
	   --------------------------------------------------------------------- */
	var cakeRise = 0;          // 0→1 升起进度
	var cakeFade = 1;          // 许愿时压暗

	function projectLayers() {
		var faces = [];
		var SEG = isMobile ? 32 : 52;
		var yOff = -110 * (1 - easeOutCubic(cakeRise));

		var cosY = Math.cos(cam.yaw), sinY = Math.sin(cam.yaw);
		var LX = -0.50, LZ = -0.62;
		var lLen = Math.sqrt(LX * LX + LZ * LZ);
		LX /= lLen; LZ /= lLen;

		for (var li = 0; li < LAYERS.length; li++) {
			var L = LAYERS[li];
			for (var i = 0; i < SEG; i++) {
				var a0 = i / SEG * TAU;
				var a1 = (i + 1) / SEG * TAU;
				var mx = Math.cos((a0 + a1) / 2);
				var mz = Math.sin((a0 + a1) / 2);

				var nx = mx * cosY - mz * sinY;
				var nz = mx * sinY + mz * cosY;

				var x0 = Math.cos(a0) * L.r, z0 = Math.sin(a0) * L.r;
				var x1 = Math.cos(a1) * L.r, z1 = Math.sin(a1) * L.r;

				// 侧面：只画朝向相机的那半个圆柱
				if (nz <= 0.02) {
					var p0 = project(x0, L.y0 + yOff, z0);
					var p1 = project(x1, L.y0 + yOff, z1);
					var p2 = project(x1, L.y1 + yOff, z1);
					var p3 = project(x0, L.y1 + yOff, z0);

					// 面中心（物体空间），烛光要按真实距离算
					var fx = mx * L.r;
					var fz = mz * L.r;
					var fy = (L.y0 + L.y1) / 2;

					// 越靠下越暗；蛋糕层紧贴上方奶油的那一圈压一条接触阴影
					var dim = 0.82 + 0.18 * ((fy - L.y0) / Math.max(1, L.y1 - L.y0));
					var fromTop = L.y1 - fy;
					if (L.kind === 'cake' && fromTop < 16) dim *= 0.70 + 0.30 * (fromTop / 16);

					faces.push({
						z: (p0.z + p1.z + p2.z + p3.z) / 4,
						pts: [p0, p1, p2, p3],
						col: lightFace(L.side, fx, fy, fz, nx, 0, nz, {
							spec: L.kind === 'cream' ? 0.40 : (L.kind === 'plate' ? 0.34 : 0.08),
							shin: L.kind === 'cream' ? 26 : 18,
							dim: dim
						})
					});
				}

				// 顶面：俯视时整圈都要画，不受上面那个剔除影响
				if (cam.pitch < 0) {
					var c0 = project(0, L.y1 + yOff, 0);
					var t1 = project(x0, L.y1 + yOff, z0);
					var t2 = project(x1, L.y1 + yOff, z1);
					faces.push({
						z: (c0.z + t1.z + t2.z) / 3 + 0.5,
						pts: [c0, t1, t2],
						col: lightFace(L.top, mx * L.r * 0.75, L.y1, mz * L.r * 0.75, 0, 1, 0, {
							spec: L.kind === 'cream' ? 0.22 : 0.05,
							shin: 34
						})
					});
				}
			}
		}

		// 蜡烛
		var cSeg = 10;
		for (var ci = 0; ci < candles.length; ci++) {
			var cd = candles[ci];
			var bx = Math.cos(cd.a) * CANDLE_R;
			var bz = Math.sin(cd.a) * CANDLE_R;
			for (var k = 0; k < cSeg; k++) {
				var b0 = k / cSeg * TAU, b1 = (k + 1) / cSeg * TAU;
				var nmx = Math.cos((b0 + b1) / 2), nmz = Math.sin((b0 + b1) / 2);
				var rnx = nmx * cosY - nmz * sinY;
				var rnz = nmx * sinY + nmz * cosY;
				if (rnz > 0.02) continue;

				var q0 = project(bx + Math.cos(b0) * CANDLE_RAD, CANDLE_Y0 + yOff, bz + Math.sin(b0) * CANDLE_RAD);
				var q1 = project(bx + Math.cos(b1) * CANDLE_RAD, CANDLE_Y0 + yOff, bz + Math.sin(b1) * CANDLE_RAD);
				var q2 = project(bx + Math.cos(b1) * CANDLE_RAD, CANDLE_Y1 + yOff, bz + Math.sin(b1) * CANDLE_RAD);
				var q3 = project(bx + Math.cos(b0) * CANDLE_RAD, CANDLE_Y1 + yOff, bz + Math.sin(b0) * CANDLE_RAD);

				var cd2 = rnx * LX + rnz * LZ;
				var cl = 0.55 + 0.55 * Math.max(0, cd2);
				faces.push({ z: (q0.z + q1.z + q2.z + q3.z) / 4, pts: [q0, q1, q2, q3], col: shade(cd.col, cl) });
			}
			// 蜡烛顶面
			if (cam.pitch < 0) {
				var cc = project(bx, CANDLE_Y1 + yOff, bz);
				var cr = CANDLE_RAD * cc.s;
				faces.push({ z: cc.z, pts: null, circle: { x: cc.x, y: cc.y, r: cr }, col: shade(cd.col, 1.1) });
			}
		}

		// 奶油裱花：一圈合成一条路径，一次填充
		for (var ri = 0; ri < creamRings.length; ri++) {
			var R = creamRings[ri];
			var yv = R.y + yOff;
			var balls = [];
			var frontZ = 1e9;

			for (var rk = 0; rk < R.pts.length; rk++) {
				var P = R.pts[rk];
				var ca2 = Math.cos(P.a), sa2 = Math.sin(P.a);
				var rnx = ca2 * cosY - sa2 * sinY;
				var rnz = ca2 * sinY + sa2 * cosY;
				if (rnz > 0.30) continue;               // 背面的不参与

				var pp = project(P.x, yv, P.z);
				balls.push({ x: pp.x, y: pp.y, r: R.rad * pp.s });
				if (pp.z < frontZ) frontZ = pp.z;
			}
			if (balls.length < 4) continue;

			// 整圈统一用一个投影半径，避免相邻球大小不一产生锯齿
			var rr = 0;
			for (var bi = 0; bi < balls.length; bi++) rr += balls[bi].r;
			rr /= balls.length;

			var leftX = balls[0].x, rightX = balls[0].x;
			var leftI = 0, rightI = 0;
			for (var bj = 1; bj < balls.length; bj++) {
				if (balls[bj].x < leftX) { leftX = balls[bj].x; leftI = bj; }
				if (balls[bj].x > rightX) { rightX = balls[bj].x; rightI = bj; }
			}

			// 三段取样算渐变：左端 / 中间 / 右端
			var midI = balls.length >> 1;
			var cL = lightFace(C.cream, 0, R.L.y1, 0, -0.92, 0.28, -0.28, { spec: 0.22, shin: 14 });
			var cM = lightFace(C.cream, 0, R.L.y1, 0, 0.10, 0.36, -0.93, { spec: 0.55, shin: 16 });
			var cR = lightFace(C.cream, 0, R.L.y1, 0, 0.92, 0.28, -0.28, { spec: 0.16, shin: 14 });

			faces.push({
				z: frontZ - 1.2,
				ring: { balls: balls, r: rr, left: leftX, right: rightX },
				ringCols: [cL, cM, cR]
			});
		}

		// 糖粒：沿侧面切向画一小段圆头线
		for (var si = 0; si < sprinkles.length; si++) {
			var S = sprinkles[si];
			var ca = Math.cos(S.a), sa = Math.sin(S.a);
			var snx = ca * cosY - sa * sinY;
			var snz = ca * sinY + sa * cosY;
			if (snz > 0.02) continue;                 // 背面的不画

			var ax = ca * S.r, az = sa * S.r;
			var e1 = project(ax, S.y + yOff, az);
			var e2 = project(ax - sa * S.len, S.y + yOff, az + ca * S.len);
			faces.push({
				z: e1.z - 0.35,
				seg: { x1: e1.x, y1: e1.y, x2: e2.x, y2: e2.y, w: Math.max(1.1, 1.25 * e1.s) },
				col: S.col
			});
		}

		faces.sort(function (a, b) { return b.z - a.z; });
		return faces;
	}

	function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

	function drawCake() {
		if (cakeRise <= 0.001) return;

		var base = project(0, CAKE_BOT_Y, 0);

		// 点一下蛋糕，整块以底部为原点做一次横向拉宽 / 纵向压扁的弹性形变
		ctx.save();
		if (cakeSquash > 0.001) {
			var sq = cakeSquash;
			ctx.translate(base.x, base.y);
			ctx.scale(1 + sq * 0.05, 1 - sq * 0.05);
			ctx.translate(-base.x, -base.y);
		}

		var shR = 176 * base.s;
		var sg = ctx.createRadialGradient(base.x, base.y, 0, base.x, base.y, shR);
		sg.addColorStop(0, 'rgba(0,0,0,0.55)');
		sg.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.save();
		ctx.globalAlpha = cakeRise * cakeFade;
		ctx.fillStyle = sg;
		ctx.beginPath();
		ctx.ellipse(base.x, base.y + 6, shR, shR * 0.30, 0, 0, TAU);
		ctx.fill();
		ctx.restore();

		var faces = projectLayers();

		ctx.save();
		ctx.globalAlpha = cakeRise;
		ctx.lineCap = 'round';

		for (var i = 0; i < faces.length; i++) {
			var f = faces[i];
			if (f.ring) {
				var g = f.ring;
				var lg = ctx.createLinearGradient(g.left, 0, g.right, 0);
				lg.addColorStop(0, f.ringCols[0]);
				lg.addColorStop(0.5, f.ringCols[1]);
				lg.addColorStop(1, f.ringCols[2]);
				ctx.fillStyle = lg;
				ctx.beginPath();
				for (var bq = 0; bq < g.balls.length; bq++) {
					var bl = g.balls[bq];
					ctx.moveTo(bl.x + g.r, bl.y);
					ctx.arc(bl.x, bl.y, g.r, 0, TAU);
				}
				ctx.fill();
			} else if (f.ball) {
				ctx.fillStyle = f.col;
				ctx.beginPath();
				ctx.arc(f.ball.x, f.ball.y, f.ball.r, 0, TAU);
				ctx.fill();
				ctx.fillStyle = 'rgba(255,255,255,0.52)';
				ctx.beginPath();
				ctx.arc(f.ball.hx, f.ball.hy, f.ball.hr, 0, TAU);
				ctx.fill();
			} else if (f.seg) {
				ctx.strokeStyle = f.col;
				ctx.lineWidth = f.seg.w;
				ctx.beginPath();
				ctx.moveTo(f.seg.x1, f.seg.y1);
				ctx.lineTo(f.seg.x2, f.seg.y2);
				ctx.stroke();
			} else if (f.circle) {
				ctx.fillStyle = f.grad || f.col;
				ctx.beginPath();
				ctx.arc(f.circle.x, f.circle.y, Math.max(0.6, f.circle.r), 0, TAU);
				ctx.fill();
			} else {
				var pts = f.pts;
				ctx.fillStyle = f.col;
				ctx.strokeStyle = f.col;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(pts[0].x, pts[0].y);
				for (var j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
		}
		ctx.restore();
		ctx.restore();   // 收掉开头那层形变变换
	}

	/* ---------------------------------------------------------------------
	   火焰
	   --------------------------------------------------------------------- */
	function drawFlames() {
		if (cakeRise <= 0.2) return;
		var yOff = -110 * (1 - easeOutCubic(cakeRise));
		ctx.save();
		ctx.globalCompositeOperation = 'lighter';
		ctx.globalAlpha = cakeRise;

		for (var i = 0; i < candles.length; i++) {
			var cd = candles[i];
			if (cd.alive <= 0.01) continue;

			var bx = Math.cos(cd.a) * CANDLE_R;
			var bz = Math.sin(cd.a) * CANDLE_R;
			var top = project(bx, CANDLE_Y1 + yOff, bz);
			var sc = top.s * 26;
			var flick = 0.86 + 0.14 * Math.sin(T * 13 + i * 2.1) + 0.06 * Math.sin(T * 27 + i);
			var h = sc * 1.5 * flick * cd.alive;
			var w = sc * 0.42 * (0.9 + 0.1 * flick) * (0.5 + 0.5 * cd.alive);

			var g0 = ctx.createRadialGradient(top.x, top.y - h * 0.45, 0, top.x, top.y - h * 0.45, w * 6.5);
			g0.addColorStop(0, 'rgba(255,190,90,' + (0.30 * cd.alive) + ')');
			g0.addColorStop(1, 'rgba(255,120,0,0)');
			ctx.fillStyle = g0;
			ctx.beginPath();
			ctx.arc(top.x, top.y - h * 0.45, w * 6.5, 0, TAU);
			ctx.fill();

			var g1 = ctx.createRadialGradient(top.x, top.y - h * 0.55, 0, top.x, top.y - h * 0.35, h * 0.95);
			g1.addColorStop(0, 'rgba(255,255,235,' + (0.95 * cd.alive) + ')');
			g1.addColorStop(0.32, 'rgba(255,212,96,' + (0.90 * cd.alive) + ')');
			g1.addColorStop(0.72, 'rgba(255,132,26,' + (0.55 * cd.alive) + ')');
			g1.addColorStop(1, 'rgba(255,80,0,0)');
			ctx.fillStyle = g1;
			ctx.beginPath();
			ctx.moveTo(top.x, top.y - h * 1.42);
			ctx.bezierCurveTo(top.x + w, top.y - h * 0.86, top.x + w * 0.72, top.y, top.x, top.y);
			ctx.bezierCurveTo(top.x - w * 0.72, top.y, top.x - w, top.y - h * 0.86, top.x, top.y - h * 1.42);
			ctx.fill();

			// 烛芯根部亮点
			ctx.fillStyle = 'rgba(255,255,255,' + (0.55 * cd.alive) + ')';
			ctx.beginPath();
			ctx.arc(top.x, top.y - h * 0.1, Math.max(1, w * 0.28), 0, TAU);
			ctx.fill();
		}
		ctx.restore();
	}

	/* ---------------------------------------------------------------------
	   音效：Web Audio 合成，不加载任何外部文件
	   --------------------------------------------------------------------- */
	var audioCtx = null;

	function ensureAudio() {
		if (audioCtx) return audioCtx;
		var AC = window.AudioContext || window.webkitAudioContext;
		if (!AC) return null;
		try { audioCtx = new AC(); } catch (e) { audioCtx = null; }
		return audioCtx;
	}

	function chime() {
		var ac = ensureAudio();
		if (!ac) return;
		if (ac.state === 'suspended') ac.resume();
		var now = ac.currentTime;
		var notes = [880, 1108.73, 1318.51, 1760];
		for (var i = 0; i < notes.length; i++) {
			var d = [0, 0.13, 0.27, 0.46][i];
			var o = ac.createOscillator();
			var g = ac.createGain();
			o.type = 'sine';
			o.frequency.value = notes[i];
			g.gain.setValueAtTime(0.0001, now + d);
			g.gain.linearRampToValueAtTime(0.16, now + d + 0.012);
			g.gain.exponentialRampToValueAtTime(0.0001, now + d + 1.7);
			o.connect(g);
			g.connect(ac.destination);
			o.start(now + d);
			o.stop(now + d + 1.8);
		}
	}

	function puff() {
		var ac = ensureAudio();
		if (!ac) return;
		if (ac.state === 'suspended') ac.resume();
		var now = ac.currentTime;
		var len = Math.floor(ac.sampleRate * 0.5);
		var buf = ac.createBuffer(1, len, ac.sampleRate);
		var d = buf.getChannelData(0);
		for (var i = 0; i < len; i++) {
			d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
		}
		var src = ac.createBufferSource();
		src.buffer = buf;
		var lp = ac.createBiquadFilter();
		lp.type = 'lowpass';
		lp.frequency.setValueAtTime(1400, now);
		lp.frequency.exponentialRampToValueAtTime(220, now + 0.5);
		var g = ac.createGain();
		g.gain.setValueAtTime(0.22, now);
		g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
		src.connect(lp); lp.connect(g); g.connect(ac.destination);
		src.start(now);
	}

	/* ---------------------------------------------------------------------
	   背景音乐：两条轨，交叉淡入

	     叙事九幕  → music/story.mp3         （轻音乐，垫情绪）
	     蛋糕互动  → music/happy-birthday.mp3（生日歌，进正片才起）

	   两个都自己托管在 music/ 下，不发任何外部请求。
	   合成版（Web Audio）留作生日歌的兜底。

	   ★ 叙事音乐走 Web Audio，加载即出声（真正的自动播放）：
	     <audio> 元素的 autoplay 策略连 muted 都拦（新 profile / 部分 WebView），
	     但 AudioContext 无手势即可 running。所以叙事那条轨改成
	     fetch(mp3) → decodeAudioData → AudioBufferSourceNode，
	     页面加载那一刻就开始放，不需要任何点击。

	   ★ 生日歌仍走 <audio>（外链无 CORS 不能 fetch 进 Web Audio）：
	     它在 80 秒后才出场，那时手势早已发生，unlockAudio() 已摘过 muted。

	   ♪ 按钮对两条通道都有效：Web Audio 走总线增益，<audio> 走 volume。
	   --------------------------------------------------------------------- */
	// ★ 本地优先：叙事音乐直接用仓库里的文件，不发任何外部请求。
	//   之前主源挂的是 netlify 直链，国内时通时不通，而且请求挂起时既不返回
	//   也不触发 error，导致「等线上 → 等不到 → 本地兜底永远不执行」= 没声音。
	var BGM_STORY_URL = 'music/story.mp3';
	// 想换回线上：把上面那行换成下面这条即可（默认不走）
	// var BGM_STORY_URL = 'https://friendly-paprenjak-ad64b7.netlify.app/music/bgMusic.mp3';
	var BGM_STORY_URL_FALLBACK = '';   // 本地为主，不再需要远程兜底
	var BGM_STORY_VOLUME = 0.50;
	var BGM_STORY_OFFSET = 0;     // 从第几秒开始播，默认从头

	var BGM_URL = 'music/happy-birthday.mp3';
	var BGM_TRACK_VOLUME = 0.45;    // 外部音源音量（0~1）

	var BGM_LEVEL = 0.45;       // 合成版整体音量（嫌吵就往下调，0.2 很轻，0.8 很响）
	var BGM_BEAT = 0.46;        // 一拍秒数
	var BGM_GAP = 1.2;          // 每遍之间的留白

	// [MIDI 音高, 拍数, 力度]
	var BGM_MELODY = [
		67, 0.45, 0.50, 67, 0.45, 0.50, 69, 0.90, 0.55, 67, 0.90, 0.55, 72, 0.90, 0.60, 71, 1.80, 0.60,
		67, 0.45, 0.50, 67, 0.45, 0.50, 69, 0.90, 0.55, 67, 0.90, 0.55, 74, 0.90, 0.60, 72, 1.80, 0.60,
		67, 0.45, 0.50, 67, 0.45, 0.50, 79, 0.90, 0.62, 76, 0.90, 0.58, 72, 0.90, 0.56, 74, 0.45, 0.52, 72, 1.50, 0.58,
		77, 0.45, 0.52, 77, 0.45, 0.52, 76, 0.90, 0.55, 72, 0.90, 0.55, 74, 0.90, 0.56, 72, 2.40, 0.60
	];
	// 每句下方的低音铺底 [MIDI, 拍数]
	var BGM_BASS = [
		48, 5.40,
		43, 5.40,
		48, 5.55,
		41, 6.00
	];

	var bgmBus = null;
	var bgmOn = true;
	var bgmStarted = false;
	var bgmTimer = null;
	var bgmNext = 0;
	var bgmEl = null;           // 生日歌 <audio>
	var storyEl = null;         // 叙事音乐 <audio>
	var storyActive = false;    // 叙事幕还在放，用来算静音恢复时的目标音量
	var bdayActive = false;     // 生日歌已经接管
	var bgmUnlocked = false;    // 是否已经摘掉 muted 放过声

	// ---- 叙事音乐的 Web Audio 通道 ----
	var storyStartedAt = 0;    // ctx.currentTime 起播时刻
	var storyOffset = 0;       // 起播时落在文件内的秒数
	var bgmBtn = document.getElementById('bgmBtn');

	function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

	function bgmBusInit() {
		var ac = ensureAudio();
		if (!ac) return null;
		if (!bgmBus) {
			var lp = ac.createBiquadFilter();
			lp.type = 'lowpass';
			lp.frequency.value = 4200;
			bgmBus = ac.createGain();
			bgmBus.gain.value = 0.0001;
			bgmBus.connect(lp);
			lp.connect(ac.destination);
		}
		return bgmBus;
	}

	// 一个音符 = 基频正弦 + 二次谐波 + 三次谐波，指数衰减，做出音乐盒的颗粒感
	function bgmNote(midi, at, beats, vel) {
		var ac = audioCtx;
		if (!ac || !bgmBus) return;
		var f = midiToFreq(midi);
		var dur = Math.max(0.5, beats * BGM_BEAT * 0.95);

		var g = ac.createGain();
		g.connect(bgmBus);

		var parts = [[1, 'sine', 1.0], [2.002, 'sine', 0.26], [3.01, 'triangle', 0.08]];
		var oscs = [];
		for (var i = 0; i < parts.length; i++) {
			var o = ac.createOscillator();
			o.type = parts[i][1];
			o.frequency.value = f * parts[i][0];
			var pg = ac.createGain();
			pg.gain.value = parts[i][2];
			o.connect(pg);
			pg.connect(g);
			oscs.push(o);
		}

		g.gain.setValueAtTime(0.0001, at);
		g.gain.linearRampToValueAtTime(vel * 0.5, at + 0.008);
		g.gain.exponentialRampToValueAtTime(0.0001, at + 0.008 + dur + 0.55);

		var end = at + 0.008 + dur + 0.6;
		for (var k = 0; k < oscs.length; k++) {
			oscs[k].start(at);
			oscs[k].stop(end);
		}
	}

	function bgmPad(midi, at, beats, vel) {
		var ac = audioCtx;
		if (!ac || !bgmBus) return;
		var o = ac.createOscillator();
		o.type = 'sine';
		o.frequency.value = midiToFreq(midi);
		var g = ac.createGain();
		o.connect(g);
		g.connect(bgmBus);
		var dur = beats * BGM_BEAT;
		g.gain.setValueAtTime(0.0001, at);
		g.gain.linearRampToValueAtTime(vel, at + 0.12);
		g.gain.setTargetAtTime(0.0001, at + dur * 0.8, 0.3);
		o.start(at);
		o.stop(at + dur + 1.4);
	}

	// 排一遍完整旋律，返回这一遍结束的时刻
	function bgmScheduleLoop(at) {
		var t = at;
		for (var i = 0; i < BGM_MELODY.length; i += 3) {
			bgmNote(BGM_MELODY[i], t, BGM_MELODY[i + 1], BGM_MELODY[i + 2]);
			t += BGM_MELODY[i + 1] * BGM_BEAT;
		}
		var bt = at;
		for (var j = 0; j < BGM_BASS.length; j += 2) {
			bgmPad(BGM_BASS[j], bt, BGM_BASS[j + 1], 0.22);
			bt += BGM_BASS[j + 1] * BGM_BEAT;
		}
		return at + (t - at) + BGM_GAP;
	}

	function bgmPump() {
		var ac = audioCtx;
		if (!ac || !bgmStarted) return;
		if (bgmNext < ac.currentTime + 0.2) bgmNext = ac.currentTime + 0.2;
		var guard = 0;
		while (bgmNext < ac.currentTime + 2.0 && guard++ < 8) {
			bgmNext = bgmScheduleLoop(bgmNext);
		}
	}

	function bgmApplyGain(on) {
		if (!bgmBus || !audioCtx) return;
		var now = audioCtx.currentTime;
		var g = bgmBus.gain;
		g.cancelScheduledValues(now);
		g.setValueAtTime(g.value, now);
		g.linearRampToValueAtTime(on ? BGM_LEVEL : 0.0001, now + 0.3);
	}

	// 音频：love/ 站点同款，<audio autoplay loop preload> + JSBridge + click 补播
	function makeTrack(url) {
		var el = new Audio();
		el.preload = 'auto';
		el.loop = true;
		el.volume = 0;
		el.src = url;
		return el;
	}

	function preloadTracks() {
		// <audio autoplay loop> 已写在 HTML 里，浏览器自己尝试自动播；
		// 被拦了也没事：WeixinJSBridgeReady / document click 会补 play()。
		if (!storyEl) {
			storyEl = document.getElementById('storyMusic');
			storyEl.dataset.ready = 'loading';
			storyEl.addEventListener('canplaythrough', function () { storyEl.dataset.ready = 'ready'; });
			storyEl.addEventListener('error', function () { storyEl.dataset.ready = 'error'; });
		}
		if (!bgmEl) {
			bgmEl = makeTrack(BGM_URL);
			bgmEl.dataset.ready = 'loading';
			bgmEl.addEventListener('canplaythrough', function () { bgmEl.dataset.ready = 'ready'; });
			bgmEl.addEventListener('error', function () { bgmEl.dataset.ready = 'error'; });
			bgmEl.load();
		}
	}

	function bgmStartStory() {
		var ac = ensureAudio();
		if (ac && ac.state === 'suspended') ac.resume();
		unlockAudio();
	}

	function bgmSwitchToBirthday() {
		storyActive = false;
		bdayActive = true;
		if (storyEl) storyEl.pause();
		if (bgmEl) {
			try { bgmEl.currentTime = 0; } catch (e) { }
			bgmEl.volume = BGM_TRACK_VOLUME;
			bgmEl.play().catch(function () { });
		}
		syncBgmBtn();
	}

	// ---- 顶部提示：只在「确实没声」时出现 ----
	var musicHint = document.getElementById('musicHint');
	var musicHintTimer = null;

	function showMusicHint(on) {
		if (musicHint) musicHint.classList.toggle('on', !!on);
	}

	// 音乐真的在响（未静音、未暂停、有进度）才算有声音
	function musicAlive() {
		if (!storyEl) return false;
		if (storyEl.paused || storyEl.muted) return false;
		return storyEl.currentTime > 0.15;
	}

	function checkMusicHint(delay) {
		clearTimeout(musicHintTimer);
		musicHintTimer = setTimeout(function () {
			showMusicHint(!musicAlive());
		}, delay == null ? 0 : delay);
	}

	function setupMusicHint() {
		if (!musicHint) return;

		// 播起来了就自动收起
		if (storyEl) {
			storyEl.addEventListener('playing', function () { showMusicHint(false); });
		}

		// 点提示 = 强推播放 + 顺手把开场封面推掉，直接进内容
		musicHint.addEventListener('click', function (e) {
			e.stopPropagation();
			e.preventDefault();
			unlockAudio();
			if (storyEl && storyEl.paused) {
				storyEl.muted = false;
				storyEl.volume = BGM_STORY_VOLUME;
				storyEl.play().catch(function () { });
			}
			var sp = document.getElementById('splash');
			if (sp && !sp.classList.contains('gone')) {
				sp.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
			}
			setTimeout(function () { checkMusicHint(0); }, 600);
		});

		// 加载完等自动播放结果出来再判断（太早会误报）
		checkMusicHint(2600);
	}

	function armAudioUnlock() {
		['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
			document.addEventListener(ev, unlockAudio, true);
		});
		// 微信 webview：JSBridge 就绪即放声（love/ 同款）
		document.addEventListener('WeixinJSBridgeReady', function () {
			if (bgmUnlocked) return;
			bgmUnlocked = true;
			storyActive = true;
			if (storyEl) { storyEl.muted = false; storyEl.volume = BGM_STORY_VOLUME; storyEl.play().catch(function () { }); }
			syncBgmBtn();
		});
	}

	function unlockAudio() {
		if (bgmUnlocked) return;
		bgmUnlocked = true;
		['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
			document.removeEventListener(ev, unlockAudio, true);
		});
		storyActive = true;
		if (storyEl) {
			storyEl.muted = false;
			storyEl.volume = BGM_STORY_VOLUME;
			var p = storyEl.play();
			if (p && p.catch) p.catch(function () {
				// 被拦就重试一次
				setTimeout(function () { storyEl.play().catch(function () { }); }, 200);
			});
		}
		if (bgmEl) {
			bgmEl.volume = 0;
			bgmEl.play().catch(function () { });
		}
		syncBgmBtn();
	}

	function trackStatus() {
		return {
			story: storyEl ? (storyEl.paused ? 'paused' : 'playing') : 'none',
			storyTime: storyEl ? +storyEl.currentTime.toFixed(1) : 0,
			birthday: bgmEl ? bgmEl.dataset.ready : 'none'
		};
	}

	function syncBgmBtn() {
		bgmBtn.textContent = bgmOn ? '♪' : '🔇';
		bgmBtn.classList.toggle('on', bgmOn && (storyActive || bdayActive || bgmStarted));
		bgmBtn.classList.toggle('off', !bgmOn);
	}

	function applyBgmUi() {
		if (storyEl) {
			storyEl.muted = !bgmOn;
			storyEl.volume = bgmOn ? BGM_STORY_VOLUME : 0;
		}
		if (bgmEl) {
			bgmEl.muted = !bgmOn;
			bgmEl.volume = (bgmOn && bdayActive) ? BGM_TRACK_VOLUME : 0;
		}
		bgmApplyGain(bgmOn);
		syncBgmBtn();
	}

	// 只负责扬声器按钮。真正的起播由 story.js 在轻触那一帧调 __bgmStartStory()
	function armBgm() {
		applyBgmUi();

		bgmBtn.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
		bgmBtn.addEventListener('click', function (e) {
			e.stopPropagation();
			bgmOn = !bgmOn;
			applyBgmUi();
		});
	}

	/* ---------------------------------------------------------------------
	   吹气检测：麦克风真吹（需 https / localhost）＋ 长按降级
	   --------------------------------------------------------------------- */
	var blow = 0;               // 0→1 进度
	var micReady = false;
	var micStream = null;
	var analyser = null;
	var freqBuf = null;
	var timeBuf = null;
	var holding = false;
	var micLevel = 0;

	var meterEl = document.getElementById('meter');
	var meterFill = document.getElementById('meterFill');
	var hintEl = document.getElementById('hint');
	var actionsEl = document.getElementById('actions');
	var captionEl = document.getElementById('caption');
	var againEl = document.getElementById('againBtn');

	function updateMeter(v) {
		meterFill.style.width = Math.min(100, v * 100) + '%';
	}

	async function startMic() {
		if (micReady) return true;
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
		try {
			micStream = await navigator.mediaDevices.getUserMedia({
				audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
			});
		} catch (e) {
			return false;
		}
		var ac = ensureAudio();
		if (!ac) return false;
		if (ac.state === 'suspended') await ac.resume();

		var src = ac.createMediaStreamSource(micStream);
		analyser = ac.createAnalyser();
		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = 0.6;
		src.connect(analyser);

		freqBuf = new Uint8Array(analyser.frequencyBinCount);
		timeBuf = new Float32Array(analyser.fftSize);
		micReady = true;
		meterEl.classList.add('on');
		return true;
	}

	// 真吹 = 响度够大 + 能量偏低频。纯说话会被低频占比卡掉，避免误触。
	function readMic() {
		if (!micReady) return 0;
		analyser.getFloatTimeDomainData(timeBuf);
		var sum = 0;
		for (var i = 0; i < timeBuf.length; i++) sum += timeBuf[i] * timeBuf[i];
		var rms = Math.sqrt(sum / timeBuf.length);

		analyser.getByteFrequencyData(freqBuf);
		var lowSum = 0, allSum = 0;
		var cutoff = Math.floor(600 / (audioCtx.sampleRate / 2) * freqBuf.length);
		for (var j = 0; j < freqBuf.length; j++) {
			allSum += freqBuf[j];
			if (j < cutoff) lowSum += freqBuf[j];
		}
		var lowRatio = allSum > 0 ? lowSum / allSum : 0;

		var loud = Math.min(1, rms / 0.16);
		micLevel = loud;

		if (rms > 0.030 && lowRatio > 0.42) {
			return Math.min(1, (rms - 0.030) / 0.09);
		}
		return 0;
	}

	function setupControls() {
		// 麦克风按钮可能被注掉（微信里基本拿不到权限），取不到就跳过，不能让整页崩
		var micBtn = document.getElementById('micBtn');
		if (micBtn) micBtn.addEventListener('click', async function (e) {
			var btn = e.currentTarget;
			var ok = await startMic();
			if (ok) {
				btn.classList.add('live');
				btn.textContent = '🎤 麦克风已开，吹吧';
				hintEl.textContent = '用力吹向话筒';
			} else {
				btn.disabled = true;
				btn.textContent = '🎤 麦克风不可用';
				hintEl.textContent = '这台设备拿不到麦克风，用「按住吹」也一样';
			}
		});

		var holdBtn = document.getElementById('holdBtn');
		if (!holdBtn) return;
		var startHold = function (e) {
			e.preventDefault();
			holding = true;
			holdBtn.classList.add('live');
		};
		var endHold = function () {
			holding = false;
			holdBtn.classList.remove('live');
		};
		holdBtn.addEventListener('pointerdown', startHold);
		holdBtn.addEventListener('pointerup', endHold);
		holdBtn.addEventListener('pointerleave', endHold);
		holdBtn.addEventListener('pointercancel', endHold);
	}

	/* ---------------------------------------------------------------------
	   流程控制
	   --------------------------------------------------------------------- */
	function setPhase(p) {
		phase = p;
		tStart = T;

		if (p === 'cake') {
			hintEl.textContent = '吹灭蜡烛，许个愿';
			hintEl.classList.add('on');
			captionEl.classList.remove('on');
			againEl.classList.remove('on');
		}
		if (p === 'wish') {
			hintEl.classList.remove('on');
			actionsEl.classList.remove('on');
			// 进度条只在 cake 幕里更新，切幕后就没人管它了，
			// 会一直亮着满格。这里收掉并归零。
			meterEl.classList.remove('on');
			updateMeter(0);
			setTimeout(function () {
				captionEl.textContent = '愿你所求皆如愿\n所行皆坦途';
				captionEl.classList.add('on');
			}, 900);
			setTimeout(function () { againEl.classList.add('on'); }, 2600);
			chime();
			for (var i = 0; i < 4; i++) {
				setTimeout(launchRocket, i * 260 + Math.random() * 180);
			}
			// mua~ 彩蛋：从蛋糕上方一簇一簇往上冒
			var muaN = isMobile ? 7 : 10;
			for (var k = 0; k < muaN; k++) {
				setTimeout(spawnMuaAtCake, 260 + k * 210 + Math.random() * 140);
			}
			// 隔一秒再来一小撮，别一次放完
			for (var k2 = 0; k2 < 4; k2++) {
				setTimeout(spawnMuaAtCake, 2600 + k2 * 320);
			}
		}
	}

	// 逐根熄灭。门槛必须全部落在 [0,1) 内：blow 被 Math.min(1, ...) 封顶，
	// 早先的 0.34*(i+1) 第三根算出来是 1.02，永远点不着。
	function updateCandles(dt) {
		for (var i = 0; i < candles.length; i++) {
			var cd = candles[i];
			var threshold = 0.30 * (i + 1);          // 0.30 / 0.60 / 0.90
			if (blow >= 1) cd.dying = true;          // 收尾兜底，一根都不许留
			else if (cd.alive > 0 && blow >= threshold) cd.dying = true;

			if (cd.dying && cd.alive > 0) {
				var before = cd.alive;
				cd.alive = Math.max(0, cd.alive - dt * 3.4);
				if (before > 0.5 && cd.alive <= 0.5) {
					var yOff = -110 * (1 - easeOutCubic(cakeRise));
					var top = project(Math.cos(cd.a) * CANDLE_R, CANDLE_Y1 + yOff, Math.sin(cd.a) * CANDLE_R);
					spawnSmoke(top.x, top.y);
					puff();
				}
			}
		}
	}

	function update(dt) {
		if (!started) return;               // 聊天幕还没走完，第三幕不启动
		var el = T - tStart;

		// ---- 第一幕 ----
		if (phase === 'text') {
			// 0→1.6s 聚拢，1.6→3.8s 悬停（这段才是给人看清字的窗口），3.8s 起散开
			if (el > 3.2 && !textDone) {
				textDone = true;
			}
			if (el > 4.4) {
				cakeRise = 0;
				setPhase('cake');
			}
		}

		// ---- 第二幕 ----
		if (phase === 'cake') {
			cakeRise = Math.min(1, cakeRise + dt * 1.15);
			if (cakeRise > 0.55 && el > 0.5) actionsEl.classList.add('on');
			if (cakeRise >= 1 && Math.random() < dt * 6) {
				// 偶尔掉一颗浮尘进蛋糕区，增加空气感
			}
			// 吹气累积
			var power = 0;
			if (micReady) power = Math.max(power, readMic());
			if (holding) power = Math.max(power, 1);
			if (power > 0) {
				blow = Math.min(1, blow + power * dt * 0.9);
				updateMeter(blow);
			} else {
				blow = Math.max(0, blow - dt * 0.5);
				updateMeter(blow);
			}
			meterEl.classList.toggle('on', micReady || holding || blow > 0.02);

			if (blow >= 1) {
				setPhase('wish');
			}
		}

		// ---- 第三幕 ----
		if (phase === 'wish') {
			cakeFade = Math.max(0.55, cakeFade - dt * 0.4);
			if (Math.random() < dt * 0.55) launchRocket();
		}

		// 蜡烛的衰减必须跨幕持续：
		// 吹满那一刻第三根才刚被引燃（门槛 0.90，到 1.0 只剩 0.1 的余量），
		// 同一帧里 setPhase('wish') 切走 phase，若衰减还锁在 cake 幕里，
		// 它就会永久冻在 alive≈0.55，显示成一个「暗下去但没灭」的小火苗。
		if (phase === 'cake' || phase === 'wish') updateCandles(dt);

		// ---- 持续更新 ----
		if (phase !== 'text' || textDone) { /* 无 */ }
		updateTextParticles(dt);
		updateSmoke(dt);
		updateFire(dt);
		updateMua(dt);

		// 蛋糕自转
		if (phase !== 'text') cam.yaw += dt * 0.16;
		cam.pitch = -0.38 + Math.sin(T * 0.6) * 0.035;
	}

	function render() {
		drawStars();
		if (textParticles.length) drawTextParticles();
		drawCake();
		if (phase === 'cake' || phase === 'wish') drawFlames();
		drawSmoke();
		drawFire();
		drawMua();
	}

	function frame(now) {
		requestAnimationFrame(frame);
		var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
		last = now;
		T += dt;
		update(dt);
		render();
	}

	/* ---------------------------------------------------------------------
	   启动
	   --------------------------------------------------------------------- */
	// 第三幕正式开演
	function startShow() {
		if (started) return;
		started = true;
		phase = 'text';
		tStart = T;
		createTextParticles();
		buildTextTargets();
	}

	// 长按「再看一次」→ 跳过 80 秒叙事，直接落到蛋糕幕
	function jumpToCake() {
		started = true;
		textDone = true;
		textParticles.length = 0;
		cakeRise = 0;
		cakeFade = 1;
		blow = 0;
		micLevel = 0;
		smoke.length = 0;
		fireParticles.length = 0;
		rockets.length = 0;
		muaTexts.length = 0;
		flash = 0;
		captionEl.classList.remove('on');
		againEl.classList.remove('on');
		meterEl.classList.remove('on');
		updateMeter(0);
		for (var i = 0; i < candles.length; i++) {
			candles[i].alive = 1;
			candles[i].dying = false;
		}
		setPhase('cake');
	}

	function restart() {
		phase = 'text';
		tStart = T;
		textDone = false;
		cakeRise = 0;
		cakeFade = 1;
		blow = 0;
		micLevel = 0;
		smoke.length = 0;
		fireParticles.length = 0;
		rockets.length = 0;
		muaTexts.length = 0;
		flash = 0;
		captionEl.classList.remove('on');
		againEl.classList.remove('on');
		actionsEl.classList.remove('on');
		hintEl.classList.remove('on');
		meterEl.classList.remove('on');
		updateMeter(0);
		for (var i = 0; i < candles.length; i++) {
			candles[i].alive = 1;
			candles[i].dying = false;
		}
		createTextParticles();
		buildTextTargets();
	}

	function boot() {
		preloadTracks();            // 第一件事：建轨、下载、静音起播
		armAudioUnlock();           // 任意一次交互即放声
		setupMusicHint();           // 没声时顶部给个能点的提示
		layout();
		sampleText();
		setupControls();
		armBgm();
		// 「再看一次」：短按重播，长按 2 秒直接跳蛋糕幕
		var againTimer = null;
		var againLongDone = false;

		againEl.addEventListener('pointerdown', function (e) {
			e.stopPropagation();
			againLongDone = false;
			againEl.classList.add('holding');
			againTimer = setTimeout(function () {
				againLongDone = true;
				againEl.classList.remove('holding');
				jumpToCake();
			}, 2000);
		});

		['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
			againEl.addEventListener(ev, function () {
				clearTimeout(againTimer);
				againEl.classList.remove('holding');
			});
		});

		againEl.addEventListener('click', function (e) {
			e.stopPropagation();
			if (againLongDone) { againLongDone = false; return; }   // 长按已经处理过
			restart();
		});

		// 叙事九幕（story.js）通过这些钩子驱动音频和画布
		window.__startShow = startShow;
		window.__bgmStartStory = bgmStartStory;
		window.__bgmSwitch = bgmSwitchToBirthday;
		// 点蛋糕：它会颤一下（蛋糕幕和许愿幕都有效）
		document.addEventListener('pointerdown', function (e) {
			if (phase !== 'cake' && phase !== 'wish') return;
			if (e.target && e.target.closest && e.target.closest('.bgm, .again, .actions')) return;
			var b = project(0, (CAKE_TOP_Y + CAKE_BOT_Y) / 2, 0);
			var r = (isMobile ? 210 : 300);
			var dx = e.clientX - b.x, dy = e.clientY - b.y;
			if (dx * dx + dy * dy < r * r) cakeSquash = 1;
		}, true);

		// 许愿幕：点哪儿就在哪儿冒一个 mua~（小彩蛋）
		document.addEventListener('pointerdown', function (e) {
			if (phase !== 'wish') return;
			if (e.target && e.target.closest && e.target.closest('.bgm, .again')) return;
			spawnMua(e.clientX, e.clientY);
		}, true);

		window.__trackStatus = trackStatus;

		var onResize = null;
		window.addEventListener('resize', function () {
			clearTimeout(onResize);
			onResize = setTimeout(layout, 120);
		});

		requestAnimationFrame(frame);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', boot);
	} else {
		boot();
	}
})();
