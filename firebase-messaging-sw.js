/* ==========================================================
   MAX-USE TEMPLATE KANTAH v1
   FILE: firebase-messaging-sw.js
   VERSION: V4_FORCE_OPEN_UPDATING
   PURPOSE: Firebase Cloud Messaging Service Worker

   FIX UTAMA:
   - Jika notif membawa URL kosong, "/", "./", "#", atau root GitHub,
     klik notif DIPAKSA membuka halaman Updating Framer.
   - skipWaiting + clients.claim agar update service worker cepat aktif.
========================================================== */

const MAXUSE_DEFAULT_OPEN_URL = "https://max-use-template-kantahv1.framer.website/updating";

function MAXUSE_SW_normalizeOpenUrl(rawUrl) {
  const text = String(rawUrl || "").trim();

  if (!text || text === "/" || text === "./" || text === "#") {
    return MAXUSE_DEFAULT_OPEN_URL;
  }

  // Jika masih root GitHub, jangan buka root; paksa ke Updating.
  if (
    text === "https://makyuslogrecord-sudo.github.io/" ||
    text === "https://makyuslogrecord-sudo.github.io" ||
    text.indexOf("makyuslogrecord-sudo.github.io/?") === 8 ||
    text.indexOf("makyuslogrecord-sudo.github.io/#") === 8
  ) {
    return MAXUSE_DEFAULT_OPEN_URL;
  }

  if (/^https?:\/\//i.test(text)) {
    return text;
  }

  return MAXUSE_DEFAULT_OPEN_URL;
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

try {
  importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

  firebase.initializeApp({
    apiKey: "AIzaSyBu_dozVu0jC71-PuJn4h7eC33eWsjcxuc",
    authDomain: "max-use-template-kantah-v1.firebaseapp.com",
    projectId: "max-use-template-kantah-v1",
    storageBucket: "max-use-template-kantah-v1.firebasestorage.app",
    messagingSenderId: "961455902199",
    appId: "1:961455902199:web:62a3fdaed44ca6f92d32f2"
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification || {};
    const data = payload.data || {};
    const linkFromFcm = payload.fcmOptions && payload.fcmOptions.link ? payload.fcmOptions.link : "";
    const openUrl = MAXUSE_SW_normalizeOpenUrl(data.url || data.link || linkFromFcm);

    const title = notification.title || data.title || "MAX-USE";
    const options = {
      body: notification.body || data.body || "Ada notifikasi baru dari MAX-USE.",
      icon: data.icon || notification.icon || "./favicon.ico",
      badge: data.badge || "./favicon.ico",
      tag: data.tag || "MAXUSE_NOTIFICATION",
      renotify: true,
      silent: false,
      vibrate: [220, 90, 220],
      requireInteraction: data.requireInteraction === "true",
      data: {
        url: openUrl,
        type: data.type || "GENERAL",
        menu: data.menu || "",
        nomor_berkas: data.nomor_berkas || "",
        tahun_berkas: data.tahun_berkas || ""
      }
    };

    return self.registration.showNotification(title, options);
  });

  console.log("[MAX-USE FCM SW V4] aktif. Default open:", MAXUSE_DEFAULT_OPEN_URL);

} catch (err) {
  console.error("[MAX-USE FCM SW V4] evaluation/init failed:", err);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification && event.notification.data ? event.notification.data : {};
  const targetUrl = MAXUSE_SW_normalizeOpenUrl(data.url);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        try {
          const clientUrl = new URL(client.url);
          const target = new URL(targetUrl);

          if (clientUrl.href === target.href && "focus" in client) {
            return client.focus();
          }
        } catch (e) {}
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
