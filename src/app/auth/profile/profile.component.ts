import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import * as firebase from "firebase";
import * as $ from "jquery"
import tooltip from "bootstrap"
import { MyFireService } from '../../shared/my-fire.service';
import { NotificationService } from '../../shared/notification.service';
import { UtilityService } from '../../shared/utility.service';
// import { ResizeSensor } from "css-element-queries"


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
  
   @HostListener('window:resize', ['$event']) onResize($event) {
      let menuItems = document.getElementsByClassName("postImage"); 
      // console.log("event", event)
      // console.log("menuItems", menuItems)
      for (let i=0; i < menuItems.length; i++) {
            let evt = {currentTarget: menuItems[i]}
            // this.utilityService.onImageLoad(evt)
            // menuItems[i].classList.remove('active')
      }
      // this.el.nativeElement.classList.add('active');
  }
  
  constructor(private notificationService: NotificationService,
              private myFireService: MyFireService,
              private utilityService: UtilityService,
              private _elRef:ElementRef) {}

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

    // const onload = this.onImageLoad()
    
    // function onload(event){
    //         console.log('content dimension changed 2', event.onchange());

    // }
    
  //   let card = $('.card')
  //   new ResizeSensor(card, function(event){ 
  //     // console.log('content dimension changed width', card.onchange());
  //     // onload(event)
  //     // this.onImageLoad(event)

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
  
  onImageLoad(event) {
    console.log('event', event)
      this.utilityService.onImageLoad(event)
  }
  onImageChange(event) {
    console.log('change event =========================', event)
    // this.utilityService.onImageLoad(event)
  }  
  onImageClick(event) {
    console.log('click event', event)
      // this.utilityService.onImageLoad(event)
  }  
  

}
