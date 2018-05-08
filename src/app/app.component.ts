import { Component, OnInit } from '@angular/core';
import * as firebase from "firebase";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit{
  title = 'app';
  
  ngOnInit() {
    
    // Initialize Firebase
    const config = {
      apiKey: "AIzaSyBh0VeyxPGkr--jkH6rByGDgF1BhyE9Vx4",
      authDomain: "ig-lite.firebaseapp.com",
      databaseURL: "https://ig-lite.firebaseio.com",
      projectId: "ig-lite",
      storageBucket: "ig-lite.appspot.com",
      messagingSenderId: "258441691473"
    };
    firebase.initializeApp(config);    
  
  }
  
}
