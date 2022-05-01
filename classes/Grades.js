const allowedSandFn = ["I-1", "I-2", "I-3", "I-4", "I-5", "I-6", "II-1", "II-2", "II-3", "II-4", "II-5", "II-6", "III-1", "III-2", "III-3", "III-4", "IV-1", "IV-2", "IV-3", "IV-4", "IV-5", "IV-6", "IV-7", "IV-8", "V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7", "V-8", "V-9", "VI-1", "VI-2", "VI-3", "VI-4", "VI-5", "VI-P"];
const allowedToFail = [false, false, false, false, false, true, false, false, false, false, true, true, false, false, true, true, false, false, false, false, false, true, true, false, false, false, false, true, true, true, false, false, true, true, true, true, true, false, false];
const percentageEnd = [/*1. Semester*/191, 191, 191, 191, 191, 69, /*2. Semester*/191, 191, 191, 191, 69, 69, /*3. Semester*/286, 286, 52, 52, /*4. Semester*/400, 400, 400, 400, 400, 400, 80, 80, /*5. Semester*/400, 400, 400, 400, 80, 80, 80, 500, 400, /*6. Semester*/400, 400, 400, 100, 400, /*Praxis*/ 400];
const finalGrades = ["U suck", "U suck", "U suck", "U suck", "4,0", "3,7", "3.3", "3,0", "2,7", "2,3", "2,0", "1,7", "1,3", "1,0", "0,7"];

export default class Grades{

  //Wird eine Map mit (S-Fn, N); S == Semester, Fn == Fachnummer, N == Note
  #gradesMap = new Map();

  #calculate = function () {
    let sum = 0;
    for(let i in allowedSandFn){
      sum = sum + (this.#gradesMap.get(allowedSandFn[i]) * percentageEnd[i]);
    }
    let grade6 = finalGrades[Math.floor(sum/10000)-1];
    let grade15 = Math.round((sum/10000) * 100) / 100;
    document.getElementById("endgrade").textContent = grade6 + " (" + grade15 + ")";
  }

  loadGrades() {
    return;
    //Test
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           console.log(xhttp.responseText);
        }
        else {
          console.warn(xhtp.responseText);
        }
    };
    xhttp.open("GET", "https://aiv.hfoed.de");
    xhttp.send();
  }

  manuellGrades(){
    this.#gradesMap= new Map();
    for(let i in allowedSandFn){
      this.#gradesMap.set(allowedSandFn[i], 5);
    }

    ui('#calculator');
  }

  checkGrade(number, grade) {
    //Prüfen, ob schon vorhanden
    if(this.#gradesMap.has(number)){
      if(grade < 5 && !allowedToFail[allowedSandFn.indexOf(number)]){
        document.getElementById("semester"+number[0]+"sum").classList.add("error");
        document.getElementById(number).parentElement.classList.add("invalid");
        alert("Du darfst in diesem Fall nicht durchfallen");
        setTimeout(function () {
          document.getElementById(number).focus();
        }, 10);
        document.getElementById("endgrade").classList.add("error");
        return false;
      }
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

}
