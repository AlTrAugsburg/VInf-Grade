//Liste der erlaubten Feldernamen (V-7/Seminar entfernen?)
const allowedSandFn = ["I-1", "I-2", "I-3", "I-4", "I-5", "I-6", "II-1", "II-2", "II-3", "II-4", "II-5", "II-6", "III-1", "III-2", "III-3", "IV-1", "IV-2", "IV-3", "IV-4", "IV-5", "IV-6", "V-1", "V-2", "V-3", "V-4", "V-5", "V-6", /*"V-7",*/ "V-8", "V-9", "VI-1", "VI-2", "VI-3", "VI-4", "VI-5", "VI-P"];

//Bereich für die ersten zwei "Joker"
const jokerScope1 = ["I-1", "I-2", "I-3", "I-4", "I-5", "I-6", "II-1", "II-2", "II-3", "II-4", "II-5", "II-6"];
//Bereich für die zweiten zwei "Joker"
const jokerScope2 = ["IV-1", "IV-2", "IV-3", "IV-4", "IV-5", "IV-6", "V-1", "V-2", "V-3", "V-4", "V-5", "V-6"];
//Enthält jeweils die Noten des TA Bereichs, die zum Durchschnitt zählen
const ta1Scope = ["III-1", "III-2", "III-3"];
const ta2Scope = ["VI-1", "VI-2", "VI-3", "VI-4"];
//Spezielle Regeln für V-8, V-9, VI-5 und VI-P: Man darf dort überall durchfallen, solange Endnote mindestens Noenpunktzahl 5
//Leistungsnachweise und schriftliche Prüfungen an der HföD, welche man nur mit Durchschnitt von 5 bestehen muss
const sharedFailRules19_22 = [[12, 13, 14], [29, 30, 31, 32]];

//Wenn Punktzahl kleiner als die Zahl dann Note = Index+1
const smallerThanFinalGrade = [15.01, 13.5, 11, 8, 5, 2];

const gradeGroupsAndFaktorZW = [
  //schriftlichen Prüfungsarbeiten des ersten Teils der Zwischenprüfung
  [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 70],
  //schriftlichen Prüfungsarbeiten des zweiten Teils der Zwischenprüfung
  [[12, 13, 14], 30]
];
//Konstante, welche die Noten gruppiert für die Berechnung der Endnote (Index von allowedSandFn)
const gradeGroupsAndFaktorEnd = [
  //schriftlichen Prüfungsarbeiten des ersten Teils der Qualifikationsprüfung
  [[15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], 40],
  //schriftlichen Prüfungsarbeiten des zweiten Teils der Qualifikationsprüfung
  [[29, 30, 31, 32], 17],
  //dem jeweils 4fachen des ersten und zweiten Teils der mündlichen Prüfung
  [[28], 4],
  [[33], 4],
  //Praxisbeurteilung
  [[34], 4],
  //Hausarbeit
  [[27], 5],
  //Faktor der Zwischennote
  26
];

//Diese Klasse berechnet die Noten für die Jahrgänge bis 2020/2023
export default class GradesNextYears{
  //Wird eine Map mit (S-Fn, N); S == Semester, Fn == Fachnummer, N == Note
  #gradesMap = new Map();
  #localStorage = false;
  #localStorageHandler;
  //Joker, die noch übrig sind
  #leftJokersScope1 = 2;
  #leftJokersScope2 = 2;

  #calculate = function () {
    if(this.#localStorage){
      this.#localStorageHandler.saveGradesMapLocalN(this.#gradesMap);
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
    document.getElementById("zwgradeD").textContent = zwischennote + " (" + zwischennotenpunkte + ")";
    document.getElementById("zwgradeP").textContent = zwischennote + " (" + zwischennotenpunkte + ")";

    if(zwischennote > 4){

      document.getElementById("alertModalMessage").textContent = "Du kannst mit diesen Noten nicht das Studium bestehen, da deine Zwischennotenpunkte schlechter als 5 Notenpunkte ist (§ 26 Abs. 5 Nr. 1 Buchst. c) FachV-VI). Endnote wurde nicht berechnet.";
      if(!document.getElementById("alertModal").classList.contains("active")){
        //Damit das Modal sich nicht wieder sofort schließt
        ui("#alertModal");
      }
      document.getElementById("zwgrade").classList.add("error");
      document.getElementById("zwgradeD").classList.add("error");
      document.getElementById("zwgradeP").classList.add("bad-value");
      setTimeout(function () {
        document.activeElement.blur();
        document.getElementById("alertModalButton").focus();
      }, 25);
      return false;
    }
    else {
      document.getElementById("zwgrade").classList.remove("error");
      document.getElementById("zwgradeD").classList.remove("error");
      document.getElementById("zwgradeP").classList.remove("bad-value");
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
    document.getElementById("endgradeD").textContent = endnote + " (" + endnotenpunkte + ")";
    document.getElementById("endgradeP").textContent = endnote + " (" + endnotenpunkte + ")";

    if(endnote > 4){
      document.getElementById("alertModalMessage").textContent = "Du kannst mit diesen Noten nicht das Studium bestehen, da deine Endnote schlechter als 5 Notenpunkte ist (§ 26 Abs. 5 Nr. 2 Buchst. c) FachV-VI)";
      if(!document.getElementById("alertModal").classList.contains("active")){
        //Damit das Modal sich nicht wieder sofort schließt
        ui("#alertModal");
      }
      document.getElementById("endgrade").classList.add("error");
      document.getElementById("endgradeD").classList.add("error");
      document.getElementById("endgradeP").classList.add("bad-value");
      setTimeout(function () {
        document.activeElement.blur();
        document.getElementById("alertModalButton").focus();
      }, 25);
      return false;
    }
    else {
      document.getElementById("endgrade").classList.remove("error");
      document.getElementById("endgradeD").classList.remove("error");
      document.getElementById("endgradeP").classList.remove("bad-value");
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

  //Prüft die Bedienungnen in der Checkliste und trägt das Ergebniss entsprechend ein
  checkChecklist(){
    //0. Herausfinden, welches Foumlar aktiv ist
    var isMobile = false;
    if(window.innerWidth < 600){
      isMobile = true;
    }
    //1. Check: alle Felder gefüllt?
    var allInputsFilled = true;
    for (var i in allowedSandFn) {
      var input = allowedSandFn[i]
      if (!isMobile) {
        //Desktop -> ein "d" an den Namen anhängen um das richtige Inputfeld zu bekommen
        input = input + "d"
      }
      var content = document.getElementById(input).value;
      if(isNaN(content)||content === ""){
        //Feld ist leer -> Anforderung nicht mehr erfüllt
        allInputsFilled = false;
      }
    }
    //Schauen, ob Bedienung erfüllt, falls ja grüner Hacken, ansonsten rotes Kreuz
    if(allInputsFilled){
      //Grüner Hacken zeigen, rotes Kreuz verstecken
      document.getElementById("check0TrueD").classList.remove("hidden");
      document.getElementById("check0True").classList.remove("hidden");
      document.getElementById("check0TrueP").classList.remove("hidden");
      document.getElementById("check0FalseD").classList.add("hidden");
      document.getElementById("check0False").classList.add("hidden");
      document.getElementById("check0FalseP").classList.add("hidden");
    }
    else {
      //Rotes Kreuz zeigen, grünen Hacken verstecken
      document.getElementById("check0TrueD").classList.add("hidden");
      document.getElementById("check0True").classList.add("hidden");
      document.getElementById("check0TrueP").classList.add("hidden");
      document.getElementById("check0FalseD").classList.remove("hidden");
      document.getElementById("check0False").classList.remove("hidden");
      document.getElementById("check0FalseP").classList.remove("hidden");
    }

    //2. Check: Joker erstes und zweites Semester prüfen
    if(this.#leftJokersScope1 == 0){
      //Es kann sein, dass man die Joker überzogen hat
      let jokerOk = true;
      for (var i = 0; i < jokerScope1.length; i++) {
        let id = jokerScope1[i];
        if(!isMobile){
          id = id + "d";
        }
        var content = document.getElementById(id).value;
        if(isNaN(content)||content === ""){
          content = 5;
        }
        if(content < 5 && !document.getElementById(id).parentElement.children.item(2).classList.contains("active")){
          //Joker wurden überzogen
          jokerOk = false;
        }
      }
      if(jokerOk){
        //Grüner Hacken zeigen, rotes Kreuz verstecken
        document.getElementById("check1TrueD").classList.remove("hidden");
        document.getElementById("check1True").classList.remove("hidden");
        document.getElementById("check1TrueP").classList.remove("hidden")
        document.getElementById("check1FalseD").classList.add("hidden");
        document.getElementById("check1False").classList.add("hidden");
        document.getElementById("check1FalseP").classList.add("hidden");
      }
      else {
        //Rotes Kreuz zeigen, grünen Hacken verstecken
        document.getElementById("check1TrueD").classList.add("hidden");
        document.getElementById("check1True").classList.add("hidden");
        document.getElementById("check1TrueP").classList.add("hidden");
        document.getElementById("check1FalseD").classList.remove("hidden");
        document.getElementById("check1False").classList.remove("hidden");
        document.getElementById("check1FalseP").classList.remove("hidden");
      }
    }
    else {
      //Joker sind noch übrig, also passts
      document.getElementById("check1TrueD").classList.remove("hidden");
      document.getElementById("check1True").classList.remove("hidden");
      document.getElementById("check1TrueP").classList.remove("hidden");
      document.getElementById("check1FalseD").classList.add("hidden");
      document.getElementById("check1False").classList.add("hidden");
      document.getElementById("check1FalseP").classList.add("hidden");
    }

    //Check 3: Im ersten Teilabschnitt maximal in einem Fach durchgefallen
    let passedTests = 3;
    for (var i = 12; i < 15; i++) {
      let id = allowedSandFn[i];
      if(!isMobile){
        id = id + "d";
      }
      var content = document.getElementById(id).value;
      if(isNaN(content)||content === ""){
        content = 5;
      }
      if(content < 5){
        passedTests--;
      }
    }
    if(passedTests < 2){
      //In mehr als einem Test durchgefallen -> Bedienung nicht erfüllt
      //Rotes Kreuz zeigen, grünen Hacken verstecken
      document.getElementById("check2TrueD").classList.add("hidden");
      document.getElementById("check2True").classList.add("hidden");
      document.getElementById("check2TrueP").classList.add("hidden");
      document.getElementById("check2FalseD").classList.remove("hidden");
      document.getElementById("check2False").classList.remove("hidden");
      document.getElementById("check2FalseP").classList.remove("hidden");
    }
    else {
      //Bedienung erfüllt
      //Grüner Hacken zeigen, rotes Kreuz verstecken
      document.getElementById("check2TrueD").classList.remove("hidden");
      document.getElementById("check2True").classList.remove("hidden");
      document.getElementById("check2TrueP").classList.remove("hidden");
      document.getElementById("check2FalseD").classList.add("hidden");
      document.getElementById("check2False").classList.add("hidden");
      document.getElementById("check2FalseP").classList.add("hidden");
    }

    //4. Check: Im ersten Teilabschnitt mindestens einen Durchschnitt von 5 Punkten
    let firstTAsum = 0;
    for (var i = 12; i < 15; i++) {
      let id = allowedSandFn[i];
      if(!isMobile){
        id = id + "d";
      }
      var content = document.getElementById(id).value;
      if(isNaN(content)||content === ""){
        content = 5;
      }
      firstTAsum = firstTAsum + Number(content);
    }
    //Durchschnitt berechnen
    firstTAsum = firstTAsum / 3;
    if(firstTAsum < 5){
      //Durchschnitt nicht geschafft -> Check nicht geschafft
      //Rotes Kreuz zeigen, grünen Hacken verstecken
      document.getElementById("check3TrueD").classList.add("hidden");
      document.getElementById("check3True").classList.add("hidden");
      document.getElementById("check3TrueP").classList.add("hidden");
      document.getElementById("check3FalseD").classList.remove("hidden");
      document.getElementById("check3False").classList.remove("hidden");
      document.getElementById("check3FalseP").classList.remove("hidden");
    }
    else {
      //Bedienung erfüllt
      //Grüner Hacken zeigen, rotes Kreuz verstecken
      document.getElementById("check3TrueD").classList.remove("hidden");
      document.getElementById("check3True").classList.remove("hidden");
      document.getElementById("check3TrueP").classList.remove("hidden");
      document.getElementById("check3FalseD").classList.add("hidden");
      document.getElementById("check3False").classList.add("hidden");
      document.getElementById("check3FalseP").classList.add("hidden");
    }

    //Check 5: Joker im 4. und 5. Semester nicht überschritten
    if(this.#leftJokersScope2 == 0){
      //Es kann sein, dass man die Joker überzogen hat
      let jokerOk = true;
      for (var i = 0; i < jokerScope2.length; i++) {
        let id = jokerScope2[i];
        if(!isMobile){
          id = id + "d";
        }
        var content = document.getElementById(id).value;
        if(isNaN(content)||content === ""){
          content = 5;
        }
        if(content < 5 && !document.getElementById(id).parentElement.children.item(2).classList.contains("active")){
          //Joker wurden überzogen
          jokerOk = false;
        }
      }
      if(jokerOk){
        //Grüner Hacken zeigen, rotes Kreuz verstecken
        document.getElementById("check4TrueD").classList.remove("hidden");
        document.getElementById("check4True").classList.remove("hidden");
        document.getElementById("check4TrueP").classList.remove("hidden");
        document.getElementById("check4FalseD").classList.add("hidden");
        document.getElementById("check4False").classList.add("hidden");
        document.getElementById("check4FalseP").classList.add("hidden");
      }
      else {
        //Rotes Kreuz zeigen, grünen Hacken verstecken
        document.getElementById("check4TrueD").classList.add("hidden");
        document.getElementById("check4True").classList.add("hidden");
        document.getElementById("check4TrueP").classList.add("hidden");
        document.getElementById("check4FalseD").classList.remove("hidden");
        document.getElementById("check4False").classList.remove("hidden");
        document.getElementById("check4FalseP").classList.remove("hidden");
      }
    }
    else {
      //Joker sind noch übrig, also passts
      document.getElementById("check4TrueD").classList.remove("hidden");
      document.getElementById("check4True").classList.remove("hidden");
      document.getElementById("check4TrueP").classList.remove("hidden");
      document.getElementById("check4FalseD").classList.add("hidden");
      document.getElementById("check4False").classList.add("hidden");
      document.getElementById("check4FalseP").classList.add("hidden");
    }

    //6. Check: Im 2. TA in maximal zwei Fächern durchgefallen, ausgenommen die mündliche Prüfung
    passedTests = 4;
    for (var i = 29; i < 33; i++) {
      let id = allowedSandFn[i];
      if(!isMobile){
        id = id + "d";
      }
      var content = document.getElementById(id).value;
      if(isNaN(content)||content === ""){
        content = 5;
      }
      if(content < 5 ){
        passedTests--;
      }
    }
    if (passedTests < 2) {
      //In mehr als zwei Fächern durchgefallen -> Bedienung nicht erfüllt
      //Rotes Kreuz zeigen, grünen Hacken verstecken
      document.getElementById("check5TrueD").classList.add("hidden");
      document.getElementById("check5True").classList.add("hidden");
      document.getElementById("check5TrueP").classList.add("hidden");
      document.getElementById("check5FalseD").classList.remove("hidden");
      document.getElementById("check5False").classList.remove("hidden");
      document.getElementById("check5FalseP").classList.remove("hidden");
    }
    else {
      //Bedienung erfüllt
      //Grüner Hacken zeigen, rotes Kreuz verstecken
      document.getElementById("check5TrueD").classList.remove("hidden");
      document.getElementById("check5True").classList.remove("hidden");
      document.getElementById("check5TrueP").classList.remove("hidden");
      document.getElementById("check5FalseD").classList.add("hidden");
      document.getElementById("check5False").classList.add("hidden");
      document.getElementById("check5FalseP").classList.add("hidden");
    }

    //7. Check: Im 2. TA einen Durchschnit von 5 Punkten bei den schriftlichen Prüfungen
    let secondTAsum = 0;
    for (var i = 29; i < 33; i++) {
      let id = allowedSandFn[i];
      if(!isMobile){
        id = id + "d";
      }
      var content = document.getElementById(id).value;
      if(isNaN(content)||content === ""){
        content = 5;
      }
      secondTAsum = secondTAsum + Number(content);
    }
    //Durchschnitt berechnen
    secondTAsum = secondTAsum / 4;
    if(secondTAsum < 5){
      //Durchschnitt nicht geschafft -> Check nicht geschafft
      //Rotes Kreuz zeigen, grünen Hacken verstecken
      document.getElementById("check6TrueD").classList.add("hidden");
      document.getElementById("check6True").classList.add("hidden");
      document.getElementById("check6TrueP").classList.add("hidden");
      document.getElementById("check6FalseD").classList.remove("hidden");
      document.getElementById("check6False").classList.remove("hidden");
      document.getElementById("check6FalseP").classList.remove("hidden");
    }
    else {
      //Bedienung erfüllt
      //Grüner Hacken zeigen, rotes Kreuz verstecken
      document.getElementById("check6TrueD").classList.remove("hidden");
      document.getElementById("check6True").classList.remove("hidden");
      document.getElementById("check6TrueP").classList.remove("hidden");
      document.getElementById("check6FalseD").classList.add("hidden");
      document.getElementById("check6False").classList.add("hidden");
      document.getElementById("check6FalseP").classList.add("hidden");
    }

  }

  //Lädt die lokalen Noten aus dem Speicher
  loadLocalGrades() {
    if(this.#localStorageHandler.getGradesMapFromLocalN()!=null){
      this.#gradesMap = this.#localStorageHandler.getGradesMapFromLocalN();
      this.#gradesMap.forEach((value, key) => {document.getElementById(key).value = value; document.getElementById(key+"d").value = value; document.getElementById(key+"p").textContent = value;});

      //Joker überprüfen
      //ersten Scope prüfen
      for (var i = 0; i < jokerScope1.length; i++) {
        if(document.getElementById(jokerScope1[i]).value < 5){
          //Joker wird gebraucht
          if(this.#leftJokersScope1 < 1){
            //Es sind keine Joker mehr übrig -> Feld rot markieren
            //document.getElementById("semester"+number[0]+"sum").classList.add("error");
            document.getElementById(jokerScope1[i]).parentElement.classList.add("invalid");
            document.getElementById(jokerScope1[i]+"d").parentElement.classList.add("invalid");
            document.getElementById(jokerScope1[i]+"p").parentElement.classList.add("bad-value");
          }
          else {
            //Es sind noch Joker da -> Feld makieren und einen Joker abziehen
            this.#leftJokersScope1--;
            document.getElementById(jokerScope1[i]).parentElement.children.item(2).classList.add("active");
            document.getElementById(jokerScope1[i]+"d").parentElement.children.item(2).classList.add("active");
            document.getElementById(jokerScope1[i]+"p").parentElement.children.item(1).classList.add("active");
          }
        }
      }
      //Zweiten Scope prüfen
      for (var i = 0; i < jokerScope2.length; i++) {
        if(document.getElementById(jokerScope2[i]).value < 5){
          //Joker wird gebraucht
          if(this.#leftJokersScope2 < 1){
            //Es sind keine Joker mehr übrig -> Feld rot markieren
            //document.getElementById("semester"+number[0]+"sum").classList.add("error");
            document.getElementById(jokerScope2[i]).parentElement.classList.add("invalid");
            document.getElementById(jokerScope2[i]+"d").parentElement.classList.add("invalid");
            document.getElementById(jokerScope2[i]+"p").parentElement.classList.add("bad-value");
          }
          else {
            //Es sind noch Joker da -> Feld makieren und einen Joker abziehen
            this.#leftJokersScope2--;
            document.getElementById(jokerScope2[i]).parentElement.children.item(2).classList.add("active");
            document.getElementById(jokerScope2[i]+"d").parentElement.children.item(2).classList.add("active");
            document.getElementById(jokerScope2[i]+"p").parentElement.children.item(1).classList.add("active");
          }
        }
      }
      //Anzeige updaten
      setJokerLeft(this.#leftJokersScope1, this.#leftJokersScope2);

      //Richtigen Teil der Userinfo zeigen
      document.getElementById("userinfoNoLocal").classList.add("hidden");
      document.getElementById("userinfoLocal").classList.remove("hidden");
      ui("#calculator");
      ui("#userinfo");

      fixFields();

      this.#calculate();

      //Checkliste aktualisieren
      this.checkChecklist();

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
    //Checkliste einfach durchlaufen lassen
    //checkChecklist();
    /**/
    //Prüfen, ob Desktop oder Mobilelement
    let desktop;
    if(number[number.length-1] === "d"){
      desktop = true;
      number = number.substring(0, number.length - 1);
    }
    else {
      desktop = false;
    }
    document.getElementById(number + "p").textContent = grade;

    //Prüfen, ob schon vorhanden
    if(this.#gradesMap.has(number)){
      //Schauen, ob eingetragene Note kleiner 5
      if(grade < 5){
        //Schauen, zu welchem Jokerscope die Note gehört
        if(jokerScope1.includes(number)&&!document.getElementById(number).parentElement.children.item(2).classList.contains("active")){
          //Ist im ersten Scope (1. und 2. Semester) drin
          if(this.#leftJokersScope1 < 1){
            //Es sind keine Joker mehr übrig -> Fehlermeldung
            //document.getElementById("semester"+number[0]+"sum").classList.add("error");
            document.getElementById(number).parentElement.classList.add("invalid");
            document.getElementById(number+"d").parentElement.classList.add("invalid");
            document.getElementById(number+"p").parentElement.classList.add("bad-value");
            document.getElementById("alertModalMessage").textContent = "Du darfst in diesem Fach nicht durchfallen, da du die Joker für das 1. und 2. Semester schon verbraucht hast.";
            ui("#alertModal");
            setTimeout(function () {
              document.activeElement.blur();
              document.getElementById("alertModalButton").focus();
            }, 20);
            document.getElementById("endgrade").classList.add("error");
            return false;
          }
          else {
            //Es sind noch Joker da -> Feld makieren und einen Joker abziehen
            this.#leftJokersScope1--;
            document.getElementById(number).parentElement.children.item(2).classList.add("active");
            document.getElementById(number+"d").parentElement.children.item(2).classList.add("active");
            document.getElementById(number+"p").parentElement.children.item(1).classList.add("active");
          }
        }
        else if (jokerScope2.includes(number)&&!document.getElementById(number).parentElement.children.item(2).classList.contains("active")) {
          //Ist im zweiten Scope (4. und 5. Semester) drin
          if(this.#leftJokersScope2 < 1){
            //Es sind keine Joker mehr übrig -> Fehlermeldung
            document.getElementById("semester"+number[0]+"sum").classList.add("error");
            document.getElementById(number).parentElement.classList.add("invalid");
            document.getElementById(number+"d").parentElement.classList.add("invalid");
            document.getElementById(number+"p").parentElement.classList.add("bad-value");
            document.getElementById("alertModalMessage").textContent = "Du darfst in diesem Fach nicht durchfallen, da du die Joker für das 4. und 5. Semester schon verbraucht hast.";
            ui("#alertModal");
            setTimeout(function () {
              document.activeElement.blur();
              document.getElementById("alertModalButton").focus();
            }, 20);
            document.getElementById("endgrade").classList.add("error");
            return false;
          }
          else {
            //Es sind noch Joker da -> Feld markieren und einen Joker abziehen
            this.#leftJokersScope2--;
            document.getElementById(number).parentElement.children.item(2).classList.add("active");
            document.getElementById(number+"d").parentElement.children.item(2).classList.add("active");
            document.getElementById(number+"p").parentElement.children.item(1).classList.add("active");
          }
        }
      }
      else {
        //Schauen, ob in einem JokerScope
        if(jokerScope1.includes(number)||jokerScope2.includes(number)){
          //Note größer 5 -> schauen, ob Joker aktiv
          if(document.getElementById(number).parentElement.children.item(2).classList.contains("active")){
            //Joker ist gesetzt -> entfernen
            document.getElementById(number).parentElement.children.item(2).classList.remove("active");
            document.getElementById(number+"d").parentElement.children.item(2).classList.remove("active");
            document.getElementById(number+"p").parentElement.children.item(1).classList.remove("active");
            //Joker wieder verfügbar machen
            if(jokerScope1.includes(number)){
              this.#leftJokersScope1++;
            }
            else {
              this.#leftJokersScope2++;
            }
          }
        }
      }

      setJokerLeft(this.#leftJokersScope1, this.#leftJokersScope2);

      /*if(grade < 5 && !allowedToFail[allowedSandFn.indexOf(number)]){
        document.getElementById("semester"+number[0]+"sum").classList.add("error");
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
      }*/
      //Schauen, ob bei 1. und 2. TA mindestens zwei Prüfungen mehr als 5 Notenpunkte jeweils haben
      for (var i = 0; i < sharedFailRules19_22.length; i++) {
        let moreThanFivePoints = 0;
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
          if(valueInput > 4){
            moreThanFivePoints++;
          }
        }
        if(moreThanFivePoints<2){
          //Abbrechen, da mehr als zwei Prüfungen nicht geschafft
          for (var j = 0; j < sharedFailRules19_22[i].length; j++) {
            if(desktop){
              document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").parentElement.classList.add("invalid");
            }
            else {
              document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]).parentElement.classList.add("invalid");
            }
            document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"p").parentElement.classList.add("bad-value");
          }
          document.getElementById("alertModalMessage").textContent = "Du hast in einem Teilabschnitt nicht mindestens 2 schriftliche Prüfungen geschafft.";
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
      }
      //Schauen, ob Durchschnitt bei 1. und 2. TA passt
      for (var i = 0; i < sharedFailRules19_22.length; i++) {
        let sum = 0;
        if(i===0){
          //Wenn nicht ein Feld im 1.TA ausgefüllt wurde -> überspringen
          if(!ta1Scope.includes(number)){
            continue;
          }
        }
        if(i===1){
          //Wenn nicht ein Feld im 2.TA ausgefüllt wurde -> überspringen
          if(!ta2Scope.includes(number)){
            continue;
          }
        }
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
            document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"p").parentElement.classList.add("bad-value");
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
        else {
          for (var j = 0; j < sharedFailRules19_22[i].length; j++) {
            document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").parentElement.classList.remove("invalid");
            document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]).parentElement.classList.remove("invalid");
            document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"p").parentElement.classList.remove("bad-value");
          }
        }
      }
      //Note sollte berechnet werden können -> Errorklasse von der Note entfernen
      document.getElementById("endgrade").classList.remove("error");

      if(desktop){
        document.getElementById(number).value = document.getElementById(number + "d").value;
        //document.getElementById(number + "p").textContent = document.getElementById(number + "d").value;
      }
      else {
        document.getElementById(number + "d").value = document.getElementById(number).value;
        //document.getElementById(number + "p").textContent = document.getElementById(number).value;
      }
      ui();
      //document.getElementById("semester"+number[0]+"sum").classList.remove("error");
      document.getElementById(number).parentElement.classList.remove("invalid");
      document.getElementById(number+"d").parentElement.classList.remove("invalid");
      document.getElementById(number+"p").parentElement.classList.remove("bad-value");
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

    //Daten eintragen in Map und die Felder
    for (var i = 0; i < array.length; i++) {
      this.#gradesMap.set(allowedSandFn[i], array[i]);
    }

    this.#gradesMap.forEach((value, key) => {document.getElementById(key).value = value; document.getElementById(key+"d").value = value; document.getElementById(key + "p").textContent = value;});

    //Joker überprüfen
    //ersten Scope prüfen
    for (var i = 0; i < jokerScope1.length; i++) {
      if(document.getElementById(jokerScope1[i]).value < 5){
        //Joker wird gebraucht
        if(this.#leftJokersScope1 < 1){
          //Es sind keine Joker mehr übrig -> Feld rot markieren
          //document.getElementById("semester"+number[0]+"sum").classList.add("error");
          document.getElementById(jokerScope1[i]).parentElement.classList.add("invalid");
          document.getElementById(jokerScope1[i]+"d").parentElement.classList.add("invalid");
          document.getElementById(jokerScope1[i]+"p").parentElement.classList.add("bad-value");
        }
        else {
          //Es sind noch Joker da -> Feld makieren und einen Joker abziehen
          this.#leftJokersScope1--;
          document.getElementById(jokerScope1[i]).parentElement.children.item(2).classList.add("active");
          document.getElementById(jokerScope1[i]+"d").parentElement.children.item(2).classList.add("active");
          document.getElementById(jokerScope1[i]+"p").parentElement.children.item(1).classList.add("active");
        }
      }
    }
    //Zweiten Scope prüfen
    for (var i = 0; i < jokerScope2.length; i++) {
      if(document.getElementById(jokerScope2[i]).value < 5){
        //Joker wird gebraucht
        if(this.#leftJokersScope2 < 1){
          //Es sind keine Joker mehr übrig -> Feld rot markieren
          //document.getElementById("semester"+number[0]+"sum").classList.add("error");
          document.getElementById(jokerScope2[i]).parentElement.classList.add("invalid");
          document.getElementById(jokerScope2[i]+"d").parentElement.classList.add("invalid");
          document.getElementById(jokerScope2[i]+"p").parentElement.classList.add("bad-value");
        }
        else {
          //Es sind noch Joker da -> Feld makieren und einen Joker abziehen
          this.#leftJokersScope2--;
          document.getElementById(jokerScope2[i]).parentElement.children.item(2).classList.add("active");
          document.getElementById(jokerScope2[i]+"d").parentElement.children.item(2).classList.add("active");
          document.getElementById(jokerScope2[i]+"p").parentElement.children.item(1).classList.add("active");
        }
      }
    }
    //Anzeige updaten
    setJokerLeft(this.#leftJokersScope1, this.#leftJokersScope2);

    //Durchfallen bei 1. und 2. TA schauen
    for (var i = 0; i < sharedFailRules19_22.length; i++) {
      let moreThanFivePoints = 0;
      for (var j = 0; j < sharedFailRules19_22[i].length; j++) {
        let valueInput = 0;
        //Desktopfelder auslesen
        valueInput = Number(document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").value);
        if(isNaN(document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").value) || document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").value === ""){
          valueInput = 5;
        }
        if(valueInput > 4){
          moreThanFivePoints++;
        }
      }
      if(moreThanFivePoints<2){
        //Abbrechen, da mehr als zwei Prüfungen nicht geschafft
        for (var j = 0; j < sharedFailRules19_22[i].length; j++) {
          if(desktop){
            document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").parentElement.classList.add("invalid");
          }
          else {
            document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]).parentElement.classList.add("invalid");
          }
          document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"p").parentElement.classList.add("bad-value");
        }
        document.getElementById("endgrade").classList.add("error");
      }
    }

    //Auch Durchschnit bei 1. und 2. TA schauen
    for (var i = 0; i < sharedFailRules19_22.length; i++) {
      let sum = 0;
      if(i===0){
        //Wenn nicht ein Feld im 1.TA ausgefüllt wurde -> überspringen
        if(false){
          continue;
        }
      }
      if(i===1){
        //Wenn nicht ein Feld im 2.TA ausgefüllt wurde -> überspringen
        if(false){
          continue;
        }
      }
      for (var j = 0; j < sharedFailRules19_22[i].length; j++) {
        let valueInput = 0;
        //Desktopfelder auslesen
        valueInput = Number(document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").value);
        if(isNaN(document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").value) || document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").value === ""){
          valueInput = 5;
        }
        sum = sum + valueInput;
      }
      let durchschnitt = sum/sharedFailRules19_22[i].length;
      if(durchschnitt < 5){
        for (var j = 0; j < sharedFailRules19_22[i].length; j++) {
          document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").parentElement.classList.add("invalid");
          document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]).parentElement.classList.add("invalid");
          document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"p").parentElement.classList.add("bad-value");
        }
        document.getElementById("endgrade").classList.add("error");
      }
      else {
        for (var j = 0; j < sharedFailRules19_22[i].length; j++) {
          document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"d").parentElement.classList.remove("invalid");
          document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]).parentElement.classList.remove("invalid");
          document.getElementById(allowedSandFn[sharedFailRules19_22[i][j]]+"p").parentElement.classList.remove("bad-value");
        }
      }
    }

    ui("#calculator");
    ui("#userinfo");

    fixFields();

    this.#calculate();

    this.checkChecklist();

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

function setJokerLeft(jokerScope1, jokerScope2){
  document.getElementById("jokerLeftScope1").innerText = jokerScope1;
  document.getElementById("jokerLeftScope1-1").innerText = jokerScope1;
  document.getElementById("jokerLeftScope1-2").innerText = jokerScope1;
  document.getElementById("jokerLeftScope2").innerText = jokerScope2;
  document.getElementById("jokerLeftScope2-1").innerText = jokerScope2;
  document.getElementById("jokerLeftScope2-2").innerText = jokerScope2;
  if(Number(jokerScope1)===2){
    document.getElementById("joker1P").innerText = 0;
  }
  else if (Number(jokerScope1)===1) {
    document.getElementById("joker1P").innerText = 1;
  }
  else {
    document.getElementById("joker1P").innerText = 2;
  }
  if(Number(jokerScope2)===2){
    document.getElementById("joker2P").innerText = 0;
  }
  else if (Number(jokerScope2)===1) {
    document.getElementById("joker2P").innerText = 1;
  }
  else {
    document.getElementById("joker2P").innerText = 2;
  }
}
