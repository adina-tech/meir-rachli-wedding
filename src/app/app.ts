import { Component, computed, effect, OnDestroy, signal } from '@angular/core';
import { launchConfetti } from './confetti';

/** ו׳ בכסלו תשפ״ז — יום שני, 16.11.2026, 19:00 שעון ישראל */
const WEDDING = new Date('2026-11-16T19:00:00+02:00');

interface Unit { label: string; value: string; }

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  protected readonly bride = 'רחלי';
  protected readonly groom = 'מאיר';
  protected readonly hebrewDate = 'ו׳ בכסלו תשפ״ז';
  protected readonly gregorianDate = 'יום שני · 16.11.2026';

  // ?preview=finale counts down 5 seconds to show the celebration
  private readonly target = new URLSearchParams(location.search).get('preview') === 'finale'
    ? new Date(Date.now() + 5000)
    : WEDDING;

  private readonly now = signal(Date.now());
  private readonly timer = setInterval(() => this.now.set(Date.now()), 1000);

  protected readonly remaining = computed(() => Math.max(0, this.target.getTime() - this.now()));
  protected readonly done = computed(() => this.remaining() === 0);

  protected readonly units = computed<Unit[]>(() => {
    const s = Math.floor(this.remaining() / 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return [
      { label: 'ימים', value: String(Math.floor(s / 86400)) },
      { label: 'שעות', value: pad(Math.floor(s / 3600) % 24) },
      { label: 'דקות', value: pad(Math.floor(s / 60) % 60) },
      { label: 'שניות', value: pad(s % 60) },
    ];
  });

  protected readonly sparkles = Array.from({ length: 22 }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 6,
    duration: 3 + Math.random() * 4,
  }));

  // Gold dust drifting up through the whole page
  protected readonly dust = Array.from({ length: 26 }, () => ({
    left: Math.random() * 100,
    size: 2 + Math.random() * 3,
    delay: -Math.random() * 18,
    duration: 12 + Math.random() * 10,
  }));

  protected readonly calendarUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent('החתונה של מאיר ורחלי') +
    '&dates=20261116T170000Z/20261116T230000Z' +
    '&details=' + encodeURIComponent('ו׳ בכסלו תשפ״ז');

  protected readonly copied = signal(false);

  constructor() {
    let fired = false;
    effect(() => {
      if (this.done() && !fired) {
        fired = true;
        clearInterval(this.timer);
        launchConfetti();
      }
    });
  }

  protected async share(): Promise<void> {
    const url = location.origin + location.pathname;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'מאיר ורחלי מתחתנים', text: `${this.hebrewDate} · סופרים יחד את הימים`, url });
      } catch { /* user cancelled */ }
      return;
    }
    await navigator.clipboard?.writeText(url);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2200);
  }

  protected celebrate(): void {
    launchConfetti(4000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
