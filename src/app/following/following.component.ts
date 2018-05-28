import { Component, OnInit, OnDestroy } from '@angular/core';
import * as firebase from "firebase";
import * as _ from "lodash";
import * as $ from "jquery"

import { MyFireService } from '../shared/my-fire.service';
import { NotificationService } from '../shared/notification.service';
import { UtilityService } from '../shared/utility.service';

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
              private notificationService: NotificationService,
              private utilityService: UtilityService) { }

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
      
      //console.log("data val", data.val())
      
      const otherUsersUids = _.keys(data.val())
      console.log("otherUsersUids", otherUsersUids)
      this.getOtherUsersPosts(otherUsersUids, uid);
    }) 
  }
  
  getOtherUsersPosts(uidList, uid){

    const refTemp = firebase.database().ref('following/' + uid);
    refTemp.once('value')
      .then(snapshot => {
        if (!snapshot.exists()) {
          console.log("ain't following anyone")
          this.notificationService.display("info", "You are not following anyone")
  
        } else {
          console.log("yes i am following them")
        }
      })
      
    const followedUsers = this.myFireService.getFollowedUserArray(uid)
    console.log("followedUsers====", followedUsers)
    this.postList.length=0;
    for(let count=0; count < uidList.length; count++){
      this.refArray[count] = this.myFireService.getUserPostRef(uidList[count]);
      this.refArray[count].on('child_added', data => {
        //console.log("data", data, data.val())
        //console.log("uid list count", uidList[count])
        //console.log(this.myFireService.checkUidAgainstFollowedUsers(uidList[count], followedUsers))
        const tempList = uidList[count]
        this.postList.push({
          key: data.key,
          data: data.val(),
          followed: this.myFireService.checkUidAgainstFollowedUsers(uidList[count], followedUsers), 
        })
        
        // PROMISE TEST 2
        this.utilityService.doAsyncTask2(tempList, followedUsers)
          .then(
              (val) => {
                console.log("val =====", val);
                return "blah"; 
              }
          )
          .then( 
              (val) => {
                console.log("val2 ", val);
                throw new Error(JSON.stringify({id: "2", message: "You fucked up."}));
              }
          )
          .catch(
              (err) => {
                console.error(err);
                console.log(JSON.parse(err.message).message)
              }
          )
      })
    }
    // setTimeout(()=>{this.utilityService.checkForPosts(this.postList, "You are not following anyone", "info")}, 1000)

  }
  
  onRemoveFollowedUser(image) {
    //console.log("image", image)
    this.myFireService.handleRemoveFollowedUser(image.imageData.upLoadedBy)
      .then(data => {
        this.notificationService.display("info", "You have unfollowed " + image.imageData.upLoadedBy.name)
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
