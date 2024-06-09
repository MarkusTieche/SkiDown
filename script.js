
var lastTick = Date.now();
var dt = 0;
let svg = document.querySelector('svg');
var fpsCounter = document.getElementById("debug_FPS");
var viewBox = svg.viewBox.baseVal;

var score = 0;
var counter = document.getElementById("counter");
var best = document.getElementById("best");
var player = document.getElementById("Player");
    player.body = document.getElementById("body");
    player.onGround = true;
    player.direction = 1;
    player.position = vec2(0,0);
    player.acceleration = vec2(0,0);
    player.velocity = vec2(0,0);
    player.scale = vec2(1,1);
    player.angle = 0;
    player.row = 0;
    player.column = 4;
    player.currentTile = null;
    player.shadow = document.getElementById("playerShadow");
    player.position = vec2(0,0);


var camera = document.getElementById("World");
    camera.velocity  = vec2(0,0);
    camera.position = vec2(0,0);
    camera.target = player;

var level = document.getElementById("Level");
    level.size={width:4,height:6};
    level.array = [];
    level.currentRow = 0;
    level.trapChance = 0;

var removeArray = [];
    removeArray.count = 0;

var background = document.getElementById("Background");
    background.position = vec2(0,0);
    
var tiles = document.getElementById("Tiles");
    tiles.size = {width:200,height:140};

var tweenable;

var clickEvent = document.createEvent("MouseEvent");
var saveGame = {"name":"Savegame","highscore":0};


init();
function init()
{

    setInput(input)
    
    initLevel();
    camera.position.y -= 500;


    //INIT TWEENR
    tweenable = new Tweenable({
        from: {scaleX:1,scaleY:1,opacity:0},
        to: {scaleX:1,scaleY:1,opacity:1},
        ease:"linear",
        duration: 1000,
        onUpdate: ({scaleX,scaleY,opacity}) => {
            player.scale.x = scaleX;
            player.scale.y = scaleY;
            player.shadow.style.opacity = opacity;
        }
    });

    //RANDOM PARALLAX FACTO FOR BG
    for (let i = 0; i < background.children.length; i++) 
    {
        background.children[i].position = vec2(Math.random()*viewBox.width,-100+Math.random()*viewBox.height+100);
        background.children[i].parallaxFac = 2+Math.ceil(Math.random()*6);
        background.children[i].setAttribute("transform","translate("+ background.children[i].position.x+","+ background.children[i].position.y+")");
    }

    //LOAD SAVE
    localStorage.clear()
    if(JSON.parse(localStorage.getItem(saveGame.name)))
    {
        saveGame = JSON.parse(localStorage.getItem(saveGame.name))
    }
    //START ANIMATION
    animate();
}

function setInput(func)
{
    document.getElementById("input").onclick = func;
}

function initLevel()
{
    //INIT LEVEL
    for (let i = 0; i < level.size.height; i++) 
    {
        level.array.push([]);
        addRow();
    }

    //PLACE PLAYER
    score = 0;
    counter.style.color ="white";
    counter.innerHTML = score;
    player.onGround = true;
    player.velocity.x =player.velocity.y = 0;
    player.angle = 0;
    player.row = 0;
    player.column = 4;
    player.currentTile = level.array[player.row][player.column/2];
    player.position = vec2.add(player.currentTile.position,vec2(0,-50));

    player.shadow.position = player.currentTile.position
    player.shadow.setAttribute("transform","translate("+player.shadow.position.x+","+player.shadow.position.y+")");

    camera.target = player;
    camera.position.x = viewBox.width/2-camera.target.position.x;
    camera.position.y = viewBox.height/2-camera.target.position.y;
    camera.position.y += 500;
    camera.setAttribute("transform","translate("+camera.position.x+","+camera.position.y+")");

}

function resetLevel()
{
    for (let i = 0; i < level.size.height; i++) {
        removeRow(i);
    }

    level.currentRow = 0;
    setTimeout(initLevel, 800);
}

function addRow()
{
    for (let i = 0; i < level.size.width; i++) 
    {
        level.trapChance += Math.random()*Math.sign(level.currentRow);
        
        var type = 0
        if(level.trapChance >=1)
        {
            type = Math.floor(Math.random()*tiles.children.length);
            level.trapChance  = 0;
        }

        var clone = tiles.children[type].cloneNode(true);
            clone.type = type;
            clone.position = vec2(
                (i*tiles.size.width)+( level.currentRow%2*tiles.size.width/2),
                500+(tiles.size.height * level.currentRow)
            );
            clone.setAttribute("transform","translate("+ clone.position.x+","+ clone.position.y +")");
            level.appendChild(clone);
        
            level.array[level.currentRow%level.size.height][i] = clone;
    }
    
    level.currentRow +=1;
}

function removeRow(row)
{
    for (let i = 0; i < level.size.width; i++) 
    {
        level.array[row%level.size.height][i].life = 30;
        level.array[row%level.size.height][i].velocity = -4+Math.random()*-10;
        removeArray.push(level.array[row%level.size.height][i]);
        removeArray.count +=1;
    }
}

function input(e)
{
    e.preventDefault();

    if(!player.onGround){return;};

    if(e.offsetX<window.innerWidth/2)
    {
        // console.log("left");
        player.column--;
        player.direction = 1;
    }
    else
    {
        // console.log("right");
        player.column++;
        player.direction = -1;
    }
    player.velocity.y = -5;
    
    player.onGround = false;
    player.row += 1;

    player.currentTile = currentTile();

    // player.shadow.style.opacity = 1;
    tweenable.tween({to:{scaleX:.9,scaleY:1.1,opacity:0},duration:100}).then(()=>
    {
        player.shadow.position = player.currentTile.position
        player.shadow.setAttribute("transform","translate("+player.shadow.position.x+","+player.shadow.position.y+")")
    }).then(() =>tweenable.tween({to:{scaleX:1,scaleY:1,opacity:1},duration:300}));

    if(!player.currentTile || player.currentTile.type == 1)
    {
        player.currentTile = {position:vec2(player.position.x-tiles.size.width/2*player.direction,(player.row+100)*tiles.size.height)};
        
        setTimeout(playerDeath, 300);
    }
}

function playerDeath()
{
    // console.log("death")
    camera.target = {position:vec2(player.currentTile.position.x,player.position.y)};
    player.velocity.y = -10;
    player.angle = 30;
    setTimeout(resetLevel, 1000);
    if(counter.innerHTML > saveGame.highscore)
    {
        saveGame["highscore"] = Number(counter.innerHTML);
        localStorage.setItem(saveGame.name,JSON.stringify(saveGame));
        best.innerHTML = "HIGHSCORE: "+counter.innerHTML;
    }
    counter.innerHTML = "X";
    counter.style.color ="#e85664";
}

function currentTile()
{
    return level.array[player.row%level.size.height][Math.floor(player.column/2)]||false;
}

function bounds(x,y)
{
    //ONLY NEED Y-TOP CALCULATION
    // console.log(x-camera.position.x > -camera.position.x&&x-camera.position.x < -camera.position.x+viewBox.width)
    return (y-camera.position.y > -camera.position.y&&(x-camera.position.x > -camera.position.x&&x-camera.position.x < -camera.position.x+viewBox.width));
    // return (y-camera.position.y > -camera.position.y);
}

function render(time)
{

    dt = (time-lastTick)*.06;//!! WRONG IMPLEMENTATION OF DELTATIME
    lastTick = time;
    if(dt >= 5)
    {
        return;
    }

    if(!player.onGround)
    {
        player.velocity.y += 0.8*dt;
        player.velocity.x = ((player.currentTile.position.x-player.position.x)/(10/dt));

        //PLAYER ON LANDING
        if((player.position.y+player.velocity.y) > player.currentTile.position.y-50)
        {
            player.velocity.y = 0;
            player.velocity.x = 0;
            player.onGround = true;

            //CENTER ON TILE??
            player.position.x = player.currentTile.position.x;
            player.position.y = player.currentTile.position.y-50;

            //REMOVE ROW
            removeRow(player.row-1)
            addRow();
            score +=1 ;
            counter.innerHTML = score;

            tweenable.tween({to:{scaleX:1.1,scaleY:.9},duration:100}).then(() =>tweenable.tween({to:{scaleX:1,scaleY:1},duration:200}));

            //CHECK CURRENT TILE
            if(player.currentTile.type == 2)
            {
                //MOVE TO NEXT TILE
                clickEvent.initMouseEvent(
                    "click",
                    true /* bubble */, true /* cancelable */,
                    window, null,
                    0, 0, (player.direction*-100)*window.screen.width/2, 0, /* coordinates */
                    false, false, false, false, /* modifier keys */
                    0 /*left*/, null
                );
                document.getElementById('input').dispatchEvent(clickEvent);
            }
        }
    }

    // player.velocity = vec2.scale(player.velocity,dt);
    // var x = vec2.scale(player.velocity,dt)
    player.position = vec2.add(player.position,player.velocity);

    //UPDATE PLAYER
    player.setAttribute("transform","translate("+player.position.x+","+player.position.y+"),scale("+player.direction+",1),rotate("+player.angle+")");
    player.body.setAttribute("transform","scale("+player.scale.x+","+player.scale.y+")");

    //CAMERA
    camera.velocity.x = ((viewBox.width/2-camera.target.position.x)- camera.position.x )/(10/dt);
    camera.velocity.y = ((viewBox.height/2-camera.target.position.y)- camera.position.y)/(30/dt);
    camera.position = vec2.add(camera.position,camera.velocity);
    camera.setAttribute("transform","translate("+camera.position.x+","+camera.position.y+")");

    //BG
    for (let i = 0; i < background.children.length; i++) 
    {
        background.children[i].position.x += camera.velocity.x/background.children[i].parallaxFac;
        background.children[i].position.y += camera.velocity.y/background.children[i].parallaxFac;
        background.children[i].setAttribute("transform","translate("+ background.children[i].position.x+","+ background.children[i].position.y+")");
    
        if(!this.bounds(background.children[i].position.x,background.children[i].position.y+140))
        {
            background.children[i].position.y = viewBox.height+140;
            background.children[i].position.x = Math.random()*viewBox.width;
        }
    }
    //REMOVE ARRAY
    for (let i = removeArray.count-1; i >= 0; i--)
    {
        removeArray[i].life-=(1*dt);
        removeArray[i].style.opacity = (removeArray[i].style.opacity||1.5)-(0.05*dt);
        removeArray[i].velocity += (1*dt);
        removeArray[i].position.y += (removeArray[i].velocity*dt);
        removeArray[i].setAttribute("transform","translate("+ removeArray[i].position.x+","+ removeArray[i].position.y +")");
        
        if( removeArray[i].life < 0)
        {
            removeArray[i].remove()
            removeArray[i] = removeArray[removeArray.count-1]
            removeArray[removeArray.count-1] = null;
            removeArray.count -=1;
            removeArray.length = removeArray.count;
        }
    }
}

// Animation loop
function animate(){
    requestAnimationFrame(animate);
    // Render scene
    render(Date.now());
}

