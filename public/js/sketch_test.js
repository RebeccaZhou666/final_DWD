

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
    
    // draw: function(ctx) {
    //   var points = this.generateValues(-10,10);
    //   var len = points.length;
    //   ctx.strokeStyle = "black";
    //   ctx.beginPath();
    //   var p0 = points[0];
    //   ctx.moveTo(0, height - (height*p0));
    //   points.forEach(function(p,i) {
    //     if(i===0) {
    //       return;
    //     }
    //     ctx.lineTo(width * i/len, height - (height*p));
    //     p0 = p;
    //   });
    //   ctx.stroke();
    // }
  };
  
let gauss;
let cvs;
let ctx;
let canvas;
let gauss_init;
let terrain_init;
let ground_init;

var terrain;
var vertexSets = [];
let outline = [];
let terrain_new,gauss_new, ground_new;
let width = window.innerWidth;
let height = window.innerHeight;

let balls = [];


gauss = new Gaussian(0,1);
// cvs = document.getElementById("defaultCanvas0")
// ctx = cvs.getContext("2d");

ground = gauss.generateArrays(-10,10)

gauss_init = new Gaussian(0,1);

var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Events = Matter.Events,
    Runner = Matter.Runner,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Vector = Matter.Vector,
    Body = Matter.Body,
    Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create(
);

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    canvas: canvas,
    options: {
        width: width,
        height: height,
        wireframes: false,
        background: 'white',
    }
});

// create two boxes and a ground
var boxA = Bodies.circle(400, 200, 10, 10);
var boxB = Bodies.circle(450, 50, 10, 10);
console.log(ground)
// var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
terrain = Bodies.fromVertices(0, height/2, ground , {
    isStatic: false,
    render: {
        fillStyle: '#d1f5d3',
        // strokeStyle: '#2e2b44',
        // lineWidth: 1
    }
},true);
let vec = {x:terrain.position.x/2-terrain.bounds.min.x-300, y: height-1-terrain.bounds.max.y};
Body.translate(terrain,vec);

terrain.friction = 0.8;
land = Bodies.rectangle(width/2, height, 2*width, 1, { isStatic: true, render: { fillStyle: '#f5f5f5'} });
land2 = Bodies.rectangle(-100,height,5,height,1, { isStatic: true, render: { fillStyle: '#f5f5f5'}})

ground_init = gauss_init.generateArrays(-10,10);
terrain_init = Bodies.fromVertices(0,height/2, ground_init , {
    isSensor: true,
    // isStatic: true,
    render: {
        fillStyle: '#f5f5f5',
        // strokeStyle: '#2e2b44',
        // lineWidth: 1
    }
},true);
Body.translate(terrain_init,vec);
Body.setStatic(terrain_init,true);

// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, terrain_init,terrain,land, land2]);



// add mouse control
let mouse = Mouse.create(render.canvas),
mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});

World.add(engine.world, mouseConstraint);

// Create a On-Mouseup Event-Handler
Events.on(mouseConstraint, 'mouseup', function(event) {
    let pos = event.mouse.mouseupPosition;
    addBall(pos.x, pos.y, 10,10);
    updateTerrain();
});




// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 1000, y: 1000 }
});


function addBall(x,y,w,h){
	let circle = Bodies.circle(x,y, w,h);
    World.add(engine.world, [circle,land]);
    console.log("Add balls")
	// setTimeout(() => {
	// 	let circle = Bodies.circle(-500, 0, 10, { force: { x: 0.015, y: -0.01 }, restitution: 0.3 });
	// 	World.add(world, circle)
	// }, 100);
};

let t = 0;

function updateTerrain(){
    if(t%5 == 0){
        gauss_new = new Gaussian(0,1+t*0.005);
    ground_new = gauss_new.generateArrays(-10,10);
    terrain_new = Bodies.fromVertices(terrain.position.x, height/2, ground_new , {
        isStatic: false,
        render: {
            fillStyle: '#d1f5d3',
            fill: '#d1f5d3',
            // strokeStyle: '#2e2b44',
            // lineWidth: 1
        }
    },true);
    terrain_new.friction = 0.8;
    let vec = {x:0, y: height-1-terrain_new.bounds.max.y-2};
    Body.translate(terrain_new,vec);
    World.add(engine.world, [terrain_new,land]);
    World.remove(engine.world,terrain);
    terrain = terrain_new;
    ground = ground_new;
    gauss = gauss_new;
    }
    
    t++;
    console.log(terrain);
}


// function Box(x,y,w,h){
//     this.body = Bodies.rectangle(x,y,w,h);
//     this.body.friction = 0.3;
//     this.w = w;
//     this.h = h;
//     World.add(world, [this.body, land]);

//     // this.show = function(){
//     //     let pos = this.body.position;
//     //     let angle = this.body.angle;
//     //     push();
//     //         translate(pos.x, pos.y);
//     //         rotate(angle);
//     //         rectMode(CENTER);
//     //         circle(0,0,this.w,this.h);
//     //     pop();
//     // }
// }

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);