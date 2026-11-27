import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ClienteService } from '../../services/cliente-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientePublico } from '../../model/cliente';
import { mensajeError } from '../../utils/utilidades';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';

@Component({
  imports: [
    MatCard,
    MatIcon,
    MatCardContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatButton,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
  ],
  selector: 'app-cliente-cuenta-component',
  styleUrl: './cliente-cuenta-component.css',
  templateUrl: './cliente-cuenta-component.html',
})
export class ClienteCuentaComponent {
  fb: FormBuilder = inject(FormBuilder);
  auth: AuthService = inject(AuthService);
  router: Router = inject(Router);
  clienteService: ClienteService = inject(ClienteService);
  snack: MatSnackBar = inject(MatSnackBar);

  cliente = signal<ClientePublico | null>(null);
  guardando = signal(false);

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
  });

  private get idCliente(): number {
    return this.auth.sesion()?.idCliente ?? 0;
  }

  ngOnInit() {
    // GET /api/clientes/{id}
    this.clienteService.getById(this.idCliente).subscribe({
      next: (c) => {
        this.cliente.set(c);
        this.form.setValue({ nombre: c.nombre, apellidos: c.apellidos });
      },
      error: (e) => this.avisar(mensajeError(e)),
    });
  }

  // PUT /api/clientes/{id}/nombre
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.avisar('Completa tu nombre y apellidos');
      return;
    }
    this.guardando.set(true);
    this.clienteService.actualizarNombre(this.idCliente, this.form.getRawValue()).subscribe({
      next: (c) => {
        this.guardando.set(false);
        this.cliente.set(c);
        this.auth.actualizarNombre(c.nombre);
        this.avisar('Datos actualizados');
      },
      error: (e) => {
        this.guardando.set(false);
        this.avisar(mensajeError(e));
      },
    });
  }

  // DELETE /api/clientes/{id} y cierra la sesión
  eliminarCuenta() {
    if (!confirm('¿Seguro que deseas eliminar tu cuenta?')) return;
    this.clienteService.delete(this.idCliente).subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigate(['/login']);
      },
      error: (e) => this.avisar(mensajeError(e)),
    });
  }

  inicial(nombre: string): string {
    return (nombre.trim()[0] ?? '?').toUpperCase();
  }

  private avisar(mensaje: string) {
    this.snack.open(mensaje, 'OK', { duration: 3000 });
  }
}
