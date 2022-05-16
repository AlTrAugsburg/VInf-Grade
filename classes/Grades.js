const allowedSandFn = ["I-1", "I-2", "I-3", "I-4", "I-5", "I-6", "II-1", "II-2", "II-3", "II-4", "II-5", "II-6", "III-1", "III-2", "III-3", "III-4", "IV-1", "IV-2", "IV-3", "IV-4", "IV-5", "IV-6", "IV-7", "IV-8", "V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7", "V-8", "V-9", "VI-1", "VI-2", "VI-3", "VI-4", "VI-5", "VI-P"];
const allowedToFail = [false, false, false, false, false, true, false, false, false, false, true, true, false, false, true, true, false, false, false, false, false, true, true, false, false, false, false, true, true, true, false, false, true, true, true, true, true, true, false];
const percentageEnd19_22 = [/*1. Semester*/191, 191, 191, 191, 191, 69, /*2. Semester*/191, 191, 191, 191, 69, 69, /*3. Semester*/286, 286, 52, 52, /*4. Semester*/400, 400, 400, 400, 400, 400, 80, 80, /*5. Semester*/400, 400, 400, 400, 80, 80, 80, 500, 400, /*6. Semester*/400, 400, 400, 100, 400, /*Praxis*/ 400];
const percentageZW19_22 = [/*1. Semester*/733, 733, 733, 734, 734, 267, /*2. Semester*/733, 733, 733, 733, 267, 267, /*3. Semester*/1100, 1100, 200, 200];
const finalGrades = ["DG!", "DG!", "DG!", "DG!", "4,0", "3,7", "3.3", "3,0", "2,7", "2,3", "2,0", "1,7", "1,3", "1,0", "0,7"];

export default class Grades{

  //Wird eine Map mit (S-Fn, N); S == Semester, Fn == Fachnummer, N == Note
  #gradesMap = new Map();
  #localStorage = false;
  #localStorageHandler;

  #calculate = function () {
    if(this.#localStorage){
      this.#localStorageHandler.saveGradesMapLocal(this.#gradesMap);
    }
    let sum = 0;
    for(let i in percentageZW19_22){
      sum = sum + (this.#gradesMap.get(allowedSandFn[i]) * percentageZW19_22[i]);
    }
    let grade6 = finalGrades[Math.floor(sum/10000)-1];
    let grade15 = Math.round((sum/10000) * 100) / 100;
    document.getElementById("zwgrade").textContent = grade6 + " (" + grade15 + ")";
    sum = 0;
    for(let i in allowedSandFn){
      sum = sum + (this.#gradesMap.get(allowedSandFn[i]) * percentageEnd19_22[i]);
    }
    grade6 = finalGrades[Math.floor(sum/10000)-1];
    grade15 = Math.round((sum/10000) * 100) / 100;
    document.getElementById("endgrade").textContent = grade6 + " (" + grade15 + ")";
  }

  constructor(localStorageHandler){
    if(localStorageHandler.constructor.name == "LocalStorageHandler"){
      //Richtige Klasse -> setzen
      this.#localStorageHandler = localStorageHandler;
    }
    else {
      console.error("LocalStorageHandler wurde nicht an grades Objekt übergeben. Es könnte zu Fehlern kommen");
    }
  }

  loadLocalGrades() {
    if(this.#localStorageHandler.getGradesMapFromLocal()!=null){
      this.#gradesMap = this.#localStorageHandler.getGradesMapFromLocal();
      this.#gradesMap.forEach((value, key) => {document.getElementById(key).value = value;  document.getElementById(key+"d").value = value;});

      //Richtigen Teil der Userinfo zeigen
      document.getElementById("userinfoNoLocal").classList.add("hidden");
      document.getElementById("userinfoLocal").classList.remove("hidden");
      ui("#calculator");
      ui("#userinfo");

      fixFields();

      this.#calculate();

      alert("Datenimport erfolgreich");
      return;
    }
    console.error("Es sind keine lokalen Daten vorhanden");
  }

  manuellGrades(){
    this.#gradesMap= new Map();
    for(let i in allowedSandFn){
      this.#gradesMap.set(allowedSandFn[i], 5);
    }
    if(this.#localStorage){
      //Richtigen Teil der Userinfo zeigen
      document.getElementById("userinfoNoLocal").classList.add("hidden");
      document.getElementById("userinfoLocal").classList.remove("hidden");
    }
    ui('#calculator');
    //Felder leeren, wegen caching von Werten, etc.
    Array.from(document.getElementsByTagName("input")).every((x) => {x.value=""; return true;});
    fixFields();
  }

  checkGrade(number, grade) {
    //Prüfen, ob Desktop oder Mobilelement
    let desktop;
    if(number[number.length-1] === "d"){
      desktop = true;
      number = number.substring(0, number.length - 1);
    }
    else {
      desktop = false;
    }

    //Prüfen, ob schon vorhanden
    if(this.#gradesMap.has(number)){
      if(grade < 5 && !allowedToFail[allowedSandFn.indexOf(number)]){
        document.getElementById("semester"+number[0]+"sum").classList.add("error");
        document.getElementById(number).parentElement.classList.add("invalid");
        alert("Du darfst in diesem Fach nicht durchfallen");
        setTimeout(function () {
          document.getElementById(number).focus();
        }, 10);
        document.getElementById("endgrade").classList.add("error");
        return false;
      }
      if(desktop){
        document.getElementById(number).value = document.getElementById(number + "d").value;
      }
      else {
        document.getElementById(number + "d").value = document.getElementById(number).value;
      }
      ui();
      document.getElementById("semester"+number[0]+"sum").classList.remove("error");
      document.getElementById(number).parentElement.classList.remove("invalid");
      document.getElementById("endgrade").classList.remove("error");
      this.#gradesMap.set(number, Number(grade));
      this.#calculate();
    }
    else {
      console.warn("Something went wrong. garde('" + number + "', '" + grade + "')");
    }
  }

  get grades(){
    let returnValue = "";
    this.#gradesMap.forEach((value) => {returnValue = returnValue + "-" + value.toString();});
    return returnValue;
  }

  toString(){
    let returnValue = "";
    this.#gradesMap.forEach((value) => {returnValue = returnValue + value.toString() + "-";});
    returnValue = returnValue.slice(0, -1);
    return returnValue;
  }

  import(array){
    //Daten werden nur temporär angezeigt und sollen nicht gespeichert werden
    this.#localStorage = false;
    //Pürfen, ob alle Daten ok sind
    let dataRightFormat = 0;
    for (var i = 0; i < array.length; i++) {
      if(!isNaN(array[i]) && array[i]!==""){
        let n = Number(array[i]);
        //Schauen, ob die Zahl eine gültige Note ist (Einzelprüfung später)
        if(n > 0 && n < 16){
          array[i] = n;
          dataRightFormat++;
        }
      }
    }
    if(dataRightFormat != array.length){
      console.error("Ungültige Daten im Link! Daten werden nicht übernommen");
      return;
    }
    //Daten prüfen, ob man durchfallen durfte, wenn < 5
    let didNotFail = array.every((value, index) => {
      if(value < 5){
        //Schauen, ob man durchfallen durfte
        return allowedToFail[index];
      }
      return true;
    });

    if(!didNotFail){
      alert("Mindestens in einem Fach durchgefallen, damit ungültiger Datensatz und nicht geladen.");
      ui("#start");
      ui();
      return;
    }

    //Daten sind "ok". Werden in die Map eingetragen
    for (var i = 0; i < array.length; i++) {
      this.#gradesMap.set(allowedSandFn[i], array[i]);
    }

    this.#gradesMap.forEach((value, key) => {document.getElementById(key).value = value; document.getElementById(key+"d").value = value;});

    ui("#calculator");
    ui("#userinfo");

    fixFields();

    this.#calculate();

    alert("Datenimport erfolgreich");
  }

  changeSaveLocal(){
    this.#localStorage = !this.#localStorage;
  }

  get saveLocal(){
    return this.#localStorage;
  }
}

function fixFields(){
  document.querySelectorAll("details").forEach((x)=>{x.open = true});
  ui();
  document.querySelectorAll("details").forEach((x)=>{x.open = false});
}
