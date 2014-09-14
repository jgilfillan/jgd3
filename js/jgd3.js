// the following code is based on these two methods:
// *** http://bost.ocks.org/mike/chart/
// *** http://bost.ocks.org/mike/chart/time-series-chart.js

// instantiate chart with closure
mychart = geom_point();

var config = {
  data: [{x: 10, y: 3, type: 0.1, enrl_cnt: 5},{x: 4, y: 2, type: 0.2, enrl_cnt: 10},{x: 8, y: 9, type: 0.5, enrl_cnt: 15}],
  aes: {
    x: { value: 'x', type: 'linear' },
    y: { value: 'y', type: 'linear' },
    fill: {
      value: 'type',   // variable to map to fill colour
      type: 'discrete'   // discrete or continuous scale?
    },
    size: {
      value: 'enrl_cnt',
      type: 'linear',
      range: [5, 20]
    },
    alpha: {
      value: 'enrl_cnt',
      type: 'linear',
      range: [.4, 1]
    }
  },

};

// pass selection to mychart
d3.select('#chart1').datum(config).call(mychart);
// d3.select('#chart2').datum([0,2,4,6,8,10.5]).call(mychart);

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





































var jgd3 = new JGD3('#chart1');

// // comment out for real run..
// // readDropBoxFile([{link: 'http://localhost:1651/sample/BenchmarkDC_Disclosure_2012.csv', name: 'BenchmarkDC_Disclosure_2012.csv'}]);


function JGD3(chartElementSelector) {

  // page info
  // this.outerDim = {width: 1100, height: 600};
  // this.margin = {left: 80, top: 20, bottom: 20, right: 20};
  // this.innerDim = {
  //   width: this.outerDim.width - this.margin.left - this.margin.right,
  //   height: this.outerDim.height - this.margin.top - this.margin.bottom
  // };

  // properties
  this.chartSelector = chartElementSelector;
  this.datasets = [];
  this.aes = {
    fill: {type: 'static', value: 'black'},
    // size: {type: 'static', value: 10},
    alpha: {type: 'static', value: 1}
  }
  // this.scale = {
  //   x: d3.scale.linear().range([0, this.innerDim.width]),
  //   y: d3.scale.linear().range([this.innerDim.height, 0]),
  //   size: d3.scale.linear().range([2, 15]),
  //   colour: d3.scale.ordinal().range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999']),
  //   tooltip: []
  // };
  // this.axis = {
  //   x: d3.svg.axis().scale(this.scale.x).orient("bottom"),
  //   y: d3.svg.axis().scale(this.scale.y).orient("left")};



  // // initialise chart
  // this.chart = d3.select(chartElementSelector).append('svg')
  //   .attr('height', this.outerDim.height)
  //   .attr('width', this.outerDim.width)
  //   .attr('class', 'chart')
  //   ;

  // this.chartArea = this.chart.append('g')
  //   .attr('transform', translateString(this.margin.left, this.margin.top))
  //   .attr('class', 'chart-area')
  //   ;

  // this.chartAxisX = this.chartArea.append('g').attr('class', 'axis').attr('transform', translateString(0, this.innerDim.height));;
  // this.chartAxisY = this.chartArea.append('g').attr('class', 'axis').attr('transform', translateString(0, 0));;

  // // set up d3-tip tooltip - see https://github.com/Caged/d3-tip
  // this.tip = d3.tip()
  //   .attr('class', 'd3-tip')
  //   .direction('n')
  //   .offset([-10, 0])
  // ;

  // this.chart.call(this.tip);
}

//translate function
function translateString(x, y) {
  return 'translate(' + x + ',' + y + ')';
}

// returns the index of a given obj in a given array.  optionally accepts an accessor function.
jgd3.indexOf = function (obj, array, accessor) {
  if (accessor === undefined) {
    accessor = function(d) {return d;};
  }

  return array.map(accessor).indexOf(obj);
}

jgd3.getElementValue = function(selection) {
  return selection.selectAll('option:checked')[0].map(function(d) {return d.value;});
}

// // function to run when a parameter changes
jgd3.parameterChanged = function(d) {
  //array of selected values
  var changedElement = d3.select(this),
      selected = jgd3.getElementValue(changedElement),
      changedElementId = changedElement[0][0].id
      ;

  console.log(changedElementId, selected[0]);

  // if x mapping changes
  if (changedElementId === 'xSelect') {
    if (jgd3.aes.x) {                                                       // if y mapping objects already exists
      (selected[0]) ? jgd3.aes.x.value = selected[0] : delete jgd3.aes.x;   // if selected value not blank
    }
    else {                                                                  // if y mapping object doesn't already exist
      jgd3.aes.x = {value: selected[0]};
    }
  } 

  // if y mapping changes
  if (changedElementId === 'ySelect') {
    if (jgd3.aes.y) {
      (selected[0]) ? jgd3.aes.y.value = selected[0] : delete jgd3.aes.y;
    }
    else {
      jgd3.aes.y = {value: selected[0]};
    }
  } 

  // if fill mapping changes
  if (changedElementId === 'colourSelect') {
      (selected[0] !== '') ? jgd3.aes.fill = {value: selected[0], type: 'discrete'} : jgd3.aes.fill = mychart.defaultAes().size;    // todo: implement discrete option + change else to pull default
  } 

  // if size mapping changes
  if (changedElementId === 'sizeSelect') {
    console.log(selected[0]);
      (selected[0] !== '') ? jgd3.aes.size = {value: selected[0], type: 'linear', range: [10, 20]} : jgd3.aes.size = mychart.defaultAes().size;    // todo: implement discrete option
  }

  // if size mapping changes
  if (changedElementId === 'alphaSelect') {
      (selected[0] !== '') ? jgd3.aes.alpha = {value: selected[0], type: 'linear', range: [0.5, 1]} : jgd3.aes.alpha = mychart.defaultAes().size;    // todo: implement discrete option
  } 


  // if filters selection changes
  (changedElementId === 'filterSelect') ? jgd3.populateFilterControls() : null;

  console.log(jgd3.aes);

  // if mandatory mappings exist, draw chart
  if (jgd3.aes.x && jgd3.aes.y) {
    config = {data: jgd3.datasets[0].data, aes: jgd3.aes};
    d3.select(jgd3.chartSelector).datum(config).call(mychart);
  }

}

jgd3.getVariableValue = function(variable) {
  return d3.set(jgd3.datasets[0].data.map(function(d) { return d[variable]; })).values();
}

jgd3.populateFilterControls = function() {
  console.log('changing filter list!');
  var filters = d3.select('#filterSelect').selectAll('.filter-list')
  .data(jgd3.getElementValue(d3.select('#filterSelect').select('select')).filter(function(d) {return d !== ''; }))
  ;

  // update
  filters.select('label')
  .text(function(d) { return d; })
  ;

  var filterOptions = filters.select('select').selectAll('option')
   .data(function(d) {return jgd3.getVariableValue(d); })
   ;

   filterOptions.attr('value', function(d) { return d; })
   .text(function(d) { return d; })
  ;

   filterOptions.enter()
   .append('option')
   .attr('value', function(d) { return d; })
   .text(function(d) { return d; })
  ;

  filterOptions.exit().remove();

  // enter
  var newFilters = filters.enter()
  .append('div')
  .attr('class', 'filter-list')
  .attr('id', function(d) { return 'filter-' + d; })
  ;

  newFilters.append('label')
  .attr('for', function(d) { return 'filter-' + d; })
  .text(function(d) { return d; })
  ;

  newFilters.append('select')
   .attr('class', 'form-control input-sm')
   .attr('multiple', 'multiple')
   .selectAll('option')
   .data(function(d) {return jgd3.getVariableValue(d); })
   .enter()
   .append('option')
   .attr('value', function(d) { return d; })
   .text(function(d) { return d; })
  ;

  // exit
  filters.exit().remove();
}

jgd3.populateSelectControls = function(parameterList) {
  var formGroup = d3.select('#parameter-form').selectAll('.form-group').data(parameterList)
    .enter()
    .append('div')
    .attr('class', function(d) {return (d.required) ? 'form-group has-error' : 'form-group';} )  //add has error for required fields
    .attr('id', function(d) {return d.id; })
    .on('change', jgd3.parameterChanged)
    ;

  // labels
  formGroup.append('label')
    .attr('for', function(d) { return d.id; })
    .text(function(d) { return d.label; })
    ;

  // controls
  formGroup.append('select')
    .attr('class', 'form-control input-sm')
    .attr('multiple', function(d) { return (d.type === 'multi-select') ? 'multi' : null; })
    .selectAll('option')    // insert parameter values
    .data(function(d) {return d.list; }) 
    .enter()
    .append('option')
    .attr('value', function(d) {return d.value})
    .text(function(d) {return d.label; })
    ;
}

jgd3.Parameter = function(id, label, type, required, list) {
  this.id = id;
  this.label = label;
  this.type = type;   //select, multi-select
  this.required = required;  //boolean
  this.list = d3.merge([['-- No Mapping--'], list]).map(function(d, i) { return (i === 0) ? { label: d, value: '', selected: true } : { label: d, value: d, selected: false }; });
}

function Dataset(data, fileName) {
  this.data = data;
  this.sourceFileName = fileName;
  this.emptyV = this.getEmptyVariables(this.data);
  this.continuousV = this.getContinuousVariables(this.data, this.emptyV);
  this.timeseriesV = [];
  this.discreteV = this.getDiscreteVariables(this.data, this.emptyV);

  // initialise parameters array, then populate
  this.parameters = [];
  this.parameters.push(new jgd3.Parameter('xSelect', 'x Axis Mapping', 'select', true, this.continuousV));
  this.parameters.push(new jgd3.Parameter('ySelect', 'y Axis Mapping', 'select', true, this.continuousV));
  this.parameters.push(new jgd3.Parameter('colourSelect', 'Colour Mapping', 'select', false, this.discreteV));
  this.parameters.push(new jgd3.Parameter('sizeSelect', 'Size Mapping', 'select', false, this.continuousV));
  this.parameters.push(new jgd3.Parameter('alphaSelect', 'Alpha Mapping', 'select', false, this.continuousV));
  this.parameters.push(new jgd3.Parameter('tooltipSelect', 'Tooltip Mapping', 'multi-select', false, this.continuousV.concat(this.discreteV)));
  this.parameters.push(new jgd3.Parameter('filterSelect', 'Filter Mapping', 'multi-select', false, this.discreteV));

  // add parameter controls to off-canvas nav
  jgd3.populateSelectControls(this.parameters);

}


Dataset.prototype.getEmptyVariables = function(data) {
  var keys = Object.keys(data[0]),
      emptyVariables = [];
      ;

  keys.map(function(key) {
    var isEmpty = data.reduce(function(a, b) {
      if (b[key].trim() !== '') { return false; } else { return a; }
    }, true);

    if (isEmpty) { emptyVariables.push(key); }
  });

  return emptyVariables;
}

Dataset.prototype.getContinuousVariables = function(data, emptyList) {
  var keys = Object.keys(data[0]).filter(function(d) { return (emptyList.indexOf(d) === -1); }),
      continuousVariables = [];
      ;

  keys.map(function(key) {
    var isContinuous = data.reduce(function(a, b) {
      if (isNaN(b[key])) { return false; } else { return a; }
    }, true);

    if (isContinuous) { continuousVariables.push(key); }
  });

  return continuousVariables;
}

Dataset.prototype.getDiscreteVariables = function(data, emptyList) {
  var keys = Object.keys(data[0]).filter(function(d) { return (emptyList.indexOf(d) === -1); }),
      discreteVariables = [];
      ;

  keys.map(function(key) {
    var isDiscrete = data.reduce(function(a, b) {
      if (isNaN(b[key])) { return true; } else { return a; }
    }, false);

    if (isDiscrete) { discreteVariables.push(key); }
  });

  return discreteVariables;
}



function dropBoxOnClick() {
  var dropBoxOptions = {
  success: readDropBoxFile,
  linkType: 'direct',
  multiselect: false,
  extensions: ['.csv']
  }

  Dropbox.choose(dropBoxOptions);
}

function readLocalFile() {
  // console.log(document.getElementById('csvFile').files[0].name);
  csvData = Papa.parse(document.getElementById('csvFile').files[0], {
    delimiter: "",
    header: true,
    dynamicTyping: false,
    preview: 0,
    step: undefined,
    encoding: "",
    worker: false,
    comments: false,
    complete: processCSV(document.getElementById('csvFile').files[0].name),    //callback function
    download: false
    }
  );

}

function readDropBoxFile(files) {
  // console.log(files[0].name);
  csvData = Papa.parse(files[0].link, {
    delimiter: "",
    header: true,
    dynamicTyping: false,
    preview: 0,
    step: undefined,
    encoding: "",
    worker: false,
    comments: false,
    complete: processCSV(files[0].name),    //callback function
    download: true
    }
  );
}

function processCSV(fileName) {
  return function(results, file) {

    console.log(fileName, results);

    // check file with same name not loaded
    if (jgd3.indexOf(fileName, jgd3.datasets, function(d) { return d.sourceFileName; }) === -1) {
      jgd3.datasets.push(new Dataset(results.data, fileName));
    }

    // popups to alert user if conditions not met
    else {
      window.alert("File names must be unique!");
    }
  };
}

