export function onReady(callback: () => void): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
    return;
  }
  callback();
}

export function eventNode(event: Event): Node | null {
  return event.target instanceof Node ? event.target : null;
}
