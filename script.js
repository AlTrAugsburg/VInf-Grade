import CookieHandler from "./classes/CookieHandler.js"
import LocalStorageHandler from "./classes/LocalStorageHandler.js"
import Grades from "./classes/Grades.js"

const localStorageHandler = new LocalStorageHandler();
const cookieHandler = new CookieHandler();
const grades = new Grades(localStorageHandler);

let userAtForm = false;

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
  document.body.classList.toggle('is-dark');
  document.getElementById("darkMode").classList.toggle("hidden");
}

window.changeMode = function () {
  cookieHandler.changeMode();
  document.getElementById("darkMode").classList.toggle("hidden");
  document.getElementById("lightMode").classList.toggle("hidden");
  document.body.classList.toggle('is-dark');
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
  if(grades.saveLocal){
    if(!confirm("Wenn sie fortfahren, werden alle lokal gespeicherten Daten gelöscht. Fortfahren?")){
      document.getElementById("manuellButton").blur();
      return;
    }
  }
  userAtForm = !grades.saveLocal;
  ui("#userinfo");
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

  }
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
  return grades.checkGrade(id, grade);
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
  document.getElementById("dataLink").value = window.location.origin + window.location.pathname + "?grades=" + grades.grades;
}

window.closeUserInfo = function (){
  ui("#userinfo");
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
if(localStorageHandler.hasGradesMapLocal()){
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
}

window.copyLink = function () {
  navigator.clipboard.writeText(window.location.origin + window.location.pathname + "?grades=" + grades.grades).then(function() {
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

//Schauen, ob Daten über die URL mitgegeben wurden
if(window.location.search !== ""){
  let splittedParam = window.location.search.split("-");
  //Simple Prüfung, ob die Daten "passen"
  if(splittedParam[0] === "?grades=" && splittedParam.length == 40){
    splittedParam.shift();
    grades.import(splittedParam);
  }
  else {
    ui("#start");
    ui();
  }
}
else {
  ui("#start");
  ui();
}
