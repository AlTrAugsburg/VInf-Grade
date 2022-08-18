//Liste der erlaubten Feldernamen
const allowedSandFn = ["I-1", "I-2", "I-3", "I-4", "I-5", "I-6", "II-1", "II-2", "II-3", "II-4", "II-5", "II-6", "III-1", "III-2", "III-3", "III-4", "IV-1", "IV-2", "IV-3", "IV-4", "IV-5", "IV-6", "IV-7", "IV-8", "V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7", "V-8", "V-9", "VI-1", "VI-2", "VI-3", "VI-4", "VI-5", "VI-P"];
//Gibt an, ob man in dem Fach weniger als 5 Punkte haben darf
const allowedToFail = [false, false, false, false, false, true, false, false, false, false, true, true, true, true, true, true, false, false, false, false, false, false, true, true, false, false, false, false, true, true, true, true, false, true, true, true, true, true, true];
//Wenn Punktzahl kleiner als die Zahl dann Note = Index+1
const smallerThanFinalGrade = [15.01, 13.5, 11, 8, 5, 2];
//Leistungsnachweise und schriftliche Prüfungen an der HföD, welche man nur mit Durchschnitt von 5 bestehen muss
const sharedFailRules19_22 = [[5, 10, 11], [12, 13], [22, 23, 28, 29, 30], [33, 34, 35]];
//Konstante, welche die Noten gruppiert für die Berechnung der ZW (Index von allowedSandFn)
const gradeGroupsAndFaktorZW = [
  //schriftlichen Prüfungsarbeiten des ersten Teils der Zwischenprüfung
  [[0, 1, 2, 3, 4, 6, 7, 8, 9], 66],
  //schriftlichen Prüfungsarbeiten des zweiten Teils der Zwischenprüfung
  [[12, 13], 22],
  //der studienbegleitenden Leistungsnachweise im Grundstudium gemäß § 5 Abs. 2 Nr. 2
  [[5, 10, 11], 8],
  //studienbegleitenden Leistungsnachweise des ersten Teilabschnitts gemäß § 5 Abs. 2 Nr. 1
  [[14, 15], 4]
];
//Konstante, welche die Noten gruppiert für die Berechnung der Endnote (Index von allowedSandFn)
const gradeGroupsAndFaktorEnd = [
  //schriftlichen Prüfungsarbeiten des ersten Teils der Qualifikationsprüfung
  [[16, 17, 18, 19, 20, 21, 24, 25, 26, 27], 40],
  //schriftlichen Prüfungsarbeiten des zweiten Teils der Qualifikationsprüfung
  [[33, 34, 35], 12],
  //dem jeweils 4fachen des ersten und zweiten Teils der mündlichen Prüfung
  [[32], 4],
  [[37], 4],
  //studienbegleitenden Leistungsnachweise im Hauptstudium gemäß § 5 Abs. 2 Nr. 2
  [[22, 23, 28, 29, 30], 4],
  //studienbegleitenden Leistungsnachweise des zweiten Teilabschnitts gemäß § 5 Abs. 2 Nr. 1
  [[36], 1],
  //Praxisbeurteilung
  [[38], 4],
  //Hausarbeit
  [[31], 5],
  //Faktor der Zwischennote
  26
];

//Diese Klasse berechnet die Noten für die Jahrgänge bis 2020/2023
export default class NewGrades{

  //Wird eine Map mit (S-Fn, N); S == Semester, Fn == Fachnummer, N == Note
  #gradesMap = new Map();
  #localStorage = false;
  #localStorageHandler;

  #calculate = function () {
    if(this.#localStorage){
      this.#localStorageHandler.saveGradesMapLocal(this.#gradesMap);
    }
    //Berechnung Zwischennote (§ 26 Abs. 3 FachV-VI)
    let sum = 0;
    //gradeGroupsAndFaktorZW durchiterieren
    for (var i = 0; i < gradeGroupsAndFaktorZW.length; i++) {
      let faktor = gradeGroupsAndFaktorZW[i][1];
      let sumGrades = 0;
      //Die einzelnen Noten zusammenaddieren
      for (var j = 0; j < gradeGroupsAndFaktorZW[i][0].length; j++) {
        sumGrades = sumGrades + this.#gradesMap.get(allowedSandFn[gradeGroupsAndFaktorZW[i][0][j]]);
      }
      //Durchschnitt bilden
      let durchschnitt = sumGrades / gradeGroupsAndFaktorZW[i][0].length;
      //Nur zwei Nachkommastellen berücksichtigen, § 25 Abs. 3 Satz 1 FachV-VI
      durchschnitt = roundTo(durchschnitt, 2);
      sum = sum + (durchschnitt * faktor);
    }
    let zwischennotenpunkte = sum / 100;
    //Nur zwei Nachkommastellen berücksichtigen, § 25 Abs. 3 Satz 1 FachV-VI
    zwischennotenpunkte =roundTo(zwischennotenpunkte, 2);

    //Schauen, welche Note die Notenpunkte bedeuten
    let zwischennote = 0;
    while (smallerThanFinalGrade[zwischennote]>zwischennotenpunkte) {
      zwischennote++;
    }

    //Ausgabe der Zwischennote
    document.getElementById("zwgrade").textContent = zwischennote + " (" + zwischennotenpunkte + ")";

    if(zwischennote > 4){
      document.getElementById("alertModalMessage").textContent = "Du kannst mit diesen Noten nicht das Studium bestehen, da deine Zwischennotenpunkte schlechter als 5 Notenpunkte ist (§ 26 Abs. 5 Nr. 1 Buchst. c) FachV-VI). Endnote wurde nicht berechnet.";
      if(!document.getElementById("alertModal").classList.contains("active")){
        //Damit das Modal sich nicht wieder sofort schließt
        ui("#alertModal");
      }
      document.getElementById("zwgrade").classList.add("error");
      setTimeout(function () {
        document.activeElement.blur();
        document.getElementById("alertModalButton").focus();
      }, 25);
      return false;
    }
    else {
      document.getElementById("zwgrade").classList.remove("error");
    }

    //Berechnung Endnote (§ 26 Abs. 4 FachV-VI)
    sum = 0;
    //Durch gradeGroupsAndFaktorEnd iterieren (bis auf das letzte Feld, das ist der Faktor der Zwischennote)
    for (var i = 0; i < gradeGroupsAndFaktorEnd.length-1; i++) {
      let faktor = gradeGroupsAndFaktorEnd[i][1];
      let sumGrades = 0;
      for (var j = 0; j < gradeGroupsAndFaktorEnd[i][0].length; j++) {
        sumGrades = sumGrades + this.#gradesMap.get(allowedSandFn[gradeGroupsAndFaktorEnd[i][0][j]]);
      }
      let durchschnitt = sumGrades / gradeGroupsAndFaktorEnd[i][0].length;
      //Nur zwei Nachkommastellen berücksichtigen, § 25 Abs. 3 Satz 1 FachV-VI
      durchschnitt = roundTo(durchschnitt, 2);
      sum = sum + (durchschnitt * faktor);
    }

    //Zwischennote dazurechnen
    sum = sum + (zwischennotenpunkte * gradeGroupsAndFaktorEnd[gradeGroupsAndFaktorEnd.length-1]);

    let endnotenpunkte = sum / 100;
    //Nur zwei Nachkommastellen berücksichtigen, § 25 Abs. 3 Satz 1 FachV-VI
    endnotenpunkte = roundTo(endnotenpunkte, 2);

    //Schauen, welche Note die Notenpunkte bedeuten
    let endnote = 0;
    while (smallerThanFinalGrade[endnote] > endnotenpunkte) {
      endnote++;
    }

    //Ausgabe der Endnote
    document.getElementById("endgrade").textContent = endnote + " (" + endnotenpunkte + ")";

    if(endnote > 4){
      document.getElementById("alertModalMessage").textContent = "Du kannst mit diesen Noten nicht das Studium bestehen, da deine Endnote schlechter als 5 Notenpunkte ist (§ 26 Abs. 5 Nr. 2 Buchst. c) FachV-VI)";
      if(!document.getElementById("alertModal").classList.contains("active")){
        //Damit das Modal sich nicht wieder sofort schließt
        ui("#alertModal");
      }
      document.getElementById("endgrade").classList.add("error");
      setTimeout(function () {
        document.activeElement.blur();
        document.getElementById("alertModalButton").focus();
      }, 25);
      return false;
    }
    else {
      document.getElementById("endgrade").classList.remove("error");
    }
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

  //Lädt die lokalen Noten aus dem Speicher
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

  //Bereitet die Anwendung für die Eintragung neuer Noten vor
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

  //Funktion wird aufgerufen, wenn von einem Inputfeld wegfokussiert wird
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
        //document.getElementById("semester"+number[0]+"sum").classList.add("error");
        document.getElementById(number).parentElement.classList.add("invalid");
        document.getElementById(number+"d").parentElement.classList.add("invalid");
        document.getElementById("alertModalMessage").textContent = "Du darfst in diesem Fach nicht durchfallen, nach § 26 Abs. 5 FachV-VI. Berechnung wird nicht durchgeführt.";
        ui("#alertModal");
        setTimeout(function () {
          document.activeElement.blur();
          document.getElementById("alertModalButton").focus();
        }, 20);
        document.getElementById("endgrade").classList.add("error");
        return false;
      }
      for (var i = 0; i < sharedFailRules19_22.length; i++) {
        let sum = 0;
        for (var j = 0; j < sharedFailRules19_22[i].length; j++) {
          let valueInput = 0;
          if(desktop){
            //Desktopfelder auslesen
            valueInput = Number(document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").value);
            if(isNaN(document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").value) || document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").value === ""){
              valueInput = 5;
            }
          }
          else {
            //Mobilegerätfelder auslesen
            valueInput = Number(document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]).value);
            if(isNaN(document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]).value) || document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]).value === ""){
              valueInput = 5;
            }
          }
          sum = sum + valueInput;
        }
        let durchschnitt = sum/sharedFailRules19_22[i].length;
        if(durchschnitt < 5){
          for (var j = 0; j < sharedFailRules19_22[i].length; j++) {
            if(desktop){
              document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").parentElement.classList.add("invalid");
            }
            else {
              document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]).parentElement.classList.add("invalid");
            }
          }
          document.getElementById("alertModalMessage").textContent = "Du hast in Fächern, wo man weniger als 5 Punkte bekommen kann, nicht den Durchschnitt geschafft und damit würdest du durchfallen, nach § 26 Abs. 5 FachV-VI. Diese wurden rot markiert und sollten entsprechend angepasst werden.";
          if(!document.getElementById("alertModal").classList.contains("active")){
            //Damit das Modal sich nicht wieder sofort schließt
            ui("#alertModal");
          }
          document.getElementById("endgrade").classList.add("error");
          setTimeout(function () {
            document.activeElement.blur();
            document.getElementById("alertModalButton").focus();
          }, 25);
          return;
        }
        //Achtung! Bei der vierten Regel mindestens 2 mal mindestens 5 Punkte
        else if (i==3) {
          let valueInput1 = 0;
          let valueInput2 = 0;
          let valueInput3 = 0;
          if(desktop){
            //Desktopfelder auslesen
            valueInput1 = Number(document.getElementById(allowedSandFn[33]+"d").value);
            valueInput2 = Number(document.getElementById(allowedSandFn[34]+"d").value);
            valueInput3 = Number(document.getElementById(allowedSandFn[35]+"d").value);
            if(isNaN(document.getElementById(allowedSandFn[33]+"d").value) || document.getElementById(allowedSandFn[33]+"d").value === ""){
              valueInput1 = 5;
            }
            if(isNaN(document.getElementById(allowedSandFn[34]+"d").value) || document.getElementById(allowedSandFn[34]+"d").value === ""){
              valueInput2 = 5;
            }
            if(isNaN(document.getElementById(allowedSandFn[35]+"d").value) || document.getElementById(allowedSandFn[35]+"d").value === ""){
              valueInput3 = 5;
            }
          }
          else {
            //Mobilegerätfelder auslesen
            valueInput1 = Number(document.getElementById(allowedSandFn[33]).value);
            valueInput2 = Number(document.getElementById(allowedSandFn[34]).value);
            valueInput3 = Number(document.getElementById(allowedSandFn[35]).value);
            if(isNaN(document.getElementById(allowedSandFn[33]).value) || document.getElementById(allowedSandFn[33]).value === ""){
              valueInput1 = 5;
            }
            if(isNaN(document.getElementById(allowedSandFn[34]).value) || document.getElementById(allowedSandFn[34]).value === ""){
              valueInput2 = 5;
            }
            if(isNaN(document.getElementById(allowedSandFn[35]).value) || document.getElementById(allowedSandFn[35]).value === ""){
              valueInput3 = 5;
            }
          }

          //Schauen, ob mindestens zwei Notenpunkte größer gleich 5
          if((valueInput1 < 5 && valueInput2 < 5 && valueInput3 > 4) || (valueInput1 < 5 && valueInput2 > 4 && valueInput3 < 5) || (valueInput1 > 4 && valueInput2 < 5 && valueInput3 < 5) || (valueInput1 < 5 && valueInput2 < 5 && valueInput3 < 5)){
            //In zwei Fächern weniger als 5 Notenpunkte -> nicht geschafft nach § 26 Abs.5 Nr. 2 Buchst. b) FachV-VI
            for (var j = 0; j < sharedFailRules19_22[3].length; j++) {
              if(desktop){
                document.getElementById(allowedSandFn[sharedFailRules19_22[3][j]]+"d").parentElement.classList.add("invalid");
              }
              else {
                document.getElementById(allowedSandFn[sharedFailRules19_22[3][j]]).parentElement.classList.add("invalid");
              }
            }
            document.getElementById("alertModalMessage").textContent = "Du hast in den schriftlichen Prüfungsleistungen des zweiten TA nicht in zwei von drei Prüfungen mindestens 5 Notenpunkte. Damit würdest du nach § 26 Abs.5 Nr. 2 Buchst. b) FachV-VI nicht bestehen.";
            if(!document.getElementById("alertModal").classList.contains("active")){
              //Damit das Modal sich nicht wieder sofort schließt
              ui("#alertModal");
            }
            document.getElementById("endgrade").classList.add("error");
            setTimeout(function () {
              document.activeElement.blur();
              document.getElementById("alertModalButton").focus();
            }, 25);
            return;
          }
          else {
            //Bedienungen erfüllt -> invalid entfernen falls vorhanden
            for (var j = 0; j < sharedFailRules19_22[3].length; j++) {
              if(desktop){
                document.getElementById(allowedSandFn[sharedFailRules19_22[3][j]]+"d").parentElement.classList.remove("invalid");
              }
              else {
                document.getElementById(allowedSandFn[sharedFailRules19_22[3][j]]).parentElement.classList.remove("invalid");
              }
            }
          }

        }
        else {
          for (var j = 0; j < sharedFailRules19_22[i].length; j++) {
            document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").parentElement.classList.remove("invalid");
            document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]).parentElement.classList.remove("invalid");
          }
        }
      }
      //Note sollte berechnet werden können -> Errorklasse von der Note entfernen
      document.getElementById("endgrade").classList.remove("error");

      if(desktop){
        document.getElementById(number).value = document.getElementById(number + "d").value;
      }
      else {
        document.getElementById(number + "d").value = document.getElementById(number).value;
      }
      ui();
      //document.getElementById("semester"+number[0]+"sum").classList.remove("error");
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

function roundTo(n, digits) {
    if (digits === undefined) {
        digits = 0;
    }

    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    return Math.floor(n) / multiplicator;
}
