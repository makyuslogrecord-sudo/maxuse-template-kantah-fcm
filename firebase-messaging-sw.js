/* ==========================================================
   MAX-USE TEMPLATE KANTAH v1
   FILE: firebase-messaging-sw.js
   VERSION: V2_SAFE_EVALUATION_FIX
   PURPOSE: Firebase Cloud Messaging Service Worker

   Catatan penting:
   - File ini wajib berada satu folder/domain dengan index.html notifier.
   - GitHub Pages path:
     /maxuse-template-kantah-fcm/firebase-messaging-sw.js
========================================================== */

try {
  importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

  firebase.initializeApp({
    apiKey: "AIzaSyBu_doZVuOjC71-PuJn4h7eC33eWsjcxuc",
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

    const title = notification.title || data.title || "MAX-USE";
    const options = {
      body: notification.body || data.body || "Ada notifikasi baru dari MAX-USE.",
      icon: data.icon || notification.icon || "./favicon.ico",
      badge: data.badge || "./favicon.ico",
      tag: data.tag || "MAXUSE_NOTIFICATION",
      renotify: true,
      requireInteraction: data.requireInteraction === "true",
      data: {
        url: data.url || data.link || "/",
        type: data.type || "GENERAL",
        menu: data.menu || "",
        nomor_berkas: data.nomor_berkas || "",
        tahun_berkas: data.tahun_berkas || ""
      }
    };

    return self.registration.showNotification(title, options);
  });

  console.log("[MAX-USE FCM SW] aktif.");

} catch (err) {
  // Jangan biarkan service worker gagal register hanya karena init/import error.
  // Error tetap bisa dibaca dari DevTools bila diperlukan.
  console.error("[MAX-USE FCM SW] evaluation/init failed:", err);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification && event.notification.data ? event.notification.data : {};
  const targetUrl = data.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        try {
          const clientUrl = new URL(client.url);
          const target = new URL(targetUrl, self.location.origin);

          if (clientUrl.origin === target.origin && "focus" in client) {
            client.focus();
            if ("navigate" in client) return client.navigate(target.href);
            return;
          }
        } catch (e) {}
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
