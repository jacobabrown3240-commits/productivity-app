/* Nest service worker.
   Network-first for app files so new deploys show up without a hard refresh,
   with a cache fallback so the app still opens offline.
   Also handles clicks on reminder notifications by focusing the app. */
var CACHE = "nest-v5";
var ASSETS = [
  ".",
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "icons/icon.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      // Keep the current app cache and the share inbox; purge old app caches.
      function keep(k) { return k === CACHE || k === "nest-share"; }
      var hadOld = keys.some(function (k) { return !keep(k); });
      return Promise.all(keys.filter(function (k) { return !keep(k); }).map(function (k) { return caches.delete(k); }))
        .then(function () { return self.clients.claim(); })
        .then(function () {
          if (!hadOld) return;
          return self.clients.matchAll({ type: "window" }).then(function (clients) {
            clients.forEach(function (c) {
              if ("navigate" in c) { try { c.navigate(c.url); } catch (err) {} }
            });
          });
        });
    })
  );
});

self.addEventListener("fetch", function (e) {
  // Web Share Target: a shared screenshot arrives as a POST to share-target/.
  // Stash the image in a cache and redirect back into the app with ?share=1.
  if (e.request.method === "POST" && new URL(e.request.url).pathname.indexOf("share-target/") !== -1) {
    e.respondWith((function () {
      return e.request.formData().then(function (form) {
        var file = form.get("image");
        if (!file) return Response.redirect("./?share=0", 303);
        return caches.open("nest-share").then(function (c) {
          return c.put("shared-image", new Response(file, { headers: { "Content-Type": file.type || "image/png" } }));
        }).then(function () { return Response.redirect("./?share=1", 303); });
      }).catch(function () { return Response.redirect("./?share=0", 303); });
    })());
    return;
  }
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request, { cache: "no-store" }).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) {
          try { c.put(e.request, copy); } catch (err) {}
        });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (cached) {
        return cached || caches.match("index.html");
      });
    })
  );
});

// Tapping a reminder notification opens (or focuses) the app.
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clients) {
      for (var i = 0; i < clients.length; i++) {
        if ("focus" in clients[i]) return clients[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(".");
    })
  );
});
