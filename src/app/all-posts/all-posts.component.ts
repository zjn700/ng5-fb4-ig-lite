import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router'
import * as firebase from "firebase";
import * as _ from "lodash";
import { MyFireService } from "../shared/my-fire.service";
import { NotificationService } from "../shared/notification.service"
import { Observable } from 'rxjs';

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.css']
})
export class AllPostsComponent implements OnInit, OnDestroy {
  allRef: any;
  all: any = [];
  loadMoreRef: any;
  followUserRef: any;
  totalImagesLoaded = 0;
  private maxPerLoad: number = 4
  
  // @Output() favoriteCountChanged = new EventEmitter<any>();
  // switch: boolean = false;
  displayPostedBy: boolean = true;
  displayFavoriteButton: boolean = true;
  displayFollowButton: boolean = true;  
  endOfAllposts:boolean = false;
  newFollowedUser: string = null;
  // unFollowedUse: string = null;
  
  constructor(private myFireService: MyFireService, 
              private notificationService: NotificationService,
              private router: Router) { }
  
  ngOnDestroy(){
    this.allRef.off();
    // this.followUserRef.off()
    if (this.loadMoreRef) {
      this.loadMoreRef.off();
    }
  }

  ngOnInit() {
    
    this.allRef = firebase.database().ref('allposts').limitToFirst(this.maxPerLoad);
    
    this.allRef.on('child_added', data => {
      this.all.push({
        key: data.val().imageKey,
        data: data.val(),
        followed: null
      });
      this.totalImagesLoaded += 1
      
      console.log("data", data)
      console.log("data.val", data.val())

    });

    const uid = firebase.auth().currentUser.uid

    // this.followUserRef = firebase.database().ref('following/' + uid);

    // this.followUserRef.on('child_removed', function(data) {
    //   console.log("data remove", data.key)
    // });
    
    // this.followUserRef.on('child_added', function(data) {
    //   console.log("data add key", data.key)
    //   this.router.navigate(['/following']);
    // });

  }
  
  onLoadMore() {
    
     this.endOfAllposts = (this.totalImagesLoaded % this.maxPerLoad != 0)
     if (this.endOfAllposts) {
        this.notificationService.display("info", "There are no more posts")
     }

    if (this.all.length > 0) {
      
      const lastLoadedPost = _.last(this.all);
      const lastLoadedPostKey = lastLoadedPost.key

      this.loadMoreRef = firebase.database().ref('allposts').startAt(null, lastLoadedPostKey).limitToFirst(this.maxPerLoad+1)
      this.loadMoreRef.on('child_added', data => {
        if (data.val().imageKey === lastLoadedPostKey) {
          return;
        } else {
          this.all.push({
            key: data.val().imageKey,
            data: data.val(),
            followed: null
          });
          this.totalImagesLoaded += 1

        }
         
      })

    }
    
  }
  
  onRemoveFavoriteClicked(imageData){
    this.myFireService.handleRemoveFavoriteClicked(imageData)
      .then(data => {
        this.notificationService.display("info", "Image removed from favorites")
        this.myFireService.setFavoriteUpdate(imageData.imageKey);
      })
      .catch(err => {
        console.log('err', err.message)
        this.notificationService.display("error", err.message)
      })
    
  }
  
  onFavoriteClicked(imageData){
    this.myFireService.handleFavoriteClicked(imageData)
      .then(data => {
        this.notificationService.display("info", "Image added to favorites")
        this.myFireService.setFavoriteUpdate(imageData.imageKey)
      })
      .catch(err => {
        console.log('err', err.message)
        this.notificationService.display("error", err.message)
      })
  }
  
  
  
  onRemoveFollowedUser(image) {
    this.myFireService.handleRemoveFollowedUser(image.imageData.upLoadedBy)
      .then(data => {
        this.notificationService.display("info", "Unfollowed " + image.imageData.upLoadedBy.name)
        this.myFireService.updateFollowedInPosts(image.imageData.upLoadedBy.uid, this.all, false)

        this.myFireService.setFollowUpdate(image.imageData.upLoadedBy);
      })
      .catch(err => {
        console.log('err', err.message)
        this.notificationService.display("error", err.message)
      })    
    
  }
  
  onFollowUser(image){
    // console.log("imageData", image.imageData)
    // console.log("imageData.upLoadedBy", image.imageData.upLoadedBy)
    this.myFireService.handleFollowUser(image.imageData.upLoadedBy)
      .then(data => {
        this.notificationService.display("info", "Following " + image.imageData.upLoadedBy.name)
        this.myFireService.updateFollowedInPosts(image.imageData.upLoadedBy.uid, this.all, true)
        console.log("this.all", this.all)
        this.myFireService.setFollowUpdate(image.imageData.upLoadedBy);
        // this.switch = !this.switch
        // this.router.navigate(['/following']);
        var newArray = this.all.slice();
        console.log("newArray", newArray)
        this.all = newArray.slice()
        console.log("this.all", this.all)

        
      })
      .catch(err => {
        console.log('err', err.message)
        this.notificationService.display("error", err.message)
      })
  }  

}
