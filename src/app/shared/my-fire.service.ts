import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { UserService } from './user.service';

@Injectable()
export class MyFireService {
  
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
    
    // const imageKey = firebase.database().ref('images').push().key;
    // const imageDetails = {
    //   fileUrl: data.fileUrl,
    //   name: data.fileName,
    //   createdOn: new Date().toString(),
    //   upLoadedBy: user,
    //   favoriteCount: 0
    // };
    
    const updates = {};
    updates['/myposts/' + user.uid + "/" + newPersonalPostKey ] = personalPostDetails;
    updates['/allposts/' + allPostKey] = allPostDetails;
    updates['/images/' + imageKey] = imageDetails;
    
    return firebase.database().ref().update(updates)
    
  }


  getUserPostRef(uid) {
    return firebase.database().ref('myposts').child(uid);
  }
}
