import { Component, Input, Output, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import * as firebase from "firebase";
import { Subscription } from 'rxjs/Subscription';
import { MyFireService } from '../my-fire.service'

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnDestroy {
  
  @Input() post: string;
  @Input() imageKey: string;
  @Input() uploadedBy: string;
  @Input() displayImage: boolean = true;
  @Input() displayPostedBy: boolean;
  @Input() displayFavoriteButton: boolean;
  // @Input() displayUnfavoriteButton: boolean;
  @Input() showThis:boolean = false;
  @Input() displayFollowButton: boolean;
  @Input() newFollowedUser: string;
  @Input() favoriteCountChanged
  @Input() inFollowing: boolean = false;
  
  @Input() curUserIsUploader: boolean;
  
  defaultImage: string = "assets/images/150x150.png";
  imageName: string = "";
  imageData: any = {};
  favoritedKey:string = null;
  followedKey:string = null;
  
  @Output() favoriteClicked = new EventEmitter<any>();
  @Output() followUser = new EventEmitter<any>();
  @Output() removeFavoriteClicked = new EventEmitter<any>();
  @Output() unfollowUser = new EventEmitter<any>();

  subscription: Subscription;

  constructor(private myFireService: MyFireService) { }

  ngOnDestroy() {
      // unsubscribe to ensure no memory leaks
      // this.subscription.unsubscribe();
  }

  ngOnInit() {
    const uid = firebase.auth().currentUser.uid
    
    firebase.database().ref('following/' + uid + '/' + this.uploadedBy)
      .once('value')
      .then(snapshot => {
        console.log("snapshot.val", snapshot.val())
        if (snapshot.val()){
          this.displayFollowButton = !snapshot.val()
        }
      });

    
    // firebase.database().ref('favorites').child(uid)
    firebase.database().ref('favorites/' + uid + '/' + this.imageKey)
      .once('value')
      .then(snapshot => {
        if (snapshot.val()){
          // console.log("this.imageKey", this.imageKey )
          // console.log('key snapshot', snapshot.key)          
          // console.log('fav snapshot', snapshot.val().favoriteCount)
          this.displayFavoriteButton = (this.imageKey != snapshot.key)
          // this.displayUnfavoriteButton = (this.imageKey == snapshot.key)
        } 
        // else {
        //   console.log('not favorited')
        // }
      });
      // , error => {
      //     if (error) {
      //       // The write failed...
      //     } else {
      //       console.log("no error")
      //       // Data saved successfully!
      //     }
      // })

    
    firebase.database().ref('images').child(this.imageKey)
     .once('value')
     .then(snapshot => {
       this.imageData = snapshot.val();
       this.defaultImage = this.imageData.fileUrl;
       this.curUserIsUploader = (uid == this.imageData.upLoadedBy.uid)
      if (this.inFollowing) {
        this.curUserIsUploader=false
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
        // this.displayUnfavoriteButton=false

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
        // this.displayUnfavoriteButton=true
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
        this.followedKey = null;
        this.displayFollowButton = true
        console.log()
        // this.myFireService.clearMessage()
        subscription.unsubscribe();
      });  
  }
  
  onFollowUser() {
    // EventEmitter and Observable/Subject subscription combined
    this.followUser.emit({imageKey:this.imageKey, imageData:this.imageData})
    const subscription = this.myFireService.getFollowUpdate()
      .subscribe(message => { 
        this.followedKey = message.text.uid;
        this.displayFollowButton = false

        // this.myFireService.clearMessage()
        subscription.unsubscribe();
      });       

  }
  
  
}


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