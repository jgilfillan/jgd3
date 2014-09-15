// the following code is based on these two methods:
// *** http://bost.ocks.org/mike/chart/
// *** http://bost.ocks.org/mike/chart/time-series-chart.js

// ********************************************************************************
//  USAGE:  
//    // instantiate chart with closure
//      mychart = geom_point();
//
//    // build config object
//      var config = {
//        data: [{x: 10, y: 3, type: 0.1, enrl_cnt: 5},{x: 4, y: 2, type: 0.2, enrl_cnt: 10},{x: 8, y: 9, type: 0.5, enrl_cnt: 15}],
//        aes: {
//          x: { value: 'x', type: 'linear' },
//          y: { value: 'y', type: 'linear' },
//          fill: {
//            value: 'type',   // variable to map to fill colour
//            type: 'discrete'   // discrete or continuous scale?
//          },
//          size: {
//            value: 'enrl_cnt',
//            type: 'linear',
//            range: [5, 20]
//          },
//          alpha: {
//            value: 'enrl_cnt',
//            type: 'linear',
//            range: [.4, 1]
//          }
//        },
//      };
//
//    // get a selection, attach config object to selection, and call mychart
//      d3.select('#chart1').datum(config).call(mychart);
// ********************************************************************************

function geom_point() {
  // default values
  var width = 1000,
      height = 600,
      margin = { top: 30, right: 20, bottom: 30, left: 50 },
      legend = { margin: 100, padding: 20 },
      scaleX = d3.scale.linear(),
      scaleY = d3.scale.linear(),
      scaleSize = null,
      scaleAlpha = null,
      scaleFill = d3.scale.category20(),
      axisX = d3.svg.axis().scale(scaleX).orient("bottom"),
      axisY = d3.svg.axis().scale(scaleY).orient("left"),
      data = [],
      defaultAes = {
        fill: {type: 'static', value: 'black'},
        size: {type: 'static', value: 5},
        alpha: {type: 'static', value: 1}
      },
      // default unmapped aesthetics
      aes = null;
      ;

  ;

  function my(selection) {
    selection.each(function(d, i) {
      var nonDiscreteVariables = [];    // to hold array of variables that need to be converted to numeric values

      // attach config to 
      data = d.data;
      aes = Object.create(defaultAes);

      // override default aesthetic mappings
      for (prop in d.aes) {
        aes[prop] = d.aes[prop];
        if (['linear'].some(function(e) { return (e === d.aes[prop].type); })) nonDiscreteVariables.push(d.aes[prop].value);
      }

      // make x and y linear
      data = data.map(function(d) {
        for (prop in d) {
          if (prop === aes.x.value || prop === aes.y.value || nonDiscreteVariables.some( function(e) { return (e === prop); } )) {  // implement checks for other linear scales
            d[prop] = +d[prop];
          }
        }

        return d;
      });

      // console.log(data);

      //update x scale
      scaleX.domain(d3.extent(data, function(d) { return d[aes.x.value]; }))
      .range([0, width - margin.left - margin.right - legend.margin - legend.padding])
      .nice();

      //update y scale
      scaleY.domain(d3.extent(data, function(d) { return d[aes.y.value]; }))
      .range([height - margin.top - margin.bottom, 0])
      .nice();

      //update color scale
      if (aes.fill.type === 'linear') {
        scaleFill = d3.scale.quantize()
        .domain(d3.extent(data, function(d) { return d[aes.fill.value]; }))
        .range(colorbrewer.RdBu[11]);
      } 
        // if not explicity configured as continuous, make scale discrete
        else if (aes.fill.type === 'discrete') {
          scaleFill = d3.scale.category20().domain(d3.extent(data, function(d) { return d[aes.fill.value]; }));
        }
        else {
          scaleFill = function() {return aes.fill.value; };
        }

      //update size scale
      if (aes.size.type === 'linear') {
        scaleSize = d3.scale.linear().domain(d3.extent(data, function(d) { return d[aes.size.value]; }))
        .range(aes.size.range);
      }
      else {
        scaleSize = function() {return aes.size.value; };
      }

      //update alpha scale
      if (aes.alpha.type === 'linear') {
        scaleAlpha = d3.scale.linear().domain(d3.extent(data, function(d) { return d[aes.alpha.value]; }))
        .range(aes.alpha.range);
      }
      else {
        scaleAlpha = function() {return aes.alpha.value; };
      }

      // select the SVG element, if it exists
      var svg = d3.select(this).selectAll('svg').data([d]);

      // otherwise create the skeletal chart
      var gEnter = svg.enter().append('svg').append('g');   // outer g element which contains both chart and legend
      var chartAreaEnter = gEnter.append('g').attr('class', 'chart-area');   // chart g
      chartAreaEnter.append('g').attr('class', 'x axis');
      chartAreaEnter.append('g').attr('class', 'y axis');
      var legendAreaEnter = gEnter.append('g').attr('class', 'legend-area');   // legend g

      // update outer dimensions
      svg.attr('height', height)
        .attr('width', width);

      // update inner dimensions
      var g = svg.select('g').attr('transform', translateString(margin.left, margin.top));
      var legendArea = svg.select('.legend-area').attr('transform', translateString(width - margin.left - margin.right - legend.margin - legend.padding, 0));

      // update points
      var dots = g.selectAll('.dot').data(data);

      // update existing points
      dots.transition().duration(1500)
        .attr('cx', function(d) {return scaleX(d[aes.x.value]); })
        .attr('cy', function(d, i) {return scaleY(d[aes.y.value]); })
        .attr('r', function(d) {return scaleSize( (aes.size) ? d[aes.size.value] : null); })
        .attr('fill-opacity', function(d) {return scaleAlpha( (aes.alpha) ? d[aes.alpha.value] : null); })
        .style('fill', function(d) { return scaleFill( (aes.fill) ? d[aes.fill.value] : null); })
      ;

      // insert new points
      dots.enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', 0)
      .attr('fill-opacity', function(d) {return scaleAlpha( (aes.alpha) ? d[aes.alpha.value] : null); })
      .style('fill', function(d) { return scaleFill((aes.fill) ? d[aes.fill.value] : null); })
      // .on('mouseover', jgd3.tip.show)
      // .on('mouseout', jgd3.tip.hide)
        .attr('cx', function(d) {return scaleX(d[aes.x.value]); })
        .attr('cy', function(d, i) {return scaleY(d[aes.y.value]); })
      .transition().duration(1500)
      .attr('r', function(d) {return scaleSize( (aes.size) ? d[aes.size.value] : null); })
      ;

      // remove deleted points
      dots.exit().transition().duration(1500).remove();

      // update x axis
      g.select('.x.axis')
      .attr('transform', translateString(0, scaleY.range()[0]))
      .call(axisX)
      ;

      //update y axis
      g.select('.y.axis')
      .call(axisY)
      ;

    });
  }

  // getters and setters
  my.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return my;
  };

  my.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return my;
  };

  my.scaleX = function(value) {
    if (!arguments.length) return scaleX;
    scaleX = value;
    return scaleX;
  }

  my.scaleY = function(value) {
    if (!arguments.length) return scaleY;
    scaleY = value;
    return scaleY;
  }

  my.scaleFill = function(value) {
    if (!arguments.length) return scaleFill;
    scaleFill = value;
    return scaleFill;
  }

  my.scaleSize = function(value) {
    if (!arguments.length) return scaleSize;
    scaleSize = value;
    return scaleSize;
  }

  my.defaultAes = function() {
    return defaultAes;
  }

  my.aes = function(aesthetic) {
    return aes;
  }

  my.data = function() {
    return data;
  }



  return my;

}
































