console.log("Perceived health education chart loaded");

d3.csv("data/clean/perceived_health_status_by_socioeconomic_status.csv")
.then(function(data) {

    // Convert numerical fields
    data.forEach(function(d) {
        d.year = +d.year;
        d.value = +d.value;
    });

    var margin = {
        top: 40,
        right: 30,
        bottom: 150,
        left: 80
    };

    var width = 900 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    function drawChart(selectedYear) {
        console.log("Drawing year:", selectedYear);

        // Clear previous chart
        //d3.select("#educationChart")
            //.selectAll("*")
            //.remove();


    var educationCodes = [
        "ISCED11_0T2",
        "ISCED11_3T4",
        "ISCED11_5T8"
    ];

    var filteredData = data.filter(function(d){

        return d.year === selectedYear &&
            educationCodes.includes(
                    d.socioeconomic_status_code
            );

    });
    console.log(filteredData);
        // Filter selected year + education categories only
       // var filteredData = data.filter(function(d) {

         //   return d.year === selectedYear &&
           //     d.socioeconomic_status &&
           //     (
            //        d.socioeconomic_status.includes("Pre-primary") ||
            //        d.socioeconomic_status.includes("Upper secondary") ||
            //        d.socioeconomic_status.includes("Tertiary")
            //    );

       // });

        console.log("Filtered rows:", filteredData.length);

        console.log(
            [...new Set(
                data.map(function(d){
                    return d.socioeconomic_status;
                })
            )]
        );


        if (filteredData.length === 0) {

            console.log("No data available for this year");

            return;

        }



        // SVG
        var svg = d3.select("#educationChart")
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

        // Education categories
        var educationLevels = [
            ...new Set(
                filteredData.map(function(d) {
                    return d.socioeconomic_status;
                })
            )
        ];

        console.log("Education levels:", educationLevels);

        // X scale
        var xScale = d3.scaleBand()

            .domain(educationLevels)
            .range([0, width])
            .padding(0.2);

        // Y scale
        var yScale = d3.scaleLinear()

            .domain([
                0,
                d3.max(filteredData,function(d){
                    return d.value;
                })
            ])

            .range([height,0]);

        // Bars
        svg.selectAll("rect")

            .data(filteredData)
            .enter()
            .append("rect")
            .attr("x",function(d){
                return xScale(d.socioeconomic_status);
            })

            .attr("y",function(d){
                return yScale(d.value);
            })

            .attr("width",xScale.bandwidth())
            .attr("height",function(d){
                return height - yScale(d.value);
            })

            .attr("fill","steelblue");

        // X axis
        svg.append("g")

            .attr(
                "transform",
                "translate(0," + height + ")"
            )

            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform","rotate(-45)")
            .style("text-anchor","end");

        // Y axis
        svg.append("g")
            .call(d3.axisLeft(yScale));

    }

    // Initial display
    drawChart(2023);

    // Year dropdown
    d3.select("#educationYearSelect")

        .on("change",function(){

            var selectedYear = +this.value;
            drawChart(selectedYear);

        });
});