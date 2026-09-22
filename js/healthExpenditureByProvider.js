d3.csv("data/clean/health_expenditure_by_provider_clean.csv").then(function(data) {

    // Convert numerical values from strings to numbers
    data.forEach(function(d) {
        d.year = +d.year;
        d.expenditure = +d.expenditure;
    });

    // Main healthcare provider categories
    var mainProviders = [
        "HP1",
        "HP2",
        "HP3",
        "HP4",
        "HP5",
        "HP6",
        "HP7",
        "HP8",
        "HP9"
    ];

    // Filter data for the first prototype
    var filteredData = data.filter(function(d) {
        return d.country === "Australia" &&
            d.year === 2023 &&
            mainProviders.includes(d.provider_code);
    });

    // Sort from highest to lowest expenditure
    filteredData.sort(function(a, b) {
        return b.expenditure - a.expenditure;
    });

    console.log(filteredData);

    // Create tooltip
    var tooltip = d3.select("#tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "white")
        .style("border", "1px solid black")
        .style("padding", "8px");

    // Chart dimensions
    var margin = {
        top: 20,
        right: 30,
        bottom: 50,
        left: 300
    };

    var width = 900 - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;


    // Create SVG
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")"
        );


    // X scale - expenditure
    var xScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, function(d) {
            return d.expenditure;
        }) * 1.1])
        .range([0, width]);


    // Y scale - healthcare providers
    var yScale = d3.scaleBand()
        .domain(filteredData.map(function(d) {
            return d.provider;
        }))
        .range([0, height])
        .padding(0.2);

    // X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Healthcare expenditure (% of GDP)");


    // Draw bars
    svg.selectAll("rect")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d) {
            return yScale(d.provider);
        })
        .attr("width", function(d) {
            return xScale(d.expenditure);
        })
        .attr("height", yScale.bandwidth())

        // Show tooltip when hovering over a bar
        .on("mouseover", function(event, d) {
            tooltip
                .style("visibility", "visible")
                .html(
                    "<strong>" + d.provider + "</strong><br>" +
                    "Expenditure: " + d.expenditure.toFixed(2) + "% of GDP"
                );
        })

        // Move tooltip with the mouse
        .on("mousemove", function(event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })

        // Hide tooltip when mouse leaves the bar
        .on("mouseout", function() {
            tooltip
                .style("visibility", "hidden");
        });

    // Add expenditure value labels
    svg.selectAll(".value-label")
        .data(filteredData)
        .enter()
        .append("text")
        .attr("class", "value-label")
        .attr("x", function(d) {
            return xScale(d.expenditure) + 5;
        })
        .attr("y", function(d) {
            return yScale(d.provider) + yScale.bandwidth() / 2;
        })
        .attr("dy", "0.35em")
        .text(function(d) {
            return d.expenditure.toFixed(2) + "%";
        });


    // X axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));


    // Y axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

});