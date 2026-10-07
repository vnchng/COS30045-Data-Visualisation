console.log("Bar chart coverage loaded");


d3.csv("../../data/clean/health_expenditure_coverage_2023.csv")
.then(function(data){


    data.forEach(function(d){

        d.expenditure = +d.expenditure;
        d.coverage = +d.coverage;

    });


    var selectedData = data.slice(0,10);



    var margin = {
        top:40,
        right:30,
        bottom:120,
        left:80
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



    var countries = selectedData.map(function(d){
        return d.country;
    });



    var xScale = d3.scaleBand()
        .domain(countries)
        .range([0,width])
        .padding(0.2);



    var yScale = d3.scaleLinear()
        .domain([
            0,
            100
        ])
        .range([
            height,
            0
        ]);



    svg.selectAll("rect")
        .data(selectedData)
        .enter()
        .append("rect")
        .attr("x",function(d){

            return xScale(d.country);

        })
        .attr("y",function(d){

            return yScale(d.coverage);

        })
        .attr(
            "width",
            xScale.bandwidth()
        )
        .attr(
            "height",
            function(d){

                return height-yScale(d.coverage);

            }
        )
        .attr(
            "fill",
            "steelblue"
        );


    svg.append("g")
        .attr(
            "transform",
            "translate(0,"+height+")"
        )
        .call(d3.axisBottom(xScale));


    svg.append("g")
        .call(d3.axisLeft(yScale));


});