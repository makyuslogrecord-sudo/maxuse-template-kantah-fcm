/* ==========================================================
   MAX-USE TEMPLATE KANTAH v1
   FILE: firebase-messaging-sw.js
   VERSION: V6_RAW_PUSH_FINAL
   PURPOSE: Service Worker Web Push MAX-USE

   Kenapa V6:
   - Tidak memakai firebase-messaging-compat di service worker.
   - Menangkap event push langsung dengan self.addEventListener("push").
   - Mencegah notifikasi generik Chrome:
     "Situs ini diperbarui di latar belakang".
   - Semua klik notif diarahkan ke halaman Updating Framer.
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

function MAXUSE_SW_readPayload(event) {
  try {
    if (!event.data) return {};
    return event.data.json() || {};
  } catch (err) {
    try {
      return { data: { body: event.data ? event.data.text() : "" } };
    } catch (e) {
      return {};
    }
  }
}

function MAXUSE_SW_pickData(payload) {
  // FCM data message biasanya masuk di payload.data.
  // Fallback dibuat agar tetap aman jika bentuk payload berbeda.
  return payload && payload.data ? payload.data : (payload || {});
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const payload = MAXUSE_SW_readPayload(event);
  const data = MAXUSE_SW_pickData(payload);
  const notification = payload.notification || {};

  const openUrl = MAXUSE_SW_normalizeOpenUrl(
    data.url || data.link ||
    (payload.fcmOptions && payload.fcmOptions.link) ||
    (payload.webpush && payload.webpush.fcm_options && payload.webpush.fcm_options.link)
  );

  const nomor = data.nomor_berkas || "";
  const tahun = data.tahun_berkas || "";
  const pemohon = data.nama_pemohon || "";
  const dari = data.dari_petugas || "";
  const ke = data.ke_petugas || "";

  let title = data.title || notification.title || "MAX-USE";
  let body = data.body || notification.body || "Ada notifikasi baru dari MAX-USE.";

  // Extra fallback agar notif KIRIM tetap informatif walau body kosong.
  if (data.type === "UPDATING_KIRIM" && !data.body) {
    title = "📥 Berkas Masuk" + (nomor ? ": " + nomor + (tahun ? "/" + tahun : "") : "");
    const parts = [];
    if (dari) parts.push("Dari: " + dari);
    if (pemohon) parts.push("Pemohon: " + pemohon);
    if (ke) parts.push("Untuk: " + ke);
    body = parts.length ? parts.join(" • ") : "Ada berkas masuk ke Inbox MAX-USE.";
  }

  const options = {
    body: body,
    icon: data.icon || notification.icon || "./favicon.ico",
    badge: data.badge || "./favicon.ico",
    tag: data.tag || ("MAXUSE_" + Date.now()),
    renotify: true,
    silent: false,
    vibrate: [280, 100, 280, 100, 280],
    requireInteraction: data.requireInteraction === "true" || data.type === "UPDATING_KIRIM",
    data: {
      url: openUrl,
      type: data.type || "GENERAL",
      menu: data.menu || "",
      nomor_berkas: nomor,
      tahun_berkas: tahun,
      nama_pemohon: pemohon,
      dari_petugas: dari,
      ke_petugas: ke
    },
    actions: [
      { action: "open", title: "Buka Updating" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

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
