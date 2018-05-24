import { Component, OnInit } from '@angular/core';
import * as $ from "jquery";
import { Croppie } from "croppie";
// import { cropper } from "cropperjs"
import Cropper from 'cropperjs';

import { MyFireService } from '../../shared/my-fire.service'
import { NotificationService } from '../../shared/notification.service'

interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
}

interface FileReaderEventTarget extends EventTarget {
    result:string
}

interface FileReaderEvent extends Event {
    target: FileReaderEventTarget;
    getMessage():string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
 
  
  
  constructor(private notificationService: NotificationService,
              private myFireService: MyFireService){ }

  ngOnInit() {}

}
