document.addEventListener('DOMContentLoaded', function() {
    const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
    
    d3.json(url).then(data => {
      const baseTemp = data.baseTemperature;
      const monthlyVariance = data.monthlyVariance;
      
      const margin = { top: 60, right: 20, bottom: 60, left: 80 };
      const width = 1200 - margin.left - margin.right;
      const height = 600 - margin.top - margin.bottom;
      
      const years = monthlyVariance.map(d => d.year);
      const minYear = d3.min(years);
      const maxYear = d3.max(years);
      
      const x = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.01);
  
      const y = d3.scaleBand()
        .domain(d3.range(0, 12))
        .range([0, height])
        .padding(0.01);
  
      const xAxis = d3.axisBottom(x)
        .tickValues(x.domain().filter(year => year % 10 === 0))
        .tickFormat(d3.format('d'));
      
      const yAxis = d3.axisLeft(y)
        .tickFormat(month => d3.timeFormat("%B")(new Date(0, month)));
  
      const svg = d3.select("#chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
      svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
  
      svg.append("g")
        .attr("id", "y-axis")
        .call(yAxis);
  
      const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
        .domain([d3.max(monthlyVariance, d => baseTemp + d.variance), d3.min(monthlyVariance, d => baseTemp + d.variance)]);
  
      svg.selectAll(".cell")
        .data(monthlyVariance)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.month - 1))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => colorScale(baseTemp + d.variance))
        .attr("data-month", d => d.month - 1)
        .attr("data-year", d => d.year)
        .attr("data-temp", d => baseTemp + d.variance)
        .on("mouseover", function(event, d) {
          const tooltip = d3.select("#tooltip");
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`Year: ${d.year}<br>Month: ${d3.timeFormat("%B")(new Date(0, d.month - 1))}<br>Temperature: ${(baseTemp + d.variance).toFixed(2)}℃<br>Variance: ${d.variance.toFixed(2)}℃`)
            .attr("data-year", d.year)
            .style("left", (event.pageX -150) + "px")
            .style("top", (event.pageY - 300) + "px");
        })
        .on("mouseout", function() {
          d3.select("#tooltip").transition().duration(500).style("opacity", 0);
        });
  
      const legendWidth = 300;
      const legendHeight = 20;
  
      const legendData = colorScale.ticks(10).map((d, i, nodes) => ({
        value: d,
        color: colorScale(d)
      }));
  
      const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${margin.left}, ${height + margin.top + 40})`);
  
      legend.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * (legendWidth / legendData.length))
        .attr("y", 0)
        .attr("width", legendWidth / legendData.length)
        .attr("height", legendHeight)
        .attr("fill", d => d.color);
  
      legend.append("text")
        .attr("class", "legend-text")
        .attr("x", legendWidth + 10)
        .attr("y", legendHeight / 2)
        .attr("dy", "0.35em")
        .text("Temperature (℃)");
    });
  });
  