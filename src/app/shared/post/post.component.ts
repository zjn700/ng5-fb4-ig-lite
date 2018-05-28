import { Component, Input, Output, OnInit, OnDestroy, EventEmitter, HostListener } from '@angular/core';
import * as firebase from "firebase";
import { Subscription } from 'rxjs/Subscription';
import { MyFireService } from '../my-fire.service'
import { UtilityService } from "../utility.service";
import { UserService } from "../user.service";


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnDestroy {
  
  @Input() post;
  @Input() imageKey: string;
  @Input() uploadedBy: string;
  @Input() displayImage: boolean = true;
  @Input() displayPostedBy: boolean;
  @Input() displayFavoriteButton: boolean;


  @Input() showThis:boolean = false;
  @Input() displayFollowButton: boolean;
  @Input() newFollowedUser: string;
  @Input() favoriteCountChanged
  @Input() inFollowing: boolean = false;
  
  @Input() curUserIsUploader: boolean;
  
  @Input() postFollowed=null;
  
  defaultImage: string = "assets/images/150x150.png";
  imageName: string = "";
  imageData: any = {};
  favoritedKey:string = null;
  followedKey:string = null;
  
  @Output() favoriteClicked = new EventEmitter<any>();
  @Output() followUser = new EventEmitter<any>();
  @Output() removeFavoriteClicked = new EventEmitter<any>();
  @Output() unfollowUser = new EventEmitter<any>();

   @HostListener('window:resize', ['$event']) onResize($event) {
     console.log("window resize")
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

  subscription: Subscription;

  constructor(private myFireService: MyFireService,
              private utilityService: UtilityService,
              private userService: UserService) { }

  ngOnDestroy() {
      // unsubscribe to ensure no memory leaks
      // this.subscription.unsubscribe();
  }

  ngOnInit() {
    
    const userSavedInService = this.userService.getCurrentUser()
    console.log('userSavedInService post', userSavedInService);
    
    const uid = firebase.auth().currentUser.uid
    
    firebase.database().ref('favorites/' + uid + '/' + this.imageKey)
      .once('value')
      .then(snapshot => {
        if (snapshot.val()){
          this.displayFavoriteButton = (this.imageKey != snapshot.key)
        } 
      });
    
    firebase.database().ref('images').child(this.imageKey)
     .once('value')
     .then(snapshot => {
       this.imageData = snapshot.val();
       this.defaultImage = this.imageData.fileUrl;
       this.curUserIsUploader = (uid == this.imageData.upLoadedBy.uid)
      if (this.inFollowing) {
        this.curUserIsUploader=false
        this.postFollowed =true
        
      }
       // remove unique identifiers from the saved name for display only
       let arr = (this.imageData.name).split('_');
       let removed = arr.splice(-1,2).join();
       this.imageData.name = arr.join();
       
       if (this.imageData.upLoadedBy.uid === uid) {
         this.displayFavoriteButton = false
         this.displayFollowButton = false
       }

     })
    
  }
  
  
  // FAVORITES
  onRemoveFavoriteClicked() {
   this.removeFavoriteClicked.emit({imageKey:this.imageKey, imageData:this.imageData})
   const subscription = this.myFireService.getFavoriteUpdate()
      .subscribe(message => { 
        this.favoritedKey = null;
        this.displayFavoriteButton = true;
        // this.myFireService.clearMessage()
        subscription.unsubscribe();
      });  
  }
  
  onFavoriteClicked() {
    // EventEmitter and Observable/Subject subscription combined
    this.favoriteClicked.emit({imageKey:this.imageKey, imageData:this.imageData})
    const subscription = this.myFireService.getFavoriteUpdate()
      .subscribe(message => { 
        this.favoritedKey = this.imageKey;
        this.displayFavoriteButton = false;
        // this.myFireService.clearMessage()
        subscription.unsubscribe();
      });       

  }
  

  // FOLLOWING
  onRemoveFollowedUser() {
   this.unfollowUser.emit({imageKey:this.imageKey, imageData:this.imageData})
   const subscription = this.myFireService.getFollowUpdate()
      .subscribe(message => { 
        this.postFollowed = null
        this.followedKey = null;
        this.displayFollowButton = true
        // this.myFireService.clearMessage()
        subscription.unsubscribe();
      });  
  }
  
  onFollowUser() {
    // EventEmitter and Observable/Subject subscription combined
    this.followUser.emit({imageKey:this.imageKey, imageData:this.imageData})
    const subscription = this.myFireService.getFollowUpdate()
      .subscribe(message => { 
        this.postFollowed = message.text.name
        this.followedKey = message.text.uid;
        this.displayFollowButton = false
        // this.myFireService.clearMessage()
        subscription.unsubscribe();
      });       

  }

  onImageLoad(event) {
    console.log('event', event)
      this.utilityService.onImageLoad(event)
  }
  
  onImageClick(event) {
    console.log('click event', event)
      // this.utilityService.onImageLoad(event)
  }   
  
}

        
      //     this.displayFavoriteButton = (this.imageKey != snapshot.key)
      //   } 
      // });
      // , error => {
      //     if (error) {
      //       // The write failed...
      //     } else {
      //       console.log("no error")
      //       // Data saved successfully!
      //     }
      // })



    // console.log("this.imageKey", this.imageKey )
          // console.log('key snapshot', snapshot.key)          
          // console.log('fav snapshot', snapshot.val().favoriteCount)

      // console.log('this.imageData', this.imageData)
      // const uid = firebase.auth().currentUser.uid
      // firebase.database().ref('favorites').child(uid)
      // .once('value')
      // .then(snapshot => {
      //   console.log("snapshot.val()", snapshot.val().key)
      // })
      
      // // this.message = message; 
      // console.log("post nginit  getfavmsg message", message)
      // // this.myFireService.clearMessage();
      // console.log("this.imageData", this.imageData);