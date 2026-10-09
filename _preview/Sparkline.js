"use strict";
var __dsPreview = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // <define:import.meta.env>
  var init_define_import_meta_env = __esm({
    "<define:import.meta.env>"() {
    }
  });

  // ds-raw:__ds_raw__
  var require_ds_raw = __commonJS({
    "ds-raw:__ds_raw__"(exports, module) {
      init_define_import_meta_env();
      module.exports = window.HyprlandUI;
    }
  });

  // shim:react-shim
  var require_react_shim = __commonJS({
    "shim:react-shim"(exports, module) {
      init_define_import_meta_env();
      var R = window.React;
      function np(p, k) {
        var o = {};
        for (var x in p) if (x !== "children") o[x] = p[x];
        if (k !== void 0) o.key = k;
        return o;
      }
      function jsx2(t, p, k) {
        var c = p && p.children;
        return c === void 0 ? R.createElement(t, np(p, k)) : R.createElement(t, np(p, k), c);
      }
      function jsxs2(t, p, k) {
        return R.createElement.apply(R, [t, np(p, k)].concat(p.children));
      }
      module.exports = R;
      module.exports.jsx = jsx2;
      module.exports.jsxs = jsxs2;
      module.exports.jsxDEV = function(t, p, k, s) {
        return (s ? jsxs2 : jsx2)(t, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // .design-sync/previews/Sparkline.tsx
  var Sparkline_exports = {};
  __export(Sparkline_exports, {
    Colours: () => Colours,
    Large: () => Large
  });
  init_define_import_meta_env();

  // ds-shim:ds
  var ds_exports = {};
  __export(ds_exports, {
    default: () => ds_default
  });
  init_define_import_meta_env();
  __reExport(ds_exports, __toESM(require_ds_raw()));
  var g = window.HyprlandUI;
  var ds_default = "default" in g ? g.default : g;

  // .design-sync/previews/Sparkline.tsx
  var import_jsx_runtime = __toESM(require_react_shim(), 1);
  var Colours = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 22, fontSize: 14 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { color: "var(--hx-sky)", display: "inline-flex", gap: 6, alignItems: "center" }, children: [
      "cpu ",
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Sparkline, { data: [12, 18, 30, 22, 41, 37, 25, 19] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { color: "var(--hx-green)", display: "inline-flex", gap: 6, alignItems: "center" }, children: [
      "gpu ",
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Sparkline, { data: [60, 72, 81, 77, 90, 85, 70, 88] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { color: "var(--hx-yellow)", display: "inline-flex", gap: 6, alignItems: "center" }, children: [
      "hot ",
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Sparkline, { data: [50, 61, 66, 70, 74, 79, 83, 86] })
    ] })
  ] });
  var Large = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: "var(--hx-mauve)" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Sparkline, { data: [5, 9, 14, 30, 48, 40, 22, 35, 60, 44, 31, 20, 18, 26, 39, 51], bars: 16, height: 40 }) });
  return __toCommonJS(Sparkline_exports);
})();
