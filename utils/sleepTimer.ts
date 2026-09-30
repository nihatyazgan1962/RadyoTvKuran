type SleepTimerCallback = (remainingSeconds: number, isFinished: boolean) => void;

class SleepTimerManager {
  private timerId: ReturnType<typeof setInterval> | null = null;
  private remainingSeconds: number = 0;
  private targetTimestamp: number = 0;
  private listeners: Set<SleepTimerCallback> = new Set();
  private onExpireCallbacks: Set<() => void> = new Set();

  public subscribe(cb: SleepTimerCallback): () => void {
    this.listeners.add(cb);
    cb(this.getRemainingSeconds(), false);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public onExpire(cb: () => void): () => void {
    this.onExpireCallbacks.add(cb);
    return () => {
      this.onExpireCallbacks.delete(cb);
    };
  }

  public setTimer(minutes: number) {
    this.cancelTimer();
    if (minutes <= 0) return;

    this.remainingSeconds = minutes * 60;
    this.targetTimestamp = Date.now() + this.remainingSeconds * 1000;

    this.notifyListeners(this.remainingSeconds, false);

    this.timerId = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((this.targetTimestamp - now) / 1000));
      this.remainingSeconds = left;

      if (left <= 0) {
        this.cancelTimer();
        this.notifyListeners(0, true);
        this.onExpireCallbacks.forEach(cb => {
          try {
            cb();
          } catch (e) {
            console.error('Sleep timer expire error:', e);
          }
        });
      } else {
        this.notifyListeners(left, false);
      }
    }, 1000);
  }

  public cancelTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.remainingSeconds = 0;
    this.targetTimestamp = 0;
    this.notifyListeners(0, false);
  }

  public getRemainingSeconds(): number {
    if (!this.timerId) return 0;
    const now = Date.now();
    return Math.max(0, Math.ceil((this.targetTimestamp - now) / 1000));
  }

  public isActive(): boolean {
    return this.timerId !== null && this.getRemainingSeconds() > 0;
  }

  private notifyListeners(sec: number, isFinished: boolean) {
    this.listeners.forEach(cb => {
      try {
        cb(sec, isFinished);
      } catch (e) {
        console.error('Sleep timer listener error:', e);
      }
    });
  }
}

export const sleepTimer = new SleepTimerManager();
