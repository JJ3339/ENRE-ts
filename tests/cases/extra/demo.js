import {Column,Text,Setheight,setdeep,seta} from '@ArkTS';

/*@Component
struct Foo{
    build(){
      Column(){
        Text('ArkTS')
        .Setheight(100)
        .setdeep(100)
      }.seta(1)
    }
}*/

class foo{
    constructor(){
       Column(
        Text('ArkTS'
        ,Setheight(100)
        ,setdeep(100))
      ).seta(1);
    }
}

