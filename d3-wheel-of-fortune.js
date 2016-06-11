/*
 * MIT License
 * © Copyright 2016 - Geoffrey Brossard (me@geoffreybrossard.fr)
 */

d3.wheel = function() {
    /* params */
    var width = 500,
        height = 500,
        selectorPosition = 0,
        defaultRotation = 0,
        rotationTimeMS = 700,
        color = "#333",
        innerRadius = 0;
    /* events */
    var wheelDispatch = d3.dispatch("select", "mouseover", "mouseout");

    function wheel(data) {
        data.each(function(data) {
            var radius = Math.min(width, height) / 2,
            outerRadius = radius - 20;

            /* init the svg */
            var svg = d3.select(this);
            svg.classed({"d3-wheel": true})
                .attr("width", width)
                .attr("height", height);

            /* create its main group */
            var main = svg.select(".main");
            if (main.empty()) {
                main = svg.append("g").classed({"main": true});
            }
            main.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


            /***
            * background of the wheel */
            var background = main.select(".background");
            if (background.empty()) {
                background = main.append("g").classed({"background": true});
            }
            /* black border around */
            background.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", radius-10)
                .style("fill", color);


            /***
            * arc functions for the wheel */
            var arcFull = d3.svg.arc()
                .outerRadius(outerRadius)
                .innerRadius(innerRadius);
            var arcDark = d3.svg.arc()
                .outerRadius(outerRadius)
                .innerRadius(innerRadius + 4*(outerRadius - innerRadius) / 5);
            var arcLight = d3.svg.arc()
                .outerRadius(outerRadius)
                .innerRadius(innerRadius - (outerRadius - innerRadius) / 5);


            /***
            * pie layout, all parts are equal */
            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) { return 1; });


            /***
            * arcs */
            /* container group */
            var arcGroup = main.select(".arc-group");
            if (arcGroup.empty()) {
                arcGroup = main.append("g").classed({"arc-group": true});
            }

            /* all arcs */
            var arcs = arcGroup.selectAll(".arc").data(pie(data));
            /* append arcs entering */
            var arcsEnter = arcs.enter().append("g").classed({"arc": true});
            arcsEnter.append("path").classed({"arc-color": true})
                     .attr("d", arcFull).style("fill", function(d) { return d.data.color; });
            arcsEnter.append("path").attr("d", arcDark).style("fill", "rgba(0, 0, 0, 0.2)");

            /* append image to the arc */
            var imgSize = radius / 2.4;
            arcsEnter.append("image")
                .attr('xlink:href', function(d) { return d.data.image || ''; })
                .attr("width", imgSize)
                .attr("height", imgSize)
                .attr("transform", function(d) {
                    var pos = arcLight.centroid(d);
                    pos[0] -= imgSize/2;
                    pos[1] -= imgSize/2;
                    return "translate(" + pos + ")";
                });

            /* function for rotating the wheel */
            var rotateWheel = function(angle, transition) {
                /* arc group element to rotate with / without transition */
                var toTransform = arcGroup;
                if (transition !== false) {
                    toTransform = toTransform.transition().duration(rotationTimeMS);
                }

                /* rotate wheel */
                toTransform.attr("transform", "rotate("+-angle+")");

                /* arc images to unrotate with / without transition */
                toTransform = arcGroup.selectAll("image");
                if (transition !== false) {
                    toTransform = toTransform.transition().duration(rotationTimeMS);
                }

                /* unrotate contained images */
                toTransform.attr("transform", function(d) {
                        var pos1 = arcLight.centroid(d);
                        var pos2 = [];
                        pos2[0] = -imgSize/2;
                        pos2[1] = -imgSize/2;
                        return "translate(" + pos1 + ") rotate("+angle+") translate("+pos2+")";
                    });
            };

            /* function for updating the wheel with the current data */
            var updateWithData = function() {
                /* arc color depends on d.color */
                arcs.selectAll(".arc-color")
                    .transition().duration(300)
                    .style("fill", function(d) { return d.data.color; });
                /* arc image depends on d.image */
                arcs.selectAll("image")
                    .attr('xlink:href', function(d) { return d.data.image || ''; })
            };

            /* default rotation */
            if (defaultRotation) {
                rotateWheel(defaultRotation, false);
            }

            /* append overlays which will receive events on arcs */
            var timeout = null;
            arcs.append("path")
                .attr("d", arcFull)
                .style({
                    "stroke": "#fff",
                    "stroke-width": "3px",
                    "fill": "transparent",
                    "cursor": "pointer"
                }).on("mouseover", function(d) {
                    d3.select(this).style("fill", "rgba(255,255,255,0.2)");
                    wheelDispatch.mouseover(d.data || null);
                }).on("mouseout", function(d) {
                    d3.select(this).style("fill", "transparent");
                    wheelDispatch.mouseout(d.data || null);
                }).on("click", function(d) {
                    d3.select(this).style("fill", "transparent");

                    /* compute rotation angle to get the part under selector and rotate the wheel */
                    var rotation = (d.startAngle + d.endAngle) / 2;
                    rotation *= 360 / (2*Math.PI);
                    rotation -= selectorPosition;
                    rotateWheel(rotation);

                    /* send selected event */
                    if (timeout) { clearTimeout(timeout); };
                    timeout = setTimeout(function() {
                        timeout = null;
                        wheelDispatch.select(d.data || null);
                        updateWithData();
                    }, rotationTimeMS);
                });

            /***
            * selector of the wheel */
            var selector = main.select("selector");
            if (selector.empty()) {
                selector = main.append("g").classed({"selector": true});
                selector.append("path")
                    .attr("d", "M0 "+(-0.9*radius)+" L"+(radius/20)+" "+(-radius+2)+" L-"+(radius/20)+" "+(-radius+2)+" Z")
                    .attr("transform", "rotate(" + selectorPosition + " 0 0)")
                    .style({
                        "fill": "#000",
                        "stroke": "#fff",
                        "stroke-width": "2px"
                    });
            }

            /***
             * axle of the wheel */
            var axle = main.select(".axle");
            if (axle.empty()) {
                axle = main.append("g").classed({"axle": true});
            }
            /* circles inside */
            axle.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", innerRadius-1)
                .style("fill", "#ccc");
            axle.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", innerRadius-15)
                .style("fill", "#eee");
            axle.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", innerRadius-30)
                .style("fill", color);
        });
    }

    /* dimensions of the wheel */
    wheel.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return wheel;
    };
    wheel.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return wheel;
    };
    /* selector position in degree (0=top ; 90=right ; 180=bottom ; 270=left) */
    wheel.selectorPosition = function(value) {
        if (!arguments.length) return selectorPosition;
        selectorPosition = value % 360;
        return wheel;
    };
    /* default rotation angle on load */
    wheel.defaultRotation = function(value) {
        if (!arguments.length) return defaultRotation;
        defaultRotation = value % 360;
        return wheel;
    };
    /* time of rotation of the wheel when clicking on the part */
    wheel.rotationTimeMS = function(value) {
        if (!arguments.length) return rotationTimeMS;
        rotationTimeMS = Math.max(value, 0);
        return wheel;
    };
    /* base color for the wheel */
    wheel.color = function(value) {
        if (!arguments.length) return color;
        color = value;
        return wheel;
    };
    /* inner radius of the wheel */
    wheel.innerRadius = function(value) {
        if (!arguments.length) return innerRadius;
        innerRadius = value;
        return wheel;
    };

    /* event dispatcher */
    wheel.on = function(type, listener) {
        wheelDispatch.on(type, listener);
    };

    return wheel;
}
