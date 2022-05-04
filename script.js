import CookieHandler from "./classes/CookieHandler.js"
import Grades from "./classes/Grades.js"

const cookieHandler = new CookieHandler();
const grades = new Grades();

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
  userAtForm = true;
  ui("#userinfo");
  grades.manuellGrades();
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

window.copyLink = function () {
  navigator.clipboard.writeText(window.location.origin + window.location.pathname + "?grades=" + grades.grades).then(function() {
    ui("#copySuccess", 3000);
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });

}

window.onbeforeunload = function(){
  if(userAtForm){
    // TODO: Entkommentieren vor dem Push!!!
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
