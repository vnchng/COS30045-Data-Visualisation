console.log("Scatter plot coverage loaded");


d3.csv("../../data/clean/health_expenditure_coverage_2023.csv")
.then(function(data){


    data.forEach(function(d){

        d.expenditure = +d.expenditure;
        d.coverage = +d.coverage;

    });



    var margin = {
        top:40,
        right:40,
        bottom:60,
        left:70
    };


    var width = 900-margin.left-margin.right;
    var height = 500-margin.top-margin.bottom;



    var svg = d3.select("#chart")
        .append("svg")
        .attr(
            "width",
            width+margin.left+margin.right
        )
        .attr(
            "height",
            height+margin.top+margin.bottom
        )
        .append("g")
        .attr(
            "transform",
            "translate("+margin.left+","+margin.top+")"
        );



    var xScale = d3.scaleLinear()

        .domain([
            0,
            d3.max(data,function(d){
                return d.expenditure;
            })
        ])

        .range([
            0,
            width
        ]);



    var yScale = d3.scaleLinear()

        .domain([
            0,
            100
        ])

        .range([
            height,
            0
        ]);



    var tooltip = d3.select("#tooltip")
        .style("position","absolute")
        .style("visibility","hidden");



    svg.selectAll("circle")

        .data(data)

        .enter()

        .append("circle")

        .attr(
            "cx",
            function(d){

                return xScale(d.expenditure);

            }
        )

        .attr(
            "cy",
            function(d){

                return yScale(d.coverage);

            }
        )

        .attr(
            "r",
            6
        )

        .attr(
            "fill",
            "steelblue"
        )

        .on("mouseover",function(event,d){

            tooltip
                .style(
                    "visibility",
                    "visible"
                )
                .html(

                    "<strong>"+
                    d.country+
                    "</strong><br>"+
                    "Expenditure: "+
                    d.expenditure+
                    "% GDP<br>"+
                    "Coverage: "+
                    d.coverage+
                    "%"

                );

        })

        .on("mousemove",function(event){

            tooltip
                .style(
                    "left",
                    event.pageX+10+"px"
                )
                .style(
                    "top",
                    event.pageY+10+"px"
                );

        })

        .on("mouseout",function(){

            tooltip.style(
                "visibility",
                "hidden"
            );

        });



    svg.append("g")
        .attr(
            "transform",
            "translate(0,"+height+")"
        )
        .call(
            d3.axisBottom(xScale)
        );


    svg.append("g")
        .call(
            d3.axisLeft(yScale)
        );


});