import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from './environments/environment';
import { App } from './app';
import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the ComparaSalud landing page', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Transparencia');
    expect(compiled.querySelector('#beneficios')).toBeTruthy();
    expect(compiled.querySelector('#como-funciona')).toBeTruthy();
    expect(compiled.querySelector('#proveedores')).toBeTruthy();
    expect(compiled.querySelector('#about')).toBeTruthy();
  });

  it('should show the registration and login screens on their routes', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/registro');
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('h2')?.textContent).toContain('Crear tu cuenta');

    await router.navigateByUrl('/login');
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('h2')?.textContent).toContain('Bienvenido de nuevo');
  });

  it('redirects protected customer routes to login when there is no session', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/favoritos');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toContain('/login');
    expect(router.parseUrl(router.url).queryParams['returnUrl']).toBe('/favoritos');
    expect((fixture.nativeElement as HTMLElement).querySelector('h2')?.textContent).toContain('Bienvenido de nuevo');
  });

  it('searches live API catalogs and applies the landing-page query', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/explorar?q=cardio');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${environment.apiUrl}/medicos`).flush([
      { id: 1, nombre: 'Dra. Ana', apellido: 'García', especialidades: [{ id: 1, nombre: 'Cardiología' }] },
    ]);
    http.expectOne(`${environment.apiUrl}/servicios`).flush([]);
    http.expectOne(`${environment.apiUrl}/centros-medicos`).flush([]);
    http.expectOne(`${environment.apiUrl}/medicamentos`).flush([]);
    await fixture.whenStable();

    const rendered = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(rendered).toContain('Dra. Ana');
    expect(rendered).toContain('1 opciones');
    expect(rendered).not.toContain('No encontramos opciones');
    http.verify();
  });
});
