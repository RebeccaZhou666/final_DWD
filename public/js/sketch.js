//

let Gaussian = function(mean, std) {
    this.mean = mean;
    this.std = std;
    this.a = 1/Math.sqrt(2*Math.PI);
  };
  
  Gaussian.prototype = {
    addStd: function(v) {
      this.std += v;
    },
    
    get: function(x) {
      var f = this.a / this.std;
      var p = -1/2;
      var c = (x-this.mean)/this.std;
      c *= c;
      p *= c;
      return f * Math.pow(Math.E, p);
    },
  
    generateValues: function(start, end) {
      var LUT = [];
      var step = (Math.abs(start)+Math.abs(end)) / 100;
      for(var i=start; i<end; i+=step) {
        LUT.push(this.get(i));
      }
      return LUT;
    },

    generateArrays: function(start,end){
        let LUT = [];
        let step = (Math.abs(start)+Math.abs(end)) / 100;
        for(let i=start; i<end; i+=step){
            LUT.push({x:i*width/2/10+width/2, y:height-this.get(i)*height});
        }
        return LUT;
    },
    
    draw: function(ctx) {
      var points = this.generateValues(-10,10);
      var len = points.length;
      ctx.strokeStyle = "black";
      ctx.beginPath();
      var p0 = points[0];
      ctx.moveTo(0, height - (height*p0));
      points.forEach(function(p,i) {
        if(i===0) {
          return;
        }
        ctx.lineTo(width * i/len, height - (height*p));
        p0 = p;
      });
      ctx.stroke();
    }
  };
  
let gauss;
let cvs;
let ctx;
let canvas;

// module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Svg = Matter.Svg,
    Bodies = Matter.Bodies;

// create an engine
let engine;
let world;
let boxA;
// create a renderer
// var render = Render.create({
//     element: document.body,
//     engine: engine
// });

// // create two boxes and a ground
let boxes = [];
// var boxA = Bodies.rectangle(400, 200, 80, 80);
// var boxB = Bodies.rectangle(450, 50, 80, 80);
var ground;
let concavePolygon = [
    {x : 50 , y : -100},
    {x : 50 , y : -50},
    {x : 50 , y : 50},
    {x : 50 , y : 100},
    {x : -200 , y : 0}
]
var terrain;
var vertexSets = [];
let outline = [];
let terrain_new,gauss_new, ground_new;

// function preload(){
    
// }

function setup(){
    canvas = createCanvas(800,800);
    engine = Engine.create();
    world = engine.world;
    boxA = Bodies.rectangle(400, 200, 80, 80);

    gauss = new Gaussian(0,1);
    cvs = document.getElementById("defaultCanvas0")
    ctx = cvs.getContext("2d");

    ground = gauss.generateArrays(-10,10)

    gauss_before = new Gaussian(-2,1);

    // run the engine
    Engine.run(engine);

    terrain = Bodies.fromVertices(width/2, height, ground , { // p5 & matter.js画图初始点的换算
                isStatic: false
            }, true);
    terrain.friction = 1;
    land = Bodies.rectangle(width/2,height,width,10,{isStatic:true});
    console.log(terrain)
    World.add(world,[terrain,land]);
    // console.log(ground)
    // $.get('terrain.svg').done(function(data) {
    //     $(data).find('path').each(function(i, path) {
    //         vertexSets.push(Svg.pathToVertices(path, 30));
    //     });
    
    //     terrain = Bodies.fromVertices(400, 300, vertexSets[0] , { // p5 & matter.js画图初始点的换算
    //         isStatic: true
    //     }, true);
    //    outline = vertexSets[0];
    //     console.log(outline)
    //     World.add(world, terrain);
    // });
    
    // center of the position x y; width + height
//   // ground = Bodies.polygon(width/2, height,6,100, {isStatic: true})
    // ground = Bodies.fromVertices(width/2,height-300,concavePolygon,{
    //             isStatic: true,
    //             render: {
    //                 fillStyle: '#2e2b44',
    //                 strokeStyle: '#2e2b44',
    //                 lineWidth: 1
    //             }
    //         }, true);
    // box1 = new Box(200,100,50,50);
    // console.log(terrain)
    // World.add(world,terrain);
    // run the renderer
    // Render.run(render);
}
let t = 0;

function draw(){
    background(51);
    
    ground_new = new Gaussian(0+t*0.01,1+t*0.001).generateArrays(-10,10)
    terrain_new = Bodies.fromVertices(width/2, height-41, ground_new , { // p5 & matter.js画图初始点的换算
        isStatic: false
    }, true);
    // World.add(world,[terrain_new,land]);
    // World.remove(world,terrain);
    terrain = terrain_new;
    ground_new = ground_new;
    // drawTerrian();
    fill(200);
    push();
    translate(0,height-(height*ground_new[0]));
    beginShape();
    // translate(400/2,350/2);
    for (let j = 0; j < ground_new.length; j++){
        vertex(ground_new[j].x, ground_new[j].y);
    }
    endShape(CLOSE);
    pop();
    // t++;
    
    // fill(255);
    // rect(, 200, 80, 80);
    // rect(boxA.position.x, boxA.position.y,80,80 );
    for(let i = 1; i < boxes.length; i++){
        boxes[i].show();
    }
    // ground
    // stroke(0);
    // strokeWeight(2);
    // // rectMode(CENTER);
    // rect(0,height-20, width, height-20);

    gauss_before.draw(ctx);
    // console.log(world.bodies.length);
}

function drawTerrian(){
    terrain.friction = 1;
    let pos = terrain.position;
    push();
        translate(pos.x,pos.y);

    pop();

}

function mouseDragged(){
    boxes.push(new Box(mouseX, mouseY, 10,10));
}

function Box(x,y,w,h){
    this.body = Bodies.rectangle(x,y,w,h);
    this.body.friction = 0.3;
    this.w = w;
    this.h = h;
    World.add(world, [this.body, land]);

    this.show = function(){
        let pos = this.body.position;
        let angle = this.body.angle;
        push();
            translate(pos.x, pos.y);
            rotate(angle);
            rectMode(CENTER);
            circle(0,0,this.w,this.h);
        pop();
    }
}

// // add all of the bodies to the world


