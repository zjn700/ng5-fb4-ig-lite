import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

import * as firebase from "firebase";
import * as _ from "lodash"

import { MyFireService } from "../shared/my-fire.service";
import { NotificationService } from "../shared/notification.service";
import { UtilityService } from '../shared/utility.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  
  all: any = [];
  allRef: any = null;
  displayPostedBy: boolean = true;
  displayImage = true;

  
  constructor(private myFireService: MyFireService, 
              private notificationService: NotificationService,
              private utilityService: UtilityService,
              private router: Router) { }

  ngOnInit() {
       

        
    // These firebase tasks should be moved to the firebase service
    const uid = firebase.auth().currentUser.uid

    this.myFireService.getFollowedUserArrayPromise(uid)
      .then( 
          (followedList) => {
          
            console.log("promise followed", followedList)
          // )
            let followedUsers = followedList
            // const followedUsers = this.myFireService.getFollowedUserArray(uid)
            console.log("followedUsers===========", followedUsers)
            this.allRef = firebase.database().ref('favorites/' + uid);
            this.allRef.on('child_added', data => {
              console.log("data val", data.val(), data.key)
              this.myFireService.checkUidAgainstFollowedUsersPromise(data.val().upLoadedBy.uid, followedUsers)
                .then (
                  (followed) => {
                    console.log("followed====promise", followed)
                // })
              
                  // const followed = this.myFireService.checkUidAgainstFollowedUsers(data.val().upLoadedBy.uid, followedUsers);
                  // console.log("followed&&&&&&&&&&&&&", followed)
                  this.all.push({
                    key: data.key,
                    data: data.val(),
                    followed: followed
                  });
                  console.log("followed=======================", followed)
                  console.log("this.all", this.all)
                });
                
                // PROMISE TEST 1 - SIMPLE PROMISE
                this.utilityService.doAsyncTask()
                  .then(
                    (val) => console.log(val),
                    (err) => console.error(err)
                  )
                  
                setTimeout(()=>{this.utilityService.checkForPosts(this.all, "You have no favorites", "info")}, 500)
    
            })
        })
  }
  
  // moved to utility.service -- see above
  // checkForPosts() {   
  //   ////console.log("in checkForPosts")
  //     if (this.all.length==0) {
  //       ////console.log('wtf')
  //       this.notificationService.display("info", "You have have no favorites")
  //     }        
  // }
  
  onRemoveFavoriteClicked(imageData){
    this.myFireService.handleRemoveFavoriteClicked(imageData)
      .then(data => {
        this.notificationService.display("info", "One image was removed from favorites")
        this.myFireService.setFavoriteUpdate(imageData.imageKey);
        this.displayImage = false;
        this.all = this.myFireService.removeImage(this.all,imageData.imageKey )
        if (this.all.length==0){
         this.notificationService.display("info", "You have have no favorites. Add some below")
         this.router.navigate(['/allposts'])

        }
      })
      .catch(err => {
        console.log('err', err.message)
        this.notificationService.display("error", err.message)
      })
    
  }
  
  onRemoveFollowedUser(image) {
    this.myFireService.handleRemoveFollowedUser(image.imageData.upLoadedBy)
      .then(data => {
        this.notificationService.display("info",  "You have unfollowed " + image.imageData.upLoadedBy.name)
        this.updateFollowedInPosts(image.imageData.upLoadedBy.uid, this.all, false)
        this.myFireService.setFollowUpdate(image.imageData.upLoadedBy);
      })
      .catch(err => {
        console.log('err', err.message)
        this.notificationService.display("error", err.message)
      })    
    
  }
  
  onFollowUser(image){
    this.myFireService.handleFollowUser(image.imageData.upLoadedBy)
      .then(data => {
        this.notificationService.display("info", "Following " + image.imageData.upLoadedBy.name)
        this.updateFollowedInPosts(image.imageData.upLoadedBy.uid, this.all, true)
        this.myFireService.setFollowUpdate(image.imageData.upLoadedBy);
      })
      .catch(err => {
        console.log('err', err.message)
        this.notificationService.display("error", err.message)
      })
  }  

  // should be moved to utility service?
  updateFollowedInPosts(followedUid, postArray, add){
    _.forEach(this.all, post => {
          if (followedUid == post.data.upLoadedBy.uid && add) {
            post.followed = post.data.upLoadedBy.name
            // this.displayFollowButton=false
          }
          if (followedUid == post.data.upLoadedBy.uid && !add) {
            post.followed = null
            // this.displayFollowButton=true

          }     
      })
      
    }
  
  
  

}
