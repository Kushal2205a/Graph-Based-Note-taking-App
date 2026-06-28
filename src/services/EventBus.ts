import type { AppEvent } from "../types";

type Handler = (event: AppEvent) => void;
type Unsubscribe = () => void;

export class EventBus {
  private handlers = new Map<string, Set<Handler>>();
  private wildcards = new Set<Handler>();

  on(type: AppEvent["type"], handler: Handler): Unsubscribe {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  onAny(handler: Handler): Unsubscribe {
    this.wildcards.add(handler);
    return () => {
      this.wildcards.delete(handler);
    };
  }

  emit(event: AppEvent): void {
    const specific = this.handlers.get(event.type);
    if (specific) {
      for (const handler of specific) {
        handler(event);
      }
    }
    for (const handler of this.wildcards) {
      handler(event);
    }
  }

  clear(): void {
    this.handlers.clear();
    this.wildcards.clear();
  }
}
