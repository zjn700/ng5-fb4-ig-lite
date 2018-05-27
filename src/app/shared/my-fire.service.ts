import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import * as _ from "lodash";
import * as $ from "jquery";

@Injectable()
export class MyFireService {
  
  private subject = new Subject<any>();
  
  constructor(private userService: UserService) {}

  // USER
  getUserFromDatabase(uid) {
    const ref = firebase.database().ref('users/' + uid);
    return ref.once('value')
              .then(snapshot => snapshot.val())
  }
  
  getUserPostRef(uid) {
    return firebase.database().ref('myposts').child(uid);
  }
  
  getUsersFollowed(uid) {
    return firebase.database().ref('following').child(uid);
  }
  
  verifyUserIsFollowed(uid, uploadedBy) {
    console.log("in verifyUserIsFollowed", uid, uploadedBy)

    return firebase.database().ref('following/' + uid + '/' + uploadedBy)
      .once('value')
      .then(snapshot => {
        let userFollowed
        console.log("snapshot.val in fireb service", snapshot.val(), snapshot.key)
        if (snapshot.val()){
          userFollowed = snapshot.val()
        } else {
          userFollowed = null
        }
        return userFollowed
      });
      
  }
  
  // FILE UPLOAD
  uploadFile(file) {
    
    const fileName = this.randomizeFileName(file.name)

    const fileRef = firebase.storage().ref().child('image/' + fileName )
    const uploadTask = fileRef.put(file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', snapshot=> {
      }, error => {
        reject(error);
      }, ()=> {
        const fileUrl = uploadTask.snapshot.downloadURL;
        resolve({fileName, fileUrl});
      });
    })
    
  }
  
  randomizeFileName(fileName){
    let fna = fileName.split('.')
    let fnNoExtension = '';
    for (let i=0; i<fna.length-1; i++) {
      if (i == fna.length-2) {
        fnNoExtension += fna[i] + '_'
      } else {
        fnNoExtension += fna[i] + '.'
      }
    }

   return fnNoExtension + Math.random().toString(36).substr(2, 9) + '.' + fileName.split('.').pop();
  }
  
  handleImageUpload(data) {
    const currentUser = this.userService.getUser();
    // const currentUser = this.userService.getCurrentUser()
    console.log('user', user);
    console.log('currentUseruser', currentUser);
    
    const imageKey = firebase.database().ref('images').push().key;
    const imageDetails = {
      fileUrl: data.fileUrl,
      name: data.fileName,
      createdOn: new Date().toString(),
      upLoadedBy: user,
      favoriteCount: 0
    };
    
    
    const newPersonalPostKey = firebase.database().ref().child('myposts').push().key;
    const personalPostDetails = {
      imageKey: imageKey,
      fileUrl: data.fileUrl,
      name: data.fileName,
      createdOn: new Date().toString()
    };
    
    const allPostKey = firebase.database().ref('allposts').push().key;
    const allPostDetails = {
      imageKey: imageKey,
      fileUrl: data.fileUrl,
      name: data.fileName,
      createdOn: new Date().toString(),
      upLoadedBy: user
    };
 
    const updates = {};
    updates['/myposts/' + user.uid + "/" + newPersonalPostKey ] = personalPostDetails;
    updates['/allposts/' + allPostKey] = allPostDetails;
    updates['/images/' + imageKey] = imageDetails;
    
    return firebase.database().ref().update(updates)
    
  }
  
  
  // FAVORITES
  handleFavoriteClicked(image) {
    const uid = firebase.auth().currentUser.uid;
    
    const updates = {}
    
    if (image.imageData.favoriteCount) {
      image.imageData.oldFavoriteCount = image.imageData.favoriteCount;
      image.imageData.favoriteCount += 1
      //console.log("image.imageData.favoriteCount", image.imageData.favoriteCount)
      //console.log("image.imageData.oldFavoriteCount", image.imageData.oldFavoriteCount)

    } else {
      image.imageData.favoriteCount = 1
      image.imageData.oldFavoriteCount = 0;
    }
  
    
    updates['/images/' + image.imageKey + "/oldFavoriteCount"] = image.imageData.oldFavoriteCount;
    updates['/images/' + image.imageKey + "/favoriteCount"] = image.imageData.favoriteCount;
    updates['/favorites/' + uid + "/" + image.imageKey] = image.imageData;
    
    return firebase.database().ref().update(updates);
    
  }
  
  handleRemoveFavoriteClicked(image) {
    const uid = firebase.auth().currentUser.uid;
    
    const updates = {}
    
    if (image.imageData.favoriteCount > 1) {
      image.imageData.oldFavoriteCount -= 1;
      image.imageData.favoriteCount -= 1
      //console.log("image.imageData.favoriteCount", image.imageData.favoriteCount)
      //console.log("image.imageData.oldFavoriteCount", image.imageData.oldFavoriteCount)

    } else {
      image.imageData.favoriteCount = 0
      image.imageData.oldFavoriteCount = null;
    }
  
    
    updates['/images/' + image.imageKey + "/oldFavoriteCount"] = image.imageData.oldFavoriteCount;
    updates['/images/' + image.imageKey + "/favoriteCount"] = image.imageData.favoriteCount;
    // updates['/favorites/' + uid + "/" + image.imageKey] = image.imageData;
    firebase.database().ref('favorites/' + uid + '/' + image.imageKey).remove()

    return firebase.database().ref().update(updates);
    
  }
  
  removeImage(arr, key) {
    //console.log("remove image")
    let index = _.findIndex(arr, {key: key});
    //console.log("remove index", index);
    arr.splice(index, 1);
    return arr

    // _.update(this.all, 'a[0].b.c', function(n) { return n * n; });
  }
  
      // NEXT THREE FUNCTIONS IMPLEMENT AN OBSERVALE/SUBJECT
      // REF: http://jasonwatmore.com/post/2016/12/01/angular-2-communicating-between-components-with-observable-subject
  setFavoriteUpdate(key) {
    // sendMessage(message: string) {
    this.subject.next({ text: key });
  }

  getFavoriteUpdate(): Observable<any> {
    return this.subject.asObservable();
  }

  clearMessage() {
    this.subject.next();
  }
  
  
  // FOLLOW
  handleFollowUser(user){
    const uid = firebase.auth().currentUser.uid;
    
    const updates = {}       
    updates['/following/' + uid + "/" + user.uid] = user.name;
    // updates['/following/' + uid + "/" + user.uid] = true;

    return firebase.database().ref().update(updates);

  }

  handleRemoveFollowedUser(user) {
    const uid = firebase.auth().currentUser.uid;
    
    const updates = {}       
    
    firebase.database().ref('following/' + uid + '/' + user.uid).remove()

    return firebase.database().ref().update(updates);
    
  }
  
  updateFollowedInPosts(followedUid, postArray, add){
    _.forEach(postArray, post => {
        //console.log("post", post)
        //console.log("post uid", post.data.upLoadedBy.uid)
        //console.log("followedUid", followedUid)

        //console.log("post follow", post.followed)

          if (followedUid == post.data.upLoadedBy.uid && add) {
            post.followed = true
          }
          if (followedUid == post.data.upLoadedBy.uid && !add) {
            post.followed = null
          }     
          
        //console.log("postArray", postArray)      
        // return postArray
      })
      
    }

  getFollowedUserArray(uid) {
    const followedRef = this.getUsersFollowed(uid)
    //console.log("followedRef=====", followedRef)
    // let followedUsers = new Array()
    let followedUsers = []
    //console.log("============")
    followedRef.once('value', data => {
      //console.log("data val", data.val())
      $.each(data.val(), function(k, v) {
        //display the key and value pair
        //console.log(k + ' is ' + v);
        followedUsers.push({
          uid: k,
          name: v
        })
      });
      //console.log("followedUsers xxxxx", followedUsers)
    })
    if (followedUsers.length==0) { 
      console.log("OOPSSSSSSSSSSS", followedUsers, followedUsers.length) 
    }
    return followedUsers

  }
  
  getFollowedUserArrayPromise(uid) {
    console.log("getFollowedUserArrayPromise")
    return new Promise((resolve, reject) => {
      const followedRef = this.getUsersFollowed(uid)
      console.log("followedRef=====", followedRef)
      let followedUsers = new Array()
      // let followedUsers = []
      //console.log("============")
      followedRef.once('value', data => {
        //console.log("data val", data.val())
        $.each(data.val(), function(k, v) {
          //display the key and value pair
          //console.log(k + ' is ' + v);
          followedUsers.push({
            uid: k,
            name: v
          })
        });
      })
      if (!followedUsers) {
        reject("error in getFollowedUserArrayPromise")
      } else {
        resolve(followedUsers); // pass values
      }
    });
  }

  
  // checkUidAgainstFollowedUsersx(uid, followedUserList) {
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
  
  checkUidAgainstFollowedUsersPromise(uid, followedUserList) {
    console.log("checkUidAgainstFollowedUsersPromise")
    //return new Promise((resolve, reject) => {
    let promise =  new Promise((resolve, reject) => {
    setTimeout(()=>{
        console.log("checkUidAgainstFollowedUsersPromise", "uid", uid , "list length", followedUserList.length,"followedlist", followedUserList)
        let followed=null
        for (let i=0; i < followedUserList.length; i++) {
           console.log("uids", uid, followedUserList[i].uid, (uid===followedUserList[i].uid))
           if (uid===followedUserList[i].uid) {
             followed = followedUserList[i].name
             console.log('++++++ before break', followed)
             break;
           }
        }
        console.log("resolve follow", followed)
        resolve(followed);
      }, 500)      
    });
    return promise
  } 
  
  checkUidAgainstFollowedUsers(uid, followedUserList) {
    // setTimeout(()=>{
      console.log("checkUidAgainstFollowedUsers", "uid", uid , "list length", followedUserList.length,"followedlist", followedUserList)
      let followed=null
      for (let i=0; i < followedUserList.length; i++) {
         console.log("uids", uid, followedUserList[i].uid, (uid===followedUserList[i].uid))
         if (uid===followedUserList[i].uid) {
           followed = followedUserList[i].name
           console.log('++++++ before break', followed)
           break;
         }
      }
      return followed;
    // }, 500)
  }
  
  updateFollowedInPostsx(followedUid, postArray, add){
    //console.log("followedUid", followedUid)
    const uid = firebase.auth().currentUser.uid
    const followUserRef = firebase.database().ref('following/' + uid)
    
    followUserRef.once('value', data => {
      const otherUsersUids = _.keys(data.val())
      //console.log("otherUsersUids", otherUsersUids)
      _.forEach(otherUsersUids, uid => {
        //console.log("uid", uid)
        _.forEach(postArray, post => {
          //console.log("post", post)
          //console.log("post uid", post.data.upLoadedBy.uid)
          //console.log("followedUid", followedUid)

          //console.log("post follow", post.followed)
          if (add) {
            if (followedUid == post.data.upLoadedBy.uid) {
              post.followed = true
            } 
          } else {
            if (followedUid == post.data.upLoadedBy.uid) {
              post.followed = null
            }             
          }
          
        })
        //console.log("postArray", postArray)
      })
      
      // this.getOtherUsersPosts(otherUsersUids);
    })
    
    
    // _.forEach(this.refArray, ref => {
    //   if (ref && typeof(ref)==='object') {
    //   ref.off();
    // }
    
  }
  
  setFollowUpdate(key) {
    // sendMessage(message: string) {
    this.subject.next({ text: key });
  }
  
  getFollowUpdate(): Observable<any> {
    return this.subject.asObservable();
  }




}
