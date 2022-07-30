///////////// Pie Chart Initialisation /////////////////

//make the svg and chart container (with padding)
let pieSVG = d3
    .select("#pieContainer")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "550")
    .attr("class", "pieSVG")
    .style("border", "1px solid gray")
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

//make pi and arc
const radius = 150;
let pie = d3.pie();
let arc = d3
    .arc()
    .innerRadius(radius - 100)
    .outerRadius(radius - 50);

class Pie {
    constructor(data, lineChart) {
        this.data = data;
        this.lineChart = lineChart;

        pieSVG
            .append("circle")
            .attr("cx", -60)
            .attr("cy", 130)
            .attr("r", 6)
            .style("fill", "#bebada");
        pieSVG
            .append("circle")
            .attr("cx", -60)
            .attr("cy", 160)
            .attr("r", 6)
            .style("fill", "#fb8072");
        // pieSVG
        //   .append("circle")
        //   .attr("cx", 200)
        //   .attr("cy", 190)
        //   .attr("r", 6)
        //   .style("fill", "#fdb462");
        pieSVG
            .append("text")
            .attr("x", -40)
            .attr("y", 130)
            .text("Partially Vaccinated")
            .style("font-size", "15px")
            .attr("alignment-baseline", "middle");
        pieSVG
            .append("text")
            .attr("x", -40)
            .attr("y", 160)
            .text("Unvaccinated")
            .style("font-size", "15px")
            .attr("alignment-baseline", "middle");
    }

    update() {
        let filteredData = this.filter();
        var color = d3.scaleOrdinal().domain(filteredData).range(d3.schemeSet3);

        //make tooltip for arc hover
        let tooltip = d3
            .select("#pieContainer")
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "5px")
            .style("border-radius", "5px")
            .style("padding", "5px");

        //Generate groups
        let arcs = pieSVG
            .selectAll("arc")
            .data(pie(filteredData))
            .enter()
            .append("g")
            .attr("class", "arc");
        //Draw arc paths
        arcs
            .append("path")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("d", arc)
            .attr("stroke", "#ffff")
            .on("click", (event, d, i) => {
                if (d.index === 0) {
                    selectedOption = "people_vaccinated";
                    selectedOptionString = "People Partially Vaccinated";
                    this.lineChart.update();
                } else {
                    selectedOptionString = "People Unvaccinated";
                    this.lineChart.update(true);
                }
            })
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .transition()
                    .ease(d3.easeBounce)
                    .duration(1000)
                    .attr("d", function (d) {
                        return d3.arc().innerRadius(50).outerRadius(110)(d);
                    })
                    //   .attr("stroke", "#ffff")
                    .attr("stroke-width", "2px");

                //make the tooltip visible
                tooltip.style("visibility", "visible");
            })
            .on("mousemove", function (event, d) {
                //update the location of the tooltip
                tooltip
                    .html(d.data.toLocaleString())
                    .style("top", event.pageY + 10 + "px")
                    .style("left", event.pageX + "px");
            })
            .on("mouseleave", function (event, d) {
                d3.select(this)
                    .transition()
                    .ease(d3.easeBounce)
                    .duration(1000)
                    .attr("d", function (d) {
                        return d3
                            .arc()
                            .innerRadius(radius - 100)
                            .outerRadius(radius - 50)(d);
                    })
                    //   .attr("stroke", "")
                    .attr("stroke-width", "2px");

                //hide the tooltip again
                tooltip.style("visibility", "hidden");
            });

        arcs
            .transition()
            .duration(1000)
            .attrTween("d", (d, i) => this.arcTween(d3.select(this), d));

        d3.select(".pieTitle").remove();

        // append title to the graph
        d3.select(".pieSVG")
            .append("text")
            .attr("class", "pieTitle")
            .attr("text-anchor", "start")
            .attr("y", 50)
            .attr("x", 50)
            .text(() => countryName + " - Vaccination Data")
            .style("fill", "black");
    }

    //filters the data for the pie chart
    filter() {
        let countryData = this.data.get(country);
        let filteredData = [];
        //loop throught the country data to find the last valid data
        for (let i = countryData.length - 1; i > 0; i--) {
            let partiallyVaccinated = parseInt(countryData[i].people_vaccinated);
            let fullyVaccinated = parseInt(countryData[i].people_fully_vaccinated);
            let population = parseInt(countryData[i].population);
            let unvaccinated = 0;
            //finds the latest data entry where all three of the above fields are populated (i.e. not undefined)
            if (
                !isNaN(partiallyVaccinated) &&
                !isNaN(fullyVaccinated) &&
                !isNaN(population)
            ) {
                // unvaccinated = population - vaccinated;
                //work out porportion of partially vaccinated people vs unvaccinated people
                unvaccinated = population - partiallyVaccinated;
                filteredData.push(partiallyVaccinated);
                // filteredData.push(fullyVaccinated);
                filteredData.push(unvaccinated);
                break;
            }
        }
        return filteredData;
    }

    arcTween(oldArc, newArc) {
        var interp = d3.interpolate(oldArc, newArc); // this will return an interpolater
        //  function that returns values
        //  between 'this._current' and 'd'
        //  given an input between 0 and 1

        oldArc = newArc; // update this._current to match the new value

        return function (t) {
            // returns a function that attrTween calls with
            //  a time input between 0-1; 0 as the start time,
            //  and 1 being the end of the animation

            var tmp = interp(t); // use the time to get an interpolated value
            //  (between this._current and d)

            return arc(tmp); // pass this new information to the accessor
            //  function to calculate the path points.
            //  make sure sure you return this.

            // n.b. we need to manually pass along the
            //  index to drawArc so since the calculation of
            //  the radii depend on knowing the index. if your
            //  accessor function does not require knowing the
            //  index, you can omit this argument
        };
    }

    //used for passing vaccination data to
}
