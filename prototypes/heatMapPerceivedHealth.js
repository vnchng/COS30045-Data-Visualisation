console.log("Heatmap perceived health loaded");


d3.csv("../data/clean/perceived_health_status_by_socioeconomic_status.csv")
.then(function(data){


    data.forEach(function(d){

        d.year = +d.year;
        d.value = +d.value;

    });


    var educationCodes = [
        "ISCED11_0T2",
        "ISCED11_3T4",
        "ISCED11_5T8"
    ];


    var selectedYear = 2023;


    var filteredData = data.filter(function(d){

        return d.year === selectedYear &&
            educationCodes.includes(
                d.socioeconomic_status_code
            );

    });


    console.log(filteredData);



    var margin = {
        top:80,
        right:30,
        bottom:120,
        left:150
    };


    var width = 900 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;



    var svg = d3.select("#heatmap")
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
                return d.socioeconomic_status;
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



    var colourScale = d3.scaleSequential()
        .domain([0,100])
        .interpolator(d3.interpolateBlues);



    svg.selectAll("rect")
        .data(filteredData)
        .enter()
        .append("rect")

        .attr("x",function(d){

            return xScale(
                d.socioeconomic_status
            );

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


});