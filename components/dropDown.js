//define options for the dropdown
const dropDownOptions = [
    {
        key: "Total Cases",
        value: "total_cases",
    },
    {
        key: "Hospitalisations",
        value: "hosp_patients",
    },
    {
        key: "ICU Patients",
        value: "icu_patients",
    },
    {
        key: "New Cases",
        value: "new_cases",
    },
    {
        key: "New Deaths",
        value: "new_deaths",
    },
    {
        key: "New Tests",
        value: "new_tests",
    },
    {
        key: "New Vaccinations",
        value: "new_vaccinations",
    },
    {
        key: "People Fully Vaccinated",
        value: "people_fully_vaccinated",
    },
    {
        key: "People Vaccinated",
        value: "people_vaccinated",
    },
    {
        key: "Total Boosters",
        value: "total_boosters",
    },
    {
        key: "Total Deaths",
        value: "total_deaths",
    },
    {
        key: "Total Tests",
        value: "total_tests",
    },
];

class DropDown {
    constructor(lineChart) {
        //get the instance of the line chart
        this.lineChart = lineChart;

        ////////////// Make the DropDown //////////////
        let dropDown = d3
            .select("#main")
            .append("select")
            .attr("class", "selection")
            .attr("name", "data-options")
            .on("change", function (event, d) {
                // recover the option that has been chosen
                selectedOption = d3.select(this).property("value");
                selectedOptionString = dropDownOptions.find(
                    (o) => o.value === selectedOption
                ).key;
                console.log(selectedOption);
                console.log(selectedOptionString);
                lineChart.update();
            });
        //make options for the dropdown
        let options = dropDown
            .selectAll("option")
            .data(dropDownOptions)
            .enter()
            .append("option")
            .text((d) => d.key)
            .attr("value", (d) => d.value);
    }
}
