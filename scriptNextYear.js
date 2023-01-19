import CookieHandler from "./classes/CookieHandler.js"
import LocalStorageHandler from "./classes/LocalStorageHandler.js"
import GradesNextYears from "./classes/GradesNextYears.js"

const localStorageHandler = new LocalStorageHandler();
const cookieHandler = new CookieHandler();
const grades = new GradesNextYears(localStorageHandler);

const MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

let userAtForm = false;
let activeTabPage = "tabSemIp";
let activeTab = "tabSemI";
let openDetail = false;
let lastDesktopSizeMobile = window.getComputedStyle(document.getElementsByClassName("s").item(0)).display !== "none";

if(!cookieHandler.getCookieBanner()){
  //Cookiebanner wurde dem Nutzer noch nicht gezeigt
  document.getElementById("cookieBanner").style.visibility = "visible";
}

window.closeCookieBanner = function () {
  document.getElementById("cookieBanner").style.visibility = "hidden";
  cookieHandler.watchedCookieBanner();
}

if(cookieHandler.getMode()){
  //Dark Mode ist automatisch schon an, nur noch Button anpassen
  document.getElementById("lightMode").classList.toggle("hidden");
}
else {
  //False -> Light Mode abgespeichert/auf dem Geröt eingestellt
  document.body.classList.toggle('dark');
  document.getElementById("darkMode").classList.toggle("hidden");
}

window.changeMode = function () {
  cookieHandler.changeMode();
  document.getElementById("darkMode").classList.toggle("hidden");
  document.getElementById("lightMode").classList.toggle("hidden");
  document.body.classList.toggle('dark');
  //Schließen des popup Menüs
  document.activeElement.blur();
}

window.info = function () {
  alert("Infotest");
}

window.getGrades = function () {
  grades.loadGrades();
}

window.manuellGrades = function () {
  //Warnung beim verlassen soll nur kommen, wenn nicht lokal gespeichert wird
  if(grades.saveLocal&&localStorageHandler.hasGradesMapLocalN()){
    if(!confirm("Wenn sie fortfahren, werden alle lokal gespeicherten Daten gelöscht. Fortfahren?")){
      document.getElementById("manuellButton").blur();
      return;
    }
  }
  userAtForm = !grades.saveLocal;
  ui("#userinfo");
  document.getElementById("closeUserInfo").focus();
  grades.manuellGrades();
}

window.manuellGradesTemp = function () {
  grades.changeSaveLocal();
  manuellGrades();
}

window.clickDetails = function (number) {
  let itemID;
  switch (number) {
    case 1:
      //Semester 1 geklickt
      document.getElementById("I-close").classList.toggle("hidden");
      document.getElementById("I-open").classList.toggle("hidden");
      document.getElementById("semesterII").classList.toggle("hidden");
      document.getElementById("semesterIII").classList.toggle("hidden");
      document.getElementById("semesterIV").classList.toggle("hidden");
      document.getElementById("semesterV").classList.toggle("hidden");
      document.getElementById("semesterVI").classList.toggle("hidden");
      break;
    case 2:
      //Semester 2 geklickt
      document.getElementById("II-close").classList.toggle("hidden");
      document.getElementById("II-open").classList.toggle("hidden");
      document.getElementById("semesterI").classList.toggle("hidden");
      document.getElementById("semesterIII").classList.toggle("hidden");
      document.getElementById("semesterIV").classList.toggle("hidden");
      document.getElementById("semesterV").classList.toggle("hidden");
      document.getElementById("semesterVI").classList.toggle("hidden");
      break;
    case 3:
      //Semester 3 geklickt
      document.getElementById("III-close").classList.toggle("hidden");
      document.getElementById("III-open").classList.toggle("hidden");
      document.getElementById("semesterI").classList.toggle("hidden");
      document.getElementById("semesterII").classList.toggle("hidden");
      document.getElementById("semesterIV").classList.toggle("hidden");
      document.getElementById("semesterV").classList.toggle("hidden");
      document.getElementById("semesterVI").classList.toggle("hidden");
      break;
    case 4:
      //Semester 4 geklickt
      document.getElementById("IV-close").classList.toggle("hidden");
      document.getElementById("IV-open").classList.toggle("hidden");
      document.getElementById("semesterI").classList.toggle("hidden");
      document.getElementById("semesterII").classList.toggle("hidden");
      document.getElementById("semesterIII").classList.toggle("hidden");
      document.getElementById("semesterV").classList.toggle("hidden");
      document.getElementById("semesterVI").classList.toggle("hidden");
      break;
    case 5:
      //Semester 5 geklickt
      document.getElementById("V-close").classList.toggle("hidden");
      document.getElementById("V-open").classList.toggle("hidden");
      document.getElementById("semesterI").classList.toggle("hidden");
      document.getElementById("semesterII").classList.toggle("hidden");
      document.getElementById("semesterIII").classList.toggle("hidden");
      document.getElementById("semesterIV").classList.toggle("hidden");
      document.getElementById("semesterVI").classList.toggle("hidden");
      break;
    case 6:
      //Semester 6 geklickt
      document.getElementById("VI-close").classList.toggle("hidden");
      document.getElementById("VI-open").classList.toggle("hidden");
      document.getElementById("semesterI").classList.toggle("hidden");
      document.getElementById("semesterII").classList.toggle("hidden");
      document.getElementById("semesterIII").classList.toggle("hidden");
      document.getElementById("semesterIV").classList.toggle("hidden");
      document.getElementById("semesterV").classList.toggle("hidden");
      break;
    default:
      return;
  }
  if (!openDetail) {
    //Tab wird geöffnet
    openDetail = number;
  }
  else {
    //Tab wird geschlossen
    openDetail = false;
  }
  setTimeout(function () {
    ui();
  }, 50);
}

window.checkGrade = function (id) {
  if(document.getElementById(id).value > 15){
    document.getElementById(id).value = 15;
  }
  let grade = document.getElementById(id).value;
  if(isNaN(grade) || grade === ""){
    document.getElementById(id).value = "";
    grade = 5;
  }
  let returnValue = grades.checkGrade(id, grade);
  grades.checkChecklist();
  return returnValue;
}

window.focusHiddenInput = function (event) {
  if(document.getElementById("alertModal").classList.contains("active")){
    //AlertModal ist offen -> ignorieren, da alertModal sonst verschwindet!
    return;
  }
  document.getElementById('hiddenSuperImportantInputfield').dispatchEvent(new KeyboardEvent('keydown', {'key': 'a'}));
  //Schauen, ob von einem Inputfeld dorthin fokussiert wird => Nächsten Tab öffnen
  if (event.explicitOriginalTarget.tagName === "INPUT") {
    let activeTab = "";
    if(event.explicitOriginalTarget.id[event.explicitOriginalTarget.id.length-1] === "d"){
      //Tablet/Desktop View
      let activateNext = false;
      for(let i in document.getElementById("tabSemI").parentElement.children){
        if(!isNaN(i)){
          //Nur die Array Zahlen rausfiltern
          if(activateNext){
            //Dieses Element soll aktiv werden
            clickedTab(document.getElementById("tabSemI").parentElement.children.item(i).id + "p");
            if(document.getElementById("tabSemI").parentElement.children.item(i).id === "tabSemIV" || document.getElementById("tabSemI").parentElement.children.item(i).id === "tabSemV"){
              //Zwei Ebenen tiefer, da hier eine Row verwendet wird
              document.getElementById(document.getElementById("tabSemI").parentElement.children.item(i).id + "p").children.item(1).children.item(0).children.item(0).children.item(0).focus();
            }
            else {
              document.getElementById(document.getElementById("tabSemI").parentElement.children.item(i).id + "p").children.item(1).children.item(0).focus();
            }
            return;
          }
          if(document.getElementById("tabSemI").parentElement.children.item(i).classList.contains("active")){
            //Dieser Tab ist aktiv, nächster soll aktiv werden
            activateNext = true;
          }
        }
      }
      document.getElementById("shareButton").focus();
      return;
    }
    else {
      //Mobile View
      if(event.explicitOriginalTarget.id === "IV-8"){
        //Sonderfall für das 4. Semester, da hier ein paar Ebenen extra hoch gegangen werden muss, wg. der row!
        //Wird allgemein definiert, falls noch mehr Ausnahmen dazukommen sollten (Warum auch immer)
        activeTab = event.explicitOriginalTarget.parentElement.parentElement.parentElement.parentElement.parentElement.children.item(0).onclick.toString().split("\n")[1].split("(")[1].split(")")[0];
      }
      else {
        activeTab = event.explicitOriginalTarget.parentElement.parentElement.parentElement.children.item(0).onclick.toString().split("\n")[1].split("(")[1].split(")")[0];
      }
      activeTab = Number.parseInt(activeTab);
      if(activeTab < 1 || activeTab > 5){
        //Entweder ungültiger Wert, oder im 6. Semester Tab => einfach Teilenbutton fokussieren
        document.getElementById("shareButton").focus();
        return;
      }

      //Aktuellen Tab schließen und nächsten öffnen
      clickDetails(activeTab);
      document.getElementsByTagName("details").item(activeTab-1).open = false;
      clickDetails(activeTab+1);
      document.getElementsByTagName("details").item(activeTab).open = true;
      //Jetzt erstes Inputfeld dort fokussieren
      if(activeTab == 3 || activeTab == 4){
        //Es wird zum 4. oder 5. Semester gewechselt => eine Ebene extra runter, wg. row!
        document.getElementsByTagName("details").item(activeTab).children.item(1).children.item(0).children.item(0).children.item(0).children.item(0).focus();
      }
      else {
        //Ansonsten muss man nicht so tief
        document.getElementsByTagName("details").item(activeTab).children.item(1).children.item(0).children.item(0).focus();
      }
      //Seite nach oben scrollen, weil auf Smartphone beim wechseln vom 4. Semester zum 5. Semester die Felder komisch fokussiert werden. Hat überall wo es normal funktioniert, keine Auswirkungen
      window.scrollBy(0, -100);
    }
  }
  //Schauen, ob von einem Button (Teilenbutton) dorthin fokussiert wird => Überspringen
  else if (event.explicitOriginalTarget.tagName === "BUTTON") {
    if(!openDetail && window.getComputedStyle(document.getElementsByClassName("s").item(0)).display === "none"){
      //Details nicht offen, vermutlich PC, TODO
      //display property of s element -> window.getComputedStyle(document.getElementsByClassName("s").item(0)).display
      if(activeTabPage === "tabSemIVp"){
        //Letztes Element in Row => Zwei Ebenen tiefer
        document.getElementById(activeTabPage).children.item(document.getElementById(activeTabPage).children.length-1).children.item(1).children.item(0).children.item(0).focus();
      }
      else {
        document.getElementById(activeTabPage).children.item(document.getElementById(activeTabPage).children.length-1).children.item(0).focus();
      }
    }
    else {
      //Versuchen, dass letzte Element zu fokussieren
      if(openDetail == 4){
        //Sonderfall wg. row!
        let length = document.getElementsByTagName("details").item(openDetail-1).children.item(1).children.length-1;
        document.getElementsByTagName("details").item(openDetail-1).children.item(1).children.item(length).children.item(1).children.item(0).children.item(0).focus();
      }
      else {
        //Hier wird nicht zu einem Input in einer Row gesprungen
        let length = document.getElementsByTagName("details").item(openDetail-1).children.item(1).children.length-1;
        document.getElementsByTagName("details").item(openDetail-1).children.item(1).children.item(length).children.item(0).focus();
      }
    }
  }
}

window.grades = grades;

window.generateLink = function () {
  //Warten, damit Daten entsprechend in die Map eingetragen werden können
  setTimeout(function () {
    generateLinkNow();
  }, 10);
}

function generateLinkNow() {
  ui("#generatedLink");
  document.getElementById("dataLink").value = window.location.origin + window.location.pathname + "?grades=" + grades.grades + "-v2";
}

window.closeUserInfo = function (){
  ui("#userinfo");
}

window.clickedTab = function (tabId) {
  if(tabId !== activeTabPage && tabId != null && tabId != undefined){
    //Schauen, ob ein Element mit der Id exestiert
    if(document.getElementById(tabId)!=null){
      //ELement exestiert -> alten Tab deaktivieren, neuen aktivieren und speichern
      document.getElementById(activeTabPage).classList.remove("active");
      document.getElementById(tabId).classList.add("active");
      document.getElementById(tabId.substring(0, tabId.length - 1)).classList.add("active");
      document.getElementById(activeTab).classList.remove("active");
      activeTabPage = tabId;
      activeTab = tabId.substring(0, tabId.length - 1);
      ui();
    }
  }
}

window.changeSaveLocal = function () {
  if(grades.saveLocal){
    //Aktuell sollen Noten lokal gespeichert werden -> jetzt nicht mehr
    if(!confirm("Sollen die Noten wirklich nicht mehr lokal gespeichert werden? Achtung! Aktuell vorhandene Daten werden unwiederruflich gelöscht!")){
      //Nutzer möchte Daten nicht verlieren -> nichts machen
      document.getElementById("changeSaveLocalButton").blur();
      return;
    }
    //Alle(!) Daten löschen aus dem localStorage löschen
    localStorage.clear();
    //grades sagen, dass die Änderungen nicht mehr gespeichert werden sollen
    grades.changeSaveLocal();
    //Button zum laden lokaler Daten verstecken, falls nicht schon geschehen
    document.getElementById("loadFromLocalButton").classList.add("hidden");
    document.getElementById("manuellTempButton").classList.add("hidden");
    //Jetzt nur noch den Button anpasen
    document.getElementById("changeSaveLocalButton").classList.add("secondary-container");
    document.getElementById("changeSaveLocalButton").classList.remove("green");
    document.getElementById("saveLocalFalse").classList.remove("hidden");
    document.getElementById("saveLocalTrue").classList.add("hidden");
  }
  else {
    //Noten sollen ab jetzt lokal gespeichert werden
    //grades sagen, dass Noten lokal gespeichert werden sollen
    grades.changeSaveLocal();
    //Jetzt nur noch den Button anpasen
    document.getElementById("changeSaveLocalButton").classList.remove("secondary-container");
    document.getElementById("changeSaveLocalButton").classList.add("green");
    document.getElementById("saveLocalFalse").classList.add("hidden");
    document.getElementById("saveLocalTrue").classList.remove("hidden");
  }
}

//Schauen, ob Daten lokal vorhanden sind
if(localStorageHandler.hasGradesMapLocalN()){
  //Button zum Laden der Daten zeigen
  document.getElementById("loadFromLocalButton").classList.remove("hidden");
  document.getElementById("manuellTempButton").classList.remove("hidden");
  //grades sagen, dass lokale Daten vorhanden sind
  grades.changeSaveLocal();
  //Button der die Speicherung der Daten lokal festlegt macht
  document.getElementById("changeSaveLocalButton").classList.remove("secondary-container");
  document.getElementById("changeSaveLocalButton").classList.add("green");
  document.getElementById("saveLocalFalse").classList.add("hidden");
  document.getElementById("saveLocalTrue").classList.remove("hidden");
}

window.loadFromLocal = function () {
  grades.loadLocalGrades();
  //Infomation zur Speicherung bei Fehlermeldungen anzeigen
  document.getElementById("savingInfoAlert").classList.remove("hidden");
}

window.copyLink = function () {
  navigator.clipboard.writeText(window.location.origin + window.location.pathname + "?grades=" + grades.grades + "-v2").then(function() {
    ui("#copySuccess", 3000);
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}

window.onbeforeunload = function(){
  if(userAtForm){
    return 'Achtung! Eingegebene Daten werden nicht gespeichert! Zum sichern bitte den Teilungslink kopieren.';
  }
};

//Bsp.: onfocusout="focusOutCheck('I-5', 1, 'semesterIsum')"
window.focusOutCheck = function (expected, clickDetailsNum, changeTo=null){
  //Expected is the field, where it would stay in the detail, otherwise go back to the overview
  if(document.getElementById(expected) != event.relatedTarget){
    //Going out => clickDetails()
    clickDetails(clickDetailsNum);
    //close the active detail (Its the parent of the parent of the parent of the expected element ;) )
    document.getElementById(expected).parentElement.parentElement.parentElement.open = false;
    //if changeTo is not null => focus Element with that id
    if(changeTo!=null){
      document.getElementById(changeTo).focus();
    }
  }
  //Do nothing, if it stays in there
}

window.onresize = function () {
  if(window.getComputedStyle(document.getElementsByClassName("s").item(0)).display !== "none" && !lastDesktopSizeMobile){
    //Jetzt Mobilgeräte -> Fix Fields on mobile
    document.querySelectorAll("details").forEach((x)=>{x.open = true});
    ui();
    document.querySelectorAll("details").forEach((x, index)=>{
      if(openDetail-1 == index){/*Offen lassen*/}
      //Rest schließen
      else{x.open = false;}
    });
    lastDesktopSizeMobile = true;
  }
  if (window.getComputedStyle(document.getElementsByClassName("s").item(0)).display === "none" && lastDesktopSizeMobile) {
    ui();
    lastDesktopSizeMobile = false;
  }
}

window.printPage = function () {
  try{
    window.print();
  }
  catch(e){
    ui("#noPrintToast")
  }
}

//Funktion um Tabs im 5.Semester Tab im Mobile zu wechseln
window.vSemesterChangePage = function(page){
  //Schauen, ob erster Tab versteckt und erster Button geklickt ist
  if(document.getElementById("V-tab-1").classList.contains("hidden") && page === "V-tab-1"){
    //Erster Tab anzeigen und zweiten verstecken
    document.getElementById("V-tab-1").classList.remove("hidden");
    document.getElementById("V-tab-2").classList.add("hidden");
    document.getElementById("button-V-tab-1").classList.add("active");
    document.getElementById("button-V-tab-2").classList.remove("active");
  }
  else if(document.getElementById("V-tab-2").classList.contains("hidden") && page === "V-tab-2"){
    //Zweiten Tab anzeigen und ersten verstecken
    document.getElementById("V-tab-1").classList.add("hidden");
    document.getElementById("V-tab-2").classList.remove("hidden");
    document.getElementById("button-V-tab-1").classList.remove("active");
    document.getElementById("button-V-tab-2").classList.add("active");
  }
}

//Schauen, ob Daten über die URL mitgegeben wurden
if(window.location.search !== ""){
  let splittedParam = window.location.search.split("-");
  //Simple Prüfung, ob die Daten "passen"
  if(splittedParam[0] === "?grades=" && splittedParam.length == 37 && splittedParam[36] === "v2"){
    splittedParam.shift();
    splittedParam.pop();
    grades.import(splittedParam);

  }
  else {
    ui("#start");
    ui("#startModal");
    setTimeout(function () {
      document.activeElement.blur();
      document.getElementById("startModalButton").focus();
    }, 50);
  }
}
else {
  ui("#start");
  ui("#startModal");
  setTimeout(function () {
    document.activeElement.blur();
    document.getElementById("startModalButton").focus();
  }, 50);
}
