# d3 Wheel of fortune

[![](http://www.geoffreybrossard.fr/github/d3-wheel-of-fortune/example.png)](http://www.geoffreybrossard.fr/github/d3-wheel-of-fortune/)

* [Live example](http://www.geoffreybrossard.fr/github/d3-wheel-of-fortune/)
* [Example code](example/)

## Quick Start

### Install with Bower
```
bower install d3-wheel-of-fortune
```

### Use it!
````javascript
/* set up the wheel of fortune */
var wheel = d3.wheel();
wheel.width(500)
    .height(500)
    .selectorPosition(180)
    .defaultRotation(90)
    .rotationTimeMS(700)
    .color("#444444")
    .innerRadius(75);

/* register event listeners */
wheel.on("select", function(d) { alert("You selected the " + d.info + " present !"); });
wheel.on("mouseover", function(d) { console.log("mouse on " + d.info); });
wheel.on("mouseout", function(d) { console.log("mouse out of " + d.info); });

/* add the wheel to the page */
d3.json("data.json", function(d) {
    d3.select("svg").datum(d).call(wheel);
});
````

## Documentation
### Parameters
You can set up the parameters of the wheel passing the values through the function named as the
parameter, as I did in the example:
* **width** *Number* = The max. width of the wheel (which will always be a circle)
* **height** *Number* = The max. height of the wheel (which will always be a circle)
* **selectorPosition** *Number* = The angle on which put the selector (0=top; 90=right; 180=bottom; -90=left)
* **defaultRotation** *Number* = The rotation angle of the wheel when it loads
* **rotationTimeMS** *Number* = The length of the transition for rotating the wheel in ms.
* **color** *Color* = The background color of the wheel (change the out border and color of the axle)
* **innerRadius** *Number* = The size of the axle

### Events
Three events are launched while interacting with the wheel:
* **select** = when the rotation ends and the selector is on a part of the wheel
* **mouseover** = when the user put her mouse on a part of the wheel
* **mouseout** = when the user remove her mouse on a part of the wheel

You can register event listeners calling *on*. The first parameter given to the event listener is
the data you put in the part of the wheel.

### Data
The data given to *datum* before calling *wheel* (see example) should be an array of objects, one
object per part of the wheel. These objects should contain the fields:
* **color** *Color* = the color of the part of the wheel
* **img** *String* = the url of the image to put on the part of the wheel

Then, you can add more data if you want to retrieve them in your event listeners.

## License
MIT License

## TODO
* Add a weight field in the data to change the size of the parts
* Add a way to select a part of the wheel in the code
* Add a random button on the axle to select a part randomly
* Other? Let me know!
