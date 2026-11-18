import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-home-component',
  styleUrl: './home-component.css',
  templateUrl: './home-component.html',
})
export class HomeComponent {
  private readonly router = inject(Router);

  search(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const query = String(new FormData(form).get('query') || '').trim();
    void this.router.navigate(['/explorar'], { queryParams: query ? { q: query } : {} });
  }
}
