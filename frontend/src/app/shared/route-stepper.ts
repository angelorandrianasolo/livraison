import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ORDER_STATUS } from '../core/labels';
import { OrderStatus } from '../core/models';

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'CREEE', label: 'Créée' },
  { key: 'ASSIGNEE', label: 'Assignée' },
  { key: 'PRISE_EN_CHARGE', label: 'Prise en charge' },
  { key: 'EN_TRANSIT', label: 'En transit' },
  { key: 'LIVREE', label: 'Livrée' },
];
const DETOURS: OrderStatus[] = ['ANNULEE', 'ECHEC_LIVRAISON', 'RETOURNEE'];

/** Tracé du parcours d'une commande : la ligne de route est le motif visuel de l'application. */
@Component({
  selector: 'app-route-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="route" [class.off]="detour()" aria-label="Progression de la commande">
      @for (step of steps; track step.key; let i = $index) {
        <li [class.done]="i < index()" [class.current]="i === index()" [attr.aria-current]="i === index() ? 'step' : null">
          <span class="node"></span>
          <span class="name">{{ step.label }}</span>
        </li>
      }
    </ol>
    @if (detour()) {
      <p class="detour">Hors parcours : <strong>{{ label() }}</strong></p>
    }
  `,
  styles: `
    .route { display: flex; list-style: none; margin: 0; padding: 0; }
    li { flex: 1; position: relative; display: flex; flex-direction: column; align-items: center; gap: .4rem; font-size: .82rem; color: var(--steel); text-align: center; }
    li::before { content: ''; position: absolute; top: 8px; right: 50%; width: 100%; height: 4px; background: var(--line); }
    li:first-child::before { display: none; }
    .node { position: relative; z-index: 1; width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 4px solid var(--line); }
    li.done::before { background: var(--ink); }
    li.done .node { background: var(--ink); border-color: var(--ink); }
    li.current .node { background: var(--signal); border-color: var(--ink); box-shadow: 0 0 0 4px rgba(242, 183, 5, .3); }
    li.current { color: var(--ink); font-weight: 650; }
    .off { opacity: .45; }
    .detour { margin: .9rem 0 0; padding: .5rem .8rem; background: #fbe4e1; color: var(--danger); border-radius: var(--radius); }
  `,
})
export class RouteStepper {
  readonly status = input.required<OrderStatus>();
  protected readonly steps = STEPS;
  protected readonly detour = computed(() => DETOURS.includes(this.status()));
  protected readonly label = computed(() => ORDER_STATUS[this.status()].label);
  protected readonly index = computed(() => STEPS.findIndex((s) => s.key === this.status()));
}
