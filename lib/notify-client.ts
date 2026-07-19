"use client";

/**
 * Call this right after any client action that creates a notification
 * server-side (settings changes, role add/edit/archive, etc.) so the
 * topbar bell refetches instantly instead of waiting for a page reload.
 */
export function broadcastNotificationsUpdate() {
  window.dispatchEvent(new CustomEvent("fincoach:notifications-update"));
}