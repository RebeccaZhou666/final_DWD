
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

    generateArrays: function(start,end){
        let LUT = [];
        let step = (Math.abs(start)+Math.abs(end)) / 100;
        for(let i=start; i<end; i+=step){
            LUT.push({x:i*width/2/10+width/2, y:height-2*this.get(i)*height});
        }
        return LUT;
    }
  };


let gauss;
let gauss_init, terrain_init, ground_init;
let cvs;
let ctx;
let canvas;

var terrain;
var vertexSets = [];
let outline = [];
let terrain_new,gauss_new, ground_new;

// let width = $(".curve-block").offsetWidth;
// let height = $(".curve-block").offsetHeight;
let width = 800, height = 600;

let ball = 0;

gauss = new Gaussian(0,1);
ground = gauss.generateArrays(-10,10)

gauss_init = new Gaussian(0,1);

//--------------------- get input data -------------------

$("#submit").click(function(e){
    e.preventDefault();
    console.log("click");
        getChoice();
        setTimeout(function(){reset()},2000);
})

$("#Tab-1-link").click(function(){
    if(!play){
        createBalls(people_home);
        play = true;
    }
})

function getChoice(){
    let choices = document.getElementsByName('yes_no');
    for(i = 0; i < choices.length; i++) { 
        if(choices[i].checked) {
            if(i == 0){
                congrates();
                sendChoice(1);
            }else{
                sendChoice(0);
            }
        }
    }
}

let j = 0;
function congrates(){
    setTimeout(function(){
        let new_pos = (0.1+Math.random()*0.01)*width;
        addBall(new_pos,0, 10,10);
        updateTerrain();
        ball++;
        j++;
        if(j<4){
            congrates();
        }else{
            j = 0;
        }
    },300);
}

function sendChoice(data){
    fetch("/send",
      {
        method: "POST",
        body: JSON.stringify({ staying: data, time:today_time}),
        headers: {
          'Content-Type': 'application/json'
        },
      });
}

function reset(){
    $("#yes_no").removeAttr('checked');
    j=0;
    location.reload(true);
}

//------- get people --------
async function getPeople(){ 
    const res = await fetch("/people");
    const data_people = await res.json();
    console.log(data_people)
    ball = 0;
    $("#staying").text(data_people[0]);
    $("#people").text(data_people[1]);
    people_home = data_people[0];
  }
//--------------------- get input data END -------------------

let times = 0;
function createBalls(k){
    setTimeout(function(){ 
        congrates(); 
        if(times<k){
            createBalls(k)
            times++;
        }else{
            times = 0;
        }
    },400)
}

let Engine = Matter.Engine,
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

let engine = Engine.create();

// create a renderer
let render = Render.create({
    element: document.querySelector('#curve-block'),
    engine: engine,
    // canvas: canvas,
    // canvas: document.querySelector('#myCanvas'),
    options: {
        width: 1200,
        height: 800,
        wireframes: false,
        background: 'white',
    }
});

// create two boxes and a ground
// var ballA = Bodies.circle(400, 200, 10, 10);
// var ballB = Bodies.circle(450, 50, 10, 10);
console.log(width)

// var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
terrain = Bodies.fromVertices(0, height/2, ground , {
    isStatic: false,
    render: {
        fillStyle: '#dcd6f7',
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
World.add(engine.world, [ terrain_init,terrain,land, land2]);



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
    ball++;
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
    Body.setAngle( circle, Math.floor(Math.random()*100));
    World.add(engine.world, [circle,land]);
    console.log("Add balls")
	// setTimeout(() => {
	// 	let circle = Bodies.circle(-500, 0, 10, { force: { x: 0.015, y: -0.01 }, restitution: 0.3 });
	// 	World.add(world, circle)
	// }, 100);
};

// let t = 0;

function updateTerrain(){
    if(ball%5 == 0){
        gauss_new = new Gaussian(0,1+ball*0.005);
    ground_new = gauss_new.generateArrays(-10,10);
    terrain_new = Bodies.fromVertices(terrain.position.x, height/2, ground_new , {
        isStatic: false,
        render: {
            fillStyle: '#dcd6f7',
            fill: '#dcd6f7',
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
    
    // t++;
    console.log(terrain);
}
// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);