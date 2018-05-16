import { Component, Input, OnInit } from '@angular/core';
import * as firebase from "firebase";

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  
  @Input() imageKey: string;
  // @Input() displayPostedBy: boolean = false;
  @Input() displayPostedBy: boolean;
  @Input() displayFavoritesButton: boolean;
  @Input() displayFollowButton: boolean;
  
  defaultImage: string = "assets/images/150x150.png";
  imageName: string = "";
  imageData: any = {}

  // defaultImage: string = "https://firebasestorage.googleapis.com/v0/b/ig-lite.appspot.com/o/image%2F150x150_pcbiwihqh.png?alt=media&token=ca80d457-b266-46c2-9f57-eba7920fb546"
  // defaultImage: string = "http://via.placeholder.com/150x150";
  // public displayFavoritesButton = true;


  constructor() { }

  ngOnInit() {
    
    console.log("displayPostedBy", this.displayPostedBy)
    firebase.database().ref('images').child(this.imageKey)
     .once('value')
     .then(snapshot => {
       this.imageData = snapshot.val();
       this.defaultImage = this.imageData.fileUrl;
       let arr = (this.imageData.name).split('_');
       let removed = arr.splice(-1,2).join();
       this.imageData.name = arr.join();
       
      // this.displayPostedBy = this.imageData.upLoadedBy;

     })
    
  }

}
