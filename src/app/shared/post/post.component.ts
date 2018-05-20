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
  
  @Input() imageKey: string;
  @Input() displayImage: boolean = true;
  @Input() displayPostedBy: boolean;
  @Input() displayFavoritesButton: boolean;
  @Input() displayFollowButton: boolean;
  @Input() favoriteCountChanged
  curUserIsUploader: boolean;
  
  defaultImage: string = "assets/images/150x150.png";
  imageName: string = "";
  imageData: any = {};
  changedKey:string = null;
  
  @Output() favoriteClicked = new EventEmitter<any>();
  @Output() removeFavoriteClicked = new EventEmitter<any>();

  subscription: Subscription;

  constructor(private myFireService: MyFireService) { }

  ngOnDestroy() {
      // unsubscribe to ensure no memory leaks
      // this.subscription.unsubscribe();
  }

  ngOnInit() {
  
    const uid = firebase.auth().currentUser.uid
    
    // firebase.database().ref('favorites').child(uid)
    firebase.database().ref('favorites/' + uid + '/' + this.imageKey)
      .once('value')
      .then(snapshot => {
        if (snapshot.val()){
          // console.log("this.imageKey", this.imageKey )
          // console.log('key snapshot', snapshot.key)          
          // console.log('fav snapshot', snapshot.val().favoriteCount)
          this.displayFavoritesButton = (this.imageKey != snapshot.key)
          
        } 
        // else {
        //   console.log('not favorited')
        // }
      })

    
    firebase.database().ref('images').child(this.imageKey)
     .once('value')
     .then(snapshot => {
       this.imageData = snapshot.val();
       this.defaultImage = this.imageData.fileUrl;
       this.curUserIsUploader = (uid == this.imageData.upLoadedBy.uid)

       // remove unique identifiers from the saved name
       let arr = (this.imageData.name).split('_');
       let removed = arr.splice(-1,2).join();
       this.imageData.name = arr.join();
       
       if (this.imageData.upLoadedBy.uid === uid) {
         this.displayFavoritesButton = false
       }

     })
    
  }
  
  onRemoveFavoritesClicked() {
   this.removeFavoriteClicked.emit({imageKey:this.imageKey, imageData:this.imageData})
   const subscription = this.myFireService.getFavoriteUpdate()
      .subscribe(message => { 
        this.changedKey = null;
        this.displayFavoritesButton = true;
        // this.myFireService.clearMessage()
        subscription.unsubscribe();
      });  
  }
  
  onFavoritesClicked() {
    // EventEmitter and Observable/Subject subscription combined
    this.favoriteClicked.emit({imageKey:this.imageKey, imageData:this.imageData})
    const subscription = this.myFireService.getFavoriteUpdate()
      .subscribe(message => { 
        this.changedKey = this.imageKey;
        // this.myFireService.clearMessage()
        subscription.unsubscribe();
      });       
      
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



  }

}
