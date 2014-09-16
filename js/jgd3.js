
var mychart = geom_point();
var jgd3 = new JGD3('#chart1', mychart);

// // comment out for real run..
// // readDropBoxFile([{link: 'http://localhost:1651/sample/BenchmarkDC_Disclosure_2012.csv', name: 'BenchmarkDC_Disclosure_2012.csv'}]);


function JGD3(chartElementSelector, drawMethod) {

  // page info
  // this.outerDim = {width: 1100, height: 600};
  // this.margin = {left: 80, top: 20, bottom: 20, right: 20};
  // this.innerDim = {
  //   width: this.outerDim.width - this.margin.left - this.margin.right,
  //   height: this.outerDim.height - this.margin.top - this.margin.bottom
  // };

  // properties
  this.chartSelector = chartElementSelector;
  this.draw = drawMethod;
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
  if (changedElementId === 'fillSelect') {
      (selected[0] !== '') ? jgd3.aes.fill = {value: selected[0], type: 'discrete'} : delete jgd3.aes.fill;    // todo: implement discrete option + change else to pull default
  } 

  // if size mapping changes
  if (changedElementId === 'sizeSelect') {
    console.log(selected[0]);
      (selected[0] !== '') ? jgd3.aes.size = {value: selected[0], type: 'linear', range: [10, 20]} : delete jgd3.aes.size;    // todo: implement discrete option
  }

  // if size mapping changes
  if (changedElementId === 'alphaSelect') {
      (selected[0] !== '') ? jgd3.aes.alpha = {value: selected[0], type: 'linear', range: [0.5, 1]} : delete jgd3.aes.alpha;    // todo: implement discrete option
  } 

  // if size mapping changes
  if (changedElementId === 'tooltipSelect') {
      (selected[0] !== '') ? jgd3.aes.tip = {value: selected, type: 'mapped'} : delete jgd3.aes.tip;    // todo: implement discrete option
  } 


  // if filters selection changes
  (changedElementId === 'filterSelect') ? jgd3.populateFilterControls() : null;

  console.log(jgd3.aes);

  // if mandatory mappings exist, draw chart
  if (jgd3.aes.x && jgd3.aes.y) {
    config = {data: jgd3.datasets[0].data, aes: jgd3.aes};
    d3.select(jgd3.chartSelector).datum(config).call(jgd3.draw);
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
  this.parameters.push(new jgd3.Parameter('fillSelect', 'Fill Mapping', 'select', false, this.discreteV));
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

