export default class CookieHandler{

  #setCookie = function (cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/; SameSite=Strict";
  }

  #getCookie = function (cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return false;
  }

  //Gibt den aktuellen Mode zurück, der im Cookie gespeichert ist; Falls keiner
  //geseetzt ist, gibt er das vom Gerät zurück; Dark = true, Light = false
  getMode(){
    if(this.#getCookie("mode")==="dark"){
      return true;
    }
    else if(this.#getCookie("mode")==="light"){
      return false;
    }
    else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // dark mode
        this.#setCookie("mode", "dark", 7);
        return true;
      }
      else {
        //light mode
        this.#setCookie("mode", "light", 7);
        return false;
      }
    }
  }

  //Ändert den Mode der Seite und gibt den aktuellen zurück; Dark = true, Light= false;
  changeMode(){
    if(this.#getCookie("mode")==="dark"){
      this.#setCookie("mode", "light", 1);
      return false;
    }
    else {
      this.#setCookie("mode", "dark", 1);
      return true;
    }
  }

  //Gibt true zurück, falls der Cookiebanner schon gezeigt wurde; false, wenn nicht
  getCookieBanner(){
    //Cookie ist nur gesetzt, wenn der Banner schon gezeigt wurde; Wert ist egal
    if(!this.#getCookie("cookieBanner")){
      return false;
    }
    else {
      return true;
    }

  }

  watchedCookieBanner(){
    this.#setCookie("cookieBanner", "watched", 1);
  }

}
