import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CustomersApi } from '../../core/api/customers.api';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/errors';
import { Customer } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { Pager } from '../../shared/pager';

@Component({
  selector: 'app-customers-list',
  imports: [RouterLink, ReactiveFormsModule, Pager],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <h1>Clients</h1>
          <p>Expéditeurs rattachés aux commandes.</p>
        </div>
        <a class="btn btn-signal" routerLink="/customers/new">Nouveau client</a>
      </header>
      <div class="filters">
        <input class="input" type="search" placeholder="Nom ou e-mail" aria-label="Rechercher" [formControl]="searchControl" />
      </div>
      <div class="card">
        @if (list.error()) {
          <p class="alert">Impossible de charger les clients.</p>
        } @else if (list.value(); as result) {
          @if (result.content.length === 0) {
            <p class="empty">Aucun client trouvé.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead><tr><th>Nom</th><th>E-mail</th><th>Téléphone</th><th>Adresse</th><th></th></tr></thead>
                <tbody>
                  @for (c of result.content; track c.id) {
                    <tr>
                      <td><strong>{{ c.name }}</strong></td>
                      <td>{{ c.email }}</td>
                      <td class="mono">{{ c.phone }}</td>
                      <td>{{ c.address }}</td>
                      <td class="actions">
                        <a class="btn btn-ghost btn-sm" [routerLink]="['/customers', c.id, 'edit']">Modifier</a>
                        @if (canDelete()) {
                          <button type="button" class="btn btn-danger btn-sm" (click)="remove(c)">Supprimer</button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <app-pager [page]="result.page" [totalPages]="result.totalPages" [total]="result.totalElements" (pageChange)="page.set($event)" />
          }
        } @else {
          <p class="skeleton">Chargement…</p>
        }
      </div>
    </div>
  `,
})
export class CustomersList {
  private readonly api = inject(CustomersApi);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly canDelete = () => this.auth.hasRole('ADMIN', 'MANAGER');
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly q = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  protected readonly page = linkedSignal({ source: () => this.q(), computation: () => 0 });
  protected readonly list = rxResource({
    params: () => ({ q: this.q(), page: this.page() }),
    stream: ({ params }) => this.api.search({ ...params, size: 10 }),
  });

  protected remove(customer: Customer): void {
    if (!confirm(`Supprimer le client « ${customer.name} » ?`)) {
      return;
    }
    this.api.delete(customer.id).subscribe({
      next: () => {
        this.toast.success('Client supprimé.');
        this.list.reload();
      },
      error: (err: unknown) => this.toast.error(errorMessage(err)),
    });
  }
}
