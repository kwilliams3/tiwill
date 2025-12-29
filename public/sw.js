self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  
  const options = {
    body: data.body || "",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [],
    tag: data.tag || "default",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "TiWill", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data;
  let url = "/feed";

  if (data.type === "message" && data.conversationId) {
    url = `/chat?id=${data.conversationId}`;
  } else if (data.type === "reaction" && data.postId) {
    url = `/feed#post-${data.postId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
