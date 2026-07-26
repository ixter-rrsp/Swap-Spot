import { createClient } from "@/utils/supabase/client";

type OnDef = { event: string; schema?: string; table: string; filter?: string };

type HandlerEntry = {
  onDef: OnDef;
  handler: (payload: any) => void;
};

class SupabaseChannelRegistry {
  private client = createClient();
  private channels: Map<
    string,
    {
      name: string;
      handlers: Map<number, HandlerEntry>;
      channel: any | null;
      subscribed: boolean;
    }
  > = new Map();

  private idCounter = 0;

  subscribe(channelName: string, onDef: OnDef, handler: (payload: any) => void) {
    const entry = this.channels.get(channelName) ?? {
      name: channelName,
      handlers: new Map<number, HandlerEntry>(),
      channel: null,
      subscribed: false,
    };

    const id = ++this.idCounter;
    entry.handlers.set(id, { onDef, handler });
    this.channels.set(channelName, entry);

    // (re)create channel with all handlers to avoid adding callbacks after subscribe
    this.recreateChannel(channelName);

    return () => this.unsubscribe(channelName, id);
  }

  private recreateChannel(channelName: string) {
    const entry = this.channels.get(channelName);
    if (!entry) return;

    try {
      entry.channel?.unsubscribe();
    } catch (e) {
      // ignore
    }

    const ch = this.client.channel(channelName);

    for (const { onDef, handler } of entry.handlers.values()) {
      (ch as any).on("postgres_changes", onDef, handler);
    }

    try {
      ch.subscribe();
      entry.channel = ch;
      entry.subscribed = true;
    } catch (e) {
      // best-effort
      entry.channel = ch;
      entry.subscribed = false;
    }
  }

  private unsubscribe(channelName: string, id: number) {
    const entry = this.channels.get(channelName);
    if (!entry) return;

    entry.handlers.delete(id);

    if (entry.handlers.size === 0) {
      try {
        entry.channel?.unsubscribe();
      } catch (e) {
        // ignore
      }
      this.channels.delete(channelName);
      return;
    }

    // recreate channel with remaining handlers
    this.recreateChannel(channelName);
  }
}

export const channelRegistry = new SupabaseChannelRegistry();

export function subscribeChannel(
  channelName: string,
  onDef: OnDef,
  handler: (payload: any) => void
) {
  return channelRegistry.subscribe(channelName, onDef, handler);
}

export default channelRegistry;
