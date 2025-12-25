import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CommonModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  isLoading = false;
  private hasRegisteredEmail = false;
  private returnUrl: string = '/';

  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Lấy email từ localStorage nếu người dùng vừa đăng ký
    const registeredEmail = localStorage.getItem('registeredEmail') || '';
    this.hasRegisteredEmail = !!registeredEmail;

    // Lấy returnUrl từ query params (được set bởi auth guard)
    const qpReturn = this.route.snapshot.queryParamMap.get('returnUrl');
    this.returnUrl = qpReturn || '/';

    this.loginForm = this.fb.group({
      email: [registeredEmail, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Xóa email khỏi localStorage sau khi điền vào form
    if (registeredEmail) {
      localStorage.removeItem('registeredEmail');
    }
  }

  ngAfterViewInit(): void {
    // Auto focus: nếu có registeredEmail thì focus password, ngược lại focus email
    if (this.hasRegisteredEmail) {
      this.passwordInput.nativeElement.focus();
    } else {
      this.emailInput.nativeElement.focus();
    }
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: () => {
          this.snackBar.open('Đăng nhập thành công', 'Đóng', { duration: 2000 });
          this.router.navigateByUrl(this.returnUrl || '/');
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Đăng nhập thất bại', 'Đóng', { duration: 3000 });
        }
      });
    }
  }
}
