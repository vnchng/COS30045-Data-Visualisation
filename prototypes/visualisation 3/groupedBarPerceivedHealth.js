console.log("Grouped bar perceived health loaded");


d3.csv("../../data/clean/perceived_health_status_by_socioeconomic_status.csv")
.then(function(data) {


    // Convert data types
    data.forEach(function(d){

        d.year = +d.year;
        d.value = +d.value;

    });

    // Get available years from dataset
    var years = [
        ...new Set(
            data.map(function(d){
                return d.year;
            })
        )
    ].sort();

    d3.select("#educationYearSelect")
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

    // Education categories only
    var educationCodes = [
        "ISCED11_0T2",
        "ISCED11_3T4",
        "ISCED11_5T8"
    ];

    //var selectedYear = 2023;

    
    function drawChart(selectedYear){

        // Clear previous chart
        d3.select("#groupedChart")
            .selectAll("*")
            .remove();

        var filteredData = data.filter(function(d){

            return d.year === selectedYear &&
                educationCodes.includes(
                    d.socioeconomic_status_code
                );

        });



        console.log("Filtered data:", filteredData);



        if(filteredData.length === 0){

            console.log("No data available");

            return;

        }



        // Education display names
        var educationNames = {

            "ISCED11_0T2":
                "Lower education",

            "ISCED11_3T4":
                "Upper secondary",

            "ISCED11_5T8":
                "Tertiary education"

        };



        // Replace codes with readable names
        filteredData.forEach(function(d){

            d.education =
                educationNames[
                    d.socioeconomic_status_code
                ];

        });



        // Dimensions

        var margin = {

            top: 50,
            right: 30,
            bottom: 120,
            left: 80

        };

        var width = 1000 - margin.left - margin.right;
        var height = 550 - margin.top - margin.bottom;

        // SVG

        var svg = d3.select("#groupedChart")

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
                "translate(" +
                margin.left +
                "," +
                margin.top +
                ")"
            );



        // Countries

        var countries = [
            ...new Set(
                filteredData.map(function(d){

                    return d.country;

                })
            )
        ];



        // Education levels

        var educationLevels = [
            ...new Set(
                filteredData.map(function(d){

                    return d.education;

                })
            )
        ];



        console.log("Countries:", countries);
        console.log("Education:", educationLevels);



        // Outer x scale - countries

        var xScale = d3.scaleBand()

            .domain(countries)

            .range([0,width])

            .padding(0.2);



        // Inner x scale - education groups

        var xSubScale = d3.scaleBand()

            .domain(educationLevels)

            .range([0,xScale.bandwidth()])

            .padding(0.05);



        // Y scale

        var yScale = d3.scaleLinear()

            .domain([

                0,

                d3.max(filteredData,function(d){

                    return d.value;

                })

            ])

            .range([height,0]);



        // Colour scale

        var colour = d3.scaleOrdinal()

            .domain(educationLevels)

            .range([
                "#8dd3c7",
                "#80b1d3",
                "#bebada"
            ]);



        // Draw bars

        svg.selectAll("rect")

            .data(filteredData)

            .enter()

            .append("rect")

            .attr(
                "x",
                function(d){

                    return (
                        xScale(d.country)
                        +
                        xSubScale(d.education)
                    );

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
                xSubScale.bandwidth()
            )

            .attr(
                "height",
                function(d){

                    return height - yScale(d.value);

                }
            )

            .attr(
                "fill",
                function(d){

                    return colour(d.education);

                }
            )

            // design iteration

            .on("mouseover",function(event,d){

            tooltip
                .style(
                    "visibility",
                    "visible"
                )
                .html(
                    "Country: "
                    + d.country
                    +
                    "<br>"
                    +
                    "Education: "
                    +
                    d.education
                    +
                    "<br>"
                    +
                    "Health: "
                    +
                    d.value
                    +
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


        // X axis

        svg.append("g")

            .attr(
                "transform",
                "translate(0," + height + ")"
            )

            .call(
                d3.axisBottom(xScale)
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



        // Y axis

        svg.append("g")

            .call(
                d3.axisLeft(yScale)
            );



        // Y axis label

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
                -55
            )

            .attr(
                "text-anchor",
                "middle"
            )

            .text(
                "Percentage reporting good/very good health (%)"
            );



        // Legend

        var legend = svg.append("g")

            .attr(
                "transform",
                "translate(0,-30)"
            );


        educationLevels.forEach(function(level, i){

            legend.append("rect")

                .attr(
                    "x",
                    i * 180
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
                    colour(level)
                );


            legend.append("text")

                .attr(
                    "x",
                    i * 180 + 22
                )

                .attr(
                    "y",
                    12
                )

                .text(level);

        });
    }

    drawChart(2023); // Calling function with the selected year

    d3.select("#educationYearSelect")
    .on("change", function(){

        var selectedYear = +this.value;

        drawChart(selectedYear);

    });

});