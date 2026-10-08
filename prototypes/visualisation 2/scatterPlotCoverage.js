console.log("Scatter plot coverage loaded");


d3.csv("../../data/clean/health_expenditure_and_coverage_combined.csv")
.then(function(data){
    var selectedCountries = new Set();

        //selected countries show up as buttons/labels
        function updateSelectedCountryButtons(){

        var container =
            d3.select("#selectedCountries");
        container
            .selectAll("*")
            .remove();

        selectedCountries.forEach(function(country){
            container
                .append("button")
                .attr("class","selected-country")
                .text(country)
                .on("click",function(){
                    selectedCountries.delete(country);
                    updateSelectedCountryButtons();
                    updateDotColors();
                });
        });
    }

    function updateDotColors(){

        d3.selectAll(".dot")
            .attr("fill", function(point){

                if(selectedCountries.has(point.country)){
                    return "#d62728";
                }
                return "steelblue";
            });
    }

    data.forEach(function(d){
            d.year = +d.year; // converting string incase this is causing the issues w graph
        d.expenditure = +d.expenditure;
        d.coverage = +d.coverage;
    });

    //protecting graph incase N/A values are present later
    data = data.filter(function(d){
        return !isNaN(d.expenditure) &&
            !isNaN(d.coverage);
    });

    var years = [
        ...new Set(
            data.map(function(d){
                return d.year;
            })
        )
    ].sort();

    // design feature; dropdown country selection (second option to just clicking on the graph too)
    var countries = [
        ...new Set(
            data.map(function(d){
                return d.country;
            })
        )
    ].sort();

    //default text instead of first country option; looks confusing, as if already selected
    d3.select("#countrySelect")
    .append("option")
    .attr("value","")
    .text("X");

    d3.select("#countrySelect")
        .selectAll("option.country-option")
        .data(countries)
        .enter()
        .append("option")
        .attr("value", function(d){
            return d;
        })
        .text(function(d){
            return d;
        });

    d3.select("#countrySelect")
        .on("change",function(){
            var country = this.value;
            
            if(country !== ""){
                selectedCountries.add(country);
            }
            updateDotColors();
            updateSelectedCountryButtons();
            // reset dropdown
            this.value = "";
        });

    d3.select("#coverageYearSelect")
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

    d3.select("#clearSelection")
        .on("click",function(){
            selectedCountries.clear();
            updateDotColors();
            updateSelectedCountryButtons();
        });

    function drawScatter(selectedYear){
        var filteredData = data.filter(function(d){
            return d.year === selectedYear;
        });

        var margin = {
            top:40,
            right:40,
            bottom:60,
            left:70
        };

        var width = 900-margin.left-margin.right;
        var height = 500-margin.top-margin.bottom;

        d3.select("#chart")
            .selectAll("svg")
            .remove();

        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", width+margin.left+margin.right)
            .attr("height", height+margin.top+margin.bottom)
            .append("g")
            .attr("transform", "translate("+margin.left+","+margin.top+")");

        //x axes
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 45)
            .attr("text-anchor", "middle")
            .text("Healthcare expenditure (% GDP)");

        //y axes
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .text("Healthcare coverage (%)");

        console.log(
            "Selected year:",
            selectedYear
        );

        console.log(
            "Filtered rows:",
            filteredData.length
        );

        d3.select("#coverageYearSelect")
            .property("value",2023);

        console.log(filteredData);
        
        var xScale = d3.scaleLinear()
            .domain([
                0,
                d3.max(filteredData, function(d){
                    return d.expenditure;
                }) || 0
            ])
            .range([0, width]);

        //var yScale = d3.scaleLinear()
            //.domain([0, 100])
            //.range([height, 0]);

        //Y-axes now scalable (dynamic) based on range of coverage values
        var yScale = d3.scaleLinear()
            .domain([
                Math.max(
                    0,
                    d3.min(filteredData, function(d){
                        return d.coverage;
                    }) - 5
                ),
                //maxxed at 100%
                100
            ])
            .range([
                height,
                0
            ]);

        var tooltip = d3.select("#tooltip")
            .style("position","absolute")
            .style("visibility","hidden");
            //.attr("class","tooltip");


        //svg.selectAll("circle")
        svg.selectAll(".dot")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("class", "dot") // added class for styling purposes
            .attr("cx", function(d){
                return xScale(d.expenditure);
            })
            .attr("cy", function(d){
                return yScale(d.coverage);
            })
            .attr("r", 6)

            //default colour aka unselected
            .attr("fill", "steelblue")

            .attr("opacity", 0.7)

            .on("click", function(event,d){

                if(selectedCountries.has(d.country)){
                    selectedCountries.delete(d.country);
                } else {
                    selectedCountries.add(d.country);
                }
                updateDotColors();
                updateSelectedCountryButtons();
            })

            .on("mouseover", function(event, d){
                tooltip
                    .style("visibility", "visible")
                    .html(
                        "<strong>" + d.country +"</strong><br>" +
                        "Expenditure: " + d.expenditure + "% GDP<br>" +
                        "Coverage: " + d.coverage + "%"
                    );
            })
            .on("mousemove", function(event){
                tooltip
                    .style("left", event.pageX+10+"px")
                    .style("top", event.pageY+10+"px");
            })
            .on("mouseout", function(){
                tooltip.style("visibility", "hidden");
            })

            //highlighting the hovered dot and dimming the others
            .on("mouseenter", function(event,d){

                svg.selectAll(".dot")
                    .attr("opacity",0.2);

                d3.select(this)
                    .attr("opacity",1)
                    .attr("fill","orange") //orange on hover
                    .attr("r",7);  //slight increase in size when hovering over 

            })
            .on("mouseleave", function(){

                svg.selectAll(".dot")
                    .attr("opacity",0.7);

                d3.select(this)
                    //.attr("fill","steelblue") //reverting back to default colour
                    .attr("fill", function(d){
                        if(selectedCountries.has(d.country)){
                            return "#d62728";
                        }
                        return "steelblue";
                    })
                    .attr("r",6); //reverting back to default size


            });

        svg.append("g")
            .attr("transform", "translate(0,"+height+")")
            .attr("class","axis")
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("class","axis")
            .call(d3.axisLeft(yScale));
    }

    //default display year
    drawScatter(2023);

    d3.select("#coverageYearSelect")
    .on("change", function(){
        var selectedYear = +this.value;
        drawScatter(selectedYear);

    });

    d3.select("#coverageYearSelect")
        .property("value",2023);

});