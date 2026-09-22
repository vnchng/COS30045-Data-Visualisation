d3.csv("data/clean/health_expenditure_by_provider_clean.csv").then(function(data) {

    // Convert CSV strings to numbers
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

    // Categories displayed in the stacked chart
    var stackProviders = [
        "HP1",
        "HP2",
        "HP3",
        "HP4",
        "HP5",
        "HP6",
        "HP7",
        "HP8",
        "HP9",
        "OTHER"
    ];

    // Provider names
    var providerNames = {
        "HP1": "Hospitals",
        "HP2": "Residential long-term care",
        "HP3": "Ambulatory healthcare",
        "HP4": "Ancillary services",
        "HP5": "Medical goods",
        "HP6": "Preventive care",
        "HP7": "Administration and financing",
        "HP8": "Rest of economy",
        "HP9": "Rest of world",
        "OTHER": "Other / unallocated"
    };

    // Create tooltip
    var tooltip = d3.select("#tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "white")
        .style("border", "1px solid #999")
        .style("padding", "8px");


    // Draw chart for selected year
    function drawChart(selectedYear) {

        // Remove previous chart
        d3.select("#stackedChart")
            .selectAll("*")
            .remove();


        // Filter to selected year
        var filteredData = data.filter(function(d) {
            return d.year === selectedYear &&
                   mainProviders.includes(d.provider_code);
        });


        // Group provider expenditure by country
        var groupedData = d3.rollups(
            filteredData,
            function(values) {

                var row = {
                    country: values[0].country
                };

                values.forEach(function(d) {
                    row[d.provider_code] = d.expenditure;
                });

                return row;
            },
            function(d) {
                return d.country;
            }
        ).map(function(d) {
            return d[1];
        });


        // Get reported total expenditure for selected year
        var totalData = data.filter(function(d) {
            return d.year === selectedYear &&
                   d.provider_code === "_T";
        });


        // Calculate expenditure not represented by HP1-HP9
        groupedData.forEach(function(d) {

            var totalRecord = totalData.find(function(t) {
                return t.country === d.country;
            });

            var providerSum = d3.sum(mainProviders, function(provider) {
                return d[provider] || 0;
            });

            if (totalRecord) {
                d.OTHER = Math.max(
                    0,
                    +(totalRecord.expenditure - providerSum).toFixed(2)
                );
            } else {
                d.OTHER = 0;
            }
        });


        // Calculate total expenditure for each country
        groupedData.forEach(function(d) {

            d.total = d3.sum(stackProviders, function(provider) {
                return d[provider] || 0;
            });

        });


        // Sort countries from highest to lowest expenditure
        groupedData.sort(function(a, b) {
            return b.total - a.total;
        });


        // Check how many main provider categories each country reports
        /*
        groupedData.forEach(function(d) {

            var providerCount = mainProviders.filter(function(provider) {
                return d[provider] !== undefined;
            }).length;

            console.log(d.country + ": " + providerCount + " of 9 providers");
        });
        */


        // Compare provider sum with reported total
        groupedData.forEach(function(d) {

            var providerCount = mainProviders.filter(function(provider) {
                return d[provider] !== undefined;
            }).length;

            var providerSum = d3.sum(mainProviders, function(provider) {
                return d[provider] || 0;
            });

            var totalRecord = totalData.find(function(t) {
                return t.country === d.country;
            });

            console.log(
                d.country +
                " | Providers: " + providerCount + "/9" +
                " | Provider sum: " + providerSum.toFixed(2) +
                " | Total: " +
                (totalRecord ? totalRecord.expenditure.toFixed(2) : "N/A")
            );

            /*
            // Verifying unallocated value accuracy
            if (d.country === "Chile") {
                console.log("Chile provider sum:", providerSum);
                console.log("Chile reported total:", totalRecord.expenditure);
                console.log("Chile difference:", totalRecord.expenditure - providerSum);
            }
            */
        });


        // Create stacked data using provider categories
        var stack = d3.stack()
            .keys(stackProviders);

        var stackedData = stack(groupedData);


        // Chart dimensions
        var margin = {
            top: 140,
            right: 30,
            bottom: 50,
            left: 120
        };

        var width = 1200 - margin.left - margin.right;
        var height = groupedData.length * 25;


        // Create SVG
        var svg = d3.select("#stackedChart")
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
                "translate(" + margin.left + "," + margin.top + ")"
            );


        // Find the largest total expenditure for the x-axis
        var maxTotal = d3.max(groupedData, function(d) {
            return d3.sum(stackProviders, function(provider) {
                return d[provider] || 0;
            });
        });


        // Scales
        var xScale = d3.scaleLinear()
            .domain([0, Math.ceil(maxTotal / 2) * 2])
            .range([0, width]);

        var yScale = d3.scaleBand()
            .domain(groupedData.map(function(d) {
                return d.country;
            }))
            .range([0, height])
            .padding(0.15);

        var color = d3.scaleOrdinal()
            .domain(stackProviders)
            .range(d3.schemeTableau10);


        // Create legend
        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(-80,-110)");

        var legendItems = legend.selectAll(".legend-item")
            .data(stackProviders)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", function(d, i) {

                var column = i % 5;
                var row = Math.floor(i / 5);

                return "translate(" + (column * 250) + "," + (row * 30) + ")";
            });

        legendItems.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", function(d) {
                return color(d);
            });

        legendItems.append("text")
            .attr("x", 22)
            .attr("y", 12)
            .text(function(d) {
                return providerNames[d];
            });


        // Draw stacked bars
        var providerGroups = svg.selectAll(".provider-group")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("class", "provider-group")
            .attr("fill", function(d) {
                return color(d.key);
            });

        var bars = providerGroups
            .selectAll("rect")
            .data(function(d) {
                return d;
            })
            .enter()
            .append("rect")
            .attr("x", function(d) {
                return xScale(d[0]);
            })
            .attr("y", function(d) {
                return yScale(d.data.country);
            })
            .attr("width", function(d) {
                return xScale(d[1]) - xScale(d[0]);
            })
            .attr("height", yScale.bandwidth());

        // Create percentage labels for expanded bars
        var percentageLabels = svg.append("g")
            .attr("class", "percentage-labels")
            .selectAll("text")
            .data(
                stackedData.flatMap(function(series) {

                    return series.map(function(d) {
                        return {
                            country: d.data.country,
                            provider: series.key,
                            start: d[0],
                            end: d[1],
                            total: d.data.total
                        };
                    });

                })
            )
            .enter()
            .append("text")
            .attr("class", "percentage-label")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style("font-size", "11px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        // Add total expenditure label to each country
        var totalLabels = svg.selectAll(".total-label")
            .data(groupedData)
            .enter()
            .append("text")
            .attr("class", "total-label")
            .attr("x", function(d) {
                return xScale(d.total) + 5;
            })
            .attr("y", function(d) {
                return yScale(d.country) + yScale.bandwidth() / 2;
            })
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "start")
            .style("font-size", "10px")
            .text(function(d) {
                return d.total.toFixed(2) + "%";
            });


        // Hover over a country
        bars.on("mouseover", function(event, d) {

            var hoveredCountry = d.data.country;

            // Expand all provider segments for the hovered country
            providerGroups.selectAll("rect")
                .filter(function(segment) {
                    return segment.data.country === hoveredCountry;
                })
                .transition()
                .duration(400)
                .style("opacity", function(segment) {
                    return segment.data.country === hoveredCountry ? 1 : 0.3;
                })
                .attr("x", function(segment) {

                    var countryTotal = segment.data.total;

                    return (segment[0] / countryTotal) * width;
                })
                .attr("width", function(segment) {

                    var countryTotal = segment.data.total;
                    var segmentValue = segment[1] - segment[0];

                    return (segmentValue / countryTotal) * width;
                });

            // Move total label to the end of the expanded bar
            totalLabels
                .filter(function(label) {
                    return label.country === hoveredCountry;
                })
                .transition()
                .duration(400)
                .attr("x", width + 5);


            // Show percentage labels for hovered country
            percentageLabels
                .filter(function(label) {
                    return label.country === hoveredCountry;
                })
                .attr("x", function(label) {

                    var start = (label.start / label.total) * width;
                    var end = (label.end / label.total) * width;

                    return (start + end) / 2;
                })
                .attr("y", function(label) {
                    return yScale(label.country) + yScale.bandwidth() / 2;
                })
                .text(function(label) {

                    var percentage =
                        ((label.end - label.start) / label.total) * 100;

                    // Don't display invalid or very small percentages
                    if (!isFinite(percentage) || percentage < 5) {
                        return "";
                    }

                    return percentage.toFixed(1) + "%";
                })
                .transition()
                .duration(400)
                .style("opacity", 1);


            // Get provider being hovered
            var providerCode = d3.select(this.parentNode).datum().key;

            var value = d[1] - d[0];

            var percentageOfTotal = (value / d.data.total) * 100;


            // Show tooltip
            tooltip
                .style("visibility", "visible")
                .html(
                    "<strong>" + d.data.country + "</strong><br>" +
                    providerNames[providerCode] + "<br>" +
                    value.toFixed(2) + "% of GDP<br>" +
                    percentageOfTotal.toFixed(1) +
                    "% of healthcare expenditure"
                );
        })


        // Move tooltip with cursor
        .on("mousemove", function(event) {

            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })


        // Return country bar to normal size
        .on("mouseout", function(event, d) {

            var hoveredCountry = d.data.country;

            providerGroups.selectAll("rect")
                .filter(function(segment) {
                    return segment.data.country === hoveredCountry;
                })
                .transition()
                .duration(400)
                .attr("x", function(segment) {
                    return xScale(segment[0]);
                })
                .attr("width", function(segment) {
                    return xScale(segment[1]) - xScale(segment[0]);
                });

                // Return total label to the end of the normal bar
                totalLabels
                    .filter(function(label) {
                        return label.country === hoveredCountry;
                    })
                    .transition()
                    .duration(400)
                    .attr("x", function(label) {
                        return xScale(label.total) + 5;
                    });

                // Hide percentage labels
                percentageLabels
                    .filter(function(label) {
                        return label.country === hoveredCountry;
                    })
                    .transition()
                    .duration(200)
                    .style("opacity", 0);

            tooltip.style("visibility", "hidden");
        });


        // Axes
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScale));


        // X-axis label
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .text("Healthcare expenditure (% of GDP)");

    }


    // Display 2023 initially
    drawChart(2023);


    // Update chart when dropdown changes
    d3.select("#yearSelect")
        .on("change", function() {

            var selectedYear = +this.value;

            drawChart(selectedYear);
        });

});