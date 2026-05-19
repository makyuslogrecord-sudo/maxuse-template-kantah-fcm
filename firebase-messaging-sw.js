/* ==========================================================
   MAX-USE TEMPLATE KANTAH v1
   FILE: firebase-messaging-sw.js
   VERSION: V5_DATA_MESSAGE_RICH_NOTIF
   PURPOSE: Firebase Cloud Messaging Service Worker

   FIX:
   - Data-message only: tampilkan title/body dari data FCM.
   - Hindari notifikasi Chrome generik “Situs ini diperbarui di latar belakang”.
   - Klik notif selalu diarahkan ke halaman Updating jika URL kosong/root.
   - Minta getar dan non-silent. Bunyi tetap bergantung setting Chrome/Android.
========================================================== */

const MAXUSE_DEFAULT_OPEN_URL = "https://max-use-template-kantahv1.framer.website/updating";

function MAXUSE_SW_normalizeOpenUrl(rawUrl) {
  const text = String(rawUrl || "").trim();

  if (!text || text === "/" || text === "./" || text === "#") {
    return MAXUSE_DEFAULT_OPEN_URL;
  }

  if (
    text === "https://makyuslogrecord-sudo.github.io/" ||
    text === "https://makyuslogrecord-sudo.github.io" ||
    text.includes("makyuslogrecord-sudo.github.io/?") ||
    text.includes("makyuslogrecord-sudo.github.io/#")
  ) {
    return MAXUSE_DEFAULT_OPEN_URL;
  }

  if (/^https?:\/\//i.test(text)) return text;

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
    const data = payload.data || {};
    const openUrl = MAXUSE_SW_normalizeOpenUrl(data.url || data.link);

    const title = data.title || "MAX-USE";
    const options = {
      body: data.body || "Ada notifikasi baru dari MAX-USE.",
      icon: data.icon || "./favicon.ico",
      badge: data.badge || "./favicon.ico",
      tag: data.tag || ("MAXUSE_" + Date.now()),
      renotify: true,
      silent: false,
      vibrate: [260, 90, 260, 90, 260],
      requireInteraction: data.requireInteraction === "true",
      data: {
        url: openUrl,
        type: data.type || "GENERAL",
        menu: data.menu || "",
        nomor_berkas: data.nomor_berkas || "",
        tahun_berkas: data.tahun_berkas || "",
        nama_pemohon: data.nama_pemohon || "",
        dari_petugas: data.dari_petugas || "",
        ke_petugas: data.ke_petugas || ""
      }
    };

    return self.registration.showNotification(title, options);
  });

  console.log("[MAX-USE FCM SW V5] aktif. Default open:", MAXUSE_DEFAULT_OPEN_URL);

} catch (err) {
  console.error("[MAX-USE FCM SW V5] evaluation/init failed:", err);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification && event.notification.data ? event.notification.data : {};
  const targetUrl = MAXUSE_SW_normalizeOpenUrl(data.url);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        try {
          const target = new URL(targetUrl);
          if (client.url === target.href && "focus" in client) {
            return client.focus();
          }
        } catch (e) {}
      }

      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
