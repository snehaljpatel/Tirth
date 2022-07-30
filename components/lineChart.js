//////////////////// Line chart Initialisation ///////////////////
//(had to do it here instead of inside the class because the d3 line() function was producing
//'cannot find property 'x' of undefined' error)

let chartSVG = d3
    .select("#lineChartContainer")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "550")
    .style("border", "1px solid gray")
    .append("g")
    .attr("transform", `translate(${margin.left + 50},${margin.top + 50})`);

//make the chart axes
//initialise the X axis
const x = d3.scaleTime().range([0, width - 100]);
const xAxis = d3.axisBottom().scale(x).ticks(20);
chartSVG
    .append("g")
    .attr("transform", `translate(0, ${height - 100})`)
    .attr("class", "xAxis");

//initialise Y axis
const y = d3.scaleLinear().range([height - 100, 0]);
const yAxis = d3.axisLeft().scale(y);
chartSVG.append("g").attr("class", "yAxis");

class LineChart {
    constructor(data) {
        this.data = data;
        console.log(data);
    }

    /////////////////////////LineChart Class Methods/////////////////////////////
    update(unvacc) {
        //first filter the data for the current selected country and field (into an array of x:, y: objects to be used by the d3 path function)
        // console.log(this.filter());
        let filteredData;
        if (unvacc) {
            filteredData = this.filterUnvacc();
        } else {
            filteredData = this.filter();
        }

        //update the domain of the X axis with the filtered data
        x.domain(d3.extent(filteredData, (obj) => obj.x));
        //add the updated X axis to the svg
        chartSVG
            .selectAll(".xAxis")
            .transition()
            .duration(100)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        //append x and y labels

        d3.select(".yLabel").remove();
        d3.select(".xLabel").remove();

        chartSVG
            .append("g")
            .attr("transform", "translate(-70, 150)")
            .append("text")
            .attr("class", "yLabel")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text(() => dropDownOptions.find((o) => o.value === selectedOption).key);

        chartSVG
            .append("text")
            .style("text-anchor", "middle")
            .attr("x", width / 2 - 20)
            .attr("y", height - 20)
            .attr("class", "xLabel")
            .text("Time (since the start of the pandemic)");

        //update the domain of the Y axis with the filtered data
        // (note the '+' again to convert the new_cases string data into ints)
        y.domain([0, d3.max(filteredData, (obj) => obj.y)]);
        // console.log(d3.max(data, (d) => +d.new_cases));
        chartSVG.selectAll(".yAxis").transition().duration(1000).call(yAxis);

        let line = chartSVG.selectAll(".line").data([filteredData], function (d) {
            return d.x;
        });

        // console.log(line.enter().data());

        let lineFunc = d3
            .line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            });

        line
            .enter()
            .append("path")
            .merge(line)
            .attr("class", "line")
            .transition()
            .duration(1000)
            .attr("fake", (d) => console.log(d))
            .attr(
                "d",
                d3
                    .line()
                    .x(function (d, i) {
                        return x(d.x);
                    })
                    .y(function (d, i) {
                        return y(d.y);
                    })
            )
            .attr("fill", "none")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5);

        d3.select(".graphTitle").remove();

        // append title to the graph
        chartSVG
            .append("text")
            .attr("class", "graphTitle")
            .attr("text-anchor", "middle")
            .attr("y", -5)
            .attr("x", width / 2 - 20)
            .text(() => countryName)
            .style("fill", "black");
    }

    filter() {
        //get the data for the current country
        let countryData = this.data.get(country);
        //stores the filtered country data to return
        let filteredData = [];
        //loop over the country data...
        for (let i = 0; i < countryData.length; i++) {
            //...and get the value of the current entry and the specified field and parse it to an int (from a string)
            let currVal = parseInt(countryData[i][selectedOption]);
            //because some of the entries for a specified field are undefined, calling parseInt on them returns NaN...
            //...so check if the currVal is a number and push the date and value to the filtered value array
            //(this way only entries with values are ketp)
            if (!isNaN(currVal))
                filteredData.push({ x: new Date(countryData[i].date), y: currVal });
        }
        console.log(filteredData);
        return filteredData;
    }

    //used for filtering data based on unvaccinated people
    filterUnvacc() {
        let countryData = this.data.get(country);
        let filteredData = [];
        //loop over the country data...
        for (let i = 0; i < countryData.length; i++) {
            //...and get the value of the current entry and the specified field and parse it to an int (from a string)
            let partiallyVaccinated = parseInt(countryData[i].people_vaccinated);
            let population = parseInt(countryData[i].population);
            //because some of the entries for a specified field are undefined, calling parseInt on them returns NaN...
            //...so check if the currVal is a number and push the date and value to the filtered value array
            //(this way only entries with values are ketp)
            if (!isNaN(partiallyVaccinated) && !isNaN(population))
                filteredData.push({
                    x: new Date(countryData[i].date),
                    y: population - partiallyVaccinated,
                });
        }
        console.log(filteredData);
        return filteredData;
    }
}
