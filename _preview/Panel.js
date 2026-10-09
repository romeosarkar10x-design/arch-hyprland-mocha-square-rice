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

  // .design-sync/previews/Panel.tsx
  var Panel_exports = {};
  __export(Panel_exports, {
    Composed: () => Composed,
    Settings: () => Settings
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

  // .design-sync/previews/Panel.tsx
  var import_jsx_runtime = __toESM(require_react_shim(), 1);
  var Composed = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.Panel, { icon: "disk", accent: "blue", title: "Storage", subtitle: "Samsung 990 PRO · 2 TB · btrfs", actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Button, { icon: "folder", accent: "blue", children: "Open /" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hx-spacer" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hx-faint hx-small", children: "last scrub 2d ago" })
  ] }), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.PanelSection, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "hx-stats", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Stat, { label: "used", value: "1.34", hint: "TiB", accent: "blue" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Stat, { label: "free", value: "0.52", hint: "TiB" })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.PanelSection, { label: "subvolumes", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Meter, { label: "@", value: 22, readout: "412 GiB", accent: "blue" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Meter, { label: "@home", value: 46, readout: "858 GiB", accent: "blue" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Meter, { label: "@snapshots", value: 4, readout: "71 GiB", accent: "blue" })
    ] })
  ] });
  var Settings = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Panel, { icon: "palette", accent: "pink", title: "Appearance", subtitle: "hyprland.lua · decoration", live: false, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.PanelSection, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Toggle, { label: "Blur", description: "size 6 · passes 3", defaultChecked: true, accent: "pink" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Toggle, { label: "Dim inactive", description: "strength 0.08", defaultChecked: true, accent: "pink" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Toggle, { label: "Rotating border", description: "mauve → pink → yellow", defaultChecked: true, accent: "pink" })
  ] }) });
  return __toCommonJS(Panel_exports);
})();
