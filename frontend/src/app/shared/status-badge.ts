import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DELIVERER_STATUS, Meta, ORDER_STATUS, PRIORITY } from '../core/labels';

const MAPS: Record<'order' | 'deliverer' | 'priority', Record<string, Meta>> = {
  order: ORDER_STATUS,
  deliverer: DELIVERER_STATUS,
  priority: PRIORITY,
};

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="'tone-' + meta().tone">{{ meta().label }}</span>`,
})
export class StatusBadge {
  readonly kind = input.required<'order' | 'deliverer' | 'priority'>();
  readonly value = input.required<string>();

  protected readonly meta = computed<Meta>(
    () => MAPS[this.kind()][this.value()] ?? { label: this.value(), tone: 'neutral' },
  );
}
