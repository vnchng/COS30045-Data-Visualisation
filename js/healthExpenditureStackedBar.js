d3.csv("data/clean/health_expenditure_by_provider_clean.csv").then(function(data) {

    // ----------------------------------------------------
    // PREPARE DATA
    // ----------------------------------------------------

    // Convert CSV strings to numbers
    data.forEach(function(d) {
        d.year = +d.year;
        d.expenditure = +d.expenditure;
    });


    // Get unique countries from dataset
    var countries = Array.from(
        new Set(
            data.map(function(d) {
                return d.country;
            })
        )
    ).sort();


    // Countries displayed by default
    var selectedCountries = new Set([
        "Australia",
        "Germany",
        "United Kingdom",
        "United States"
    ]);


    // ----------------------------------------------------
    // COUNTRY FILTER
    // ----------------------------------------------------

    // Create country checkboxes
    var countryOptions = d3.select("#countryButtons")
        .selectAll("label")
        .data(countries)
        .enter()
        .append("label")
        .attr("class", "country-option");


    // Add checkbox
    countryOptions.append("input")
        .attr("type", "checkbox")
        .attr("value", function(d) {
            return d;
        })
        .property("checked", function(d) {
            return selectedCountries.has(d);
        })
        .on("change", function(event, country) {

            if (this.checked) {
                selectedCountries.add(country);
            } else {
                selectedCountries.delete(country);
            }

            updateSelectedCountries();
            drawChart(selectedYear);
        });


    // Add country name beside checkbox
    countryOptions.append("span")
        .text(function(d) {
            return d;
        });


    // Update selected country labels
    function updateSelectedCountries() {

        var selected = Array.from(selectedCountries);

        var container = d3.select("#selectedCountries");


        // Remove old labels
        container.selectAll("*").remove();


        // Add current selected countries
        container.selectAll("span")
            .data(selected)
            .enter()
            .append("span")
            .attr("class", "selected-country")
            .text(function(d) {
                return d;
            });
    }


    // Display default selected countries
    updateSelectedCountries();


    // Open / close country dropdown
    d3.select("#countryDropdown")
        .on("click", function() {

            var menu = d3.select("#countryMenu");

            menu.classed(
                "show",
                !menu.classed("show")
            );
        });


    // ----------------------------------------------------
    // PROVIDER CATEGORIES
    // ----------------------------------------------------

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


    // Categories displayed in chart
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


    // Full provider names
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


    // ----------------------------------------------------
    // TOOLTIP
    // ----------------------------------------------------

    var tooltip = d3.select("#tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "white")
        .style("border", "1px solid #999")
        .style("padding", "8px")
        .style("pointer-events", "none");


    // ----------------------------------------------------
    // DRAW CHART
    // ----------------------------------------------------

    function drawChart(selectedYear) {

        // Remove previous chart
        d3.select("#stackedChart")
            .selectAll("*")
            .remove();


        // Stop if no countries are selected
        if (selectedCountries.size === 0) {

            d3.select("#stackedChart")
                .append("p")
                .text(
                    "Select at least one country to display the chart."
                );

            return;
        }


        // ------------------------------------------------
        // FILTER DATA
        // ------------------------------------------------

        var filteredData = data.filter(function(d) {

            return (
                d.year === selectedYear &&
                mainProviders.includes(d.provider_code) &&
                selectedCountries.has(d.country)
            );

        });


        // ------------------------------------------------
        // GROUP DATA BY COUNTRY
        // ------------------------------------------------

        var groupedData = d3.rollups(

            filteredData,

            function(values) {

                var row = {
                    country: values[0].country
                };


                // Give every provider an initial value of 0
                mainProviders.forEach(function(provider) {
                    row[provider] = 0;
                });


                // Replace 0 with actual expenditure
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


        // ------------------------------------------------
        // GET TOTAL HEALTH EXPENDITURE
        // ------------------------------------------------

        var totalData = data.filter(function(d) {

            return (
                d.year === selectedYear &&
                d.provider_code === "_T"
            );

        });


        // ------------------------------------------------
        // CALCULATE OTHER / UNALLOCATED
        // ------------------------------------------------

        groupedData.forEach(function(d) {

            var totalRecord = totalData.find(function(t) {
                return t.country === d.country;
            });


            var providerSum = d3.sum(
                mainProviders,
                function(provider) {
                    return d[provider] || 0;
                }
            );


            if (totalRecord) {

                d.OTHER = Math.max(
                    0,
                    +(
                        totalRecord.expenditure -
                        providerSum
                    ).toFixed(2)
                );

            } else {

                d.OTHER = 0;
            }
        });


        // ------------------------------------------------
        // CALCULATE COUNTRY TOTALS
        // ------------------------------------------------

        groupedData.forEach(function(d) {

            d.total = d3.sum(
                stackProviders,
                function(provider) {
                    return d[provider] || 0;
                }
            );
        });


        // Sort highest expenditure first
        groupedData.sort(function(a, b) {
            return b.total - a.total;
        });


        // Stop if there is no data for this year
        if (groupedData.length === 0) {

            d3.select("#stackedChart")
                .append("p")
                .text(
                    "No data is available for the selected countries and year."
                );

            return;
        }


        // ------------------------------------------------
        // CREATE STACK
        // ------------------------------------------------

        var stack = d3.stack()
            .keys(stackProviders);


        var stackedData = stack(groupedData);


        // ------------------------------------------------
        // CHART DIMENSIONS
        // ------------------------------------------------

        var margin = {
            top: 140,
            right: 40,
            bottom: 50,
            left: 120
        };


        var width =
            1200 -
            margin.left -
            margin.right;


        var height =
            groupedData.length * 35;


        // ------------------------------------------------
        // CREATE SVG
        // ------------------------------------------------

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
            .append("g")
            .attr(
                "transform",
                "translate(" +
                margin.left +
                "," +
                margin.top +
                ")"
            );


        // ------------------------------------------------
        // SCALES
        // ------------------------------------------------

        var maxTotal = d3.max(
            groupedData,
            function(d) {
                return d.total;
            }
        );


        var xScale = d3.scaleLinear()
            .domain([
                0,
                Math.ceil(maxTotal / 2) * 2
            ])
            .range([0, width]);


        var yScale = d3.scaleBand()
            .domain(
                groupedData.map(function(d) {
                    return d.country;
                })
            )
            .range([0, height])
            .padding(0.20);


        var color = d3.scaleOrdinal()
            .domain(stackProviders)
            .range(d3.schemeTableau10);


        // ------------------------------------------------
        // LEGEND
        // ------------------------------------------------

        var legend = svg.append("g")
            .attr("class", "legend")
            .attr(
                "transform",
                "translate(-80,-110)"
            );


        var legendItems = legend
            .selectAll(".legend-item")
            .data(stackProviders)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr(
                "transform",
                function(d, i) {

                    var column = i % 5;
                    var row = Math.floor(i / 5);

                    return (
                        "translate(" +
                        (column * 250) +
                        "," +
                        (row * 30) +
                        ")"
                    );
                }
            );


        legendItems.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", function(d) {
                return color(d);
            });


        legendItems.append("text")
            .attr("x", 22)
            .attr("y", 12)
            .style("font-size", "12px")
            .text(function(d) {
                return providerNames[d];
            });


        // ------------------------------------------------
        // DRAW STACKED BARS
        // ------------------------------------------------

        var providerGroups = svg
            .selectAll(".provider-group")
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
            .attr("class", "provider-bar")
            .attr("x", function(d) {
                return xScale(d[0]);
            })
            .attr("y", function(d) {
                return yScale(d.data.country);
            })
            .attr("width", function(d) {
                return (
                    xScale(d[1]) -
                    xScale(d[0])
                );
            })
            .attr(
                "height",
                yScale.bandwidth()
            );


        // ------------------------------------------------
        // PERCENTAGE LABELS
        // ------------------------------------------------

        var percentageData = [];


        stackedData.forEach(function(series) {

            series.forEach(function(d) {

                percentageData.push({
                    country: d.data.country,
                    provider: series.key,
                    start: d[0],
                    end: d[1],
                    total: d.data.total
                });

            });
        });


        var percentageLabels = svg
            .append("g")
            .attr("class", "percentage-labels")
            .selectAll("text")
            .data(percentageData)
            .enter()
            .append("text")
            .attr("class", "percentage-label")
            .attr("text-anchor", "middle")
            .attr(
                "dominant-baseline",
                "middle"
            )
            .style("font-size", "11px")
            .style(
                "pointer-events",
                "none"
            )
            .style("opacity", 0);


        // ------------------------------------------------
        // TOTAL LABELS
        // ------------------------------------------------

        var totalLabels = svg
            .selectAll(".total-label")
            .data(groupedData)
            .enter()
            .append("text")
            .attr("class", "total-label")
            .attr("x", function(d) {
                return xScale(d.total) + 5;
            })
            .attr("y", function(d) {

                return (
                    yScale(d.country) +
                    yScale.bandwidth() / 2
                );

            })
            .attr(
                "dominant-baseline",
                "middle"
            )
            .attr(
                "text-anchor",
                "start"
            )
            .style("font-size", "10px")
            .style(
                "pointer-events",
                "none"
            )
            .text(function(d) {
                return d.total.toFixed(2) + "%";
            });


        // ------------------------------------------------
        // HOVER VARIABLES
        // ------------------------------------------------

        // Small delay before collapsing a bar
        var leaveTimer = null;


        // Country that is currently expanded
        var activeCountry = null;


        // ------------------------------------------------
        // RESET ONE COUNTRY
        // ------------------------------------------------

        function resetCountry(country) {

            // Return the country's provider segments
            // to their normal GDP positions
            providerGroups
                .selectAll("rect")
                .filter(function(segment) {

                    return (
                        segment.data.country ===
                        country
                    );

                })
                .interrupt()
                .attr("x", function(segment) {
                    return xScale(segment[0]);
                })
                .attr("width", function(segment) {

                    return (
                        xScale(segment[1]) -
                        xScale(segment[0])
                    );

                });


            // Return total label to normal position
            totalLabels
                .filter(function(label) {
                    return label.country === country;
                })
                .interrupt()
                .attr("x", function(label) {
                    return xScale(label.total) + 5;
                });


            // Hide percentage labels
            percentageLabels
                .filter(function(label) {
                    return label.country === country;
                })
                .interrupt()
                .style("opacity", 0);
        }


        // ------------------------------------------------
        // EXPAND COUNTRY
        // ------------------------------------------------

        function expandCountry(country) {

            // Cancel pending collapse
            if (leaveTimer !== null) {
                clearTimeout(leaveTimer);
                leaveTimer = null;
            }


            // If another country is expanded,
            // reset it before expanding the new one
            if (
                activeCountry !== null &&
                activeCountry !== country
            ) {

                resetCountry(activeCountry);
            }


            // Update active country
            activeCountry = country;


            // Fade other countries
            providerGroups
                .selectAll("rect")
                .interrupt()
                .style(
                    "opacity",
                    function(segment) {

                        if (
                            segment.data.country ===
                            country
                        ) {
                            return 1;
                        }

                        return 0.3;
                    }
                );


            // Expand selected country to 100%
            providerGroups
                .selectAll("rect")
                .filter(function(segment) {

                    return (
                        segment.data.country ===
                        country
                    );

                })
                .interrupt()
                .transition()
                .duration(300)
                .attr(
                    "x",
                    function(segment) {

                        var total =
                            segment.data.total;

                        return (
                            segment[0] /
                            total
                        ) * width;
                    }
                )
                .attr(
                    "width",
                    function(segment) {

                        var total =
                            segment.data.total;

                        var value =
                            segment[1] -
                            segment[0];

                        return (
                            value /
                            total
                        ) * width;
                    }
                );


            // Move total label to end
            totalLabels
                .filter(function(label) {
                    return label.country === country;
                })
                .interrupt()
                .transition()
                .duration(300)
                .attr("x", width + 5);


            // Show percentage labels
            percentageLabels
                .filter(function(label) {
                    return label.country === country;
                })
                .attr(
                    "x",
                    function(label) {

                        var start =
                            (
                                label.start /
                                label.total
                            ) * width;

                        var end =
                            (
                                label.end /
                                label.total
                            ) * width;

                        return (
                            start + end
                        ) / 2;
                    }
                )
                .attr(
                    "y",
                    function(label) {

                        return (
                            yScale(label.country) +
                            yScale.bandwidth() / 2
                        );

                    }
                )
                .text(function(label) {

                    var percentage =
                        (
                            (
                                label.end -
                                label.start
                            ) /
                            label.total
                        ) * 100;


                    // Hide labels that are too small
                    if (
                        !isFinite(percentage) ||
                        percentage < 5
                    ) {
                        return "";
                    }


                    return (
                        percentage.toFixed(1) +
                        "%"
                    );
                })
                .interrupt()
                .transition()
                .duration(300)
                .style("opacity", 1);
        }


        // ------------------------------------------------
        // COLLAPSE ACTIVE COUNTRY
        // ------------------------------------------------

        function collapseCountry(country) {

            resetCountry(country);


            // Restore opacity
            providerGroups
                .selectAll("rect")
                .interrupt()
                .transition()
                .duration(200)
                .style("opacity", 1);


            // Hide tooltip
            tooltip.style(
                "visibility",
                "hidden"
            );


            activeCountry = null;
        }


        // ------------------------------------------------
        // BAR HOVER
        // ------------------------------------------------

        bars
            .on(
                "mouseenter",
                function(event, d) {

                    var country =
                        d.data.country;


                    // Cancel pending mouseleave
                    if (leaveTimer !== null) {

                        clearTimeout(leaveTimer);

                        leaveTimer = null;
                    }


                    // Expand only if necessary
                    if (
                        activeCountry !== country
                    ) {

                        expandCountry(country);
                    }


                    // Find provider code from
                    // the parent provider group
                    var providerCode =
                        d3.select(this.parentNode)
                            .datum()
                            .key;


                    // Provider expenditure value
                    var value =
                        d[1] - d[0];


                    // Percentage of total health expenditure
                    var percentageOfTotal =
                        (
                            value /
                            d.data.total
                        ) * 100;


                    // Display tooltip
                    tooltip
                        .style(
                            "visibility",
                            "visible"
                        )
                        .style(
                            "left",
                            (event.pageX + 10) +
                            "px"
                        )
                        .style(
                            "top",
                            (event.pageY + 10) +
                            "px"
                        )
                        .html(
                            "<strong>" +
                            d.data.country +
                            "</strong><br>" +

                            providerNames[
                                providerCode
                            ] +
                            "<br>" +

                            value.toFixed(2) +
                            "% of GDP<br>" +

                            percentageOfTotal
                                .toFixed(1) +
                            "% of healthcare expenditure"
                        );
                }
            )


            // Move tooltip with cursor
            .on(
                "mousemove",
                function(event) {

                    tooltip
                        .style(
                            "left",
                            (event.pageX + 10) +
                            "px"
                        )
                        .style(
                            "top",
                            (event.pageY + 10) +
                            "px"
                        );
                }
            )


            // Delay collapse slightly so the user
            // can move between provider segments
            .on(
                "mouseleave",
                function(event, d) {

                    var country =
                        d.data.country;


                    if (leaveTimer !== null) {
                        clearTimeout(leaveTimer);
                    }


                    leaveTimer =
                        setTimeout(
                            function() {

                                if (
                                    activeCountry ===
                                    country
                                ) {

                                    collapseCountry(
                                        country
                                    );
                                }

                            },
                            250
                        );
                }
            );


        // ------------------------------------------------
        // AXES
        // ------------------------------------------------

        svg.append("g")
            .attr(
                "transform",
                "translate(0," +
                height +
                ")"
            )
            .call(
                d3.axisBottom(xScale)
            );


        svg.append("g")
            .call(
                d3.axisLeft(yScale)
            );


        // ------------------------------------------------
        // X AXIS LABEL
        // ------------------------------------------------

        svg.append("text")
            .attr(
                "class",
                "x-axis-label"
            )
            .attr(
                "x",
                width / 2
            )
            .attr(
                "y",
                height + 40
            )
            .attr(
                "text-anchor",
                "middle"
            )
            .text(
                "Healthcare expenditure (% of GDP)"
            );
    }


    // ----------------------------------------------------
    // YEAR SELECTION
    // ----------------------------------------------------

    // Default year
    var selectedYear = 2023;


    // Draw initial chart
    drawChart(selectedYear);


    // Redraw chart when year changes
    d3.select("#yearSelect")
        .on("change", function() {

            selectedYear = +this.value;

            drawChart(selectedYear);
        });

});