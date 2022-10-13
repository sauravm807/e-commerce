import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { LoginComponent } from './components/login/login.component';
import { MessageBodyComponent } from './components/message-body/message-body.component';
import { RegisterComponent } from './components/register/register.component';
import { VerifyOtpComponent } from './components/verify-otp/verify-otp.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full"
  },
  {
    path: "login",
    component: LoginComponent, canActivate: [LoginGuard]
  },
  {
    path: "register",
    component: RegisterComponent, canActivate: [LoginGuard]
  },
  {
    path: "forget-password",
    component: ForgetPasswordComponent, canActivate: [LoginGuard]
  },
  {
    path: "change-password",
    component: ChangePasswordComponent, canActivate: [LoginGuard]
  },
  {
    path: "otp-verify",
    component: VerifyOtpComponent, canActivate: [LoginGuard]
  },
  {
    path: "messages/:id",
    component: MessageBodyComponent, canActivate: [AuthGuard]
  },
  {
    path: "**",
    redirectTo: "login"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
