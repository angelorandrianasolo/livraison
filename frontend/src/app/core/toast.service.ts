import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; kind: 'success' | 'error'; message: string }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(message: string): void { this.push('success', message); }
  error(message: string): void { this.push('error', message); }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(kind: Toast['kind'], message: string): void {
    const id = ++this.seq;
    this._toasts.update((list) => [...list, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
