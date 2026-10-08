console.log("Grouped bar coverage loaded");


d3.csv("../../data/clean/health_expenditure_coverage_clean.csv")
.then(function(data){


    data.forEach(function(d){

        d.year = +d.year;
        d.expenditure = +d.expenditure;
        d.coverage = +d.coverage;

    });


    var selectedYear = 2023;


    var filteredData = data.filter(function(d){

        return d.year === selectedYear;

    });


    // Limit countries for prototype readability
    filteredData = filteredData.slice(0,10);



    var margin = {

        top:40,
        right:30,
        bottom:120,
        left:70

    };


    var width = 900 - margin.left - margin.right;

    var height = 500 - margin.top - margin.bottom;



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


});