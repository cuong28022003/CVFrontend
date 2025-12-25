import { CommonModule } from '@angular/common';
import { Component, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CvService, CVDto, UpdateCVRequest } from '../../services/cv.service';
import { SalaryChartComponent } from '../salary-chart/salary-chart.component';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

type CvStatus = 'public' | 'private';

interface CvItem {
  id: string | number;
  title: string;
  role: string;
  updatedAt: Date;
  status: CvStatus;
  views: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, SalaryChartComponent, MatDialogModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  constructor(private cvService: CvService, private router: Router, private snackBar: MatSnackBar, private dialog: MatDialog) { }

  readonly filter = signal<'all' | CvStatus>('all');
  readonly cvList = signal<CvItem[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCVs();
  }

  /**
   * Load all CVs from backend API
   */
  private loadCVs(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.cvService.getCVs().subscribe({
      next: (cvDtos: CVDto[]) => {
        const cvItems: CvItem[] = cvDtos.map(dto => ({
          id: dto.id,
          title: dto.title,
          role: dto.role,
          updatedAt: new Date(dto.updatedAt),
          status: dto.status,
          views: dto.views
        }));
        this.cvList.set(cvItems);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading CVs:', err);
        this.errorMessage.set(err.error?.message || 'Failed to load CVs');
        this.snackBar.open('Tải danh sách CV thất bại', 'Đóng', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  readonly visibleCvs = computed(() => {
    const filter = this.filter();
    const list = this.cvList();
    return filter === 'all' ? list : list.filter(cv => cv.status === filter);
  });

  readonly publicCount = computed(() => this.cvList().filter(cv => cv.status === 'public').length);
  readonly privateCount = computed(() => this.cvList().filter(cv => cv.status === 'private').length);

  setFilter(status: 'all' | CvStatus): void {
    this.filter.set(status);
  }

  createCv(): void {
    this.router.navigate(['/cv/create']);
  }

  editCv(cv: CvItem): void {
    this.router.navigate(['/cv', cv.id, 'edit']);
  }

  toggleStatus(cv: CvItem): void {
    const nextStatus: CvStatus = cv.status === 'public' ? 'private' : 'public';

    this.isLoading.set(true);
    const updateRequest: UpdateCVRequest = {
      title: cv.title,
      role: cv.role,
      status: nextStatus
    };

    this.cvService.updateCV(cv.id, updateRequest).subscribe({
      next: (updatedCv) => {
        this.cvList.update(list => list.map(item => (
          item.id === cv.id
            ? { ...item, status: nextStatus, updatedAt: new Date(updatedCv.updatedAt) }
            : item
        )));
        this.snackBar.open('Cập nhật trạng thái thành công', 'Đóng', { duration: 2000 });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error updating CV status:', err);
        this.errorMessage.set(err.error?.message || 'Failed to update CV status');
        this.snackBar.open('Cập nhật trạng thái thất bại', 'Đóng', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  deleteCv(cv: CvItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận xóa CV',
        message: `Bạn có chắc chắn muốn xóa CV "${cv.title}" không? Hành động này không thể hoàn tác.`,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDeleteCv(cv);
      }
    });
  }

  private performDeleteCv(cv: CvItem): void {
    this.isLoading.set(true);
    this.cvService.deleteCV(cv.id).subscribe({
      next: () => {
        this.cvList.update(list => list.filter(item => item.id !== cv.id));
        this.snackBar.open('Xóa CV thành công', 'Đóng', { duration: 2000 });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error deleting CV:', err);
        this.errorMessage.set(err.error?.message || 'Failed to delete CV');
        this.snackBar.open('Xóa CV thất bại', 'Đóng', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

}
