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

  getGradesMapFromLocalN(){
    if(this.hasGradesMapLocal()){
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

  saveGradesMapLocalN(gradesMap){
    //Prüfen, ob Parameter richtige Klase
    if(gradesMap.constructor.name === "Map"){
      //Map in localStorage speichern
      localStorage.setItem("gradesMapN", JSON.stringify(Object.fromEntries(gradesMap)));
    }
  }

}
