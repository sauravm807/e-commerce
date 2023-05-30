import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  userRegisterForm = new FormGroup({
    email: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
      ],
    }),
    password: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] }),
    rePassword: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] }),
    fullname: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] }),
    firstname: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] }),
    lastname: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] }),
    address: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] }),
    mobile: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] })
  });

  onRegister() {
    console.log(this.userRegisterForm.value)
  }
}
