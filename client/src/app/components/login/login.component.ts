import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  userLoginForm = new FormGroup({
    email: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
      ],
    }),
    password: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] })
  });

  onLogin() {
    if (!this.userLoginForm.value.email?.trim() || !this.userLoginForm.value.password?.trim()) {
      this.toastr.error("All fields are required.");
      return;
    }

    if (!this.userLoginForm.valid) {
      this.toastr.error("Email invalid.");
      return;
    }

    this.authService.userLogin(this.userLoginForm.value).subscribe({
      next: res => {
        this.toastr.success(res.message);
        this.authService.saveToken(res.data.token);
        this.router.navigate(["messages", res.data.id]);
      },
      error: err => {
        this.toastr.error(err.error.error.message);
      }
    });
  }

}
