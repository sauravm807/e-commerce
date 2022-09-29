import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { SocketioService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';

declare var $: any;
@Component({
  selector: 'app-message-body',
  templateUrl: './message-body.component.html',
  styleUrls: ['./message-body.component.css']
})
export class MessageBodyComponent implements OnInit {

  showMessages: boolean = true;
  showInput: boolean = true;
  userData: any = {};
  basePath: string = "";
  usersList: any = [];

  constructor(
    private socketService: SocketioService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.basePath = this.authService.BASEURL + "/assets/profile_pics/";
    this.authService.userDataMessage.subscribe(res => {
      this.userData = res;
    });

    this.userService.getUserDetails().subscribe({
      next: res => {
        this.usersList = res.data;
        console.log(this.usersList);
      },
      error: err => {
        this.usersList = [];
      }
    });

    this.socketService.setupSocketConnection();
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  onShowInput() {
    this.showInput = !this.showInput;
  }

  /**
   * onLogout - for logout user
   */
  onLogout() {
    this.authService.userLogout()
      .subscribe({
        next: (res: any) => {
          this.authService.removeTokens();
          this.toastr.success(res.message);
          this.router.navigate(["login"]);
        },
        error: err => {
          if (err.error.error.status === 404) {
            this.authService.removeTokens();
            this.toastr.success("Logged out successfully.");
            this.router.navigate(["login"]);
          } else {
            this.toastr.error("Something went wrong.");
          }
        }
      });
  }

  /**
   * onLogoutAllDevices - for logout of all devices
   */
  onLogoutAllDevices() {
    this.authService.userLogoutAllDevices()
      .subscribe({
        next: (res: any) => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          this.toastr.success(res.message);
          this.router.navigate(["login"]);
        },
        error: err => {
          this.toastr.error("Something went wrong.");
        }
      });
  }

  /**
   * onShowMessage - for showing messages section
   */
  onShowMessage() {
    this.showMessages = true;
  }

  showFileUpload() {
    $('#imageUpload').click();
  }

  onFileSelected(event: any) {
    let fileData = <File>event.target.files[0];
    let base64: any;
    if (fileData) {
      let reader = new FileReader();
      reader.readAsDataURL(fileData);

      reader.onload = () => {
        base64 = reader.result
        const imageData = {
          name: fileData.name,
          size: fileData.size,
          type: fileData.type,
          base64: base64
        }
        this.uploadProfileImage(imageData);
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    }
  }

  uploadProfileImage(imageData: any) {
    this.userService.uploadProfilePic(imageData).subscribe({
      next: res => {
        this.refreshUserData();
      },
      error: err => {
        console.log(err);
      }
    })
  }

  onImgError(event: Event) {
    let imgLink = this.userService.handleImageError();
    (event.target as HTMLInputElement).src = imgLink;
    this.userData["proPic"] = imgLink;
  }

  refreshUserData() {
    this.authService.getUserLoggedInData().subscribe(res => {
      this.authService.userData.next(res.data);
      return true;
    });
  }
}
