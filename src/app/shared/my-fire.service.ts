import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MyFireService {
  
  private subject = new Subject<any>();
  
  constructor(private userService: UserService) {}

  getUserFromDatabase(uid) {
    const ref = firebase.database().ref('users/' + uid);
    return ref.once('value')
              .then(snapshot => snapshot.val())
  }
  
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
    const user = this.userService.getUser();
    console.log('user', user);
    
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

  handleFavoriteClicked(image) {
    const uid = firebase.auth().currentUser.uid;
    
    const updates = {}
    
    // if (image.imageData.oldFavoriteCount) {
    //   image.imageData.oldFavoriteCount += 1
    //   console.log("image.imageData.oldFavoriteCount", image.imageData.oldFavoriteCount)
    // } else {
    //   image.imageData.oldFavoriteCount = 0
    // }
    
    if (image.imageData.favoriteCount) {
      image.imageData.oldFavoriteCount = image.imageData.favoriteCount;
      image.imageData.favoriteCount += 1
      console.log("image.imageData.favoriteCount", image.imageData.favoriteCount)
      console.log("image.imageData.oldFavoriteCount", image.imageData.oldFavoriteCount)

    } else {
      image.imageData.favoriteCount = 1
      image.imageData.oldFavoriteCount = 0;
    }
    
    // image.imageData.oldFavoriteCount += 1
    // image.imageData.favoriteCount += 1
    
    updates['/images/' + image.imageKey + "/oldFavoriteCount"] = image.imageData.oldFavoriteCount;
    updates['/images/' + image.imageKey + "/favoriteCount"] = image.imageData.favoriteCount;
    // updates['/images/' + image.imageKey + "/favoriteCount"] = image.imageData.favoriteCount + 1;
    updates['/favorites/' + uid + "/" + image.imageKey] = image.imageData;
    
    return firebase.database().ref().update(updates);
    
  }
  
  getUserPostRef(uid) {
    return firebase.database().ref('myposts').child(uid);
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


}
