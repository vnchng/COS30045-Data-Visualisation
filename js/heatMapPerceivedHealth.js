console.log("Heatmap perceived health loaded");


d3.csv("data/clean/perceived_health_status_by_socioeconomic_status.csv")
.then(function(data){


    data.forEach(function(d){

        d.year = +d.year;
        d.value = +d.value;

    });

    // Extract available years
    var years = [
        ...new Set(
            data.map(function(d){
                return d.year;
            })
        )
    ].sort();


    var educationCodes = [
        "ISCED11_0T2",
        "ISCED11_3T4",
        "ISCED11_5T8"
    ];

    var educationNames = {

        "ISCED11_0T2":
            "Lower education",

        "ISCED11_3T4":
            "Upper secondary education",

        "ISCED11_5T8":
            "Tertiary education"

    };

    d3.select("#heatmapYearSelect")
        .selectAll("option")
        .data(years)
        .enter()
        .append("option")
        .attr("value", function(d){
            return d;
        })
        .text(function(d){
            return d;
        });


    d3.select("#heatmapYearSelect")
        .property("value",2023);

    //var selectedYear = 2023;


    function drawHeatmap(selectedYear){
        
        d3.select("#heatmapChart")
            .selectAll("*")
            .remove();

        d3.select("#legend")
            .selectAll("*")
            .remove();
        
        var filteredData = data.filter(function(d){

            return d.year === selectedYear &&
                educationCodes.includes(
                    d.socioeconomic_status_code
                );

        });

        console.log(filteredData);

        var margin = {
            top: 30,
            right: 30,
            bottom: 70,
            left: 150
        };


        var width = 1000 - margin.left - margin.right;
        var height = 600- margin.top - margin.bottom;



        var svg = d3.select("#heatmapChart")
            .append("svg")
            .attr(
                "viewBox",
                "0 0 " +
                (width + margin.left + margin.right) +
                " " +
                (height + margin.top + margin.bottom)
            )
            .attr("width", "100%")
            .attr("height", "auto")
            .append("g")
            .attr(
                "transform",
                "translate(" +
                margin.left +
                "," +
                margin.top +
                ")"
            );


        var countries = [
            ...new Set(
                filteredData.map(function(d){
                    return d.country;
                })
            )
        ];


        var educationLevels = [
            ...new Set(
                filteredData.map(function(d){
                    return educationNames[
                        d.socioeconomic_status_code
                    ];
                })
            )
        ];



        var xScale = d3.scaleBand()
            .domain(educationLevels)
            .range([0,width])
            .padding(0.05);

        var yScale = d3.scaleBand()
            .domain(countries)
            .range([0,height])
            .padding(0.05);

        var tooltip = d3.select("#tooltip")
            .style("position","absolute")
            .style("visibility","hidden");

        //var colourScale = d3.scaleSequential()
            //.domain([0,100])
            //.interpolator(d3.interpolateBlues);
            
        //Red Green Colour Scale
        var colourScale = d3.scaleLinear()
            .domain([
                0,
                50,
                100
            ])
            .range([
                "#d73027",
                "#fee08b",
                "#1a9850"
            ]);


        //var legendScale = d3.scaleLinear()

            //.domain([0,100])

            //.range([0,legendWidth]);


        //legendSvg.selectAll("rect")

            //.data(
                //d3.range(0,100)
            //)

            //.enter()

            //.append("rect")

            //.attr(
                //"x",
                //function(d){

                    //return legendScale(d);

                //}
            //)

            //.attr(
                //"width",
                //3
            //)

            //.attr(
                //"height",
                //15
            //)

            //.attr(
                //"fill",
                //function(d){

                    //return colourScale(d);

                //}
            //);



        //legendSvg.append("text")
            //.attr("x",0)
            //.attr("y",35)
            //.text("0%");


        //legendSvg.append("text")
            //.attr("x",260)
            //.attr("y",35)
            //.text("100%");


            //design interation
            var legendWidth = 300;
            var legendHeight = 15;

            var legendSvg = d3.select("#legend")
                .append("svg")
                .attr(
                    "width",
                    legendWidth
                )
                .attr(
                    "height",
                    50
                );


            var legendScale = d3.scaleLinear()
                .domain([0,100])
                .range([0,legendWidth]);


            legendSvg.selectAll("rect")
                .data(
                    d3.range(0,100)
                )

                .enter()
                .append("rect")
                .attr("x",function(d){

                    return legendScale(d);

                })
                .attr("width",5)
                .attr("height",15)
                .attr("fill",function(d){

                    return colourScale(d);

                })

                .on("mouseover",function(event,d){

                    tooltip
                        .style("visibility","visible")
                        .html(
                            d +
                            "%"
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

                    tooltip.style(
                        "visibility",
                        "hidden"
                    );

                });

            legendSvg.append("text")
                .attr("x",0)
                .attr("y",35)
                .text("Lower health");


            legendSvg.append("text")
                .attr("x",205)
                .attr("y",35)
                .text("Higher health");


        svg.selectAll("rect")
            .data(filteredData)
            .enter()
            .append("rect")

            .attr("x",function(d){

                return xScale(
                    educationNames[d.socioeconomic_status_code]                );

            })

            .attr("y",function(d){

                return yScale(
                    d.country
                );

            })

            .attr(
                "width",
                xScale.bandwidth()
            )

            .attr(
                "height",
                yScale.bandwidth()
            )

            .attr(
                "fill",
                function(d){

                    return colourScale(d.value);

                }
            );



        svg.append("g")
            .attr(
                "transform",
                "translate(0,"+height+")"
            )
            .call(
                d3.axisBottom(xScale)
            )
            //.selectAll("text")
            //.attr(
                //"transform",
                //"rotate(-15)"
            //)
            .selectAll("text")
            .style(
                "text-anchor", "middle",
                "end"
            )
            .style(
                "font-size",
                "12px"
            );



        svg.append("g")
            .call(
                d3.axisLeft(yScale)
            );

        } 
        
    //drawChart(2023);
    drawHeatmap(2023);

    d3.select("#heatmapYearSelect")
        .on("change", function(){

            //drawChart(+this.value);
            drawHeatmap(+this.value);


        });

});