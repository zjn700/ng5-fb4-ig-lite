// import { Injectable } from '@angular/core';
import * as firebase from 'firebase'

// @Injectable()
export class MyFireService {

  getUserFromDatabase(uid) {
      
      const ref = firebase.database().ref('users/' + uid);
      return ref.once('value')
                .then(snapshot => snapshot.val())
      
      
  }

}
