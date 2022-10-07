import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';
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

  showMessages: boolean = false;
  showInput: boolean = true;
  ifSearchFriendList: boolean = false;
  userData: any = {};
  basePath: string = "";
  usersList: Array<any> = [];
  usersListCopy: Array<any> = [];
  currentFriend: any = [];
  onlineUserArr: any = [];

  @ViewChild('search') search: any;

  constructor(
    private socketService: SocketioService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.basePath = this.authService.BASEURL + "/assets/profile_pics";

    this.authService.userDataMessage.subscribe(res => {
      this.userData = res;
    });

    this.userService.getUserDetails().subscribe({
      next: res => {
        this.usersList = res.data;
        this.usersListCopy = this.usersList;
      },
      error: err => {
        this.usersList = [];
      }
    });

    this.socketService.setupSocketConnection();
    this.socketService.onlineUsersMessage.subscribe((userData: any) => {
      const onlineIds: any[] = [];
      const usersArr = userData.users;
      const disconnectedArr = userData.disconnectedUsers;
      if (usersArr?.length) usersArr.forEach((elem: any) => {
        onlineIds.push(elem.userId);
      });

      this.usersList = this.usersList.map((elem: any) => {
        elem["isOnline"] = onlineIds.includes(elem?.id);
        const lastLoginData = disconnectedArr.find((item: any) => elem.id === item.userId);
        if (lastLoginData) elem["lastLogin"] = lastLoginData.lastLogin;
        return elem;
      });
    });
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  ngAfterViewInit() {
    const searchTerm = fromEvent<any>(this.search.nativeElement, 'keyup').pipe(
      map(event => event.target.value.trim()),
      debounceTime(500),
      distinctUntilChanged()
    );
    searchTerm.subscribe(res => {
      if (res.trim()) {
        this.userService.searchUserList(res)
          .pipe(
            map(val => {
              val = val.data;
              val.forEach((elem: any) => {
                elem["username"] = elem.email.split("@")[0];
              });
              return val;
            })
          )
          .subscribe({
            next: res => {
              this.ifSearchFriendList = true;
              this.usersList = res;
              this.socketService.onlineUsersMessage.subscribe((usersArr: any) => {
                const onlineIds: any[] = [];
                usersArr.forEach((elem: any) => {
                  onlineIds.push(elem.userId);
                });

                this.onlineUserArr = usersArr;;
                this.usersList = this.usersList.map((elem: any) => {
                  elem["isOnline"] = onlineIds.includes(elem?.id);
                  return elem;
                });
              });
            },
            error: err => {
              this.usersList = []
            }
          });
      } else {
        this.ifSearchFriendList = false;
        this.usersList = this.usersListCopy;
      }
    });
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
          this.socketService.disconnect();
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
          this.socketService.logoutAll();
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
  onShowMessage(user: any) {
    this.showMessages = true;
    this.currentFriend = user;
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
  }

  refreshUserData() {
    this.authService.getUserLoggedInData().subscribe(res => {
      this.authService.userData.next(res.data);
      return true;
    });
  }

  onClickRemoveSearch() {
    $('.search-input').val('');
  }
}
