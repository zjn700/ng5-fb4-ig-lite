import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

import * as firebase from "firebase";

import { MyFireService } from "../shared/my-fire.service";
import { NotificationService } from "../shared/notification.service"

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
              private router: Router) { }

  ngOnInit() {
    
    const uid = firebase.auth().currentUser.uid

    this.allRef = firebase.database().ref('favorites/' + uid);
    console.log("this.allRef", this.allRef)
    
    this.allRef.on('child_added', data => {

      console.log("data", data)
      console.log("data.val", data.val())
      this.all.push({
        key: data.key,
        data: data.val()
      });
      console.log("this.all", this.all)

      // if (this.all.length==0) {
      //   console.log('wtf')
      //   this.notificationService.display("info", "You have have no favorites")
      // }      
      
    });    
    setTimeout(()=>{this.checkForPosts();}, 500)
  }
  
  checkForPosts() {
    console.log("in checkForPosts")
      if (this.all.length==0) {
        console.log('wtf')
        this.notificationService.display("info", "You have have no favorites")
      }        
  }
  
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

}
