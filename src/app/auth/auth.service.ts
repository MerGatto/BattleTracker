import { Injectable } from "@angular/core";
import { JwtHelperService } from "@auth0/angular-jwt";
import { myConfig } from "./auth.config";

// Avoid name not found warnings
declare var Auth0Lock: any;

const helper = new JwtHelperService();

@Injectable({
  providedIn: 'root'
})
export class Auth
{
  // Configure Auth0
  lock = new Auth0Lock(myConfig.clientID, myConfig.domain, {});
  // Store profile object in auth class
  userProfile: Object;

  constructor()
  {
    // Set userProfile attribute of already saved profile
    this.userProfile = JSON.parse(localStorage.getItem("profile"));

    // Add callback for the Lock `authenticated` event
    this.lock.on("authenticated",
      (authResult) =>
      {
        localStorage.setItem("id_token", authResult.idToken);

        // Fetch profile information
        this.lock.getProfile(authResult.idToken,
          (error, profile) =>
          {
            if (error)
            {
              // Handle error
              alert(error);
              return;
            }

            localStorage.setItem("profile", JSON.stringify(profile));
            this.userProfile = profile;
          });
      });
  }

  public login()
  {
    // Call the show method to display the widget.
    this.lock.show();
  }

  public authenticated()
  {
    // Check if there's an unexpired JWT
    // It searches for an item in localStorage with key == 'id_token'
    return true; // !helper.isTokenExpired('id_token');
  }

  public logout()
  {
    // Remove token from localStorage
    localStorage.removeItem("id_token");
    localStorage.removeItem("profile");
    this.userProfile = undefined;
  }
}
