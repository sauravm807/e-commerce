import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private toastr: ToastrService, private authService: AuthService) { }

  ngOnInit(): void {
  }

  userLoginForm = new FormGroup({
    email: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] }),
    password: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] })
  });

  onLogin() {
    if (!this.userLoginForm.valid) {
      this.toastr.error("All fields are required.");
      return
    }
    this.authService.userLogin(this.userLoginForm.value).subscribe({
      next: res => {
        console.log(res);
      },
      error: err => {
        this.toastr.error(err.error.error.message);
      }
    });
  }

}
