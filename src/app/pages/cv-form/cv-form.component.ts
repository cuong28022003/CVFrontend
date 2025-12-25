import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CvService, CreateCVRequest, CVDto } from '../../services/cv.service';

@Component({
    selector: 'app-cv-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatSnackBarModule
    ],
    templateUrl: './cv-form.component.html',
    styleUrls: ['./cv-form.component.scss']
})
export class CvFormComponent implements OnInit {
    cvForm!: FormGroup;
    isLoading = false;
    isEditMode = false;
    cvId: string | number | null = null;
    currentCV: CVDto | null = null;

    statusOptions = [
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' }
    ];

    constructor(
        private fb: FormBuilder,
        private cvService: CvService,
        private route: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.initializeForm();
        this.checkEditMode();
    }

    private initializeForm(): void {
        this.cvForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            role: ['', Validators.required],
            status: ['private', Validators.required]
        });
    }

    private checkEditMode(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.cvId = params['id']; // Keep as string (UUID)
                this.loadCV();
            }
        });
    }

    private loadCV(): void {
        if (!this.cvId) return;

        this.isLoading = true;
        this.cvService.getCVById(this.cvId).subscribe({
            next: (cv) => {
                this.currentCV = cv;
                this.cvForm.patchValue({
                    title: cv.title,
                    role: cv.role,
                    status: cv.status
                });
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading CV:', error);
                this.snackBar.open('Failed to load CV', 'Close', { duration: 3000 });
                this.isLoading = false;
                this.router.navigate(['/dashboard']);
            }
        });
    }

    onSubmit(): void {
        if (this.cvForm.invalid) {
            this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
            return;
        }

        this.isLoading = true;
        const request: CreateCVRequest = this.cvForm.value;

        if (this.isEditMode && this.cvId) {
            this.cvService.updateCV(this.cvId, request).subscribe({
                next: (response) => {
                    this.snackBar.open('CV updated successfully', 'Close', { duration: 3000 });
                    this.isLoading = false;
                    this.router.navigate(['/dashboard']);
                },
                error: (error) => {
                    console.error('Error updating CV:', error);
                    this.snackBar.open('Failed to update CV', 'Close', { duration: 3000 });
                    this.isLoading = false;
                }
            });
        } else {
            this.cvService.createCV(request).subscribe({
                next: (response) => {
                    this.snackBar.open('CV created successfully', 'Close', { duration: 3000 });
                    this.isLoading = false;
                    this.router.navigate(['/dashboard']);
                },
                error: (error) => {
                    console.error('Error creating CV:', error);
                    this.snackBar.open('Failed to create CV', 'Close', { duration: 3000 });
                    this.isLoading = false;
                }
            });
        }
    }

    onCancel(): void {
        this.router.navigate(['/dashboard']);
    }

    get title() {
        return this.cvForm.get('title');
    }

    get role() {
        return this.cvForm.get('role');
    }

    get status() {
        return this.cvForm.get('status');
    }
}
