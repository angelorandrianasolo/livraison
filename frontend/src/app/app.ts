import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
    <div class="toasts" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class.error]="t.kind === 'error'" role="status">
          <span>{{ t.message }}</span>
          <button type="button" class="close" (click)="toast.dismiss(t.id)" aria-label="Fermer">×</button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts { position: fixed; right: 1rem; bottom: 1rem; display: flex; flex-direction: column; gap: .5rem; z-index: 50; max-width: min(420px, calc(100vw - 2rem)); }
    .toast { display: flex; gap: .75rem; align-items: flex-start; justify-content: space-between; background: var(--ink); color: #fff; border-left: 5px solid var(--ok); padding: .7rem .9rem; border-radius: var(--radius); box-shadow: 0 6px 20px rgba(18, 33, 46, .25); }
    .toast.error { border-left-color: var(--danger); }
    .close { background: none; border: 0; color: inherit; font-size: 1.2rem; line-height: 1; cursor: pointer; }
  `,
})
export class App {
  protected readonly toast = inject(ToastService);
}
