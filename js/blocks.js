// block defs. textures are lazy via Sprites.*
var BlockType = {
  AIR:0, GRASS:1, DIRT:2, STONE:3, WOOD:4, LEAVES:5, PLANKS:6,
  COBBLE:7, RUBY:8, SAND:9, WATER:10, SNOW:11, GLASS:12, BRICK:13, GOLD:14, MOSS:15
};

var BLOCKS = null;
function initBlocks(){
  BLOCKS = {
    0:{name:'Air',solid:false,transparent:true},
    1:{name:'Grass',solid:true,texture:function(){return Sprites.grass();},color:0x5a8a3a},
    2:{name:'Dirt',solid:true,texture:function(){return Sprites.dirt();},color:0x6b4a2a},
    3:{name:'Stone',solid:true,texture:function(){return Sprites.stone();},color:0x7a7a7a},
    4:{name:'Wood',solid:true,texture:function(){return Sprites.wood();},color:0x8b6239},
    5:{name:'Leaves',solid:true,texture:function(){return Sprites.leaves();},color:0x3a5e2a,transparent:true},
    6:{name:'Planks',solid:true,texture:function(){return Sprites.planks();},color:0xb08550},
    7:{name:'Cobble',solid:true,texture:function(){return Sprites.cobble();},color:0x6a6a6a},
    8:{name:'Ruby',solid:true,texture:function(){return Sprites.ruby();},color:0xd33b3b,emissive:0x440000},
    9:{name:'Sand',solid:true,texture:function(){return Sprites.sand();},color:0xd4c180},
    10:{name:'Water',solid:false,texture:function(){return Sprites.water();},color:0x2a6cc4,transparent:true,opacity:0.75},
    11:{name:'Snow',solid:true,texture:function(){return Sprites.snow();},color:0xffffff},
    12:{name:'Glass',solid:true,texture:function(){return Sprites.glass();},color:0x88ccee,transparent:true,opacity:0.4},
    13:{name:'Brick',solid:true,texture:function(){return Sprites.brick();},color:0xa04030},
    14:{name:'Gold',solid:true,texture:function(){return Sprites.gold();},color:0xd4a849,emissive:0x222000},
    15:{name:'Moss',solid:true,texture:function(){return Sprites.moss();},color:0x4a6a3a}
  };
}

var PALETTE_BLOCKS = [
  {type:1,icon:'grass',hotkey:'1'},
  {type:2,icon:'dirt',hotkey:'2'},
  {type:3,icon:'stone',hotkey:'3'},
  {type:4,icon:'wood',hotkey:'4'},
  {type:5,icon:'leaves',hotkey:'5'},
  {type:6,icon:'planks',hotkey:'6'},
  {type:7,icon:'cobble',hotkey:'7'},
  {type:8,icon:'ruby',hotkey:'8'},
  {type:9,icon:'sand',hotkey:'9'},
  {type:11,icon:'snow',hotkey:'0'},
  {type:12,icon:'glass',hotkey:'-'},
  {type:13,icon:'brick',hotkey:'='},
  {type:14,icon:'gold',hotkey:'g'},
  {type:15,icon:'moss',hotkey:'m'}
];

var TOOLS = [
  {id:'build',icon:'build',name:'Build',hotkey:'B'},
  {id:'remove',icon:'remove',name:'Mine',hotkey:'X'},
  {id:'raise',icon:'raise',name:'Raise',hotkey:'R'},
  {id:'lower',icon:'lower',name:'Lower',hotkey:'L'},
  {id:'flatten',icon:'flatten',name:'Flatten',hotkey:'F'}
];

var TEMPLATES = [
  {id:'house',name:'House',icon:'house',cost:{wood:10,stone:4},size:[3,3,3],
   layout:[
    [[6,6,6],[6,6,6],[6,6,6]],
    [[4,4,4],[4,0,4],[4,4,4]],
    [[6,6,6],[6,6,6],[6,6,6]]
   ]},
  {id:'tower',name:'Tower',icon:'tower',cost:{stone:20},size:[3,5,3],
   layout:[
    [[7,7,7],[7,7,7],[7,7,7]],
    [[7,0,7],[0,7,0],[7,0,7]],
    [[7,0,7],[0,7,0],[7,0,7]],
    [[7,0,7],[0,7,0],[7,0,7]],
    [[7,7,7],[7,8,7],[7,7,7]]
   ]},
  {id:'wall',name:'Wall',icon:'wall',cost:{stone:6},size:[5,2,1],
   layout:[
    [[7],[7],[7],[7],[7]],
    [[7],[7],[7],[7],[7]]
   ]},
  {id:'tree',name:'Tree',icon:'tree',cost:{food:2},size:[3,4,3],
   layout:[
    [[0,0,0],[0,4,0],[0,0,0]],
    [[0,0,0],[0,4,0],[0,0,0]],
    [[5,5,5],[5,4,5],[5,5,5]],
    [[0,5,0],[5,5,5],[0,5,0]]
   ]},
  {id:'farm',name:'Farm',icon:'farm',cost:{wood:5},size:[3,1,3],
   layout:[[[6,6,6],[6,6,6],[6,6,6]]]},
  {id:'pylon',name:'Pylon',icon:'pylon',cost:{stone:8,food:4},size:[1,4,1],
   layout:[[[8]],[[8]],[[8]],[[8]]]},
  {id:'bridge',name:'Bridge',icon:'bridge',cost:{wood:8},size:[5,1,1],
   layout:[[[6],[6],[6],[6],[6]]]},
  {id:'barracks',name:'Barracks',icon:'barracks',cost:{wood:15,stone:10},size:[5,3,5],
   layout:[
    [[3,3,3,3,3],[3,3,3,3,3],[3,3,3,3,3],[3,3,3,3,3],[3,3,3,3,3]],
    [[3,3,3,3,3],[3,0,0,0,3],[3,0,0,0,3],[3,0,0,0,3],[3,3,0,3,3]],
    [[6,6,6,6,6],[6,6,6,6,6],[6,6,6,6,6],[6,6,6,6,6],[6,6,6,6,6]]
   ]},
  {id:'warehouse',name:'Warehouse',icon:'warehouse',cost:{wood:12,stone:4},size:[5,3,4],
   layout:[
    [[6,6,6,6],[6,6,6,6],[6,6,6,6],[6,6,6,6],[6,6,6,6]],
    [[4,4,4,4],[4,0,0,4],[4,0,0,4],[4,0,0,4],[4,4,0,4]],
    [[3,3,3,3],[3,3,3,3],[3,3,3,3],[3,3,3,3],[3,3,3,3]]
   ]},
  {id:'sawmill',name:'Sawmill',icon:'sawmill',cost:{wood:12,stone:4},size:[4,3,4],
   layout:[
    [[6,6,6,6],[6,6,6,6],[6,6,6,6],[6,6,6,6]],
    [[4,4,4,4],[4,0,0,4],[4,0,0,4],[4,4,0,4]],
    [[5,5,5,5],[5,5,5,5],[5,5,5,5],[5,5,5,5]]
   ]},
  {id:'mine',name:'Mine Shaft',icon:'mine',cost:{wood:8,stone:8},size:[3,4,3],
   layout:[
    [[3,3,3],[3,8,3],[3,3,3]],
    [[3,3,3],[3,0,3],[3,3,3]],
    [[3,3,3],[3,0,3],[3,3,3]],
    [[7,7,7],[7,7,7],[7,7,7]]
   ]},
  {id:'lighthouse',name:'Lighthouse',icon:'lighthouse',cost:{stone:25,wood:5},size:[3,6,3],
   layout:[
    [[7,7,7],[7,7,7],[7,7,7]],
    [[3,0,3],[0,3,0],[3,0,3]],
    [[3,0,3],[0,3,0],[3,0,3]],
    [[3,0,3],[0,3,0],[3,0,3]],
    [[6,6,6],[6,8,6],[6,6,6]],
    [[6,8,6],[8,8,8],[6,8,6]]
   ]},
  {id:'fountain',name:'Fountain',icon:'fountain',cost:{stone:15},size:[3,2,3],
   layout:[
    [[3,3,3],[3,10,3],[3,3,3]],
    [[0,0,0],[0,10,0],[0,0,0]]
   ]},
  {id:'castle',name:'Castle',icon:'castle',cost:{stone:50,wood:10},size:[7,5,7],
   layout:[
    // y=0 floor
    [[3,3,3,3,3,3,3],[3,3,3,3,3,3,3],[3,3,3,3,3,3,3],[3,3,3,3,3,3,3],[3,3,3,3,3,3,3],[3,3,3,3,3,3,3],[3,3,3,3,3,3,3]],
    // y=1 walls w/ door
    [[3,3,3,3,3,3,3],[3,0,0,0,0,0,3],[3,0,0,0,0,0,3],[3,0,0,0,0,0,3],[3,0,0,0,0,0,3],[3,0,0,0,0,0,3],[3,3,0,3,3,3,3]],
    // y=2 walls
    [[3,3,3,3,3,3,3],[3,0,0,0,0,0,3],[3,0,0,0,0,0,3],[3,0,0,0,0,0,3],[3,0,0,0,0,0,3],[3,0,0,0,0,0,3],[3,3,3,3,3,3,3]],
    // y=3 battlements
    [[3,0,3,0,3,0,3],[3,0,0,0,0,0,3],[3,0,0,0,0,0,3],[3,0,0,8,0,0,3],[3,0,0,0,0,0,3],[3,0,0,0,0,0,3],[3,0,3,0,3,0,3]],
    // y=4 roof
    [[6,6,6,6,6,6,6],[6,6,6,6,6,6,6],[6,6,6,6,6,6,6],[6,6,6,8,6,6,6],[6,6,6,6,6,6,6],[6,6,6,6,6,6,6],[6,6,6,6,6,6,6]]
   ]},
  {id:'gatehouse',name:'Gatehouse',icon:'gatehouse',cost:{stone:20,wood:5},size:[5,4,3],
   layout:[
    [[7,7,7],[7,7,7],[7,7,7],[7,7,7],[7,7,7]],
    [[7,0,7],[0,0,0],[0,0,0],[0,0,0],[7,0,7]],
    [[7,0,7],[0,0,0],[0,0,0],[0,0,0],[7,0,7]],
    [[7,7,7],[7,8,7],[7,7,7],[7,8,7],[7,7,7]]
   ]},
  {id:'market',name:'Market',icon:'market',cost:{wood:12,stone:4},size:[4,3,4],
   layout:[
    [[6,6,6,6],[6,6,6,6],[6,6,6,6],[6,6,6,6]],
    [[4,0,0,4],[0,0,0,0],[0,0,0,0],[4,0,0,4]],
    [[6,6,6,6],[6,0,0,6],[6,0,0,6],[6,6,6,6]]
   ]},
  {id:'well',name:'Well',icon:'well',cost:{stone:8,wood:2},size:[3,3,3],
   layout:[
    [[3,3,3],[3,10,3],[3,3,3]],
    [[0,4,0],[4,10,4],[0,4,0]],
    [[0,4,0],[4,0,4],[0,4,0]]
   ]},
  {id:'temple',name:'Temple',icon:'temple',cost:{stone:30,wood:5,gold:5},size:[5,4,5],
   layout:[
    [[3,3,3,3,3],[3,3,3,3,3],[3,3,3,3,3],[3,3,3,3,3],[3,3,3,3,3]],
    [[3,0,0,0,3],[3,0,0,0,3],[3,0,0,0,3],[3,0,0,0,3],[3,0,0,0,3]],
    [[3,3,3,3,3],[3,0,0,0,3],[3,0,8,0,3],[3,0,0,0,3],[3,3,3,3,3]],
    [[0,14,14,14,0],[14,14,14,14,14],[14,14,14,14,14],[14,14,14,14,14],[0,14,14,14,0]]
   ]},
  {id:'watchtower',name:'Watchtower',icon:'watchtower',cost:{stone:25},size:[3,7,3],
   layout:[
    [[7,7,7],[7,7,7],[7,7,7]],
    [[7,0,7],[0,7,0],[7,0,7]],
    [[7,0,7],[0,7,0],[7,0,7]],
    [[7,0,7],[0,7,0],[7,0,7]],
    [[7,0,7],[0,7,0],[7,0,7]],
    [[7,0,7],[0,7,0],[7,0,7]],
    [[7,7,7],[7,8,7],[7,7,7]]
   ]},
  {id:'windmill',name:'Windmill',icon:'windmill',cost:{wood:18,stone:4},size:[3,5,3],
   layout:[
    [[6,6,6],[6,6,6],[6,6,6]],
    [[4,4,4],[4,0,4],[4,4,4]],
    [[4,0,4],[0,0,0],[4,0,4]],
    [[4,0,4],[0,0,0],[4,0,4]],
    [[0,4,0],[4,4,4],[0,4,0]]
   ]},
  {id:'chapel',name:'Chapel',icon:'chapel',cost:{stone:20,wood:5,gold:3},size:[5,4,5],
   layout:[
    [[3,3,3,3,3],[3,3,3,3,3],[3,3,3,3,3],[3,3,3,3,3],[3,3,3,3,3]],
    [[3,0,0,0,3],[3,0,0,0,3],[3,0,0,0,3],[3,0,0,0,3],[3,0,0,0,3]],
    [[3,3,3,3,3],[3,0,0,0,3],[3,0,8,0,3],[3,0,0,0,3],[3,3,3,3,3]],
    [[0,14,14,14,0],[14,0,0,0,14],[14,0,0,0,14],[14,0,0,0,14],[0,14,14,14,0]]
   ]},
  {id:'inn',name:'Inn',icon:'inn',cost:{wood:15,stone:6,food:5},size:[4,3,4],
   layout:[
    [[6,6,6,6],[6,6,6,6],[6,6,6,6],[6,6,6,6]],
    [[4,4,4,4],[4,0,0,4],[4,0,0,4],[4,4,0,4]],
    [[6,6,6,6],[6,0,0,6],[6,0,0,6],[6,6,6,6]]
   ]}
];

window.BlockType=BlockType;
window.initBlocks=initBlocks;
window.BLOCKS=BLOCKS;
window.PALETTE_BLOCKS=PALETTE_BLOCKS;
window.TOOLS=TOOLS;
window.TEMPLATES=TEMPLATES;
