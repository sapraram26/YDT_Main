(() => {
  "use strict";
  let e,
    t = chrome;
  function o(o, s = null, n = []) {
    e.get(s, (r) => {
      t.runtime.lastError
        ? ((e = t.storage.local),
          e.get(s, (e) => {
            o(e, ...n);
          }))
        : o(r, ...n);
    });
  }
  function s(o) {
    e.set(o, () => {
      t.runtime.lastError && ((e = t.storage.local), e.set(o));
    });
  }
  const n =
      ("object" == typeof browser &&
        "object" == typeof browser.runtime &&
        (t = browser),
      (e = t.storage.local),
      "object" == typeof t.storage.sync && (e = t.storage.sync),
      t),
    r = {
      hide_feed: !0,
      hide_redirect_home: !1,
      hide_sidebar: !0,
      hide_recommended: !0,
      hide_chat: !0,
      hide_playlists: !0,
      hide_donate: !0,
      hide_endscreen: !0,
      hide_cards: !0,
      hide_comments: !1,
      hide_prof: !1,
      hide_mix: !1,
      hide_merch: !0,
      hide_meta: !1,
      hide_bar: !1,
      hide_channel: !1,
      hide_desc: !1,
      hide_header: !1,
      hide_notifs: !0,
      hide_moreyt: !0,
      hide_search: !0,
      hide_trending: !1,
      hide_shorts: !1,
      hide_subs: !1,
      hide_autoplay: !0,
      hide_annotations: !0,
      yt_on: !0,
      popup_settings: {
        dark_mode: !1,
        sidebar_tree: !1,
        comment_tree: !0,
        meta_tree: !0,
        header_tree: !1,
      },
    };
  function i(e) {
    const t = e ? "" : "-off";
    n.action.setIcon({
      path: {
        16: `/images/logo.png`,
        32: `/images/logo.png`,
        48: `/images/logo.png`,
        128: `/images/logo.png`,
      },
    });
  }
  let c = {
    hide_feed: !1,
    hide_redirect_home: !1,
    hide_trending: !1,
    hide_subs: !1,
    yt_on: !1,
  };
  const d = Object.keys(c);
  function h() {
    o((e) => {
      c = e;
    }, d);
  }
  function a(e, t) {
    n.tabs.update(t, { url: e });
  }
  o(function (o) {
    const n = Object.keys(o).length;
    0 === n
      ? s(r)
      : (function (e, t) {
          return (
            t !== Object.keys(r).length ||
            Object.keys(r).some(
              (t) => !Object.prototype.hasOwnProperty.call(e, t)
            ) ||
            Object.keys(e.popup_settings).length !==
              Object.keys(r.popup_settings).length
          );
        })(o, n) &&
        (Object.keys(r).forEach((e) => {
          Object.prototype.hasOwnProperty.call(o, e) &&
            ("boolean" == typeof r[e]
              ? (r[e] = o[e])
              : Object.keys(r[e]).forEach((t) => {
                  Object.prototype.hasOwnProperty.call(o[e], t) &&
                    (r[e][t] = o[e][t]);
                }));
        }),
        e.clear(() => {
          t.runtime.lastError && ((e = t.storage.local), e.clear());
        }),
        s(r)),
      i(o.yt_on || r.yt_on);
  }),
    h(),
    n.storage.onChanged.addListener((e) => {
      for (let t = 0; t < d.length; t += 1)
        if (Object.prototype.hasOwnProperty.call(e, d[t])) {
          "yt_on" === d[t] && i(e.yt_on.newValue), h();
          break;
        }
    }),
    n.webRequest.onBeforeRequest.addListener(
      ({ url: e, tabId: t }) => {
        c.yt_on &&
          (((c.hide_trending &&
            /^https:\/\/.*\.youtube\.com\/feed\/(trending|explore)/.test(e)) ||
            (c.hide_subs && -1 !== e.indexOf("subscriptions"))) &&
            a("https://www.youtube.com", t),
          c.hide_redirect_home &&
            c.hide_feed &&
            !c.hide_subs &&
            /^https:\/\/.*\.youtube\.com\/(?:\?.*)?$/.test(e) &&
            a("https://www.youtube.com/feed/subscriptions", t));
      },
      {
        urls: [
          "https://*.youtube.com/",
          "https://*.youtube.com/?*",
          "https://*.youtube.com/feed/trending*",
          "https://*.youtube.com/feed/explore*",
          "https://*.youtube.com/feed/subscriptions*",
        ],
        types: ["main_frame", "sub_frame", "xmlhttprequest"],
      }
    );
})();
