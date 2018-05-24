import { Component, OnInit } from '@angular/core';
import * as firebase from "firebase";
import * as $ from "jquery"
import tooltip from "bootstrap"
import { MyFireService } from '../../shared/my-fire.service'
import { NotificationService } from '../../shared/notification.service'

// import * as $ from "jquery";
// import { Croppie } from "croppie";
// import Cropper from 'cropperjs';
// interface HTMLInputEvent extends Event {
//     target: HTMLInputElement & EventTarget;
// }

// interface FileReaderEventTarget extends EventTarget {
//     result:string
// }

// interface FileReaderEvent extends Event {
//     target: FileReaderEventTarget;
//     getMessage():string;
// }

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  allRef: any;
  all: any = [];
  totalImagesLoaded = 0;

  displayPostedBy: boolean = true;
  displayFavoriteButton: boolean = true;
  
  constructor(private notificationService: NotificationService,
              private myFireService: MyFireService){ }

  ngOnInit() {
    
  // $(document).ready(function(){
  //       // $('[data-toggle="tooltip"]').tooltip()
  //       $("p").click(function(){
  //           console.log("here")
  //           $(this).hide();
  //       });
  //   });

    $("p").click(function(){
        console.log("here")
        $(this).hide();
    });
    // $(function() {
    //   $('[data-toggle="tooltip"]').tooltip()
    // });

    const uid = firebase.auth().currentUser.uid
    const followedUsers = this.myFireService.getFollowedUserArray(uid)

    this.allRef = firebase.database().ref('allposts')//.limitToFirst(this.maxPerLoad);
    
    this.allRef.on('child_added', data => {
      this.all.push({
        key: data.val().imageKey,
        data: data.val(),
        followed: this.myFireService.checkUidAgainstFollowedUsers(data.val().upLoadedBy.uid, followedUsers)
      });
      this.totalImagesLoaded += 1
      
    });    
    
    
    
  }
  

}
