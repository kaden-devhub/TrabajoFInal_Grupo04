import { Routes } from '@angular/router';
import { HomeComponent } from './componentes/home-component/home-component';
import { AdminResumenComponent } from './componentes/admin-resumen-component/admin-resumen-component';
import { AdminCategoriasComponent } from './componentes/admin-categorias-component/admin-categorias-component';
import { AdminClientesComponent } from './componentes/admin-clientes-component/admin-clientes-component';
import { AdminFarmaciasComponent } from './componentes/admin-farmacias-component/admin-farmacias-component';
import { AdminMedicamentosComponent } from './componentes/admin-medicamentos-component/admin-medicamentos-component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'admin/resumen', component: AdminResumenComponent, data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/categorias', component: AdminCategoriasComponent, data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/farmacias', component: AdminFarmaciasComponent, data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/clientes', component: AdminClientesComponent, data: { roles: ['ADMINISTRADOR'] } },
    { path: 'admin/medicamentos', component: AdminMedicamentosComponent, data: { roles: ['ADMINISTRADOR'] } },
  { path: '**', component: HomeComponent, pathMatch: 'full' },
];
