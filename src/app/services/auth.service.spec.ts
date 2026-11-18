import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('authenticates against the backend and attaches the JWT to API requests', () => {
    auth.login('paciente@example.com', 'password').subscribe();
    const login = http.expectOne(`${environment.apiUrl}/authenticate`);
    expect(login.request.method).toBe('POST');
    expect(login.request.body).toEqual({ username: 'paciente@example.com', password: 'password' });
    login.flush({ jwt: 'test-token', roles: ['ROLE_CLIENTE'] });

    expect(auth.session()?.roles).toEqual(['ROLE_CLIENTE']);
    expect(JSON.parse(sessionStorage.getItem('comparasalud.auth') || '{}').token).toBe('test-token');

    TestBed.inject(HttpClient).get(`${environment.apiUrl}/clientes`).subscribe();
    const protectedRequest = http.expectOne(`${environment.apiUrl}/clientes`);
    expect(protectedRequest.request.headers.get('Authorization')).toBe('Bearer test-token');
    protectedRequest.flush([]);
  });

  it('registers a client using the backend role contract', () => {
    auth.register('paciente@example.com', 'password', 'CLIENTE').subscribe();
    const request = http.expectOne(`${environment.apiUrl}/register`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      username: 'paciente@example.com',
      password: 'password',
      rol: 'CLIENTE',
    });
    request.flush('Usuario registrado con éxito');
  });

  it('clears the session on logout', () => {
    auth.login('paciente@example.com', 'password').subscribe();
    http.expectOne(`${environment.apiUrl}/authenticate`).flush({
      jwt: 'test-token',
      roles: ['ROLE_CLIENTE'],
    });

    auth.logout();
    expect(auth.session()).toBeNull();
    expect(sessionStorage.getItem('comparasalud.auth')).toBeNull();
  });
});
