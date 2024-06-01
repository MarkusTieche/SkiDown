# TWEENR

### SINGLE TWEEN
Moves from current position to target position
```javascript
ball = document.getElementById("circle");

var tweenable = new Tweenable({
    from: {x:0},
    to: {x:100},
    ease:"linear",
    duration: 1000,
    onUpdate: ({x}) => {
      ball.style.transform = `translateX(${x}px) translateY(0px)`;
    }
  }).tween().then(() => console.log('All done!'))
```

### CHAINED TWEEN
Moves from current position to next position in chain, reset if restarted;
```javascript
ball = document.getElementById("circle");

//START TWEEN
tweenable = new Tweenable({
      from: {x:0,scale:1},
      to: {x:100},
      ease:"linear",
      duration: 1000,
      onUpdate: ({x,scale}) => {
        ball.style.transform = `translateX(${x}px) translateY(0px) scale(${scale})`;
      }
    });

    if( tweenable.isRunning()){return;} //DON'T RUN THE SAME TWEEN SIMULTANIOUS
    tweenable.tween().then(() =>tweenable.tween({to:{x:200,scale:2},duration:1000})).then(() => console.log('All done!'))
```

### EASING OPTIONS
  - linear
  - easeInQuad
  - easeOutQuad
  - easeInOutQuad
  - easeInCubic
  - easeOutCubic
  - easeInOutCubic
  - easeInQuart
  - easeOutQuart
  - easeInOutQuart
  - easeInQuint
  - easeOutQuint
  - easeInOutQuint