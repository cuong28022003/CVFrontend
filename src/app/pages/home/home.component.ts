import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private router: Router) { }

  startCreating() {
    // Điều hướng đến trang tạo CV (sẽ được tạo sau)
    this.router.navigate(['/create-cv']);
  }
}
