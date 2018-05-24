import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../shared/notification.service'
import { MyFireService } from '../shared/my-fire.service'
import { UserService } from '../shared/user.service'
import * as firebase from 'firebase';
import * as croppie from 'croppie';
import * as $ from 'jquery'

@Component({
  selector: 'app-my-posts',
  templateUrl: './my-posts.component.html',
  styleUrls: ['./my-posts.component.css']
})
export class MyPostsComponent implements OnInit, OnDestroy {
  
  public image = 'https://www.w3schools.com/bootstrap4/img_avatar1.png'
  personalPostRef: any;
  postLists: any = [];
  displayPostedBy: boolean = false;
  displayFavoriteButton: boolean = false;
  displayFollowButton: boolean = false;

  constructor(private notificationService: NotificationService,
              private myFireService: MyFireService,
              private userService: UserService) { }

  ngOnDestroy() {
    this.personalPostRef.off();
  }

  ngOnInit() {
    const user = this.userService.getUser();
    const currentUser = this.userService.getCurrentUser()
    console.log('user uid', user.uid);
    console.log('currentUseruser uid', currentUser.uid);
    const uid = firebase.auth().currentUser.uid;
    console.log("uid from auth", uid)
    this.personalPostRef = this.myFireService.getUserPostRef(uid);
    this.personalPostRef.on('child_added', data => {
      this.postLists.push({
        // key: data.key,
        key: data.val().imageKey,
        data: data.val()
      })
    })

  }

  onFileSelection(event){
    const fileList: FileList = event.target.files;
    
    if (fileList.length > 0) {
      const file: File = fileList[0];
      this.notificationService.displayLoading('info', "Uploading your image: " + file.name)
       
      this.myFireService.uploadFile(file)
        .then(data => {
          this.image = data['fileUrl'];
          this.notificationService.displayLoading(null, null)
          this.notificationService.display('info', "Image was uploaded");
          this.myFireService.handleImageUpload(data);

        })
        .catch(err => {
          this.notificationService.displayLoading(null, null) // close loading message
          this.notificationService.display('error', err.message) // display error message

          
        })
    }
    
  }
  

}
