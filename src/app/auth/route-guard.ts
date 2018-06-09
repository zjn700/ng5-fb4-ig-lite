import { CanActivate } from "@angular/router";
import * as  firebase from 'firebase';

export class RouteGuard implements CanActivate {
    
    canActivate() {
        // if logged in, return true, else return false
        if (firebase.auth().currentUser) {
            return true
        } else {
            //console.log("routerguard - not logged in")
            return false
        }
        
    }
    
    
}