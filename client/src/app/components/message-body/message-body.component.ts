import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { SocketioService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';

declare var $: any;
@Component({
  selector: 'app-message-body',
  templateUrl: './message-body.component.html',
  styleUrls: ['./message-body.component.css']
})
export class MessageBodyComponent implements OnInit, AfterViewChecked {

  showMessages: boolean = false;
  showInput: boolean = true;
  ifSearchFriendList: boolean = false;
  userData: any = {};
  basePath: string = "";
  usersList: Array<any> = [];
  messageList: any = [];
  usersListCopy: Array<any> = [];
  currentFriend: any = {};
  chattingWithUserId!: number;

  messageForm = new FormGroup({
    message: new FormControl('', { validators: Validators.required })
  });

  @ViewChild('search') search: any;
  @ViewChild('scrollMe')
  myScrollContainer!: ElementRef;

  constructor(
    private socketService: SocketioService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.basePath = this.authService.BASEURL + "/assets/profile_pics";

    this.authService.userDataMessage.subscribe(res => {
      this.userData = res;
    });

    this.messageService.getLatestMessageListUser()
      .pipe(map(val => {
        val.data.forEach((elem: any) => {
          elem["username"] = elem.email.split("@")[0];
          elem.isSent = elem.sid === this.userData?.id;
        });
        return val;
      }))
      .subscribe({
        next: res => {
          this.ifSearchFriendList = !res.messageFound;
          this.usersList = res.data;
          this.usersListCopy = this.usersList;
        },
        error: err => {
          this.usersList = [];
        }
      });

    this.scrollToBottom();
    this.socketService.setupSocketConnection();
    this.getUpdatedUsers();
    this.onGetMessage();
    this.onUpdateSeenMessage();
    // this.getUserChattingId();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
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
              this.getUpdatedUsers();
            },
            error: err => {
              this.usersList = []
            }
          });
      } else {
        this.showMessages = false;
        this.ifSearchFriendList = false;
        this.usersList = this.usersListCopy;
      }
    });
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  getUpdatedUsers() {
    this.socketService.onlineUsersMessage.subscribe((userData: any) => {
      const onlineIds: any[] = [];
      const usersArr = userData.users;
      const disconnectedArr = userData.disconnectedUsers;

      if (usersArr?.length) usersArr.forEach((elem: any) => {
        onlineIds.push(elem.userId);
      });

      this.usersList = this.usersList.map((elem: any) => {
        elem["isOnline"] = onlineIds.includes(elem?.userId);
        const lastLoginData = disconnectedArr.find((item: any) => elem.userId === item.userId);
        if (lastLoginData) elem["lastLogin"] = lastLoginData.lastLogin;
        return elem;
      });
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
    console.log(this.currentFriend)

    this.socketService.updateSeenMessages({
      userId: this.userData?.id,
      sender: user.userId,
      receiver: this.userData?.id
    });

    // this.socketService.isChattingUserId(user.userId);

    if (this.currentFriend.chatId) {
      this.messageService.getMessageByChatId(this.currentFriend.chatId)
        .pipe(map(val => {
          val.data.forEach((elem: any) => {
            elem["isSent"] = elem.sender === this.userData?.id;
            elem["c_date"] = elem["c_date"] * 1000;
          });
          return val;
        }))
        .subscribe({
          next: res => {
            this.messageList = res.data;
            const index = this.usersList.findIndex((elem: any) => elem.userId === user.userId && elem.userId === user.sid);
            if (index > -1) this.usersList[index].isSeen = 1;
          },
          error: err => {
            this.messageList = [];
          }
        });
    } else {
      this.messageService.getMessageByUserId(this.currentFriend.userId)
        .pipe(map(val => {
          val.data.forEach((elem: any) => {
            elem["isSent"] = elem.sender === this.userData?.id;
            elem["c_date"] = elem["c_date"] * 1000;
          });
          return val;
        }))
        .subscribe({
          next: res => {
            this.messageList = res.data;
            this.currentFriend["chatId"] = res?.chatId;
          },
          error: err => {
            this.messageList = [];
          }
        });
    }
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

  /**
   * uploadProfileImage - to upload profile pic
   */
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

  refreshUserData() {
    this.authService.getUserLoggedInData().subscribe(res => {
      this.authService.userData.next(res.data);
      return true;
    });
  }

  // onClickRemoveSearch() {
  //   $('.search-input').val('');
  // }

  scrollToBottom() {
    if (this.myScrollContainer?.nativeElement) {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    }
  }

  onSendMessage() {
    if (!this.messageForm.value.message?.trim()) return;
    const userId = this.userData.id;
    const friendUserId = this.currentFriend.userId;
    const chatId = this.currentFriend.chatId;
    const message = this.messageForm.value.message?.trim();
    // console.log(friendUserId === this.chattingWithUserId)
    const messageData = {
      sender: userId,
      receiver: friendUserId,
      message: message,
      chatId: chatId ? chatId : null,
      c_date: new Date().getTime(),
      isSeen: friendUserId === this.chattingWithUserId ? 1 : 0
    };

    this.messageList.push({ ...messageData, isSent: true });

    this.socketService.sendMessage(messageData);

    this.messageForm.patchValue({
      message: ""
    });
  }

  onGetMessage() {
    this.socketService.getMessages().subscribe((res: any) => {
      if (this.currentFriend.userId === res.sender && this.userData?.id === res.receiver) {
        this.messageList.push({ ...res, isSeen: false, isSent: false });
      }
      if (this.userData.id === res.receiver) {
        const index = this.usersList.findIndex((elem: any) => elem.userId === res.sender);
        this.usersList[index].message = res.message;
        this.usersList[index].isSent = false;
        this.usersList[index].isSeen = 0;
      }
    });
  }

  onUpdateSeenMessage() {
    this.socketService.updateSeenMsg().subscribe((user: any) => {

      const index = this.usersList.findIndex((elem: any) => elem.userId === user.userId && elem.rid == user.userId);
      if (index !== -1) this.usersList[index].isSeen = 1;

      this.messageList.map((elem: any) => {
        if (elem.sender === user.sender && elem.receiver === user.receiver) {
          elem["isSeen"] = 1;
        }
        return elem;
      });
    });
  }

  // getUserChattingId() {
  //   this.socketService.getUserChattingId().subscribe((id: any) => {
  //     console.log(id)
  //   });
  // }

  onImgError(event: Event) {
    let imgLink = this.userService.handleImageError();
    (event.target as HTMLInputElement).src = imgLink;
  }

}
