import { Routes } from '@angular/router';
import { HomeComponent } from './componentes/home-component/home-component';
import { AdminResumenComponent } from './componentes/admin-resumen-component/admin-resumen-component';
import { AdminCategoriasComponent } from './componentes/admin-categorias-component/admin-categorias-component';
import { AdminClientesComponent } from './componentes/admin-clientes-component/admin-clientes-component';
import { AdminFarmaciasComponent } from './componentes/admin-farmacias-component/admin-farmacias-component';
import { AdminMedicamentosComponent } from './componentes/admin-medicamentos-component/admin-medicamentos-component';
import { AuthComponent } from './componentes/auth-component/auth-component';
import { authGuard } from './guards/auth-guard';
import { ClienteBuscarComponent } from './componentes/cliente-buscar-component/cliente-buscar-component';
import { ClienteOfertasComponent } from './componentes/cliente-ofertas-component/cliente-ofertas-component';
import { ClienteFarmaciasComponent } from './componentes/cliente-farmacias-component/cliente-farmacias-component';
import { ClienteFavoritosComponent } from './componentes/cliente-favoritos-component/cliente-favoritos-component';
import { ClienteCuentaComponent } from './componentes/cliente-cuenta-component/cliente-cuenta-component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: AuthComponent, data: { modo: 'login'}},
  { path: 'registro', component: AuthComponent, data: { modo: 'registro'}},
  { path: 'cliente/buscar', component: ClienteBuscarComponent, canActivate: [authGuard], data: { roles: ['CLIENTE']}},
  { path: 'cliente/ofertas', component: ClienteOfertasComponent, canActivate: [authGuard], data: { roles: ['CLIENTE']}},
  { path: 'cliente/farmacias', component: ClienteFarmaciasComponent, canActivate: [authGuard], data: { roles: ['CLIENTE']}},
  { path: 'cliente/favoritos', component: ClienteFavoritosComponent, canActivate: [authGuard], data: { roles: ['CLIENTE']}},
  { path: 'cliente/cuenta', component:ClienteCuentaComponent, canActivate: [authGuard], data: { roles: ['CLIENTE']}},
  { path: 'admin/resumen', component: AdminResumenComponent, canActivate : [authGuard],data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/categorias', component: AdminCategoriasComponent , canActivate : [authGuard], data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/farmacias', component: AdminFarmaciasComponent, canActivate: [authGuard], data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/clientes', component: AdminClientesComponent, canActivate: [authGuard],data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/medicamentos', component: AdminMedicamentosComponent, canActivate: [authGuard], data: { roles: ['ADMINISTRADOR'] } },
  { path: '**', component: HomeComponent, pathMatch: 'full' },
];
