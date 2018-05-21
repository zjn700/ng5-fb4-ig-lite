import { Component, OnInit, OnDestroy } from '@angular/core';
import * as firebase from "firebase";
import * as _ from "lodash";
import * as $ from "jquery"

import { MyFireService } from '../shared/my-fire.service';
import { NotificationService } from "../shared/notification.service"

@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.css']
})
export class FollowingComponent implements OnInit, OnDestroy {
  
  refArray: any = [];
  postList: any = [];
  displayPostedBy: boolean = true;
  displayImage = true;

  constructor(private myFireService: MyFireService,
              private notificationService: NotificationService) { }

  ngOnDestroy(){
    _.forEach(this.refArray, ref => {
      if (ref && typeof(ref)==='object') {
       ref.off();
      }
    })
  }
  
  ngOnInit() {
    this.getFollowedUsers();
    // const uid = firebase.auth().currentUser.uid

    // const followUserRef = firebase.database().ref('following/' + uid);
    
    // followUserRef.once('value', data => {
    //   const otherUsersUids = _.keys(data.val())
    //   this.getOtherUsersPosts(otherUsersUids);
    // })
  }
  
  getFollowedUsers(){
    const uid = firebase.auth().currentUser.uid

    const followUserRef = firebase.database().ref('following/' + uid);
    
    followUserRef.once('value', data => {
      
      console.log("data val", data.val())
      
      const otherUsersUids = _.keys(data.val())
      console.log("otherUsersUids", otherUsersUids)
      this.getOtherUsersPosts(otherUsersUids, uid);
    }) 
  }
  
  getOtherUsersPosts(uidList, uid){
    const followedUsers = this.myFireService.getFollowedUserArray(uid)

    this.postList.length=0;
    for(let count=0; count < uidList.length; count++){
      this.refArray[count] = this.myFireService.getUserPostRef(uidList[count]);
      this.refArray[count].on('child_added', data => {
        console.log("data", data, data.val())
        console.log("uid list count", uidList[count])
        console.log(this.myFireService.checkUidAgainstFollowedUsers(uidList[count], followedUsers))
        this.postList.push({
          key: data.key,
          data: data.val(),
          followed: this.myFireService.checkUidAgainstFollowedUsers(uidList[count], followedUsers)
        })
      })
    }
    console.log("postList", this.postList)
  }
  
  onRemoveFollowedUser(image) {
    console.log("image", image)
    this.myFireService.handleRemoveFollowedUser(image.imageData.upLoadedBy)
      .then(data => {
        this.notificationService.display("info", "You have unfollowed this user")
        // this.myFireService.updateFollowedInPosts(image.imageData.upLoadedBy.uid, this.all, false)

        this.myFireService.setFollowUpdate(image.imageData.upLoadedBy);
        this.getFollowedUsers();
      })
      .catch(err => {
        console.log('err', err.message)
        this.notificationService.display("error", err.message)
      })    
  }
  
}
