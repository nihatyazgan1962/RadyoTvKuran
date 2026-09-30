type PlaybackSource = 'tv' | 'radio' | 'quran' | 'recording';

type StopCallback = () => void;

class PlaybackCoordinator {
  private listeners: Map<PlaybackSource, Set<StopCallback>> = new Map();

  register(source: PlaybackSource, onStop: StopCallback): () => void {
    if (!this.listeners.has(source)) {
      this.listeners.set(source, new Set());
    }
    this.listeners.get(source)!.add(onStop);

    return () => {
      this.listeners.get(source)?.delete(onStop);
    };
  }

  notifyActive(activeSource: PlaybackSource): void {
    this.listeners.forEach((callbacks, source) => {
      if (source !== activeSource) {
        callbacks.forEach((cb) => {
          try {
            cb();
          } catch (e) {
            console.error('Error stopping playback for source', source, e);
          }
        });
      }
    });
  }

  stopSource(source: PlaybackSource): void {
    const callbacks = this.listeners.get(source);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb();
        } catch (e) {
          console.error('Error stopping playback for source', source, e);
        }
      });
    }
  }

  stopAll(): void {
    this.listeners.forEach((callbacks) => {
      callbacks.forEach((cb) => {
        try {
          cb();
        } catch (e) {
          console.error(e);
        }
      });
    });
  }
}

export const playbackCoordinator = new PlaybackCoordinator();
