let plotSVG = d3
    .select("#wealthPlotContainer")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "550")
    .style("border", "1px solid gray")
    .append("g")
    .attr("transform", `translate(${margin.left + 50},${margin.top})`);

const x2 = d3.scaleLinear().range([0, width - 100]);
const xAxis2 = d3.axisBottom().scale(x2);
plotSVG
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "xAxis2");

//initialise Y axis
const y2 = d3.scaleLinear().range([height, 0]);
const yAxis2 = d3.axisLeft().scale(y2);
plotSVG.append("g").attr("class", "yAxis2");

// plotSVG.call(
//   d3
//     .brush()
//     .extent([
//       [0, 0],
//       [width - 100, height],
//     ])
//     .on("end", function (event) {
//       console.log(event.selection);
//     })
// );

class WealthPlot {
    constructor(data) {
        this.data = data;
    }

    update() {
        //make tooltip for arc hover
        let tooltip = d3
            .select("#wealthPlotContainer")
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px");

        let filteredData = this.filter();
        console.log(d3.extent(filteredData, (obj) => obj.totalDeaths));

        //update the x domain with the new data and render it
        x2.domain(d3.extent(filteredData, (obj) => obj.totalDeaths));
        plotSVG.selectAll(".xAxis2").transition().duration(100).call(xAxis2);

        //updat the y domain with the new data and render it

        y2.domain(d3.extent(filteredData, (obj) => obj.gdp));
        plotSVG.selectAll(".yAxis2").transition().duration(100).call(yAxis2);

        //add dots to the scatter plot
        plotSVG
            .append("g")
            .selectAll("dot")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", (d) => x2(d.totalDeaths))
            .attr("cy", (d) => y2(d.gdp))
            .attr("r", 10)
            .attr("id", (d) => d.iso)
            .style("fill", "#69b3a2")
            .style("opacity", 0.8)
            .style("stroke", "grey")
            .on("mouseover", function (event, d) {
                //make the tooltip visible
                tooltip.style("visibility", "visible");
            })
            .on("mousemove", function (event, d) {
                tooltip
                    .html(
                        d.countryName +
                        "<br>" +
                        "Total Deaths: " +
                        d.totalDeaths.toLocaleString() +
                        "<br>" +
                        "GDP: " +
                        d.gdp.toLocaleString()
                    )
                    .style("top", event.pageY + 10 + "px")
                    .style("left", event.pageX + "px");
            });

        //append labels
        plotSVG
            .append("g")
            .attr("transform", "translate(-70, 170)")
            .append("text")
            .attr("class", "yLabel")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Total Deaths");

        plotSVG
            .append("text")
            .style("text-anchor", "middle")
            .attr("x", width / 2 - 20)
            .attr("y", height + 50)
            .attr("class", "xLabel")
            .text("GDP (per capita)");
    }

    //function that filters the data based on gdp per capita and deaths
    filter() {
        let filteredData = [];
        //for each country get the latest populated gdp and deaths data
        for (const [key, value] of this.data.entries()) {
            let iso = key;
            //get the last item in the value array which is the most recent record of covid data
            // **** some entries at the last index don't have data for total cases which causes some
            // innacuracies with the data being displayed ****
            // **** should really filter by dates that have total cases populated. can then use interpolation function
            // with the countries range of dates as the domain and range of the number of entries the country has with populated fields

            for (let i = value.length - 1; i > 0; i--) {
                let gdp = parseInt(value[i].gdp_per_capita);
                let totalDeaths = parseInt(value[i].total_deaths);
                let countryName = value[i].location;
                if (countryName !== "World") {
                    if (!isNaN(gdp) && !isNaN(totalDeaths)) {
                        filteredData.push({
                            countryName: countryName,
                            totalDeaths: totalDeaths,
                            gdp: gdp,
                            iso: iso,
                        });
                        //no need to loop further if valid entry found so break out of the loop
                        break;
                    }
                }
            }
        }
        console.log(filteredData);
        return filteredData;
    }

    filterCountry() {
        let countryData = this.data.get(country);
    }
}
