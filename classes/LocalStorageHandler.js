export default class LocalStorageHandler{

  hasGradesMapLocal(){
    return localStorage.getItem("gradesMap")!=null;
  }

  getGradesMapFromLocal(){
    if(this.hasGradesMapLocal()){
      //Daten vorhanden -> auslesen
      let gradesMap = localStorage.getItem("gradesMap");
      gradesMap = JSON.parse(gradesMap);
      const map = new Map(Object.entries(gradesMap));
      return map;
    }
    else {
      return null;
    }
  }

  saveGradesMapLocal(gradesMap){
    //Prüfen, ob Parameter richtige Klase
    if(gradesMap.constructor.name === "Map"){
      //Map in localStorage speichern
      localStorage.setItem("gradesMap", JSON.stringify(Object.fromEntries(gradesMap)));
    }
  }

  hasGradesMapLocalN(){
    return localStorage.getItem("gradesMapN")!=null;
  }

  hasGradesMapSecondLocalN(){
    return localStorage.getItem("gradesMapSecondN")!=null;
  }

  getGradesMapFromLocalN(){
    if(this.hasGradesMapLocalN()){
      //Daten vorhanden -> auslesen
      let gradesMap = localStorage.getItem("gradesMapN");
      gradesMap = JSON.parse(gradesMap);
      const map = new Map(Object.entries(gradesMap));
      return map;
    }
    else {
      return null;
    }
  }

  getGradesMapSecondFromLocalN(){
    if(this.hasGradesMapSecondLocalN()){
      //Daten vorhanden -> auslesen
      let gradesMap = localStorage.getItem("gradesMapSecondN");
      gradesMap = JSON.parse(gradesMap);
      const map = new Map(Object.entries(gradesMap));
      return map;
    }
    else {
      return null;
    }
  }

  saveGradesMapLocalN(gradesMap, gradesMapSecond){
    //Prüfen, ob Parameter richtige Klase
    if(gradesMap.constructor.name === "Map"){
      //Map in localStorage speichern
      localStorage.setItem("gradesMapN", JSON.stringify(Object.fromEntries(gradesMap)));
      localStorage.setItem("gradesMapSecondN", JSON.stringify(Object.fromEntries(gradesMapSecond)));
    }
  }

}
