class Column{
    height:number;
    weight:number;
    setheight(s:number){this.height=s; return this}
    setweight(s:number){this.weight=s; return this}
  }
  class ParentComponent {
   build() {
     new Column().setheight(100).setweight(10)
   }
  }