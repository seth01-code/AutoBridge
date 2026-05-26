export function triggerCartUpdate() {
  window.dispatchEvent(new Event("cartUpdated"));
}