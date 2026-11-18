import { Routes } from '@angular/router';
import { HomeComponent } from './componentes/home-component/home-component';
import { AuthComponent } from './componentes/auth-component/auth-component';
import { roleGuard } from './services/role.guard';
import { PortalComponent } from './componentes/portal-component/portal-component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: AuthComponent, data: { mode: 'login' } },
  { path: 'registro', component: AuthComponent, data: { mode: 'register' } },
  { path: 'explorar', component: PortalComponent, data: { mode: 'explorar' } },
  { path: 'favoritos', component: PortalComponent, canActivate: [roleGuard], data: { roles: ['ROLE_CLIENTE'], mode: 'favoritos' } },
  { path: 'proveedor', component: PortalComponent, canActivate: [roleGuard], data: { roles: ['ROLE_PROVEEDOR'], mode: 'proveedor' } },
  { path: 'administracion', component: PortalComponent, canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'], mode: 'administracion' } },
  { path: '**', redirectTo: '' },
];
