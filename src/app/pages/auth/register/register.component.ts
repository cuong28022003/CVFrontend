import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, AfterViewInit {
  registerForm!: FormGroup;
  isLoading = false;

  @ViewChild('fullNameInput') fullNameInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  ngAfterViewInit(): void {
    // Auto focus vào input fullName sau khi view được khởi tạo
    this.fullNameInput.nativeElement.focus();
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { email, fullName, password } = this.registerForm.value;

      this.authService.register(email, fullName, password).subscribe({
        next: () => {
          // Lưu email vào localStorage để điền sẵn trên trang đăng nhập
          localStorage.setItem('registeredEmail', email);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          alert('Đăng ký thất bại');
        }
      });
    }
  }
}
