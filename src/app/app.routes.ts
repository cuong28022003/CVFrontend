import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CvFormComponent } from './pages/cv-form/cv-form.component';
import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                component: HomeComponent
            },
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'register',
                component: RegisterComponent
            },
            {
                path: 'dashboard',
                component: DashboardComponent,
                canActivate: [authGuard]
            },
            {
                path: 'cv/create',
                component: CvFormComponent,
                canActivate: [authGuard]
            },
            {
                path: 'cv/:id/edit',
                component: CvFormComponent,
                canActivate: [authGuard]
            },
            {
                path: 'profile',
                component: ProfileComponent,
                canActivate: [authGuard]
            }
        ]
    }
];
