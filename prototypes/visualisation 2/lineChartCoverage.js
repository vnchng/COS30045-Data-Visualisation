console.log("Line chart coverage loaded");


d3.csv("../../data/clean/health_expenditure_and_coverage_combined.csv")
.then(function(data){


    data.forEach(function(d){

        d.year = +d.year;
        d.expenditure = +d.expenditure;
        d.coverage = +d.coverage;

    });


    data = data.filter(function(d){

        return !isNaN(d.expenditure) &&
               !isNaN(d.coverage);

    });



    var countries = [
        ...new Set(
            data.map(function(d){
                return d.country;
            })
        )
    ].sort();



    d3.select("#countrySelect")
        .selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .attr(
            "value",
            function(d){
                return d;
            }
        )
        .text(function(d){
            return d;
        });



    function drawChart(selectedCountry){


        d3.select("#chart")
            .selectAll("*")
            .remove();



        var filteredData = data.filter(function(d){

            return d.country === selectedCountry;

        });

        console.log("Selected country:", selectedCountry);
        console.log("Filtered data:", filteredData);

        var margin = {

            top:50,
            right:50,
            bottom:70,
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
                "translate("+
                margin.left+
                ","+
                margin.top+
                ")"
            );



        var xScale = d3.scaleLinear()

            .domain(
                d3.extent(
                    filteredData,
                    function(d){
                        return d.year;
                    }
                )
            )

            .range(
                [0,width]
            );



        var yScale = d3.scaleLinear()

            .domain(
                [
                    0,
                    100
                ]
            )

            .range(
                [
                    height,
                    0
                ]
            );



        var line = d3.line()

            // incase of some missing data
            .defined(function(d){
                return !isNaN(d.value);
            })

            .x(function(d){

                return xScale(d.year);

            })

            .y(function(d){

                return yScale(d.value);

            });

        //sorting/filtering by year to make sure correctly drawn lines
        filteredData.sort(function(a,b){
            return a.year - b.year;
        });


        var expenditureData =
            filteredData.map(function(d){

                return {
                    year:d.year,
                    value:d.expenditure
                };

            });



        var coverageData =
            filteredData.map(function(d){

                return {
                    year:d.year,
                    value:d.coverage
                };

            });



        // Coverage line

        svg.append("path")

            .data([coverageData])

            .attr(
                "fill",
                "none"
            )

            .attr(
                "stroke",
                "steelblue"
            )

            .attr(
                "stroke-width",
                2
            )

            .attr(
                "d",
                line
            );



        // Expenditure line

        svg.append("path")

            .data([expenditureData])

            .attr(
                "fill",
                "none"
            )

            .attr(
                "stroke",
                "orange"
            )

            .attr(
                "stroke-width",
                2
            )

            .attr(
                "d",
                line
            );



        svg.append("g")

            .attr(
                "transform",
                "translate(0,"+
                height+
                ")"
            )

            .call(
                d3.axisBottom(xScale)
            );



        svg.append("g")

            .call(
                d3.axisLeft(yScale)
            );



        svg.append("text")

            .attr(
                "x",
                width/2
            )

            .attr(
                "y",
                height+50
            )

            .attr(
                "text-anchor",
                "middle"
            )

            .text(
                "Year"
            );


        svg.append("text")

            .attr(
                "transform",
                "rotate(-90)"
            )

            .attr(
                "x",
                -height/2
            )

            .attr(
                "y",
                -50
            )

            .attr(
                "text-anchor",
                "middle"
            )

            .text(
                "Percentage (%)"
            );

    }



    drawChart(countries[0]);



    d3.select("#countrySelect")
        .on("change",function(){

            drawChart(this.value);

        });



});