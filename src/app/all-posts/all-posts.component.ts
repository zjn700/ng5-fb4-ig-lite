import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router'
import * as firebase from "firebase";
import * as _ from "lodash";
import * as $ from "jquery";
import { MyFireService } from "../shared/my-fire.service";
import { UserService } from "../shared/user.service";
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
  private maxPerLoad: number = 12
  
  // @Output() favoriteCountChanged = new EventEmitter<any>();
  // switch: boolean = false;
  disableLoadMore: boolean = false
  displayPostedBy: boolean = true;
  
  displayFavoriteButton: boolean = true;
  displayFollowButton: boolean = true;  
  
  endOfAllposts:boolean = false;
  newFollowedUser: string = null;
  // unFollowedUse: string = null;
  
  constructor(private myFireService: MyFireService, 
              private notificationService: NotificationService,
              private userService: UserService,
              private router: Router) { }
  
  ngOnDestroy(){
    this.allRef.off();
    // this.followUserRef.off()
    if (this.loadMoreRef) {
      this.loadMoreRef.off();
    }
  }

  ngOnInit() {
    // let uid = this.myFireService.getUsersFollowed(this.userService.getUser().uid)
    const uid = firebase.auth().currentUser.uid
    //console.log("============")
    //console.log("uid", uid)

    
    // let followedUsers2 = []
    const followedUsers = this.myFireService.getFollowedUserArray(uid)
    //console.log("followedUsers2", followedUsers)
    
    // const followedRef = this.myFireService.getUsersFollowed(uid)
    // let followedUsers = []
    // //console.log("============")
    // followedRef.once('value', data => {
    //   //console.log("data val", data.val())
    //   $.each(data.val(), function(k, v) {
    //     //display the key and value pair
    //     //console.log(k + ' is ' + v);
    //     followedUsers.push({
    //       uid: k,
    //       name: v
    //     })
    //   });

    // })
    // //console.log("followedUsers", followedUsers)

        //console.log("============")

    const userSavedInService = this.userService.getCurrentUser()
    //console.log('userSavedInService allpost', userSavedInService);

    this.allRef = firebase.database().ref('allposts').limitToFirst(this.maxPerLoad);
    
    this.allRef.on('child_added', data => {
      this.all.push({
        key: data.val().imageKey,
        data: data.val(),
        followed: this.myFireService.checkUidAgainstFollowedUsers(data.val().upLoadedBy.uid, followedUsers)
      });
      this.totalImagesLoaded += 1
      //console.log("this.all ========", this.all)
      
      //console.log("data", data)
      //console.log("data.val", data.val())
      
    });

  }
  
  // checkUidAgainstFollowedUsers(uid, followedUserList) {
  //   //console.log("uid in checkUidAgainstFollowedUsers", uid)
  //   let followed=null
  //   _.forEach(followedUserList, post => {
  //     //console.log("post ---", post)
  //     if (uid==post.uid) {
  //       followed = post.name
  //     }
  //   })
  //   //console.log("followed +++++", followed)
  //   return followed;
  // }
  
  
  onLoadMore() {
    // if (this.disableLoadMore) {
      
    // } else {
      // this.disableLoadMore = true
       this.endOfAllposts = (this.totalImagesLoaded % this.maxPerLoad != 0)
       if (this.endOfAllposts) {
          this.notificationService.display("info", "There are no more posts")
       }
  
       if (this.all.length > 0) {
        const uid = firebase.auth().currentUser.uid
  
        const lastLoadedPost = _.last(this.all);
        const lastLoadedPostKey = lastLoadedPost.key
        const followedUsers = this.myFireService.getFollowedUserArray(uid)
  
        this.loadMoreRef = firebase.database().ref('allposts').startAt(null, lastLoadedPostKey).limitToFirst(this.maxPerLoad+1)
        this.loadMoreRef.on('child_added', data => {
          //console.log("data.val().key)", data.val(), data.val().imageKey)
          if (data.val().imageKey === lastLoadedPostKey) {
            return;
          } else {
            this.all.push({
              key: data.val().imageKey,
              data: data.val(),
              followed: this.myFireService.checkUidAgainstFollowedUsers(data.val().upLoadedBy.uid, followedUsers)
            });
            this.totalImagesLoaded += 1
            // this.disableLoadMore= false;
  
          }
           
        })
        //console.log("this.al load morel", this.all)
     }
    // }
    
  }
  
  onRemoveFavoriteClicked(imageData){
    this.myFireService.handleRemoveFavoriteClicked(imageData)
      .then(data => {
        this.notificationService.display("info", "Image removed from favorites")
        this.myFireService.setFavoriteUpdate(imageData.imageKey);
      })
      .catch(err => {
        //console.log('err', err.message)
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
        //console.log('err', err.message)
        this.notificationService.display("error", err.message)
      })
  }
  
  
  
  onRemoveFollowedUser(image) {
    this.myFireService.handleRemoveFollowedUser(image.imageData.upLoadedBy)
      .then(data => {
        this.notificationService.display("info",  "You have unfollowed " + image.imageData.upLoadedBy.name)
        this.updateFollowedInPosts(image.imageData.upLoadedBy.uid, this.all, false)
        // this.myFireService.updateFollowedInPosts(image.imageData.upLoadedBy.uid, this.all, false)
        // this.router.navigate(['/following']);
        this.myFireService.setFollowUpdate(image.imageData.upLoadedBy);
      })
      .catch(err => {
        //console.log('err', err.message)
        this.notificationService.display("error", err.message)
      })    
    
  }
  
  onFollowUser(image){
    // //console.log("imageData", image.imageData)
    // //console.log("imageData.upLoadedBy", image.imageData.upLoadedBy)
    this.myFireService.handleFollowUser(image.imageData.upLoadedBy)
      .then(data => {
        this.notificationService.display("info", "Following " + image.imageData.upLoadedBy.name)
        this.updateFollowedInPosts(image.imageData.upLoadedBy.uid, this.all, true)
        // this.myFireService.updateFollowedInPosts(image.imageData.upLoadedBy.uid, this.all, true)
        this.myFireService.setFollowUpdate(image.imageData.upLoadedBy);
        // this.switch = !this.switch
        // this.router.navigate(['/following']);
        // var newArray = this.all.slice();
        // //console.log("newArray", newArray)
        // this.all = newArray.slice()
        // //console.log("this.all", this.all)

        
      })
      .catch(err => {
        //console.log('err', err.message)
        this.notificationService.display("error", err.message)
      })
  }  

  updateFollowedInPosts(followedUid, postArray, add){
    //console.log('##########################')
    _.forEach(this.all, post => {
        //console.log("post in allposts", post)
        //console.log("post uid", post.data.upLoadedBy.uid)
        //console.log("followedUid", followedUid)

        //console.log("post follow", post.followed)

          if (followedUid == post.data.upLoadedBy.uid && add) {
            post.followed = post.data.upLoadedBy.name
            this.displayFollowButton=false
            // post.followed = true
          }
          if (followedUid == post.data.upLoadedBy.uid && !add) {
            post.followed = null
            this.displayFollowButton=true

          }     
          
        //console.log("postArray this-", this.all)      
        // return postArray
      })
      
    }
    

}
