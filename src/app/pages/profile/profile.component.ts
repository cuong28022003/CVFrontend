import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService, User } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = false;
  currentUser: User | null = null;
  avatarPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.initializeForm(user);
        this.avatarPreview = user.avatar || null;
      }
    })
  }

  private initializeForm(user: User): void {
    this.profileForm = this.fb.group({
      fullName: [user.fullName || '', [Validators.required, Validators.minLength(3)]],
      email: [{ value: user.email || '', disabled: true }],
      phone: [user.phone || '', Validators.pattern(/^[\d\s\-\+\(\)]*$/)],
      location: [user.location || ''],
      avatar: [user.avatar || '']
    });
  }

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result;
        this.avatarPreview = base64;
        this.profileForm.patchValue({ avatar: base64 });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.snackBar.open('Vui lòng điền đầy đủ thông tin hợp lệ', 'Đóng', { duration: 3000 });
      return;
    }

    if (!this.currentUser?.id) {
      this.snackBar.open('Người dùng không hợp lệ', 'Đóng', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const formValue = this.profileForm.getRawValue();
    const updateRequest = {
      fullName: formValue.fullName,
      phone: formValue.phone,
      location: formValue.location,
      avatar: formValue.avatar
    };

    this.profileService.updateProfile(this.currentUser.id, updateRequest).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.authService.updateCurrentUser(updatedUser);
        this.snackBar.open('Cập nhật hồ sơ thành công', 'Đóng', { duration: 2000 });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.snackBar.open('Cập nhật hồ sơ thất bại', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  get fullName() {
    return this.profileForm.get('fullName');
  }

  get phone() {
    return this.profileForm.get('phone');
  }

  get location() {
    return this.profileForm.get('location');
  }

  get email() {
    return this.profileForm.get('email');
  }
}
