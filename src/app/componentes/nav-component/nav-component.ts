import { Component, inject } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { MatAnchor, MatButton } from '@angular/material/button';
import { AuthService } from '../../service/auth.service';

@Component({
  imports: [MatToolbar, RouterLink, MatButton, MatAnchor],
  selector: 'app-nav-component',
  styleUrl: './nav-component.css',
  templateUrl: './nav-component.html',
})
export class NavComponent {
  auth:AuthService =inject(AuthService)
  router: Router = inject(Router)

  cerrarSesion(){
    this.auth.logout();
    this.router.navigate(['login']);
  }
}
