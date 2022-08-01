
///////////////////////// Global Vars ////////////////////////

//define margin to add some padding to the svg inside its container
const margin = { top: 30, bottom: 70, left: 70, right: 30 };
//define the dimensions of the svg
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

//Country and field global vars
let country = "GBR";
let countryName = "England";
let selectedOption = "total_cases";
let selectedOptionString = "Total Cases";

///////////////////////// Loading the Covid Data ////////////////////////
loadComponents();

//Load data and components for covin dashboard
function loadComponents() {

    console.log("Loading data...");

    //using the dataset that contains all of the data in the same csv
    d3.csv("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv", function (data) {
        //d3.csv("/data/owid-covid-data.csv", function (data) {
        return data;
    }).then(function (virusData) {
        //data is initially an array of objects, with each object being an entry of covid data on a specific date
        //converting it into a map with the iso code as the key for easier manipulation (especially by country)
        //(so now instead of an array of objects it is stored as a map with the country's ISO code as the key,
        //and its values are mapped to an array of data entry objects for that specific country)
        const countriesMap = new Map();

        //use the map() function to sort the data into a map by applying a function to each object
        virusData.map(function (obj) {
            //if the key isn't already contained in the map...
            if (!countriesMap.has(obj.iso_code)) {
                //...add if to the map using the iso_code as the key, with it's associated value being the object itself
                countriesMap.set(obj.iso_code, [obj]);
            } else {
                //otherwise if the key is already contained in the map, get the key and push the current object to the values array
                countriesMap.get(obj.iso_code).push(obj);
            }
        });

        console.log("Data loaded!");

        // let map = new MapView();
        let chart = new LineChart(countriesMap);
        let dropDown = new DropDown(chart);
        let pie = new Pie(countriesMap, chart);
        let mapView = new MapView(chart, pie, countriesMap);
        let wealthPlot = new WealthPlot(countriesMap);
        chart.update();
        pie.update();
        wealthPlot.update();

        //make a button to show/hide continent data
        let toggle = d3
            .select("#main")
            .append("label")
            .text("Show Continents Data")
            .style("font-family", "Arial")
            .style("margin-left", "10px")
            .append("input")
            .attr("type", "checkbox")
            .attr("id", "checkBox")
            .text("Toggle")
            .on("change", function (event, d) {
                if (d3.select("#checkBox").property("checked")) {
                    console.log("checked");
                    mapView.showContinents();
                } else {
                    console.log("unchecked");
                    mapView.hideContinentData();
                }
            });
    });
}

