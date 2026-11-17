import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ROLE } from '../core/labels';
import { Role } from '../core/models';

interface NavItem { label: string; path: string; roles?: Role[] }

const NAV: NavItem[] = [
  { label: 'Tableau de bord', path: '/dashboard' },
  { label: 'Commandes', path: '/orders' },
  { label: 'Livreurs', path: '/deliverers', roles: ['ADMIN', 'MANAGER', 'OPERATOR'] },
  { label: 'Clients', path: '/customers', roles: ['ADMIN', 'MANAGER', 'OPERATOR'] },
  { label: 'Incidents', path: '/incidents', roles: ['ADMIN', 'MANAGER', 'OPERATOR'] },
  { label: 'Statistiques', path: '/statistics', roles: ['ADMIN', 'MANAGER'] },
  { label: 'Administration', path: '/admin', roles: ['ADMIN'] },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell">
      <aside class="side">
        <a class="brand" routerLink="/dashboard"><span class="mark" aria-hidden="true"></span>Relais</a>
        <nav aria-label="Navigation principale">
          @for (item of items(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active">{{ item.label }}</a>
          }
        </nav>
        <div class="who">
          <strong>{{ auth.session()?.fullName }}</strong>
          <span>{{ roleLabel() }}</span>
          <button type="button" class="btn btn-ghost btn-sm" (click)="auth.logout()">Se déconnecter</button>
        </div>
      </aside>
      <main><router-outlet /></main>
    </div>
  `,
  styles: `
    .shell { display: grid; grid-template-columns: 232px 1fr; min-height: 100vh; }
    .side { background: var(--ink); color: #dbe4ea; display: flex; flex-direction: column; padding: 1.25rem 0; position: sticky; top: 0; height: 100vh; }
    .brand { display: flex; align-items: center; gap: .6rem; color: #fff; font-weight: 700; font-size: 1.25rem; letter-spacing: .01em; text-decoration: none; padding: 0 1.25rem 1.25rem; }
    .mark { width: 22px; height: 22px; border-radius: 50%; border: 4px solid var(--signal); position: relative; }
    .mark::after { content: ''; position: absolute; left: 14px; top: 5px; width: 18px; height: 4px; background: var(--signal); }
    nav { display: flex; flex-direction: column; }
    nav a { color: inherit; text-decoration: none; padding: .6rem 1.25rem; border-left: 4px solid transparent; }
    nav a:hover { background: var(--ink-soft); }
    nav a.active { background: var(--ink-soft); border-left-color: var(--signal); color: #fff; font-weight: 600; }
    .who { margin-top: auto; padding: 1rem 1.25rem 0; display: flex; flex-direction: column; gap: .2rem; border-top: 1px solid var(--ink-soft); }
    .who span { color: #98a9b5; font-size: .85rem; margin-bottom: .5rem; }
    .who .btn-ghost { color: #fff; border-color: #3a5063; justify-content: center; }
    .who .btn-ghost:hover { background: var(--ink-soft); }
    main { min-width: 0; }
    @media (max-width: 860px) {
      .shell { grid-template-columns: 1fr; }
      .side { position: static; height: auto; flex-direction: row; flex-wrap: wrap; align-items: center; padding: .5rem 0; }
      .brand { padding: 0 1rem; }
      nav { flex-direction: row; flex-wrap: wrap; flex: 1; }
      nav a { border-left: 0; border-bottom: 4px solid transparent; padding: .5rem .8rem; }
      nav a.active { border-bottom-color: var(--signal); }
      .who { margin: 0; border: 0; padding: 0 1rem; flex-direction: row; align-items: center; gap: .75rem; }
      .who span { display: none; }
    }
  `,
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly items = computed(() =>
    NAV.filter((i) => !i.roles || (this.auth.role() !== null && i.roles.includes(this.auth.role() as Role))),
  );
  protected readonly roleLabel = computed(() => {
    const role = this.auth.role();
    return role ? ROLE[role] : '';
  });
}
