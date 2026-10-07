// Dimensions
var margin = {
    top: 40,
    right: 30,
    bottom: 80,
    left: 70
};

var width = 800 - margin.left - margin.right;
var height = 450 - margin.top - margin.bottom;


// Countries used for prototype
var selectedCountries = [
    "Australia",
    "Germany",
    "Portugal",
    "United States"
];


// Provider categories used for prototype
var selectedProviders = [
    "HP1",
    "HP2",
    "HP3",
    "HP4",
    "HP5"
];


// Create SVG
var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr(
        "transform",
        "translate(" + margin.left + "," + margin.top + ")"
    );


// Load cleaned dataset
d3.csv(
    "../../data/clean/health_expenditure_by_provider_clean.csv"
).then(function(data) {

    // Convert expenditure to number
    data.forEach(function(d) {
        d.expenditure = +d.expenditure;
    });


    // Filter to 2023 and selected countries/providers
    var filteredData = data.filter(function(d) {

        return +d.year === 2023 &&
            selectedCountries.includes(d.country) &&
            selectedProviders.includes(d.provider_code);

    });


    // Group data by country
    var groupedData = d3.rollups(
        filteredData,

        function(values) {

            var result = {
                country: values[0].country
            };

            values.forEach(function(d) {
                result[d.provider_code] = d.expenditure;
            });

            return result;
        },

        function(d) {
            return d.country;
        }
    );


    // Extract grouped objects
    groupedData = groupedData.map(function(d) {
        return d[1];
    });


    console.log(groupedData);


    // Outer scale - countries
    var x0 = d3.scaleBand()
        .domain(selectedCountries)
        .range([0, width])
        .padding(0.2);


    // Inner scale - provider bars
    var x1 = d3.scaleBand()
        .domain(selectedProviders)
        .range([0, x0.bandwidth()])
        .padding(0.05);


    // Find maximum expenditure
    var maxValue = d3.max(
        groupedData,
        function(country) {

            return d3.max(
                selectedProviders,
                function(provider) {
                    return country[provider] || 0;
                }
            );

        }
    );


    // Y scale
    var yScale = d3.scaleLinear()
        .domain([0, maxValue])
        .nice()
        .range([height, 0]);


    // Colour scale
    var color = d3.scaleOrdinal()
        .domain(selectedProviders)
        .range(d3.schemeTableau10);


    // Create country groups
    var countryGroups = svg.selectAll(".country")
        .data(groupedData)
        .enter()
        .append("g")
        .attr("class", "country")
        .attr("transform", function(d) {
            return "translate(" + x0(d.country) + ",0)";
        });


    // Create bars
    countryGroups.selectAll("rect")
        .data(function(d) {

            return selectedProviders.map(function(provider) {

                return {
                    provider: provider,
                    value: d[provider] || 0
                };

            });

        })
        .enter()
        .append("rect")
        .attr("x", function(d) {
            return x1(d.provider);
        })
        .attr("y", function(d) {
            return yScale(d.value);
        })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) {
            return height - yScale(d.value);
        })
        .attr("fill", function(d) {
            return color(d.provider);
        });


    // X axis
    svg.append("g")
        .attr(
            "transform",
            "translate(0," + height + ")"
        )
        .call(d3.axisBottom(x0));


    // Y axis
    svg.append("g")
        .call(d3.axisLeft(yScale));


    // Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Healthcare expenditure (% of GDP)");


    // Legend
    var legend = svg.selectAll(".legend")
        .data(selectedProviders)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr(
            "transform",
            function(d, i) {
                return "translate(" + (i * 100) + ",-25)";
            }
        );


    legend.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", function(d) {
            return color(d);
        });


    legend.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .text(function(d) {
            return d;
        });
});