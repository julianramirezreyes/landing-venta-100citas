const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const page = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");

function loadPageWithFailedHotmartWidget() {
  const anchors = Array.from(page.matchAll(/<a\b([^>]*\bdata-buy\b[^>]*)>/g), ([, attributes]) => ({
    href: attributes.match(/\bhref="([^"]+)"/)?.[1].replaceAll("&amp;", "&"),
    removed: false,
  }));
  const document = {
    documentElement: { classList: { add() {} } },
    createElement(tagName) {
      return { tagName, src: "", rel: "", type: "", href: "" };
    },
    head: {
      appendChild(element) {
        if (element.tagName === "script" && element.src.includes("hotmart.com/checkout/widget.min.js")) {
          // Model the public widget's observed failed-health-check behavior at script load.
          anchors.filter((anchor) => anchor.href?.includes("hotmart.com")).forEach((anchor) => {
            anchor.removed = true;
          });
        }
      },
    },
  };

  for (const [, attributes, inlineScript] of page.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!attributes.includes("src=") && !attributes.includes("type=")) {
      vm.runInNewContext(inlineScript, { document });
    }
  }

  return anchors.filter((anchor) => !anchor.removed);
}

test("direct checkout anchors survive a failed Hotmart widget load", () => {
  const survivingAnchors = loadPageWithFailedHotmartWidget();
  const checkoutUrl = "https://pay.hotmart.com/V108076592A?checkoutMode=2&off=3jpxud41";

  assert.equal(survivingAnchors.length, 7);
  assert.ok(survivingAnchors.every((anchor) => anchor.href === checkoutUrl));
});
