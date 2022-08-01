///////////// Map View Initialization /////////////////

//make the svg and chart container (with padding)
let mapSVG = d3
    .select("#mapContainer")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "550")
    .style("border", "1px solid gray");

let g = mapSVG
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

//initialize the map (path and projection)
const path = d3.geoPath();
const projection = d3
    .geoNaturalEarth1()
    .scale(width / 1.6 / Math.PI)
    .translate([width / 2 - 20, height / 2 + 25]);

class MapView {
    constructor(lineChart, pieChart, data) {
        this.lineChart = lineChart;
        this.pieChart = pieChart;
        this.data = data;

        //load the map data from an external json file
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",)
            //d3.json("/data/world.json",)
            .then(function (data) {
                g.selectAll("path")
                    .data(data.features)
                    .enter()
                    .append("path")
                    .attr("fill", "#69b3a2")
                    .attr("d", d3.geoPath().projection(projection))
                    .style("stroke", "#fff")
                    .attr("class", () => "country")
                    .attr("id", (d) => d.id)
                    .style("opacity", 0.3)
                    //add the mouse events so that when a country is hovered over it is highlighted
                    .on("mouseover", function (event, d) {
                        //make all the unselected countries fade out
                        d3.selectAll(".country")
                            .transition()
                            .duration(200)
                            .style("opacity", 0.3);
                        //highlight the selected country and outline it in black
                        d3.select(this).transition().duration(200).style("opacity", 1);
                    })
                    .on("mouseleave", function (event, d) {
                        //fade all the countries back in
                        d3.selectAll(".country")
                            .transition()
                            .duration(200)
                            .style("opacity", 0.8);
                        //get rid of the selected countries outline
                    })
                    .on("click", function (event, d) {
                        console.log(d);
                        country = d.id;
                        countryName = d.properties.name;
                        console.log(country);
                        console.log(countryName);
                        lineChart.update();
                        pieChart.update();
                    });

                mapSVG.call(
                    d3
                        .zoom()
                        .extent([
                            [0, 0],
                            [width, height],
                        ])
                        .scaleExtent([1, 8])
                        .on("zoom", zoomed)
                );

                function zoomed({ transform }) {
                    g.attr("transform", transform);
                }
            });
    }

    getContinentData() {
        let cases = [0, 0, 0, 0, 0, 0];

        for (const [key, value] of this.data.entries()) {
            //get the last item in the value array which is the most recent record of covid data
            // **** some entries at the last index don't have data for total cases which causes some
            // innacuracies with the data being displayed ****
            // **** should really filter by dates that have total cases populated. can then use interpolation function
            // with the countries range of dates as the domain and range of the number of entries the country has with populated fields
            for (let i = value.length - 1; i > 0; i--) {
                let totalCases = parseInt(value[i].total_cases);
                let continent = value[i].continent;
                //gets the latest valid total cases value for each country from the data
                if (!isNaN(totalCases)) {
                    console.log(totalCases);
                    console.log(value[i].continent);
                    switch (value[i].continent) {
                        case "Asia":
                            cases[0] += totalCases;
                            break;
                        case "Europe":
                            cases[1] += totalCases;
                            break;
                        case "Africa":
                            cases[2] += totalCases;
                            break;
                        case "North America":
                            cases[3] += totalCases;
                            break;
                        case "South America":
                            cases[4] += totalCases;
                            break;
                        case "Oceania":
                            cases[5] += totalCases;
                            break;
                    }
                    break;
                }
            }
        }

        return cases;
    }

    showContinents() {
        let cases = this.getContinentData();
        console.log(cases);
        //scale for the continent circle data
        let size = d3.scaleLinear().domain(d3.extent(cases)).range([20, 50]);

        const continentMarkers = [
            {
                long: 96.0847214155104,
                lat: 34.717424324368565,
                continent: "Asia",
                cases: cases[0],
            },
            {
                long: 9.610801757285275,
                lat: 48.70525009904822,
                continent: "Europe",
                cases: cases[1],
            },
            {
                long: 19.927320588630536,
                lat: 9.962545367104491,
                continent: "Africa",
                cases: cases[2],
            },
            {
                long: -103.45473969870287,
                lat: 49.241995108525124,
                continent: "North America",
                cases: cases[3],
            },
            {
                long: -58.18822820409409,
                lat: -13.733023692369766,
                continent: "South America",
                cases: cases[4],
            },
            {
                long: 131.34841406341528,
                lat: -15.854347693312647,
                continent: "Oceania",
                cases: cases[5],
            },
        ];

        console.log(continentMarkers);

        let tooltip = d3
            .select("#mapContainer")
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px");

        g.selectAll("circle")
            .data(continentMarkers)
            .enter()
            .append("circle")
            .attr("cx", (d) => projection([d.long, d.lat])[0])
            .attr("cy", (d) => projection([d.long, d.lat])[1])
            .attr("r", (d) => size(d.cases))
            .attr("class", "circle")
            .style("fill", "steelblue")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 3)
            .attr("fill-opacity", 0.4)
            .on("mouseover", () => tooltip.style("visibility", "visible"))
            .on("mousemove", function (event, d) {
                tooltip
                    .html(
                        d.continent +
                        "<br>" +
                        "Total cases: " +
                        d.cases.toLocaleString() +
                        "<br>" //toLocaleString() method inserts commas into the number
                    )
                    .style("top", event.pageY + "px")
                    .style("left", event.pageX + "px");
            })
            .on("mouseleave", () => tooltip.style("visibility", "hidden"));
    }

    hideContinentData() {
        g.selectAll("circle").remove();
    }
}
