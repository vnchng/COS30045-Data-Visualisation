console.log("Grouped bar coverage loaded");


d3.csv("../../data/clean/health_expenditure_and_coverage_combined.csv")
.then(function(data){


    data.forEach(function(d){

        d.year = +d.year;
        d.expenditure = +d.expenditure;
        d.coverage = +d.coverage;

    });

    var years = [
        ...new Set(
            data.map(function(d){
                return d.year;
            })
        )
    ].sort();


    d3.select("#yearSelect")
        .selectAll("option")
        .data(years)
        .enter()
        .append("option")
        .attr("value",d=>d)
        .text(d=>d);

    var margin = {

        top:40,
        right:30,
        bottom:120,
        left:70

    };

    var width = 900 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    function drawChart(selectedYear){

        d3.select("#chart")
            .selectAll("*")
            .remove();


        var filteredData = data.filter(function(d){

            return d.year === selectedYear;

        });

        console.log("Selected year:", selectedYear);
        console.log("Filtered data:", filteredData);

        //tooptip created
        var tooltip = d3.select("#tooltip")
            .style("position","absolute")
            .style("visibility","hidden");
            
        var svg = d3.select("#chart")

            .append("svg")

            .attr(
                "width",
                width + margin.left + margin.right
            )

            .attr(
                "height",
                height + margin.top + margin.bottom
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



        var countries =
            filteredData.map(function(d){

                return d.country;

            });



        var categories = [
            "Expenditure",
            "Coverage"
        ];



        var x0 = d3.scaleBand()

            .domain(countries)

            .range([0,width])

            .padding(0.2);



        var x1 = d3.scaleBand()

            .domain(categories)

            .range([
                0,
                x0.bandwidth()
            ])

            .padding(0.05);



        var yScale = d3.scaleLinear()

            .domain([
                0,
                100
            ])

            .range([
                height,
                0
            ]);



        var colour = d3.scaleOrdinal()

            .domain(categories)

            .range([
                "steelblue",
                "orange"
            ]);



        var countryGroups = svg.selectAll(".country")

            .data(filteredData)

            .enter()

            .append("g")

            .attr(
                "transform",
                function(d){

                    return "translate("+
                    x0(d.country)+
                    ",0)";

                }
            );



        countryGroups.selectAll("rect")

            .data(function(d){

                return [

                    {
                        category:"Expenditure",
                        value:d.expenditure
                    },

                    {
                        category:"Coverage",
                        value:d.coverage
                    }

                ];

            })

            .enter()

            .append("rect")

            // tooptip added
            .on("mouseover",function(event,d){

                tooltip
                    .style(
                        "visibility",
                        "visible"
                    )
                    .html(

                        "<strong>" +
                        d.category +
                        "</strong><br>" +

                        "Country: " +
                        d3.select(this.parentNode).datum().country +
                        "<br>" +

                        "Value: " +
                        d.value.toFixed(2) +
                        "%"

                    );

            })

            .on("mouseover", function(event, d){

                tooltip
                    .style(
                        "visibility",
                        "visible"
                    )
                    .html(

                        "<strong>" +
                        d.category +
                        "</strong><br>" +

                        "Country: " +
                        d3.select(this.parentNode).datum().country +
                        "<br>" +

                        "Value: " +
                        d.value.toFixed(2) +
                        "%"

                    );

                d3.select(this)
                    .attr(
                        "stroke",
                        "black"
                    )
                    .attr(
                        "stroke-width",
                        2
                    );

            })

            .on("mousemove",function(event){
                
                tooltip
                    .style(
                        "left",
                        event.pageX + 10 + "px"
                    )

                    .style(
                        "top",
                        event.pageY + 10 + "px"
                    );
            })

            .on("mouseout",function(){

                tooltip
                    .style(
                        "visibility",
                        "hidden"
                    );


                d3.select(this)
                    .attr(
                        "stroke",
                        "none"
                    );

            })

            .attr(
                "x",
                function(d){

                    return x1(d.category);

                }
            )

            .attr(
                "y",
                function(d){

                    return yScale(d.value);

                }
            )

            .attr(
                "width",
                x1.bandwidth()
            )

            .attr(
                "height",
                function(d){

                    return height-yScale(d.value);

                }
            )

            .attr(
                "fill",
                function(d){

                    return colour(d.category);

                }
            );



        svg.append("g")

            .attr(
                "transform",
                "translate(0,"+height+")"
            )

            .call(
                d3.axisBottom(x0)
            )

            .selectAll("text")

            .attr(
                "transform",
                "rotate(-45)"
            )

            .style(
                "text-anchor",
                "end"
            );



        svg.append("g")

            .call(
                d3.axisLeft(yScale)
            );

        var legend = svg.append("g")
            .attr(
                "transform",
                "translate(0,-25)"
            );


        categories.forEach(function(category,i){

            legend.append("rect")

                .attr(
                    "x",
                    i * 150
                )

                .attr(
                    "width",
                    15
                )

                .attr(
                    "height",
                    15
                )

                .attr(
                    "fill",
                    colour(category)
                );


            legend.append("text")

                .attr(
                    "x",
                    i * 150 + 22
                )

                .attr(
                    "y",
                    12
                )

                .text(category);

        });

    }

    drawChart(2023); //default year


    d3.select("#yearSelect")
    .on("change",function(){
        drawChart(+this.value);
    });

});