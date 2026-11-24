import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ClienteService } from '../../service/cliente-service';
import { FarmaciaService } from '../../service/farmacia-service';
import { Rol } from '../../model/sesion';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    RouterLink,
  ],
  selector: 'app-auth-component',
  styleUrl: './auth-component.css',
  templateUrl: './auth-component.html',
})
export class AuthComponent {
  fb: FormBuilder = inject(FormBuilder);
  route: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  auth: AuthService = inject(AuthService);
  clienteService: ClienteService = inject(ClienteService);
  farmaciaService: FarmaciaService = inject(FarmaciaService);

  modo = signal<'login' | 'registro'>('login');
  rol = signal<Rol>('CLIENTE'); // rol con el que se inicia sesión
  tipo = signal<'CLIENTE' | 'FARMACIA'>('CLIENTE'); // tipo de cuenta que se registra
  mostrarClave = signal(false);
  enviando = signal(false);
  errores = signal<string[]>([]);

  roles: { valor: Rol; texto: string }[] = [
    { valor: 'CLIENTE', texto: 'Cliente' },
    { valor: 'FARMACIA', texto: 'Farmacia' },
    { valor: 'ADMINISTRADOR', texto: 'Admin' },
  ];
  tipos: { valor: 'CLIENTE' | 'FARMACIA'; texto: string }[] = [
    { valor: 'CLIENTE', texto: 'Soy cliente' },
    { valor: 'FARMACIA', texto: 'Soy farmacia' },
  ];

  loginForm = this.fb.nonNullable.group({
    correo: ['', Validators.required],
    contrasena: ['', Validators.required],
  });

  clienteForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    correo: ['', Validators.required],
    contrasena: ['', Validators.required],
    contrasena2: ['', Validators.required],
  });

  farmaciaForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    licencia: ['', Validators.required],
    telefono: ['', Validators.required],
    direccion: ['', Validators.required],
    distrito: ['', Validators.required],
    horario: ['', Validators.required],
    correo: ['', Validators.required],
    contrasena: ['', Validators.required],
    contrasena2: ['', Validators.required],
  });

  constructor() {
    // Si ya hay sesión, va directo a la pantalla de su rol
    const sesion = this.auth.sesion();
    if (sesion) {
      this.router.navigate([this.auth.inicio(sesion.rol)]);
    }
    this.route.data.subscribe((data) => {
      this.modo.set(data['modo'] === 'registro' ? 'registro' : 'login');
      this.errores.set([]);
    });
  }

  elegirRol(rol: Rol) {
    this.rol.set(rol);
    this.errores.set([]);
  }

  elegirTipo(tipo: 'CLIENTE' | 'FARMACIA') {
    this.tipo.set(tipo);
    this.errores.set([]);
  }

  alternarClave() {
    this.mostrarClave.update((v) => !v);
  }

  // Login: POST /api/{clientes|farmacias|administradores}/login
  iniciarSesion() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errores.set(['Ingresa tu correo y tu contraseña']);
      return;
    }
    const { correo, contrasena } = this.loginForm.getRawValue();
    this.entrar(this.rol(), correo, contrasena);
  }

  // Registro de cliente: POST /api/clientes y luego login
  registrarCliente() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.errores.set(['Completa todos los campos']);
      return;
    }
    const { contrasena2, ...cliente } = this.clienteForm.getRawValue();
    if (cliente.contrasena !== contrasena2) {
      this.errores.set(['Las contraseñas no coinciden']);
      return;
    }
    this.enviando.set(true);
    this.errores.set([]);
    this.clienteService.insert(cliente).subscribe({
      next: () => this.entrar('CLIENTE', cliente.correo, cliente.contrasena),
      error: (e) => this.mostrarError(e),
    });
  }

  // Registro de farmacia: POST /api/farmacias y luego login
  registrarFarmacia() {
    if (this.farmaciaForm.invalid) {
      this.farmaciaForm.markAllAsTouched();
      this.errores.set(['Completa todos los campos']);
      return;
    }
    const { contrasena2, ...farmacia } = this.farmaciaForm.getRawValue();
    if (farmacia.contrasena !== contrasena2) {
      this.errores.set(['Las contraseñas no coinciden']);
      return;
    }
    this.enviando.set(true);
    this.errores.set([]);
    this.farmaciaService.insert(farmacia).subscribe({
      next: () => this.entrar('FARMACIA', farmacia.correo, farmacia.contrasena),
      error: (e) => this.mostrarError(e),
    });
  }

  private entrar(rol: Rol, correo: string, contrasena: string) {
    this.enviando.set(true);
    this.errores.set([]);
    this.auth.login(rol, correo, contrasena).subscribe({
      next: (sesion) => {
        this.enviando.set(false);
        this.router.navigate([this.auth.inicio(sesion.rol)]);
      },
      error: (e) => this.mostrarError(e),
    });
  }

  // El backend responde { fecha, estado, mensaje, errores? }
  private mostrarError(e: any) {
    this.enviando.set(false);
    if (e?.status === 0) {
      this.errores.set(['No se pudo conectar con el servidor']);
      return;
    }
    const cuerpo = e?.error;
    this.errores.set(
      cuerpo?.errores?.length
        ? cuerpo.errores
        : [cuerpo?.mensaje || e?.message || 'Ocurrió un error'],
    );
  }
}
