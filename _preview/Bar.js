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

  // .design-sync/previews/Bar.tsx
  var Bar_exports = {};
  __export(Bar_exports, {
    Full: () => Full,
    UnderLoad: () => UnderLoad
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

  // .design-sync/previews/Bar.tsx
  var import_jsx_runtime = __toESM(require_react_shim(), 1);
  var ws = [
    { id: 1, apps: ["code", "ghostty"] },
    { id: 2, apps: ["chrome"] },
    { id: 3, apps: ["spotify"] },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: 10 }
  ].map((w) => ({ ...w, apps: w.apps ? [...w.apps] : void 0 }));
  var Full = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: 1920 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.Bar,
    {
      left: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BarSegment, { variant: "launcher", icon: "arch", label: "Launcher" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Workspaces, { workspaces: ws, active: 1 }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BarSegment, { variant: "title", children: "nvim ~/dotfiles/hyprland/.config/hypr/hyprland.lua" })
      ] }),
      center: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BarSegment, { variant: "media", icon: "spotify", accent: "green", children: "M83 — Midnight City" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.BarSegment, { variant: "clock", icon: "clock", children: [
          "Sat 03 Oct  09:41 ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Unit, { children: "PM" })
        ] })
      ] }),
      right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.BarSegment, { icon: "ethernet", accent: "sapphire", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Icon, { name: "down" }),
          " 2.4 MiB ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Icon, { name: "up" }),
          " 312 KiB"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.BarSegment, { icon: "cpu", accent: "sky", divider: true, spark: [12, 18, 30, 22, 41, 37, 25, 19], children: [
          "19% 52° 61",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Unit, { children: "W" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.BarSegment, { icon: "gpu", accent: "green", divider: true, spark: [30, 42, 38, 51, 47, 44, 40, 36], children: [
          "36% 58° 168",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Unit, { children: "W" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BarSegment, { icon: "memory", accent: "mauve", divider: true, children: "31%" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BarSegment, { icon: "volumeMedium", accent: "yellow", divider: true, children: "64%" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BarSegment, { icon: "coffeeOff", divider: true, dim: true, label: "Caffeine" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.BarSegment, { divider: true, className: "hx-tray", label: "Tray", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Icon, { name: "chat" }),
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Icon, { name: "steam" }),
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Icon, { name: "bluetooth" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BarSegment, { variant: "power", icon: "power", label: "Power" })
      ] })
    }
  ) });
  var UnderLoad = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: 1920 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ds_exports.Bar,
    {
      left: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BarSegment, { variant: "launcher", icon: "arch" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Workspaces, { workspaces: ws, active: 3 })
      ] }),
      center: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.BarSegment, { variant: "clock", icon: "clock", children: [
        "Sat 03 Oct  11:58 ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Unit, { children: "PM" })
      ] }),
      right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.BarSegment, { icon: "cpu", accent: "sky", divider: true, level: "crit", spark: [70, 82, 88, 91, 94, 97, 95, 98], children: [
          "97% 88° 162",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Unit, { children: "W" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ds_exports.BarSegment, { icon: "gpu", accent: "green", divider: true, level: "warn", open: true, spark: [60, 72, 81, 77, 90, 85, 70, 88], children: [
          "88% 79° 401",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.Unit, { children: "W" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BarSegment, { icon: "memory", accent: "mauve", divider: true, level: "warn", children: "81%" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BarSegment, { icon: "volumeOff", accent: "yellow", divider: true, dim: true, children: "muted" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BarSegment, { icon: "coffee", divider: true, className: "is-caffeine", label: "Caffeine" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.BarSegment, { variant: "power", icon: "power" })
      ] })
    }
  ) });
  return __toCommonJS(Bar_exports);
})();
