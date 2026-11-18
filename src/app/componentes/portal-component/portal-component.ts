import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiEntity, ComparaSaludApiService } from '../../services/comparasalud-api.service';
import { AuthService } from '../../services/auth.service';

type PortalMode = 'explorar' | 'favoritos' | 'proveedor' | 'administracion';
type CatalogType = 'todos' | 'medicos' | 'servicios' | 'centros' | 'medicamentos';
type FieldType = 'text' | 'number' | 'date' | 'json';

interface CatalogItem {
  id: string;
  type: Exclude<CatalogType, 'todos'>;
  label: string;
  subtitle: string;
  detail: string;
  price: number | null;
  raw: ApiEntity;
}

interface ResourceField {
  key: string;
  label: string;
  type: FieldType;
}

interface ResourceConfig {
  key: string;
  label: string;
  collectionPath: string;
  itemPath: string;
  fields: ResourceField[];
  clientDelete?: boolean;
}

const resource = (
  key: string,
  label: string,
  collectionPath: string,
  itemPath: string,
  fields: ResourceField[],
  clientDelete = false,
): ResourceConfig => ({ key, label, collectionPath, itemPath, fields, clientDelete });

const ADMIN_RESOURCES: ResourceConfig[] = [
  resource('centros', 'Centros médicos', 'centros-medicos', 'centro-medico', [
    { key: 'direccion', label: 'Dirección', type: 'text' }, { key: 'latitud', label: 'Latitud', type: 'number' },
    { key: 'longitud', label: 'Longitud', type: 'number' }, { key: 'tipoGestion', label: 'Tipo de gestión', type: 'text' },
    { key: 'telefono', label: 'Teléfono', type: 'text' }, { key: 'distrito', label: 'Distrito', type: 'text' },
    { key: 'ciudad', label: 'Ciudad', type: 'text' }, { key: 'administrador', label: 'Administrador (JSON)', type: 'json' },
  ]),
  resource('medicos', 'Médicos', 'medicos', 'medico', [
    { key: 'numerocolegiatura', label: 'N.º de colegiatura', type: 'number' }, { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'apellido', label: 'Apellido', type: 'text' }, { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
    { key: 'centroMedico', label: 'Centro médico (JSON)', type: 'json' }, { key: 'especialidades', label: 'Especialidades (JSON array)', type: 'json' },
  ]),
  resource('servicios', 'Servicios', 'servicios', 'servicio', [
    { key: 'nombre', label: 'Nombre', type: 'text' }, { key: 'precio', label: 'Precio', type: 'number' },
    { key: 'descripcion', label: 'Descripción', type: 'text' }, { key: 'centroMedico', label: 'Centro médico (JSON)', type: 'json' },
    { key: 'medicamento', label: 'Medicamento (JSON)', type: 'json' }, { key: 'medico', label: 'Médico (JSON)', type: 'json' },
    { key: 'tipoServicio', label: 'Tipo de servicio (JSON)', type: 'json' },
  ]),
  resource('medicamentos', 'Medicamentos', 'medicamentos', 'medicamento', [
    { key: 'nommbreComercial', label: 'Nombre comercial', type: 'text' }, { key: 'principioActivo', label: 'Principio activo', type: 'text' },
    { key: 'laboratorio', label: 'Laboratorio', type: 'text' }, { key: 'presentacion', label: 'Presentación', type: 'text' },
    { key: 'fechaRegistro', label: 'Fecha de registro', type: 'date' }, { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'precio', label: 'Precio', type: 'number' }, { key: 'stock', label: 'Stock', type: 'number' },
    { key: 'proveedor', label: 'Proveedor (JSON)', type: 'json' }, { key: 'centroMedico', label: 'Centro médico (JSON)', type: 'json' },
  ]),
  resource('proveedores', 'Proveedores', 'proveedores', 'proveedor', [
    { key: 'razonSocial', label: 'Razón social', type: 'text' }, { key: 'ruc', label: 'RUC', type: 'text' },
    { key: 'telefono', label: 'Teléfono', type: 'text' }, { key: 'direccion', label: 'Dirección', type: 'text' },
  ]),
  resource('especialidades', 'Especialidades', 'especialidades', 'especialidad', [
    { key: 'nombre', label: 'Nombre', type: 'text' },
  ]),
  resource('tipos-servicio', 'Tipos de servicio', 'tipos-servicios', 'tipo-servicio', [
    { key: 'nombre', label: 'Nombre', type: 'text' },
  ]),
  resource('administradores', 'Administradores', 'administradores', 'administrador', [
    { key: 'nombre', label: 'Nombre', type: 'text' }, { key: 'apellido', label: 'Apellido', type: 'text' },
    { key: 'dni', label: 'DNI', type: 'text' },
  ]),
  resource('clientes', 'Clientes', 'clientes', 'cliente', [
    { key: 'nombre', label: 'Nombre', type: 'text' }, { key: 'apellido', label: 'Apellido', type: 'text' },
    { key: 'dni', label: 'DNI', type: 'text' },
  ], true),
];

@Component({
  imports: [RouterLink],
  selector: 'app-portal-component',
  styleUrl: './portal-component.css',
  templateUrl: './portal-component.html',
})
export class PortalComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ComparaSaludApiService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly mode = signal<PortalMode>(this.route.snapshot.data['mode'] as PortalMode);
  readonly username = computed(() => this.auth.session()?.username ?? '');
  readonly items = signal<CatalogItem[]>([]);
  readonly activeType = signal<CatalogType>('todos');
  readonly query = signal('');
  readonly minPrice = signal('');
  readonly maxPrice = signal('');
  readonly selectedForComparison = signal(new Set<string>());
  readonly loading = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly detailItem = signal<CatalogItem | null>(null);
  readonly resources = ADMIN_RESOURCES;
  readonly selectedResource = signal<ResourceConfig>(ADMIN_RESOURCES[0]);
  readonly rows = signal<ApiEntity[]>([]);
  readonly formValues = signal<Record<string, string>>({});
  readonly editingId = signal<string | number | null>(null);
  readonly formOpen = signal(false);
  readonly saving = signal(false);
  readonly filteredItems = computed(() => {
    const query = this.normalize(this.query());
    const min = this.minPrice() === '' ? -Infinity : Number(this.minPrice());
    const max = this.maxPrice() === '' ? Infinity : Number(this.maxPrice());
    const hasPriceFilter = min !== -Infinity || max !== Infinity;
    return this.items().filter((item) => {
      const matchesType = this.activeType() === 'todos' || item.type === this.activeType();
      const searchable = this.normalize(`${item.label} ${item.subtitle} ${item.detail}`);
      return matchesType && (!query || searchable.includes(query)) &&
        (!hasPriceFilter || (item.price !== null && item.price >= min && item.price <= max));
    });
  });
  readonly comparedItems = computed(() =>
    this.items()
      .filter((item) => this.selectedForComparison().has(item.id))
      .sort((left, right) => (left.price ?? Infinity) - (right.price ?? Infinity)),
  );

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => this.query.set(params.get('q') ?? ''));
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      const mode = data['mode'] as PortalMode;
      this.mode.set(mode);
      this.error.set('');
      this.notice.set('');
      this.formOpen.set(false);
      this.rows.set([]);
      this.selectedForComparison.set(new Set());
      if (mode === 'explorar') this.loadCatalogs();
      if (mode === 'favoritos') this.loadFavoritesNotice();
      if (mode === 'proveedor') this.loadProviderCatalog();
      if (mode === 'administracion') this.loadResource(this.selectedResource());
    });
  }

  setType(type: CatalogType): void {
    this.activeType.set(type);
    this.selectedForComparison.set(new Set());
  }

  updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  updateMinPrice(event: Event): void {
    this.minPrice.set((event.target as HTMLInputElement).value);
  }

  updateMaxPrice(event: Event): void {
    this.maxPrice.set((event.target as HTMLInputElement).value);
  }

  showDetails(item: CatalogItem): void {
    this.detailItem.set(item);
  }

  closeDetails(): void {
    this.detailItem.set(null);
  }

  toggleComparison(item: CatalogItem): void {
    const selected = new Set(this.selectedForComparison());
    if (selected.has(item.id)) selected.delete(item.id);
    else if (selected.size > 0 && !this.items().some((candidate) => selected.has(candidate.id) && candidate.type === item.type)) {
      this.notice.set('Compara opciones de la misma categoría.');
      return;
    } else if (selected.size < 3) selected.add(item.id);
    else {
      this.notice.set('Puedes comparar hasta 3 opciones a la vez.');
      return;
    }
    this.notice.set('');
    this.selectedForComparison.set(selected);
  }

  selectResource(config: ResourceConfig): void {
    this.selectedResource.set(config);
    this.formOpen.set(false);
    this.editingId.set(null);
    this.notice.set('');
    this.loadResource(config);
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.formValues.set({});
    this.formOpen.set(true);
  }

  openEditForm(row: ApiEntity): void {
    const values: Record<string, string> = {};
    for (const field of this.selectedResource().fields) {
      const value = row[field.key];
      values[field.key] =
        value === undefined || value === null
          ? ''
          : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);
    }
    this.editingId.set((row['id'] as string | number | undefined) ?? null);
    this.formValues.set(values);
    this.formOpen.set(true);
  }

  updateField(key: string, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.formValues.update((values) => ({ ...values, [key]: target.value }));
  }

  saveResource(event: Event): void {
    event.preventDefault();
    const config = this.selectedResource();
    const payload: ApiEntity = {};
    try {
      for (const field of config.fields) {
        const value = this.formValues()[field.key]?.trim();
        if (!value) continue;
        if (field.type === 'number') payload[field.key] = Number(value);
        else if (field.type === 'json') payload[field.key] = JSON.parse(value);
        else payload[field.key] = value;
      }
    } catch {
      this.error.set('Revisa los campos JSON: deben contener un objeto o arreglo válido.');
      return;
    }

    this.saving.set(true);
    const id = this.editingId();
    const request = id === null
      ? this.api.create(config.itemPath, payload)
      : config.key === 'clientes'
        ? null
        : this.api.update(config.itemPath, { ...payload, id });

    if (!request) {
      this.saving.set(false);
      this.error.set('El backend no ofrece una operación de actualización para clientes.');
      return;
    }

    request.subscribe({
      next: () => {
        this.formOpen.set(false);
        this.notice.set(`${config.label}: cambios guardados.`);
        this.loadResource(config);
      },
      error: (error: unknown) => this.reportError(error, 'No se pudo guardar el registro.'),
      complete: () => this.saving.set(false),
    });
  }

  deleteResource(row: ApiEntity): void {
    const id = row['id'] as string | number | undefined;
    if (id === undefined || !window.confirm('¿Eliminar este registro?')) return;
    const config = this.selectedResource();
    const request = config.clientDelete
      ? this.api.removeClient(id)
      : this.api.remove(config.itemPath, id);
    request.subscribe({
      next: () => {
        this.notice.set('Registro eliminado.');
        this.loadResource(config);
      },
      error: (error: unknown) => this.reportError(error, 'No se pudo eliminar el registro.'),
    });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  displayValue(value: unknown): string {
    if (value === undefined || value === null || value === '') return '—';
    if (typeof value !== 'object') return String(value);
    const row = value as ApiEntity;
    return String(row['nombre'] ?? row['razonSocial'] ?? row['distrito'] ?? row['id'] ?? 'Detalle');
  }

  private loadCatalogs(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getCatalogs().subscribe({
      next: (catalogs) => {
        this.items.set([
          ...catalogs.doctors.map((row) => this.catalogItem(row, 'medicos')),
          ...catalogs.services.map((row) => this.catalogItem(row, 'servicios')),
          ...catalogs.centers.map((row) => this.catalogItem(row, 'centros')),
          ...catalogs.medicines.map((row) => this.catalogItem(row, 'medicamentos')),
        ]);
      },
      error: (error: unknown) => this.reportError(error, 'No se pudieron cargar los catálogos.'),
      complete: () => this.loading.set(false),
    });
  }

  private loadProviderCatalog(): void {
    const medicines = ADMIN_RESOURCES.find((config) => config.key === 'medicamentos');
    if (!medicines) {
      this.error.set('No se encontró la configuración del catálogo de medicamentos.');
      return;
    }
    this.selectedResource.set(medicines);
    this.loading.set(true);
    this.error.set('');
    this.api.list('medicamentos').subscribe({
      next: (rows) => this.rows.set(rows),
      error: (error: unknown) => this.reportError(error, 'No se pudo cargar el catálogo de medicamentos.'),
      complete: () => this.loading.set(false),
    });
  }

  private loadResource(config: ResourceConfig): void {
    this.loading.set(true);
    this.error.set('');
    this.api.list(config.collectionPath).subscribe({
      next: (rows) => this.rows.set(rows),
      error: (error: unknown) => this.reportError(error, `No se pudieron cargar ${config.label.toLowerCase()}.`),
      complete: () => this.loading.set(false),
    });
  }

  private loadFavoritesNotice(): void {
    this.error.set('');
    this.rows.set([]);
    this.notice.set(
      'La API de favoritos requiere el ID de Cliente, pero el inicio de sesión no devuelve ni vincula ese ID. El backend debe exponer el perfil del cliente autenticado antes de cargar o guardar favoritos de forma segura.',
    );
  }

  private catalogItem(row: ApiEntity, type: Exclude<CatalogType, 'todos'>): CatalogItem {
    const center = row['centroMedico'] as ApiEntity | undefined;
    const specialty = row['especialidades'];
    const provider = row['proveedor'] as ApiEntity | undefined;
    const specialties = Array.isArray(specialty)
      ? specialty.map((entry) => this.displayValue(entry)).join(', ')
      : '';
    const title = String(
      row['nombre'] ??
      row['nombreComercial'] ??
      row['nommbreComercial'] ??
      row['distrito'] ??
      row['razonSocial'] ??
      'Servicio de salud',
    );
    const subtitle = [
      row['apellido'] ? `${row['nombre']} ${row['apellido']}` : '',
      specialties,
      provider?.['razonSocial'],
      row['tipoGestion'],
      row['principioActivo'],
      center?.['distrito'],
    ].filter(Boolean).map(String).join(' · ');
    const priceValue = Number(row['precio']);
    return {
      id: `${type}-${String(row['id'] ?? title)}`,
      type,
      label: title,
      subtitle,
      detail: String(row['descripcion'] ?? row['direccion'] ?? row['presentacion'] ?? center?.['direccion'] ?? ''),
      price: Number.isFinite(priceValue) && priceValue > 0 ? priceValue : null,
      raw: row,
    };
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  private reportError(error: unknown, fallback: string): void {
    this.loading.set(false);
    if (error instanceof HttpErrorResponse && error.status === 0) {
      this.error.set('No se pudo conectar con el backend. Verifica que esté activo en http://localhost:8081.');
      return;
    }
    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.auth.logout();
      void this.router.navigateByUrl('/login');
      return;
    }
    if (error instanceof HttpErrorResponse && error.status === 403) {
      this.error.set('Tu cuenta no tiene permisos para esta operación.');
      return;
    }
    this.error.set(error instanceof HttpErrorResponse ? `${fallback} (HTTP ${error.status})` : fallback);
  }
}
