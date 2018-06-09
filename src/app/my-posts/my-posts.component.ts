import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../shared/notification.service'
import { MyFireService } from '../shared/my-fire.service'
import { UserService } from '../shared/user.service'
import * as firebase from 'firebase';
import * as croppie from 'croppie';
import * as $ from 'jquery'

@Component({
  selector: 'app-my-posts',
  templateUrl: './my-posts.component.html',
  styleUrls: ['./my-posts.component.css']
})
export class MyPostsComponent implements OnInit, OnDestroy {
  
  public image = 'https://www.w3schools.com/bootstrap4/img_avatar1.png'
  personalPostRef: any;
  postLists: any = [];
  displayPostedBy: boolean = false;
  displayFavoriteButton: boolean = false;
  displayFollowButton: boolean = false;

  constructor(private notificationService: NotificationService,
              private myFireService: MyFireService,
              private userService: UserService) { }

  ngOnDestroy() {
    this.personalPostRef.off();
  }

  ngOnInit() {
    const currentUser = this.userService.getUser();
        // const uid = firebase.auth().currentUser.uid
    const userSavedInService = this.userService.getCurrentUser()
    //console.log('userSavedInService mypost', userSavedInService);
    
    //console.log('currentUseruser uid', currentUser.uid);
    const uid = firebase.auth().currentUser.uid;
    //console.log("uid from auth", uid)
    this.personalPostRef = this.myFireService.getUserPostRef(uid);
    this.personalPostRef.on('child_added', data => {
      //console.log("data my post init", data.val())
      this.postLists.push({
        // key: data.key,
        key: data.val().imageKey,
        data: data.val()
      })
    })

  }
  
  resizeImage(file) {
       
       let mfs = this.myFireService
       let thi$ = this
 
      if(file.type.match(/image.*/)) {
        console.log('An image has been loaded');
        console.log("file", file)
        // Load the image
        var reader = new FileReader();
        reader.onload = function (readerEvent) {
            var image = new Image();
            console.log("onreader load")
            image.onload = function (imageEvent) {

                // Resize the image
                var canvas = document.createElement('canvas'),
                    // max_size = 544,// TODO : pull max size from a site config
                    max_size = 1280,// TODO : pull max size from a site config
                    width = image.width,
                    height = image.height;
                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                console.log("canvas width, height", width, height)
                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                var dataUrl = canvas.toDataURL('image/jpeg');
                var resizedImage = thi$.dataURLToBlob(dataUrl);
                // the only method that allowed resizing before upload to firebase storage
                mfs.uploadImageBlob(file, resizedImage)

            }
            image.src = reader.result;  // image.src = readerEvent.target.result; // change this to  reader.result
            console.log("image.src", image.src)
            // this is one of three ways to load an image to firebase storage
            mfs.uploadImageFile(file, image.src)
        }
        reader.readAsDataURL(file);
      }
    
  }


   /* Utility function to convert a canvas to a BLOB */
  dataURLToBlob(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];
        console.log("raw", raw)

        return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw2 = window.atob(parts[1]);
    var rawLength = raw2.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw2.charCodeAt(i);
    }
    console.log("uInt8Array", uInt8Array)
    return new Blob([uInt8Array], {type: contentType});
  }
  

  onFileSelection(event){
    const fileList: FileList = event.target.files;
    
    if (fileList.length > 0) {
      const file: File = fileList[0];
      
      // console.log("resizeImage", this.myFireService.uploadImageFile(this.resizeImage(file)))
      // this.resizeImage(file)
      this.myFireService.resizeImage(file)
        .then(data => {
          console.log("data resized", data, data['downloadURL'], data['ref']['name'])
          this.image = data['downloadURL'];
          this.notificationService.displayLoading(null, null)
          this.notificationService.display('info', "Image was uploaded");
          this.myFireService.handleImageUpload({fileUrl: data['downloadURL'], fileName: data['ref']['name'] });          

        })

      this.notificationService.displayLoading('info', "Uploading your image: " + file.name)
       
      this.myFireService.uploadFile(file)
        .then(data => {
          // this.image = data['fileUrl'];
          // this.notificationService.displayLoading(null, null)
          // this.notificationService.display('info', "Image was uploaded");
          // this.myFireService.handleImageUpload(data);

        })
        .catch(err => {
          this.notificationService.displayLoading(null, null) // close loading message
          this.notificationService.display('error', err.message) // display error message

          
        })
    }
    
  }
  

}
