console.log("Bar chart perceived health loaded");


d3.csv("../../data/clean/perceived_health_status_by_socioeconomic_status.csv")
.then(function(data){


    console.log(data);


    data.forEach(function(d){

        d.year = +d.year;
        d.value = +d.value;

    });

    // Create country list
    var countries = [
        ...new Set(
            data.map(function(d){
                return d.country;
            })
        )
    ].sort();


    // Populate country dropdown
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


    // Default country
    d3.select("#countrySelect")
        .property(
            "value",
            "Australia"
        );

    //dynamic dropdown
    var years = [
        ...new Set(
            data.map(function(d){
                return d.year;
            })
        )
    ].sort();


    d3.select("#barYearSelect")
        .selectAll("option")
        .data(years)
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


    d3.select("#barYearSelect")
        .property("value",2022);


    // Education categories only

    var educationCodes = [
        "ISCED11_0T2",
        "ISCED11_3T4",
        "ISCED11_5T8"
    ];


    //var selectedYear = 2023;
    //no data for Australia in 2023 onwards, so 2022 new default


    function drawChart(selectedYear){

        d3.select("#chart")
            .selectAll("*")
            .remove();

        console.log(
            [...new Set(
                data.map(function(d){
                    return d.country;
                })
            )]
        );

        var selectedCountry =
            d3.select("#countrySelect")
                .property("value");

        var filteredData = data.filter(function(d){

            return d.year === selectedYear &&
                d.country === selectedCountry &&
                educationCodes.includes(
                    d.socioeconomic_status_code
                );

        });

        //console.log(filteredData);
        console.log(
            "Selected year:",
            selectedYear
        );

        console.log(
            "Filtered rows:",
            filteredData
        );


        var margin = {
            top:40,
            right:30,
            bottom:150,
            left:80
        };


        var width = 900 - margin.left - margin.right;

        var height = 500 - margin.top - margin.bottom;

        // Tooltip setup
        var tooltip = d3.select("#tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "white")
            .style("border", "1px solid black")
            .style("padding", "8px");

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


        //var educationLevels =
            //filteredData.map(function(d){

                //return d.socioeconomic_status;

            //});
        
        var educationNames = {

            "ISCED11_0T2":
                "Lower education",

            "ISCED11_3T4":
                "Upper secondary",

            "ISCED11_5T8":
                "Tertiary education"

        };

        //var educationLevels =
        //filteredData.map(function(d){

            //return educationNames[
                //d.socioeconomic_status_code
            //];

        //});

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

            .padding(0.2);



        var yScale = d3.scaleLinear()

            .domain([
                0,
                d3.max(filteredData,function(d){

                    return d.value;

                })
            ])

            .range([height,0]);



        svg.selectAll("rect")

            .data(filteredData)
            .enter()
            .append("rect")

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

                        "<strong>" +
                        d.country +
                        "</strong><br>" +

                        "Education: " +
                        educationNames[
                            d.socioeconomic_status_code
                        ]
                        +
                        "<br>" +

                        "Good/very good health: " +
                        d.value +
                        "%"

                    );

            })

            // highlight over hover
            .on("mouseenter",function(){

                d3.select(this)
                    .style(
                        "stroke",
                        "black"
                    )
                    .style(
                        "stroke-width",
                        2
                    );

            })


            .on("mouseleave",function(){

                d3.select(this)
                    .style(
                        "stroke",
                        "white"
                    )
                    .style(
                        "stroke-width",
                        1
                    );

            })



            .on("mousemove",function(event){

                tooltip

                    .style(
                        "left",
                        (event.pageX + 10) + "px"
                    )

                    .style(
                        "top",
                        (event.pageY + 10) + "px"
                    );

            })


            .on("mouseout",function(){

                tooltip
                    .style(
                        "visibility",
                        "hidden"
                    );

            })

            .attr("x",function(d){

                return xScale(
                    educationNames[d.socioeconomic_status_code]
                );

            })


            .attr("y",function(d){

                return yScale(d.value);

            })

            .attr(
                "width",
                xScale.bandwidth()
            )

            .attr("height",function(d){

                return height-yScale(d.value);

            });

        svg.append("g")

            .attr(
                "transform",
                "translate(0," + height + ")"
            )

            .call(
                d3.axisBottom(xScale)
            )

            .selectAll("text")

            //.attr(
                //"transform",
                //"rotate(-45)"
            //)

            .style(
                "text-anchor",
                //"end" - instead going for:
                "middle"
            );



        svg.append("g")
            .call(
                d3.axisLeft(yScale)
            );
        
        // y-axis label
        svg.append("text")

        .attr(
            "transform",
            "rotate(-90)"
        )

        .attr(
            "x",
            -height / 2
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
            "Percentage reporting good/very good health (%)"
        );

    }

    drawChart(2022);

    d3.select("#barYearSelect")
        .on("change", function() {
            drawChart(+this.value);
        });

    d3.select("#countrySelect")
    .on("change", function(){

        var selectedYear =
            +d3.select("#barYearSelect")
                .property("value");

        drawChart(selectedYear);

    });


});