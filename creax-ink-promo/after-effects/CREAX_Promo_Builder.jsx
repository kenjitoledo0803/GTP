/*  CREAX.INK — Promo 9:16 (40 s) · Constructor de proyecto para After Effects
 *  ---------------------------------------------------------------------------
 *  Uso: After Effects > Archivo > Scripts > Ejecutar archivo de script… > este .jsx
 *  (Si AE pide permisos: Preferencias > Scripting y expresiones >
 *   "Permitir que los scripts escriban archivos y accedan a la red".)
 *
 *  Crea:
 *   - Composición principal "CREAX_Promo_9x16" 1080x1920 · 30 fps · 40 s
 *   - 7 precomposiciones (una por bloque del guion) ya colocadas en su tiempo
 *   - Textos con Text Animators (revelado por palabra), easing tipo "expo"
 *   - Marcadores de escena y de beat (120 BPM) para cortar al ritmo
 *   - Capas "[REEMPLAZAR] …" donde van los TRABAJOS REALES de CREAX.INK
 *   - Música (output/creax-ink-music.wav) si existe
 *
 *  Tipografía: Montserrat (gratis en Google Fonts). Instálala antes de correr
 *  el script o AE la reemplazará por otra fuente.
 *
 *  Compatible con ExtendScript (ES3): sin let/const, sin arrow functions,
 *  sin Array.forEach.
 */
(function creaxPromoBuilder() {
    // ------------------------------------------------------------------ config
    var W = 1080, H = 1920, FPS = 30, DUR = 40;
    var BEAT = 0.5; // 120 BPM

    var FONT = {
        black: "Montserrat-Black",
        xbold: "Montserrat-ExtraBold",
        bold: "Montserrat-Bold",
        semi: "Montserrat-SemiBold",
        medium: "Montserrat-Medium",
        light: "Montserrat-Light"
    };

    function hex(h) {
        h = h.replace("#", "");
        return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255];
    }
    var COL = {
        ink: hex("#0B0B0F"), paper: hex("#F7F5F0"), gray: hex("#29292C"), white: [1, 1, 1], black: hex("#111111"),
        plum: hex("#A92987"), pink: hex("#DA387B"), red: hex("#FB254E"), orange: hex("#FF7510"), amber: hex("#FFAD06"),
        sky: hex("#5890FC"), blue: hex("#256FFB"), navy: hex("#0554C8"), teal: hex("#2DC3CF"), mint: hex("#60DDC5"),
        placeholder: hex("#3A3A44")
    };

    // Escenas (inicio, duración) — idénticas al render de referencia
    var SCENES = [
        { id: "01_HOOK", t: 0, d: 4 },
        { id: "02_PROBLEMA", t: 4, d: 4 },
        { id: "03_PRESENTACION", t: 8, d: 5 },
        { id: "04_SERVICIOS", t: 13, d: 11 },
        { id: "05_PROCESO", t: 24, d: 6 },
        { id: "06_RESULTADOS", t: 30, d: 5 },
        { id: "07_CTA", t: 35, d: 5 }
    ];

    var warnings = [];
    function warn(msg) { warnings.push(msg); }

    // ------------------------------------------------------------------ paths
    var scriptFile = new File($.fileName);
    var ROOT = scriptFile.parent.parent; // creax-ink-promo/
    function fileAt(rel) { return new File(ROOT.fsName + "/" + rel); }

    // ------------------------------------------------------------------ helpers
    function setEase(prop, inInf, outInf) {
        // Easing por keyframe (influencia 0-100). Valores altos = llegada suave.
        var dims = 1;
        var vt = prop.propertyValueType;
        if (vt === PropertyValueType.TwoD) dims = 2;
        if (vt === PropertyValueType.ThreeD) dims = 3;
        for (var k = 1; k <= prop.numKeys; k++) {
            var easeIn = [], easeOut = [];
            for (var d = 0; d < dims; d++) {
                easeIn.push(new KeyframeEase(0, inInf));
                easeOut.push(new KeyframeEase(0, outInf));
            }
            try { prop.setTemporalEaseAtKey(k, easeIn, easeOut); } catch (e) { warn("Ease: " + e.toString()); }
        }
    }
    // keys: [[t, v], [t, v], ...]  · ease: "expo" | "smooth" | "linear"
    function anim(prop, keys, ease) {
        for (var i = 0; i < keys.length; i++) prop.setValueAtTime(keys[i][0], keys[i][1]);
        if (ease === "linear") return prop;
        if (ease === "smooth") setEase(prop, 75, 75);
        else setEase(prop, 92, 12); // "expo out": salida rápida, llegada muy suave
        return prop;
    }
    function tr(layer, name) { return layer.property("ADBE Transform Group").property(name); }
    function P(layer) { return tr(layer, "ADBE Position"); }
    function S(layer) { return tr(layer, "ADBE Scale"); }
    function R(layer) { return tr(layer, "ADBE Rotate Z"); }
    function O(layer) { return tr(layer, "ADBE Opacity"); }

    function span(layer, tIn, tOut) {
        layer.inPoint = Math.max(0, tIn);
        layer.outPoint = tOut;
        return layer;
    }

    function addText(comp, str, o) {
        o = o || {};
        var l = comp.layers.addText(str);
        var src = l.property("ADBE Text Properties").property("ADBE Text Document");
        var td = src.value;
        try { td.resetCharStyle(); } catch (e0) { }
        try { td.font = o.font || FONT.black; } catch (e1) { warn("Fuente no encontrada: " + (o.font || FONT.black)); }
        td.fontSize = o.size || 110;
        td.applyFill = true;
        td.fillColor = o.color || COL.white;
        td.applyStroke = false;
        td.tracking = o.tracking || 0;
        td.justification = o.left ? ParagraphJustification.LEFT_JUSTIFY : ParagraphJustification.CENTER_JUSTIFY;
        src.setValue(td);
        l.name = o.name || str;
        P(l).setValue([o.x == null ? W / 2 : o.x, o.y == null ? H / 2 : o.y]);
        if (o.blur !== false) l.motionBlur = true;
        return l;
    }

    // Text Animator: revelado por palabra (posición + opacidad), como "slide up"
    function revealWords(layer, t0, dur, o) {
        o = o || {};
        try {
            var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
            var a = animators.addProperty("ADBE Text Animator");
            a.name = "Revelado";
            var props = a.property("ADBE Text Animator Properties");
            var pos = props.addProperty("ADBE Text Position 3D");
            pos.setValue([0, o.dy == null ? 140 : o.dy, 0]);
            var op = props.addProperty("ADBE Text Opacity");
            op.setValue(0);
            if (o.scale) {
                var sc = props.addProperty("ADBE Text Scale 3D");
                sc.setValue([o.scale, o.scale, 100]);
            }
            var sel = a.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
            var adv = sel.property("ADBE Text Range Advanced");
            adv.property("ADBE Text Range Type2").setValue(o.byChar ? 2 : 3); // 2 = caracteres sin espacios, 3 = palabras
            adv.property("ADBE Text Levels Max Ease").setValue(100);
            adv.property("ADBE Text Levels Min Ease").setValue(0);
            anim(sel.property("ADBE Text Percent Start"), [[t0, 0], [t0 + dur, 100]], "expo");
        } catch (e) {
            warn("Text Animator en '" + layer.name + "': " + e.toString() + " (se usa fundido simple)");
            anim(O(layer), [[t0, 0], [t0 + 0.25, 100]], "smooth");
        }
        return layer;
    }
    function exitUp(layer, t0, dist) {
        var p = P(layer);
        var v = p.valueAtTime(t0, false);
        anim(p, [[t0, v], [t0 + 0.3, [v[0], v[1] - (dist || 160)]]], "linear");
        setEase(p, 10, 90); // "expo in"
        anim(O(layer), [[t0 + 0.1, 100], [t0 + 0.3, 0]], "linear");
        return layer;
    }

    function addShape(comp, name) {
        var l = comp.layers.addShape();
        l.name = name;
        return l;
    }
    function shapeRect(layer, w, h, r, color, stroke) {
        var g = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var v = g.property("ADBE Vectors Group");
        var rc = v.addProperty("ADBE Vector Shape - Rect");
        rc.property("ADBE Vector Rect Size").setValue([w, h]);
        rc.property("ADBE Vector Rect Roundness").setValue(r || 0);
        if (stroke) {
            var s = v.addProperty("ADBE Vector Graphic - Stroke");
            s.property("ADBE Vector Stroke Color").setValue(color);
            s.property("ADBE Vector Stroke Width").setValue(stroke);
        } else {
            var f = v.addProperty("ADBE Vector Graphic - Fill");
            f.property("ADBE Vector Fill Color").setValue(color);
        }
        return g;
    }
    function shapeEllipse(layer, d, color, stroke, trim) {
        var g = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var v = g.property("ADBE Vectors Group");
        var el = v.addProperty("ADBE Vector Shape - Ellipse");
        el.property("ADBE Vector Ellipse Size").setValue([d, d]);
        var t = null;
        if (trim) t = v.addProperty("ADBE Vector Filter - Trim");
        if (stroke) {
            var s = v.addProperty("ADBE Vector Graphic - Stroke");
            s.property("ADBE Vector Stroke Color").setValue(color);
            s.property("ADBE Vector Stroke Width").setValue(stroke);
        } else {
            var f = v.addProperty("ADBE Vector Graphic - Fill");
            f.property("ADBE Vector Fill Color").setValue(color);
        }
        return t;
    }

    // Placeholder de trabajo real (sólido etiquetado + guía de texto)
    function placeholder(comp, label, w, h, x, y, folder) {
        var l = comp.layers.addSolid(COL.placeholder, "[REEMPLAZAR] " + label, w, h, 1);
        l.label = 11; // naranja
        P(l).setValue([x, y]);
        l.motionBlur = true;
        try { if (folder && l.source) l.source.parentFolder = folder; } catch (e) { }
        return l;
    }

    function addImage(comp, item, x, y, scale) {
        if (!item) return null;
        var l = comp.layers.add(item);
        P(l).setValue([x, y]);
        if (scale) S(l).setValue([scale, scale]);
        l.motionBlur = true;
        return l;
    }

    function bg(comp, color, name) {
        var l = comp.layers.addSolid(color, name || "Fondo", W, H, 1);
        l.locked = false;
        return l;
    }
    function addEffect(layer, matchName) {
        try { return layer.property("ADBE Effect Parade").addProperty(matchName); } catch (e) { warn("Efecto " + matchName + ": " + e.toString()); return null; }
    }

    // ------------------------------------------------------------------ proyecto
    app.beginUndoGroup("CREAX.INK Promo Builder");
    if (!app.project) app.newProject();
    var proj = app.project;

    var fRoot = proj.items.addFolder("CREAX.INK Promo");
    var fComps = proj.items.addFolder("01_Composiciones"); fComps.parentFolder = fRoot;
    var fPre = proj.items.addFolder("02_Escenas"); fPre.parentFolder = fRoot;
    var fAssets = proj.items.addFolder("03_Assets"); fAssets.parentFolder = fRoot;
    var fPh = proj.items.addFolder("04_REEMPLAZAR_trabajos_reales"); fPh.parentFolder = fRoot;
    var fSolids = proj.items.addFolder("05_Solidos"); fSolids.parentFolder = fRoot;

    function imp(rel) {
        var f = fileAt(rel);
        if (!f.exists) { warn("No existe: " + rel); return null; }
        try {
            var it = proj.importFile(new ImportOptions(f));
            it.parentFolder = fAssets;
            return it;
        } catch (e) { warn("Importación fallida " + rel + ": " + e.toString()); return null; }
    }
    var A = {
        iso: imp("assets/brand/isotipo.png"),
        wordDark: imp("assets/brand/wordmark-dark.png"),
        wordWhite: imp("assets/brand/wordmark-white.png"),
        tagDark: imp("assets/brand/tagline-dark.png"),
        logo: imp("assets/brand/creax-logo-original.png"),
        music: imp("output/creax-ink-music.wav")
    };

    function newComp(name, d, folder) {
        var c = proj.items.addComp(name, W, H, 1, d, FPS);
        c.parentFolder = folder || fPre;
        c.motionBlur = true;
        c.shutterAngle = 180;
        c.bgColor = COL.ink;
        return c;
    }

    // ================================================================= 01 HOOK
    function buildHook() {
        var c = newComp("01_HOOK", 4);
        bg(c, hex("#060608"), "Negro");

        // Gota de tinta
        var drop = addShape(c, "Gota de tinta");
        shapeEllipse(drop, 44, COL.white);
        anim(P(drop), [[0, [540, 300]], [0.5, [540, 900]]], "linear");
        setEase(P(drop), 10, 10);
        anim(S(drop), [[0, [100, 100]], [0.5, [60, 220]]], "linear");
        span(drop, 0, 0.52);

        // Salpicadura: 4 manchas de color en modo Screen
        var cols = [COL.pink, COL.amber, COL.blue, COL.mint];
        for (var i = 0; i < 4; i++) {
            var b = addShape(c, "Splash " + (i + 1));
            shapeEllipse(b, 860, cols[i]);
            b.blendingMode = BlendingMode.SCREEN;
            var a = -Math.PI / 2 + i * Math.PI / 2 + 0.6;
            P(b).setValue([540 + Math.cos(a) * 110, 900 + Math.sin(a) * 110]);
            var t0 = 0.5 + i * 0.035;
            anim(S(b), [[t0, [0, 0]], [t0 + 0.45, [100, 100]]], "expo");
            S(b).setValueAtTime(0.82 + i * 0.03, [100, 100]);
            S(b).setValueAtTime(1.22 + i * 0.03, [0, 0]);
            var td = addEffect(b, "ADBE Turbulent Displace");
            if (td) { try { td.property(2).setValue(60); td.property(3).setValue(120); } catch (e) { } }
            span(b, 0.5, 1.4);
        }
        // Onda de choque
        var ring = addShape(c, "Onda de choque");
        shapeEllipse(ring, 200, COL.white, 20);
        P(ring).setValue([540, 900]);
        anim(S(ring), [[0.5, [20, 20]], [1.1, [850, 850]]], "expo");
        anim(O(ring), [[0.5, 100], [1.1, 0]], "linear");
        span(ring, 0.5, 1.15);

        // Isotipo
        var iso = addImage(c, A.iso, 540, 900, 15);
        if (iso) {
            iso.name = "Isotipo";
            anim(S(iso), [[0.6, [15, 15]], [1.05, [106, 106]], [1.3, [100, 100]], [1.8, [72, 72]]], "expo");
            anim(R(iso), [[0.6, -160], [1.25, 0]], "expo");
            anim(P(iso), [[1.3, [540, 900]], [1.8, [540, 640]]], "expo");
            anim(O(iso), [[0.6, 0], [0.7, 100], [2.15, 100], [2.4, 0]], "linear");
            span(iso, 0.6, 2.45);
            var glow = addEffect(iso, "ADBE Glo2");
            if (glow) { try { glow.property(3).setValue(60); glow.property(4).setValue(0.4); } catch (e2) { } }
        }

        // Carrusel de trabajos (corte cada 1/8 de compás = 0.25 s)
        var ctrl = c.layers.addNull(4);
        ctrl.name = "CTRL Marco trabajos";
        P(ctrl).setValue([540, 640]);
        anim(S(ctrl), [[2.15, [23, 20]], [2.6, [100, 100]], [3.35, [100, 100]], [3.75, [155, 235]]], "expo");
        anim(P(ctrl), [[3.35, [540, 640]], [3.75, [540, 960]]], "smooth");
        for (var k = 0; k < 6; k++) {
            var ph = placeholder(c, "Hook trabajo 0" + (k + 1) + " (700x820)", 700, 820, 540, 640, fPh);
            ph.parent = ctrl;
            P(ph).setValue([0, 0]);
            span(ph, k === 0 ? 2.15 : 2.25 + k * 0.25, k === 5 ? 4 : 2.5 + k * 0.25);
            anim(S(ph), [[ph.inPoint, [114, 114]], [ph.inPoint + 0.35, [100, 100]]], "expo");
        }
        // Desaturación + tape stop
        var adj = c.layers.addSolid(COL.white, "AJUSTE Desaturar (tape stop)", W, H, 1);
        adj.adjustmentLayer = true;
        var tint = addEffect(adj, "ADBE Tint");
        if (tint) anim(tint.property(3), [[3.55, 0], [3.95, 100]], "smooth");
        span(adj, 3.5, 4);

        // Texto
        var l1 = revealWords(addText(c, "NO SOLO", { y: 1250, size: 128 }), 1.3, 0.45);
        var l2 = revealWords(addText(c, "DISEÑAMOS.", { y: 1388, size: 128 }), 1.45, 0.45);
        exitUp(l1, 2.2); exitUp(l2, 2.25);
        span(l1, 1.3, 2.6); span(l2, 1.45, 2.6);
        var l3 = revealWords(addText(c, "CREAMOS", { y: 1250, size: 128 }), 2.38, 0.4);
        var l4 = revealWords(addText(c, "IDENTIDAD.", { y: 1388, size: 128, color: COL.orange }), 2.5, 0.4);
        exitUp(l3, 3.18); exitUp(l4, 3.22);
        span(l3, 2.38, 3.6); span(l4, 2.5, 3.6);
        return c;
    }

    // ================================================================= 02 PROBLEMA
    function buildProblem() {
        var c = newComp("02_PROBLEMA", 4);
        bg(c, COL.gray, "Gris apagado");
        // Diseños genéricos: animación "stop motion" a 8 fps con expresión
        var items = [
            ["Flyer genérico", 360, 480, 300, 640, -7],
            ["Logo genérico 'Mi Negocio'", 380, 220, 800, 560, 6],
            ["Caja 'TU LOGO AQUÍ'", 230, 230, 790, 920, -4],
            ["Colores que chocan", 340, 80, 310, 1060, 8]
        ];
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            var l = placeholder(c, "Problema — " + it[0], it[1], it[2], it[3], it[4], fPh);
            R(l).setValue(it[5]);
            P(l).expression = "posterizeTime(8);\nvar chaos = 1 + 3*Math.pow(linear(time, 2.9, 3.85, 0, 1), 2);\nvalue + wiggle(2.5, 8*chaos) - value;";
            R(l).expression = "posterizeTime(8);\nvalue + wiggle(2.5, 2) - value;";
            anim(S(l), [[i * 0.08, [0, 0]], [i * 0.08 + 0.25, [100, 100]]], "expo");
        }
        // Desatura sólo los diseños genéricos (la capa de ajuste afecta lo que está debajo)
        var adj = c.layers.addSolid(COL.white, "AJUSTE Desaturado", W, H, 1);
        adj.adjustmentLayer = true;
        var hs = addEffect(adj, "ADBE Tint");
        if (hs) hs.property(3).setValue(75);
        // Foco (la idea): parpadea y luego se enciende
        var bulb = addShape(c, "Foco (idea)");
        shapeEllipse(bulb, 150, COL.amber);
        P(bulb).setValue([540, 300]);
        O(bulb).expression = "if (time > 0.75 && time < 1.7) {\n  (Math.sin((time+4)*47) > 0.1 || Math.sin((time+4)*13) > 0.6) ? 85 : 15;\n} else if (time >= 3.3) {\n  linear(time, 3.3, 3.95, 15, 100);\n} else 10;";
        var g = addEffect(bulb, "ADBE Glo2");
        if (g) { try { anim(g.property(3), [[3.3, 30], [3.95, 400]], "smooth"); } catch (e) { } }

        // Texto
        var t1 = revealWords(addText(c, "¿Tu negocio tiene", { y: 1335, size: 76, font: FONT.bold }), 0.15, 0.4);
        var t2 = revealWords(addText(c, "una idea increíble…", { y: 1426, size: 76, font: FONT.bold, color: COL.amber }), 0.3, 0.45);
        exitUp(t1, 1.75, 110); exitUp(t2, 1.78, 110);
        span(t1, 0, 2.2); span(t2, 0, 2.2);
        var t3 = revealWords(addText(c, "pero no sabes cómo", { y: 1335, size: 76, font: FONT.bold }), 1.95, 0.4);
        var t4 = revealWords(addText(c, "hacerla realidad?", { y: 1426, size: 76, font: FONT.bold }), 2.1, 0.4);
        exitUp(t3, 3.5, 110); exitUp(t4, 3.53, 110);
        span(t3, 1.9, 3.9); span(t4, 1.9, 3.9);

        // Anotaciones a mano (marcador rojo)
        var n1 = addText(c, "¿genérico?", { y: 420, x: 840, size: 54, font: "Caveat-Bold", color: hex("#FF4B4B") });
        anim(O(n1), [[2.45, 0], [2.6, 100]], "linear");
        var n2 = addText(c, "sin personalidad", { y: 980, x: 330, size: 50, font: "Caveat-Bold", color: hex("#FF4B4B") });
        anim(O(n2), [[2.7, 0], [2.85, 100]], "linear");
        var circ = addShape(c, "Círculo marcador");
        var trim = shapeEllipse(circ, 300, hex("#FF4B4B"), 5, true);
        P(circ).setValue([800, 570]); S(circ).setValue([153, 100]);
        if (trim) anim(trim.property("ADBE Vector Trim End"), [[2.3, 0], [2.6, 100]], "smooth");

        // Destello blanco final
        var flash = c.layers.addSolid(hex("#FFFDF5"), "Destello (la idea se enciende)", W, H, 1);
        anim(O(flash), [[3.6, 0], [3.97, 100]], "linear");
        setEase(O(flash), 10, 90);
        span(flash, 3.55, 4);
        return c;
    }

    // ================================================================= 03 PRESENTACIÓN
    function buildPresentation() {
        var c = newComp("03_PRESENTACION", 5);
        bg(c, COL.paper, "Papel");
        // Guías de construcción (Trim Paths)
        var radii = [660, 460, 280];
        for (var i = 0; i < radii.length; i++) {
            var gl = addShape(c, "Guía círculo " + (i + 1));
            var tp = shapeEllipse(gl, radii[i], COL.black, 2, true);
            P(gl).setValue([540, 760]);
            O(gl).setValue(14);
            if (tp) anim(tp.property("ADBE Vector Trim End"), [[0.1 + i * 0.08, 0], [0.8 + i * 0.08, 100]], "smooth");
            anim(O(gl), [[1.3, 14], [1.75, 0]], "linear");
            span(gl, 0, 1.8);
        }
        // Lockup (null que sube a los 1.65 s)
        var lock = c.layers.addNull(5);
        lock.name = "CTRL Lockup";
        P(lock).setValue([540, 960]);
        var iso = addImage(c, A.iso, 540, 760, 88);
        if (iso) {
            iso.name = "Isotipo";
            var rw = addEffect(iso, "ADBE Radial Wipe");
            if (rw) anim(rw.property(1), [[0.05, 100], [0.75, 0]], "smooth");
            anim(R(iso), [[0.05, 30], [0.9, 0]], "expo");
            anim(S(iso), [[0.05, [76, 76]], [0.9, [88, 88]], [1.65, [88, 88]], [2.15, [43, 43]]], "expo");
            anim(P(iso), [[1.65, [540, 760]], [2.15, [540, 330]]], "expo");
        }
        var wm = addImage(c, A.wordDark, 540, 1210, 68.5);
        if (wm) {
            wm.name = "Wordmark CREAX.INK";
            var lw = addEffect(wm, "ADBE Linear Wipe");
            if (lw) { lw.property(2).setValue(270); anim(lw.property(1), [[0.55, 100], [1.0, 0]], "expo"); }
            anim(S(wm), [[1.65, [68.5, 68.5]], [2.15, [37.5, 37.5]]], "expo");
            anim(P(wm), [[1.65, [540, 1210]], [2.15, [540, 540]]], "expo");
        }
        var tg = addImage(c, A.tagDark, 540, 1335, 60);
        if (tg) {
            tg.name = "Tagline CREATIVE STUDIO";
            anim(O(tg), [[0.95, 0], [1.3, 100], [1.55, 100], [1.75, 0]], "smooth");
            anim(S(tg), [[0.95, [45, 60]], [1.9, [60, 60]]], "expo");
        }
        // Brand board (bento)
        var tiles = [["Paleta", 960, 250, 540, 775, COL.white], ["Tipografía", 470, 320, 295, 1080, hex("#121216")],
            ["Aplicaciones (mockup tarjeta)", 470, 320, 785, 1080, COL.pink], ["Patrón de marca", 960, 220, 540, 1370, COL.blue]];
        for (var k = 0; k < tiles.length; k++) {
            var t = tiles[k];
            var tl = addShape(c, "Board — " + t[0]);
            shapeRect(tl, t[1], t[2], 28, t[5]);
            P(tl).setValue([t[3], t[4]]);
            var t0 = 1.95 + k * 0.1;
            anim(S(tl), [[t0, [82, 82]], [t0 + 0.45, [100, 100]], [2.95 + k * 0.06, [100, 100]], [3.25 + k * 0.06, [90, 90]]], "expo");
            anim(O(tl), [[t0, 0], [t0 + 0.2, 100], [2.95 + k * 0.06, 100], [3.25 + k * 0.06, 0]], "linear");
            span(tl, t0, 3.4);
        }
        var swatches = [COL.plum, COL.pink, COL.red, COL.orange, COL.amber, COL.blue, COL.teal];
        for (var s = 0; s < swatches.length; s++) {
            var sw = addShape(c, "Swatch " + (s + 1));
            shapeRect(sw, 118, 160, 14, swatches[s]);
            P(sw).setValue([147 + s * 130, 800]);
            anim(S(sw), [[2.05 + s * 0.045, [100, 0]], [2.55 + s * 0.045, [100, 100]]], "expo");
            anim(O(sw), [[2.95, 100], [3.2, 0]], "linear");
            span(sw, 2.0, 3.3);
        }
        // Claim
        var c1 = revealWords(addText(c, "Diseño que", { y: 1000, size: 96, font: FONT.xbold, color: COL.black }), 3.15, 0.4);
        var c2 = revealWords(addText(c, "convierte ideas", { y: 1110, size: 96, font: FONT.xbold, color: COL.black }), 3.27, 0.45);
        var c3 = revealWords(addText(c, "en identidad.", { y: 1220, size: 96, font: FONT.xbold, color: COL.teal }), 3.4, 0.45);
        // Mancha de tinta negra (transición)
        var ink = addShape(c, "Mancha de tinta (transición)");
        shapeEllipse(ink, 300, COL.ink);
        P(ink).setValue([540, 1000]);
        anim(S(ink), [[4.55, [0, 0]], [5.0, [1100, 1100]]], "smooth");
        var tdp = addEffect(ink, "ADBE Turbulent Displace");
        if (tdp) { try { tdp.property(2).setValue(80); tdp.property(3).setValue(60); } catch (e) { } }
        span(ink, 4.5, 5);
        // Destello de entrada
        var fl = c.layers.addSolid(hex("#FFFDF5"), "Destello entrada", W, H, 1);
        anim(O(fl), [[0, 100], [0.35, 0]], "expo");
        span(fl, 0, 0.4);
        void c1; void c2; void c3;
        return c;
    }

    // ================================================================= 04 SERVICIOS
    function buildServices() {
        var c = newComp("04_SERVICIOS", 11);
        bg(c, COL.ink, "Negro tinta");
        var q1 = revealWords(addText(c, "¿QUÉ", { y: 940, size: 190 }), 0.05, 0.35, { scale: 180, dy: 0 });
        var q2 = revealWords(addText(c, "HACEMOS?", { y: 1135, size: 190, color: COL.orange }), 0.2, 0.35, { scale: 180, dy: 0 });
        anim(S(q1), [[0.68, [100, 100]], [1.02, [700, 700]]], "linear"); setEase(S(q1), 10, 90);
        anim(S(q2), [[0.68, [100, 100]], [1.02, [700, 700]]], "linear"); setEase(S(q2), 10, 90);
        anim(O(q1), [[0.8, 100], [1.0, 0]], "linear"); anim(O(q2), [[0.8, 100], [1.0, 0]], "linear");
        span(q1, 0, 1.05); span(q2, 0, 1.05);

        var SERV = [
            { n: "01", a: "IDENTIDAD", b: "VISUAL", sub: "Logotipos • Isotipos • Branding", col: COL.pink },
            { n: "02", a: "DISEÑO", b: "PARA REDES", sub: "Posts • Historias • Campañas", col: COL.orange },
            { n: "03", a: "PUBLICIDAD", b: "", sub: "Flyers • Banners • Material promocional", col: COL.blue },
            { n: "04", a: "DISEÑO", b: "DIGITAL", sub: "Contenido • Presentaciones • Piezas digitales", col: COL.teal }
        ];
        var SB = [1.0, 3.5, 6.0, 8.5, 11.0];
        for (var i = 0; i < 4; i++) {
            var sv = SERV[i], b0 = SB[i], b1 = SB[i + 1];
            // tarjeta + trabajo real dentro
            var card = addShape(c, "Tarjeta " + sv.n);
            shapeRect(card, 960, 800, 44, sv.col);
            P(card).setValue([540, 600]);
            var work = placeholder(c, "Servicio " + sv.n + " — trabajo real (960x800)", 960, 800, 540, 600, fPh);
            work.parent = card;
            P(work).setValue([0, 0]);
            // whip pan entre tarjetas
            if (i === 0) {
                anim(S(card), [[0.92, [60, 60]], [1.4, [100, 100]]], "expo");
                anim(O(card), [[0.92, 0], [1.1, 100]], "linear");
            } else {
                anim(P(card), [[b0 - 0.2, [1690, 600]], [b0 + 0.2, [540, 600]]], "smooth");
                anim(R(card), [[b0 - 0.2, 4], [b0 + 0.2, 0]], "smooth");
            }
            if (i < 3) {
                P(card).setValueAtTime(b1 - 0.2, [540, 600]);
                P(card).setValueAtTime(b1 + 0.2, [-610, 600]);
                setEase(P(card), 75, 75);
            }
            span(card, b0 - 0.25, Math.min(11, b1 + 0.25));
            span(work, b0 - 0.25, Math.min(11, b1 + 0.25));

            var outT = i < 3 ? b1 - 0.28 : 10.55;
            var num = revealWords(addText(c, sv.n + " / 04", { x: 90, y: 1095, size: 40, font: FONT.xbold, color: sv.col, left: true }), b0 + 0.02, 0.3);
            var t1 = revealWords(addText(c, sv.a, { x: 86, y: 1210, size: 112, left: true }), b0 + 0.08, 0.35);
            var t2 = sv.b ? revealWords(addText(c, sv.b, { x: 86, y: 1324, size: 112, left: true, color: sv.col }), b0 + 0.15, 0.35) : null;
            var st = revealWords(addText(c, sv.sub, { x: 90, y: 1420, size: 38, font: FONT.medium, left: true }), b0 + 0.3, 0.5, { dy: 30 });
            exitUp(num, outT, 80); exitUp(t1, outT, 140); if (t2) exitUp(t2, outT + 0.03, 140); exitUp(st, outT, 60);
            span(num, b0, outT + 0.35); span(t1, b0, outT + 0.35); if (t2) span(t2, b0, outT + 0.35); span(st, b0, outT + 0.35);

            // barra de progreso
            var bar = addShape(c, "Progreso " + sv.n);
            shapeRect(bar, 214, 6, 3, sv.col);
            tr(bar, "ADBE Anchor Point").setValue([-107, 0]);
            P(bar).setValue([90 + i * 228, 1503]);
            anim(S(bar), [[b0, [0, 100]], [b1, [100, 100]]], "linear");
            span(bar, b0, 10.75);
        }
        // hoja de papel que sube (transición a PROCESO)
        var paper = c.layers.addSolid(hex("#F2EEE6"), "Hoja de papel (transición)", W + 40, H + 40, 1);
        anim(P(paper), [[10.62, [540, 2900]], [11.0, [540, 960]]], "smooth");
        span(paper, 10.6, 11);
        return c;
    }

    // ================================================================= 05 PROCESO
    function buildProcess() {
        var c = newComp("05_PROCESO", 6);
        bg(c, hex("#F2EEE6"), "Papel");
        var steps = ["IDEA", "DISEÑO", "DETALLE", "RESULTADO"];
        var ST = [0, 1.5, 3.0, 4.5];
        var xs = [200, 420, 650, 900];
        for (var i = 0; i < 4; i++) {
            var s = addText(c, steps[i], { x: xs[i], y: 290, size: 28, font: FONT.xbold, color: hex("#B9B3A8"), tracking: 30 });
            var fc = s.property("ADBE Text Properties").property("ADBE Text Document");
            var td0 = fc.value; td0.fillColor = hex("#B9B3A8"); fc.setValueAtTime(0, td0);
            var td1 = fc.value; td1.fillColor = COL.black; fc.setValueAtTime(ST[i], td1);
            var und = addShape(c, "Subrayado " + steps[i]);
            shapeRect(und, 160, 6, 3, COL.orange);
            P(und).setValue([xs[i], 310]);
            anim(S(und), [[ST[i], [0, 100]], [ST[i] + 0.35, [100, 100]]], "expo");
            span(und, ST[i], i < 3 ? ST[i + 1] : 6);
        }
        var labels = ["Boceto a lápiz (foto/escaneo del boceto real)", "Vector en Illustrator (captura de pantalla)", "Detalle: color, degradado, ajustes (captura/zoom)", "Mockup final (tarjeta, papelería, etc.)"];
        for (var k = 0; k < 4; k++) {
            var ph = placeholder(c, "Proceso " + (k + 1) + " — " + labels[k], 700, 700, 540, 845, fPh);
            span(ph, ST[k], k < 3 ? ST[k + 1] + 0.2 : 6);
            if (k > 0) anim(O(ph), [[ST[k], 0], [ST[k] + 0.25, 100]], "smooth");
            anim(S(ph), [[ST[k], [104, 104]], [ST[k] + 1.5, [100, 100]]], "smooth");
        }
        // Lápiz animado sobre el boceto (expresión en círculo)
        var pen = addShape(c, "Lápiz (guía de movimiento)");
        shapeRect(pen, 260, 26, 4, COL.amber);
        P(pen).expression = "var a = -Math.PI/2 + 2*Math.PI*ease(time, 0.1, 1.2, 0, 1);\nvar r = 210 + wiggle(7, 70)[0] - value[0];\n[540 + Math.cos(a)*r, 845 + Math.sin(a)*r];";
        R(pen).setValue(-50);
        span(pen, 0.05, 1.4);

        var a1 = revealWords(addText(c, "De una idea en papel…", { y: 1385, size: 70, font: FONT.semi, color: hex("#1B1B20") }), 0.3, 0.45);
        exitUp(a1, 2.65, 100); span(a1, 0.3, 3.0);
        var a2 = revealWords(addText(c, "a una identidad", { y: 1365, size: 90, font: FONT.xbold, color: hex("#1B1B20") }), 2.9, 0.4);
        var a3 = revealWords(addText(c, "que habla por ti.", { y: 1466, size: 90, font: FONT.xbold, color: COL.orange }), 3.05, 0.45);
        exitUp(a2, 5.45, 120); exitUp(a3, 5.48, 120);
        span(a2, 2.9, 5.85); span(a3, 2.9, 5.85);
        // zoom final hacia RESULTADOS
        var adj = c.layers.addNull(6);
        adj.name = "CTRL Zoom final (emparenta aquí el mockup)";
        anim(S(adj), [[5.55, [100, 100]], [6.0, [600, 600]]], "linear");
        setEase(S(adj), 10, 90);
        return c;
    }

    // ================================================================= 06 RESULTADOS
    function buildResults() {
        var c = newComp("06_RESULTADOS", 5);
        bg(c, COL.ink, "Negro tinta");
        var t;
        // Cortes rápidos (cada 0.25 s = corchea a 120 BPM)
        for (var k = 0; k < 4; k++) {
            var ph = placeholder(c, "Resultado A" + (k + 1) + " (mejor trabajo, 860 px ancho)", 860, 1075, 540, 920, fPh);
            t = k * 0.25;
            span(ph, t, t + 0.25);
            anim(S(ph), [[t, [114, 114]], [t + 0.3, [100, 100]]], "expo");
            anim(R(ph), [[t, k % 2 ? 2.5 : -2.5], [t + 0.3, 0]], "expo");
        }
        // Muro de trabajos en movimiento (3 filas)
        var wall = c.layers.addNull(5);
        wall.name = "CTRL Muro (-10°)";
        R(wall).setValue(-10);
        anim(S(wall), [[1.0, [135, 135]], [1.35, [100, 100]]], "expo");
        for (var row = -1; row <= 1; row++) {
            var rowNull = c.layers.addNull(5);
            rowNull.name = "Fila " + (row + 2);
            rowNull.parent = wall;
            var dir = row % 2 ? 1 : -1;
            anim(P(rowNull), [[1.0, [0 - dir * 200, row * 506]], [3.0, [dir * 640, row * 506]]], "linear");
            for (var j = 0; j < 6; j++) {
                var tile = placeholder(c, "Muro fila " + (row + 2) + " pieza " + (j + 1) + " (376x470)", 376, 470, 0, 0, fPh);
                tile.parent = rowNull;
                P(tile).setValue([-1050 + j * 412, 0]);
                span(tile, 1.0, 3.0);
            }
            span(rowNull, 1.0, 3.0);
        }
        span(wall, 1.0, 3.0);
        var dim = c.layers.addSolid(hex("#08080C"), "Oscurecer muro", W, H, 1);
        anim(O(dim), [[1.1, 0], [1.3, 62], [2.85, 62], [3.0, 0]], "linear");
        span(dim, 1.0, 3.0);
        var m1 = revealWords(addText(c, "TU MARCA MERECE", { y: 860, size: 104 }), 1.2, 0.4);
        var m2 = revealWords(addText(c, "VERSE COMO", { y: 975, size: 104 }), 1.38, 0.4);
        var m3 = revealWords(addText(c, "IMAGINAS.", { y: 1130, size: 140, color: COL.orange }), 1.56, 0.4);
        exitUp(m1, 2.75); exitUp(m2, 2.78); exitUp(m3, 2.81);
        span(m1, 1.2, 3.0); span(m2, 1.38, 3.0); span(m3, 1.56, 3.0);
        // Segunda ráfaga de cortes con fondos de color
        var bgs = [COL.pink, null, COL.orange, null, COL.blue, null];
        for (var q = 0; q < 6; q++) {
            t = 3.0 + q * 0.25;
            if (bgs[q]) { var sb = c.layers.addSolid(bgs[q], "Fondo color corte " + (q + 1), W, H, 1); span(sb, t, t + 0.25); }
            var p2 = placeholder(c, "Resultado B" + (q + 1) + " (860 px ancho)", 860, 1075, 540, 920, fPh);
            span(p2, t, t + 0.25);
            anim(S(p2), [[t, [114, 114]], [t + 0.3, [100, 100]]], "expo");
            anim(R(p2), [[t, q % 2 ? 10 : -10], [t + 0.3, 0]], "expo");
        }
        // Colapso al centro + papel
        var grid = c.layers.addNull(5);
        grid.name = "CTRL Grilla final";
        P(grid).setValue([540, 960]);
        anim(S(grid), [[4.5, [240, 240]], [4.72, [100, 100]], [4.95, [0, 0]]], "expo");
        anim(R(grid), [[4.72, 0], [4.95, 90]], "smooth");
        for (var g = 0; g < 12; g++) {
            var gt = placeholder(c, "Grilla pieza " + (g + 1) + " (300x375)", 300, 375, 0, 0, fPh);
            gt.parent = grid;
            P(gt).setValue([-324 + (g % 3) * 324, -598 + Math.floor(g / 3) * 399]);
            span(gt, 4.5, 5);
        }
        span(grid, 4.5, 5);
        var pap = addShape(c, "Papel que se abre");
        shapeEllipse(pap, 200, COL.paper);
        P(pap).setValue([540, 960]);
        anim(S(pap), [[4.72, [0, 0]], [5.0, [1200, 1200]]], "smooth");
        span(pap, 4.7, 5);
        return c;
    }

    // ================================================================= 07 CTA
    function buildCTA() {
        var c = newComp("07_CTA", 5);
        bg(c, COL.paper, "Papel");
        var iso = addImage(c, A.iso, 540, 470, 38);
        if (iso) {
            iso.name = "Isotipo";
            anim(S(iso), [[0.05, [0, 0]], [0.5, [38, 38]], [2.35, [38, 38]], [2.95, [73.5, 73.5]]], "expo");
            anim(R(iso), [[0.05, -120], [0.6, 0]], "expo");
            anim(P(iso), [[2.35, [540, 470]], [2.95, [540, 720]]], "smooth");
            R(iso).expression = "value + Math.sin(time*1.2)*2;";
        }
        var a = revealWords(addText(c, "TU IDEA.", { y: 820, size: 170, color: COL.black }), 0, 0.3, { scale: 180, dy: 0 });
        var b = revealWords(addText(c, "NUESTRA", { y: 940, size: 64, font: FONT.light, color: hex("#55555E"), tracking: 280 }), 0.35, 0.4);
        var cc = revealWords(addText(c, "CREATIVIDAD.", { y: 1058, size: 118, color: COL.pink }), 0.5, 0.45, { byChar: true });
        var d1 = revealWords(addText(c, "¿Listo para darle identidad", { y: 1240, size: 48, font: FONT.medium, color: hex("#3A3A42") }), 1.15, 0.4, { dy: 25 });
        var d2 = revealWords(addText(c, "a tu proyecto?", { y: 1302, size: 48, font: FONT.medium, color: hex("#3A3A42") }), 1.3, 0.4, { dy: 25 });
        var outs = [a, b, cc, d1, d2];
        for (var i = 0; i < outs.length; i++) { exitUp(outs[i], 2.05 + i * 0.03, 120); span(outs[i], 0, 2.5); }
        var wm = addImage(c, A.wordDark, 540, 1140, 67);
        if (wm) {
            wm.name = "Wordmark CREAX.INK";
            var lw = addEffect(wm, "ADBE Linear Wipe");
            if (lw) { lw.property(2).setValue(270); anim(lw.property(1), [[2.7, 100], [3.2, 0]], "expo"); }
        }
        var line = addShape(c, "Línea degradado");
        shapeRect(line, 340, 6, 3, COL.orange);
        P(line).setValue([540, 1235]);
        anim(S(line), [[3.1, [0, 100]], [3.7, [100, 100]]], "expo");
        var fin = revealWords(addText(c, "Diseño • Branding • Creatividad", { y: 1325, size: 44, font: FONT.semi, color: hex("#2A2A31"), tracking: 40 }), 3.15, 0.5, { dy: 20 });
        void fin;
        var push = c.layers.addNull(5);
        push.name = "CTRL Push-in final (emparenta todo aquí si quieres)";
        P(push).setValue([540, 960]);
        anim(S(push), [[2.9, [100, 100]], [5, [102.5, 102.5]]], "smooth");
        var fl = c.layers.addSolid(COL.white, "Golpe blanco", W, H, 1);
        anim(O(fl), [[0, 80], [0.2, 0]], "linear");
        span(fl, 0, 0.25);
        return c;
    }

    // ================================================================= MAIN
    var builders = [buildHook, buildProblem, buildPresentation, buildServices, buildProcess, buildResults, buildCTA];
    var main = proj.items.addComp("CREAX_Promo_9x16", W, H, 1, DUR, FPS);
    main.parentFolder = fComps;
    main.motionBlur = true;
    main.bgColor = COL.ink;

    for (var s = 0; s < SCENES.length; s++) {
        var pre = null;
        try { pre = builders[s](); } catch (e) { warn("Escena " + SCENES[s].id + ": " + e.toString() + " (línea " + e.line + ")"); }
        if (!pre) continue;
        var l = main.layers.add(pre);
        l.startTime = SCENES[s].t;
        l.outPoint = SCENES[s].t + SCENES[s].d;
        l.collapseTransformation = false;
        l.moveToBeginning();
    }

    // Grano + viñeta (capa de ajuste global)
    var grain = main.layers.addSolid(COL.white, "AJUSTE Grano + viñeta", W, H, 1);
    grain.adjustmentLayer = true;
    var nz = addEffect(grain, "ADBE Noise");
    if (nz) { try { nz.property(1).setValue(4); nz.property(2).setValue(0); } catch (e3) { } }
    grain.moveToBeginning();
    var vig = main.layers.addSolid([0, 0, 0], "Viñeta", W, H, 1);
    try {
        var m = vig.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
        var sh = new Shape();
        var kx = 0.5523;
        sh.vertices = [[540, -200], [1380, 960], [540, 2120], [-300, 960]];
        sh.inTangents = [[-840 * kx, 0], [0, -1160 * kx], [840 * kx, 0], [0, 1160 * kx]];
        sh.outTangents = [[840 * kx, 0], [0, 1160 * kx], [-840 * kx, 0], [0, -1160 * kx]];
        sh.closed = true;
        m.property("ADBE Mask Shape").setValue(sh);
        m.inverted = true;
        m.property("ADBE Mask Feather").setValue([500, 500]);
    } catch (e4) { warn("Viñeta: " + e4.toString()); }
    O(vig).setValue(35);
    vig.blendingMode = BlendingMode.MULTIPLY;
    vig.moveToBeginning();

    // Música
    if (A.music) {
        var mus = main.layers.add(A.music);
        mus.name = "Música CREAX (120 BPM)";
        mus.moveToEnd();
    }

    // Marcadores: escenas + beats
    try {
        var mk = main.markerProperty;
        var names = ["1 HOOK", "2 PROBLEMA", "3 PRESENTACIÓN", "4 SERVICIOS", "5 PROCESO", "6 RESULTADOS", "7 CTA"];
        for (var n = 0; n < SCENES.length; n++) {
            var mv = new MarkerValue(names[n]);
            mv.duration = SCENES[n].d;
            mk.setValueAtTime(SCENES[n].t, mv);
        }
        var beatHolder = main.layers.addNull(DUR);
        beatHolder.name = "BEATS 120 BPM (marcadores)";
        beatHolder.enabled = false;
        beatHolder.guideLayer = true;
        var bm = beatHolder.property("ADBE Marker");
        for (var b = 0; b < DUR / BEAT; b++) {
            var lbl = (b % 4 === 0) ? "Compás " + (b / 4 + 1) : "";
            bm.setValueAtTime(b * BEAT, new MarkerValue(lbl));
        }
    } catch (e5) { warn("Marcadores: " + e5.toString()); }

    // Render queue
    try { proj.renderQueue.items.add(main); } catch (e6) { warn("Render queue: " + e6.toString()); }

    // Mueve sólidos sueltos a su carpeta
    for (var it = 1; it <= proj.numItems; it++) {
        var item = proj.item(it);
        if (item instanceof FootageItem && item.mainSource instanceof SolidSource && item.parentFolder === proj.rootFolder) {
            item.parentFolder = item.name.indexOf("[REEMPLAZAR]") === 0 ? fPh : fSolids;
        }
    }
    main.openInViewer();
    app.endUndoGroup();

    var msg = "CREAX.INK — proyecto creado.\n\n" +
        "• Composición: CREAX_Promo_9x16 (1080x1920, 30 fps, 40 s)\n" +
        "• Reemplaza las capas naranjas \"[REEMPLAZAR] …\" por trabajos reales\n" +
        "  (Alt/Option + arrastrar desde el panel Proyecto sobre la capa).\n" +
        "• Los marcadores de la capa BEATS marcan cada beat a 120 BPM.";
    if (warnings.length) msg += "\n\nAvisos (" + warnings.length + "):\n- " + warnings.slice(0, 12).join("\n- ");
    alert(msg);
})();
