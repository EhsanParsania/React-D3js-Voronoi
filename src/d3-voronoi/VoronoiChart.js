import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './voronoi.css';


function VoronoiChart(props) {
  const {  chartWidth = 700, chartHeight = 300, showTooltip=true } = props;

  // example data : 
  const data={
    "clusterPoints": [
        {
            "width": 4.12,
            "length": 10.86
        },
        {
            "width": 0.65,
            "length": 0
        },
        {
            "width": 1.07,
            "length": 12.14
        },
        {
            "width": 2.36,
            "length": 0
        },
        {
            "width": 1.3,
            "length": 14.49
        },
        {
            "width": 3.43,
            "length": 0
        },
        {
            "width": 3.63,
            "length": 10.35
        }
    ],
    "linesPoints": [
        {
            "index": 0,
            "columns": [
                {
                    "name": "rowNumber",
                    "title": "example"
                },
                {
                    "name": "Number",
                    "title": "example",
           
                },
                {
                    "name": "Time",
                    "title": "example",
                    "type": "Date"
                },
                {
                    "name": "Change",
                    "title": "example",
                },
                {
                    "name": "details",
                    "title": "example"
                }
            ],
            "data": {
            },
            "values": [
                {
                    "xPoint": 3.89,
                    "yPoint": 0
                },
                {
                    "xPoint": 4.48,
                    "yPoint": 9.9
                }
            ],
            
        },
        {
          "index": 2,
          "columns": [
              {
                  "name": "rowNumber",
                  "title": "example"
              },
              {
                  "name": "Number",
                  "title": "example",
         
              },
              {
                  "name": "Time",
                  "title": "example",
                  "type": "Date"
              },
              {
                  "name": "Change",
                  "title": "example",
              },
              {
                  "name": "details",
                  "title": "example"
              }
          ],
          "values": [
              {
                  "xPoint": 4.89,
                  "yPoint": 8
              },
              {
                  "xPoint": 3.48,
                  "yPoint": 5.9
              }
          ],
          
      }, {
        "index": 3,
        "columns": [
            {
                "name": "rowNumber",
                "title": "example"
            },
            {
                "name": "Number",
                "title": "example",
       
            },
            {
                "name": "Time",
                "title": "example",
                "type": "Date"
            },
            {
                "name": "Change",
                "title": "example",
            },
            {
                "name": "details",
                "title": "example"
            }
        ],
        "values": [
            {
                "xPoint": 0.89,
                "yPoint": 16
            },
            {
                "xPoint": 4.48,
                "yPoint": 13.9
            }
        ],
        
    },

    ]
}

  // declare a ref to show chart
  const chartRef = useRef(null);

  const margin = {
    top: 20,
    right: 25,
    bottom: 50,
    left: 55,
  };

  const width = chartWidth - (margin.right + margin.left);
  const height = chartHeight - (margin.top + margin.bottom);

  useEffect(() => {
    //remove last chart if it exists in rerendering
    d3.select('.voronoi').remove();
    d3.selectAll('#tooltip').remove();
    drawVoronoiChart();
    // eslint-disable-next-line
  }, [data]);

  function drawVoronoiChart() {
    const viz = d3.select(chartRef.current);

    // ! by default, as the size can be altered in the stylesheet
    const svg = viz
      .append('svg')
      .attr('viewBox', `0 0 ${width + (margin.right + margin.left)} ${height + (margin.top + margin.bottom)}`)
      .attr('class', 'voronoi');

    const { clusterPoints, linesPoints } = data;

    // add a tooltip
    const tooltip = viz.append('div').attr('id', 'tooltip').style('opacity', 0).style('visibility', 'hidden').style('position', 'absolute');

    // the group is translated inside the 700x500 container
    // ! it does not have a size, as group elements wrap around the nested elements
    // the visualization can however use the width and height and be centered in the svg container
    const group = svg.append('g').attr('transform', `translate(${margin.left} ,${margin.top})`);
    const groupScatter = svg.append('g').attr('transform', `translate(${margin.left} ,${margin.top})`);

    // create two linear scales for the petals' lengths and widths
    // x scale: petal width
    const xScale = d3
      .scaleLinear()
      // consider the maximum value found in the dataset
      .domain([0, d3.max(clusterPoints, (d) => d.width)])
      .range([0, width])
      .nice();

    // y scale: petal length
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(clusterPoints, (d) => d.length)])
      // given the top-down coordinate system of the svg element invert the range
      // this means smaller values are closer to the height, meaning the bottom of the svg
      .range([height, 0])
      .nice();

    // add axes to describe the length and width in centimeters
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(7)
      .tickPadding(4)
      .tickFormat((d) => `${d}`);

    // push the x-axis at the bottom of the visualization
    group.append('g').attr('class', 'axis x-axis').attr('transform', `translate(0 ,${height})`).call(xAxis);

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickPadding(12)
      .tickFormat((d) => `${d}`);

    group.append('g').attr('class', 'axis y-axis').call(yAxis);

    // xAxis and yAxis texts
    d3.selectAll('.viz svg text').style('font-size', '0.5rem');

    // remove the path elements describing the axes (these are substituted with the boundaries of the Vonoroi diagram) and the line elements behind the ticks (design choice)
    d3.selectAll('g.axis').selectAll('path').remove();

    d3.selectAll('g.axis').selectAll('line').remove();

    // remove the first tick from both axes and add a `0.00` instead, shared by both
    d3.selectAll('g.axis').select('g.tick').remove();

    // added to the first axis, meaning the x axis
    d3.select('g.axis').append('text').attr('x', -12).attr('y', 12).text('0.00').style('font-size', '0.5rem');

    // add grid lines for the existing ticks
    d3.selectAll('g.x-axis').selectAll('g.tick').append('path').attr('stroke', 'currentColor').attr('fill', 'none').attr('d', `M 0 0 v${-height}`);

    d3.selectAll('g.y-axis').selectAll('g.tick').append('path').attr('stroke', 'currentColor').attr('fill', 'none').attr('d', `M 0 0 h${width}`);

    // style the grid lines
    d3.selectAll('g.axis').selectAll('g.tick').select('path').attr('stroke-width', '1').attr('stroke-dasharray', '3').attr('opacity', 0.1);

    // labels
    svg
      .append('foreignObject')
      .attr('width', 200)
      .attr('height', 40)
      .style('text-align', 'center')
      .attr('x', (chartWidth - 180) / 2)
      .attr('y', 265)
      .html('<p>متن فارسی ( rtl text )</p>');

    svg
      .append('foreignObject')
      .attr('width', 200)
      .attr('height', 40)
      .attr('transform', 'translate(0,0)rotate(-90)')
      .style('text-align', 'center')
      .attr('x', -250)
      .attr('y', -5)
      .html('<p>متن فارسی ( rtl text )</p>');

    // add a voronoi diagram on top of the existing elements
    // following the docs specify the x and y points through functions referencing the values included in the visualization
    const delaunay = d3.Delaunay.from(
      clusterPoints,
      (d) => xScale(d.width),
      (d) => yScale(d.length)
    );
    // create a Vonoroi diagram describing its boundaries
    const voronoi = delaunay.voronoi([0, 0, width, height]);

    // add a path element describing the Vonoroi diagram
    // this shows the different sections of the diagram itself
    group
      .append('path')
      .attr('class', 'outline')
      // hidden by default
      .attr('opacity', 0.8)
      .attr('d', voronoi.render())
      .attr('fill', 'none')
      .attr('stroke', 'currentColor');

    // add the boundaries as a substitute to the axes, and to encase the visualization on four sides
    group.append('path').attr('d', voronoi.renderBounds()).attr('fill', 'none').attr('stroke', 'currentColor');

    // for each data point add a cell
    // ! make the cell fully transparent, since the path is included only for mouseover events
    group
      .selectAll('path.cell')
      .data(clusterPoints)
      .enter()
      .append('path')
      .attr('class', 'cell')
      .attr('opacity', 0)
      .attr('d', (d, i) => voronoi.renderCell(i));

    // add one circle for each data point
    // differentiate the fill of the circles according to the sub-specie of flower

    group
      .selectAll('circle')
      .data(clusterPoints)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(+d.width))
      .attr('cy', (d) => yScale(+d.length))
      .attr('r', 4);

    const allGroup = [0, data.clusterPoints.length];
    // A color scale: one color for each group
    const myColor = d3.scaleOrdinal().domain(allGroup).range(d3.schemeSet2);

    // Add X axis --> it is a date format
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(clusterPoints, (d) => +d.width + d.width)])
      .range([0, width]);
    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${height + margin.top})`)
      .call(d3.axisBottom(x))
      .style('visibility', 'hidden');

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(clusterPoints, (d) => +d.length + d.length)])
      .range([height, 0]);
    svg.append('g').attr('transform', `translate(${margin.left}, ${margin.bottom})`).call(d3.axisLeft(y)).style('visibility', 'hidden');

    // Add the lines
    const line = d3
      .line()
      .x((d) => x(+d.xPoint))
      .y((d) => y(+d.yPoint));
    groupScatter
      .selectAll('myLines')
      .data(linesPoints)
      .join('path')
      .attr('d', (d) => line(d.values))
      .attr('stroke', (d) => myColor(d.index)) // lines color
      .style('stroke-width', 2)
      .style('fill', 'none');

    // Add the points
    groupScatter
      // First we need to enter in a group
      .selectAll('myDots')
      .data(linesPoints)
      .join('g')
      .style('fill', (d) => myColor(d.index))
      .on('mouseover', (event, d) => {
        event.target.style.cursor = 'pointer';

        if (showTooltip) {
          // dom coordinates for the tooltip
          const { pageX, pageY } = event;
          const { width: tooltipWidth, height: tooltipHeight } = document.querySelector('#tooltip').getBoundingClientRect();
          const left = `${pageX - tooltipWidth / 2}px`;
          const top = `${pageY - tooltipHeight - 10}px`;
          if (tooltip) {
          }
          tooltip
            .style('left', left)
            .style('top', top)
            .on('mouseover', function (event, d) {
              event.target.style.backgroundColor = 'white';
            });

          // remove existing elements
          tooltip.selectAll('*').remove();

          const generateTooltipText = (d) => {
            const { columns } = d;
            const tooltipsTitles = columns.filter((column, index) => index !== 0 && index !== columns.length - 1);
            if (d) {
              return tooltipsTitles.map((column) => {
      
                return `Title  :   ${column.name}`;
              });
            }
          };

          // describe the flower's information through description elements
          const describeFlower = tooltip.append('dl');

          // following the hover event describe the individual data point in the tooltip
          const tooltipText = generateTooltipText(d);
          tooltipText.map((text) => {
            return describeFlower.append('dd').text(text);
          });

          // show the tooltip
          tooltip.style('opacity', 1).style('visibility', 'visible');
        }
      })
      // Second we need to enter in the 'values' part of this group
      .selectAll('myPoints')
      .data((d) => d.values)
      .join('circle')
      .attr('cx', (d) => x(d.xPoint))
      .attr('cy', (d) => y(d.yPoint))
      .attr('r', 6)
      .on('mouseout', function (event, d) {
        tooltip.style('opacity', 0).style('visibility', 'hidden').style('position', 'absolute');
      });
  }
  return <div id={'svg'} className={'viz'} ref={chartRef}></div>;
}

export default VoronoiChart;
