const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const mainScript = fs.readFileSync(path.join(__dirname, "../js/main.js"), "utf8");

function createClassList() {
  const names = new Set();
  return {
    add(name) { names.add(name); },
    remove(name) { names.delete(name); },
    contains(name) { return names.has(name); },
    toggle(name, force) {
      const enabled = force === undefined ? !names.has(name) : Boolean(force);
      if (enabled) names.add(name);
      else names.delete(name);
      return enabled;
    },
  };
}

function runPageAtViewport(width) {
  const listeners = new Map();
  const elements = {
    ".nav": { classList: createClassList() },
    ".progress span": { style: {} },
    ".dock": { classList: createClassList() },
    "#precio": { getBoundingClientRect: () => ({ top: -50 }) },
    ".nav-toggle": { addEventListener() {}, setAttribute() {} },
    ".nav-links": { classList: createClassList(), addEventListener() {} },
    "[data-passport]": { appendChild() {} },
    "[data-stamp-count]": { textContent: "" },
    "#nudge": { hidden: true, querySelectorAll: () => [], querySelector: () => null },
  };
  const document = {
    documentElement: {
      scrollHeight: 4000,
      addEventListener() {},
    },
    querySelector(selector) { return elements[selector] || null; },
    querySelectorAll() { return []; },
    createElement() { return { classList: createClassList(), addEventListener() {}, setAttribute() {} }; },
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(callback);
    },
  };
  const window = {
    scrollY: 0,
    innerWidth: width,
    innerHeight: 800,
    matchMedia: () => ({ matches: false }),
    addEventListener() {},
    setTimeout: () => 1,
    clearTimeout() {},
  };

  vm.runInNewContext(mainScript, {
    document,
    window,
    localStorage: { getItem: () => "[]", setItem() {} },
    sessionStorage: { getItem: () => null, setItem() {} },
    IntersectionObserver: undefined,
  });

  return {
    dock: elements[".dock"],
    scrollTo(scrollY) {
      window.scrollY = scrollY;
      for (const listener of listeners.get("scroll") || []) listener();
    },
  };
}

test("docked purchase CTA appears after the first scroll on mobile and desktop", () => {
  for (const width of [390, 1280]) {
    const page = runPageAtViewport(width);
    assert.equal(page.dock.classList.contains("is-on"), false, `dock should be hidden at top (${width}px)`);
    page.scrollTo(1);
    assert.equal(page.dock.classList.contains("is-on"), true, `dock should appear after first scroll (${width}px)`);
  }
});
