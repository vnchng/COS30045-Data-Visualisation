console.log("Scatter plot coverage loaded");


d3.csv("../../data/clean/health_expenditure_and_coverage (Dataset 1+2_clean).csv")
.then(function(data){


    data.forEach(function(d){
        d.expenditure = +d.expenditure;
        d.coverage = +d.coverage;
    });

    var years = [
        ...new Set(
            data.map(function(d){
                return d.year;
            })
        )
    ].sort();

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

        var yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        var tooltip = d3.select("#tooltip")
            .style("position","absolute")
            .style("visibility","hidden");

        svg.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", function(d){
                return xScale(d.expenditure);
            })
            .attr("cy", function(d){
                return yScale(d.coverage);
            })
            .attr("r", 6)
            .attr("fill", "steelblue")
            .on("mouseover", function(event, d){
                tooltip
                    .style("visibility", "visible")
                    .html(
                        "<strong>"+
                        d.country+
                        "</strong><br>"+
                        "Expenditure: "+
                        d.expenditure+
                        "% GDP<br>"+
                        "Coverage: "+
                        d.coverage+
                        "%"
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
            .on("mouseenter", function(){
                d3.select(this)
                    .attr("r", 10);
            })
            .on("mouseleave", function(){
                d3.select(this)
                    .attr("r", 6);
            });

        svg.append("g")
            .attr("transform", "translate(0,"+height+")")
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScale));
    }

    //default display year
    drawScatter(2023);

    d3.select("#coverageYearSelect")
    .on("change", function(){
        var selectedYear = +this.value;
        drawScatter(selectedYear);

    });

});