import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

import './voronoi.css'

function App() {
  const chartRef = useRef(null)

  d3.selectAll('svg')
    .remove();

  d3.selectAll('#tooltip')
    .remove()

  const data = [
    {
      length: 0.4,
      width: 0.6,
      species: "virginica"
    },
    {
      length: 0.4,
      width: 2,
      species: "virginica"
    },
    {
      length: 0.8,
      width: 1.8,
      species: "virginica"
    },
    {
      length: 0.7,
      width: 0.9,
      species: "virginica"
    }
  ];

  const margin = {
    top: 40,
    right: 55,
    bottom: 40,
    left: 55,
  }

  const width = 750 - (margin.right + margin.left);
  const height = 500 - (margin.top + margin.bottom);

  useEffect(() => {

    drawVoronoiChart()

  }, [])


  function drawVoronoiChart() {
    const viz = d3.select(chartRef.current)
    // the svg is a container 700x500
    // ! by default, as the size can be altered in the stylesheet
    const svg = viz
      .append('svg')
      .attr(
        'viewBox',
        `0 0 ${width + (margin.right + margin.left)} ${height + (margin.top + margin.bottom)
        }`
      )

    // add a tooltip
    const tooltip = viz
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0)
      .style("visibility", "hidden")
      .style("position", "absolute")





    // the group is translated inside the 700x500 container
    // ! it does not have a size, as group elements wrap around the nested elements
    // the visualization can however use the width and height and be centered in the svg container
    const group = svg
      .append('g')
      .attr('transform', `translate(${margin.left} ${margin.top})`)

    // create two linear scales for the petals' lengths and widths
    // x scale: petal width
    const xScale = d3
      .scaleLinear()
      // consider the maximum value found in the dataset
      .domain([0, d3.max(data, (d) => d.width + d.width / 2)])
      .range([0, width])
      .nice()

    // y scale: petal length
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.length + d.length / 2)])
      // given the top-down coordinate system of the svg element invert the range
      // this means smaller values are closer to the height, meaning the bottom of the svg
      .range([height, 0])
      .nice()

    // add axes to describe the length and width in centimeters
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(7)
      .tickPadding(4)
      .tickFormat((d) => `${d}`)

    // push the x-axis at the bottom of the visualization
    group
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0 ${height})`)
      .call(xAxis)

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickPadding(4)
      .tickFormat((d) => `${d}`)

    group.append('g').attr('class', 'axis y-axis').call(yAxis)

    // remove the path elements describing the axes (these are substituted with the boundaries of the Vonoroi diagram) and the line elements behind the ticks (design choice)
    d3.selectAll('g.axis').selectAll('path').remove()

    d3.selectAll('g.axis').selectAll('line').remove()

    // remove the first tick from both axes and add a `0cm` instead, shared by both
    d3.selectAll('g.axis').select('g.tick').remove()

    d3.select('g.axis') // added to the first axis, meaning the x axis
      .append('text')
      .attr('x', -18)
      .attr('y', 18)
      .text('0.00')

    // add grid lines for the existing ticks
    d3.selectAll('g.x-axis')
      .selectAll('g.tick')
      .append('path')
      .attr('stroke', 'currentColor')
      .attr('fill', 'none')
      .attr('d', `M 0 0 v${-height}`)

    d3.selectAll('g.y-axis')
      .selectAll('g.tick')
      .append('path')
      .attr('stroke', 'currentColor')
      .attr('fill', 'none')
      .attr('d', `M 0 0 h${width}`)

    // style the grid lines
    d3.selectAll('g.axis')
      .selectAll('g.tick')
      .select('path')
      .attr('stroke-width', '2')
      .attr('stroke-dasharray', '5')
      .attr('opacity', 0.1)

    // // include two labels for the axes
    d3.select('g.x-axis')
      .append('text')
      .attr('class', 'label')
      .attr('x', width / 2)
      .attr('y', margin.bottom)
      .attr('text-anchor', 'middle')
      .text("VORONOI CHART")
      .attr("color", "red")


    //add a path element to connect the cell to the tooltip
    const link = group
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 1.5)

    // add one circle for each data point
    // differentiate the fill of the circles according to the sub-specie of flower
    const fill = {
      setosa: 'hsl(360, 40%, 45%)',
      versicolor: 'hsl(300, 40%, 45%)',
      virginica: 'hsl(240, 40%, 45%)',
    }

    group
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.width))
      .attr('cy', (d) => yScale(d.length))
      .attr('fill', (d) => fill[d.species])
      .attr('r', 4)

    // add a voronoi diagram on top of the existing elements
    // following the docs specify the x and y points through functions referencing the values included in the visualization
    const delaunay = d3.Delaunay.from(
      data,
      (d) => xScale(d.width),
      (d) => yScale(d.length)
    )
    // create a Vonoroi diagram describing its boundaries
    const voronoi = delaunay.voronoi([0, 0, width, height])

    // add a path element describing the Vonoroi diagram
    // this shows the different sections of the diagram itself
    group
      .append('path')
      .attr('class', 'outline')
      // hidden by default
      .attr('opacity', 0.6)
      .attr('d', voronoi.render())
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')

    // add the boundaries as a substitute to the axes, and to encase the visualization on four sides
    group
      .append('path')
      .attr('d', voronoi.renderBounds())
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')

    // for each data point add a cell
    // ! make the cell fully transparent, since the path is included only for mouseover events
    group
      .selectAll("path.cell")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "cell")
      .attr("opacity", 0)
      .attr("d", (d, i) => voronoi.renderCell(i))

      // following the mousemove event position the tooltip and adjust the path element linking the cursor to the matching data point
      .on("mousemove", function (event, d) {
        // dom coordinates for the tooltip
        const { pageX, pageY } = event;

        // svg coordinates for the path
        // const [mouseX, mouseY] = d3.mouse(this);
        const mouseXY = d3.pointer(event, this)
        const mouseX = mouseXY[0]
        const mouseY = mouseXY[1]


        // svg coordinates for the data point
        const x = xScale(d.width);
        const y = yScale(d.length);

        // ! position the tooltip away from the connecting line
        const dx = mouseX - x; // dx > 0, the point is to the right, show the tooltip to the left
        const dy = mouseY - y; // dy > 0, the point is above, show the tooltip below

        const {
          width: tooltipWidth,
          height: tooltipHeight
        } = document.querySelector("#tooltip").getBoundingClientRect();
        const left = dx > 0 ? `${pageX}px` : `${pageX - tooltipWidth}px`;
        const top = dy > 0 ? `${pageY}px` : `${pageY - tooltipHeight}px`;

        tooltip.style("left", left).style("top", top);

        link.attr(
          "d",
          `M ${mouseX} ${mouseY} L ${x} ${y} m -8 0 a 8 8 0 0 0 16 0 a 8 8 0 0 0 -16 0`
        );


        // following the hover event describe the individual data point in the tooltip

        // remove existing elements
        tooltip.selectAll("*").remove();
        // console.log(d)

        // describe the flower's information through description elements
        tooltip.append("p").append("strong").text(`${d.species}`);

        const describeFlower = tooltip.append("dl");

        describeFlower.append("dt").text("Length");

        describeFlower.append("dd").text(`${d.length}`);

        describeFlower.append("dt").text("Width");

        describeFlower.append("dd").text(`${d.width}`);

        // show the tooltip
        tooltip.style("opacity", 1).style("visibility", "visible");
      });
    ;
    const allGroup = ["valueA", "valueB"]


      // List of groups (here I have one group per column)

      let dataReady = [{
        name: "valueA",
        values: [
          { time: '3', value: 2 },
          { time: '4', value: 7 },
        ]
      }]

      console.log(dataReady)



      // A color scale: one color for each group
      const myColor = d3.scaleOrdinal()
        .domain(allGroup)
        .range(d3.schemeSet2);

      // Add X axis --> it is a date format
      const x = d3.scaleLinear()
        .domain([0, 10])
        .range([0, width]);
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .style("visibility", "hidden");

      // Add Y axis
      const y = d3.scaleLinear()
        .domain([0, 20])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y))
        .style("visibility", "hidden");


      // Add the lines
      const line = d3.line()
        .x(d => x(+d.time))
        .y(d => y(+d.value))
      svg.selectAll("myLines")
        .data(dataReady)
        .join("path")
        .attr("d", d => line(d.values))
        .attr("stroke", d => myColor(d.name))
        .style("stroke-width", 4)
        .style("fill", "none")

      // Add the points
      svg
        // First we need to enter in a group
        .selectAll("myDots")
        .data(dataReady)
        .join('g')
        .style("fill", d => myColor(d.name))
        // Second we need to enter in the 'values' part of this group
        .selectAll("myPoints")
        .data(d => d.values)
        .join("circle")
        .attr("cx", d => x(d.time))
        .attr("cy", d => y(d.value))
        .attr("r", 5)
        .attr("stroke", "white")

      // Add a legend at the end of each line
      svg
        .selectAll("myLabels")
        .data(dataReady)
        .join('g')
        .append("text")
        .datum(d => { 
          console.log(d)
          return { name: d.name, value: d.values[d.values.length - 1] }; }) // keep only the last value of each time series
        // .datum(d => { return d.map((data)=> ({name:data.name,value:data.value}) ) }) // keep only the last value of each time series
        .attr("transform", d => `translate(${x(d.value.time)},${y(d.value.value)})`) // Put the text at the position of the last point
        .attr("x", 12) // shift the text a bit more right
        .text(d => d.name)
        .style("fill", d => myColor(d.name))
        .style("font-size", 15)

  }



return (<>
  <div className={'viz'} ref={chartRef}></div>
</>
)

}

export default App
