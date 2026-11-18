import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type AccountType = 'patient' | 'provider';

@Component({
  imports: [RouterLink],
  selector: 'app-auth-component',
  styleUrl: './auth-component.css',
  templateUrl: './auth-component.html',
})
export class AuthComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  readonly isLogin = this.route.snapshot.data['mode'] === 'login';
  readonly isPasswordVisible = signal(false);
  readonly accountType = signal<AccountType>('patient');
  readonly password = signal('');
  readonly notice = signal(
    this.isLogin && this.route.snapshot.queryParamMap.has('registered')
      ? 'Tu cuenta se creó correctamente. Ya puedes iniciar sesión.'
      : '',
  );
  readonly loading = signal(false);
  readonly rememberedUsername = this.auth.rememberedUsername();
  readonly passwordRules = computed(() => {
    const value = this.password();
    return [
      { label: 'Mínimo 8 caracteres', valid: value.length >= 8 },
      { label: 'Una letra mayúscula', valid: /[A-Z]/.test(value) },
      { label: 'Un número', valid: /\d/.test(value) },
      { label: 'Un carácter especial', valid: /[^A-Za-z0-9]/.test(value) },
    ];
  });
  readonly passwordStrength = computed(() => this.passwordRules().filter((rule) => rule.valid).length);

  updatePassword(event: Event): void {
    const field = event.target as HTMLInputElement;
    this.password.set(field.value);
    field.setCustomValidity(
      this.passwordStrength() === 4 ? '' : 'Cumple todos los requisitos de seguridad de la contraseña.',
    );
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible.update((visible) => !visible);
  }

  selectAccountType(type: AccountType): void {
    this.accountType.set(type);
  }

  showPasswordRecovery(): void {
    this.notice.set('El backend todavía no ofrece recuperación de contraseña. Contacta al administrador para restablecerla.');
  }

  submit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (this.loading()) return;

    if (!this.isLogin) {
      const password = form.elements.namedItem('password') as HTMLInputElement;
      const confirmation = form.elements.namedItem('confirmPassword') as HTMLInputElement;
      if (this.passwordStrength() < 4) {
        password.setCustomValidity('Cumple todos los requisitos de seguridad de la contraseña.');
        password.reportValidity();
        return;
      }
      if (password.value !== confirmation.value) {
        confirmation.setCustomValidity('Las contraseñas no coinciden.');
        confirmation.reportValidity();
        confirmation.setCustomValidity('');
        return;
      }
    }

    const email = String(new FormData(form).get('email') || '').trim();
    const password = String(new FormData(form).get('password') || '');
    this.loading.set(true);
    this.notice.set('');

    if (this.isLogin) {
      try {
        this.auth.rememberUsername(email, new FormData(form).has('remember'));
      } catch (error) {
        this.showRequestError(error, 'No se pudo guardar la preferencia del correo.');
        return;
      }
      this.auth.login(email, password).subscribe({
        next: () => {
          const destination = this.auth.hasRole(['ROLE_ADMIN'])
            ? '/administracion'
            : this.auth.hasRole(['ROLE_PROVEEDOR'])
              ? '/proveedor'
              : '/explorar';
          const requested = this.route.snapshot.queryParamMap.get('returnUrl');
          const returnUrl = requested?.startsWith('/') && !requested.startsWith('//') ? requested : destination;
          void this.router.navigateByUrl(returnUrl);
        },
        error: (error: unknown) => this.showRequestError(error, 'No se pudo iniciar sesión. Revisa tus credenciales.'),
        complete: () => this.loading.set(false),
      });
      return;
    }

    const role = this.accountType() === 'provider' ? 'PROVEEDOR' : 'CLIENTE';
    this.auth.register(email, password, role).subscribe({
      next: () => void this.router.navigate(['/login'], { queryParams: { registered: '1' } }),
      error: (error: unknown) => this.showRequestError(error, 'No se pudo crear la cuenta. Inténtalo nuevamente.'),
      complete: () => this.loading.set(false),
    });
  }

  private showRequestError(error: unknown, fallback: string): void {
    this.loading.set(false);
    if (error instanceof HttpErrorResponse && typeof error.error === 'string' && error.error.trim()) {
      this.notice.set(error.error);
      return;
    }
    if (error instanceof HttpErrorResponse && error.status === 0) {
      this.notice.set('No se pudo conectar con el backend. Comprueba que esté activo en http://localhost:8081.');
      return;
    }
    this.notice.set(error instanceof Error && error.message ? error.message : fallback);
  }
}
