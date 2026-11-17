import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="pager" aria-label="Pagination">
      <span class="muted">{{ total() }} résultat{{ total() > 1 ? 's' : '' }}</span>
      <span class="spacer"></span>
      @if (totalPages() > 1) {
        <button type="button" class="btn btn-ghost btn-sm" [disabled]="page() === 0" (click)="pageChange.emit(page() - 1)">Précédent</button>
        <span class="mono">Page {{ page() + 1 }} / {{ totalPages() }}</span>
        <button type="button" class="btn btn-ghost btn-sm" [disabled]="page() >= totalPages() - 1" (click)="pageChange.emit(page() + 1)">Suivant</button>
      }
    </nav>
  `,
  styles: `.pager { display: flex; align-items: center; gap: .75rem; padding-top: .9rem; }`,
})
export class Pager {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly total = input.required<number>();
  readonly pageChange = output<number>();
}
