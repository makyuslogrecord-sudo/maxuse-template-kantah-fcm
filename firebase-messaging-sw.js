/* ==========================================================
   MAX-USE TEMPLATE KANTAH v1
   FILE: firebase-messaging-sw.js
   PURPOSE: Firebase Cloud Messaging Service Worker
   PROJECT: max-use-template-kantah-v1
========================================================== */

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

  const title = notification.title || data.title || "MAX-USE";
  const options = {
    body: notification.body || data.body || "Ada notifikasi baru dari MAX-USE.",
    icon: data.icon || notification.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
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

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          try {
            const clientUrl = new URL(client.url);
            const target = new URL(targetUrl, self.location.origin);

            if (clientUrl.origin === target.origin) {
              client.navigate(target.href);
              return client.focus();
            }
          } catch (e) {}
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
