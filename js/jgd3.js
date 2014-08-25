var jgd3 = new JGD3;

// comment out for real run..
readDropBoxFile([{link: 'http://localhost:1651/sample/BenchmarkDC_Disclosure_2012.csv', name: 'BenchmarkDC_Disclosure_2012.csv'}]);


function JGD3() {
  // page info
  this.outerDim = {width: 800, height: 600};
  this.margin = {left: 20, top: 20, bottom: 20, right: 20};

  // properties
  this.datasets = [];
  this.scale = {x: d3.scale.linear().range([0, this.outerDim.width - this.margin.left - this.margin.right]),
                y: d3.scale.linear([0, this.outerDim.height - this.margin.top - this.margin.bottom])};
  this.axis = {x: null, y: null};
}

// returns the index of a given obj in a given array.  optionally accepts an accessor function.
jgd3.indexOf = function (obj, array, accessor) {
  if (accessor === undefined) {
    accessor = function(d) {return d;};
  }

  return array.map(accessor).indexOf(obj);
}

// function to run when a parameter changes
jgd3.parameterChanged = function(d) {
  //array of selected values
  var changedElement = d3.select(this),
      selected = changedElement.selectAll('option:checked')[0].map(function(d) {return d.value;}),
      changedElementId = changedElement[0][0].id
      ;

  console.log(changedElementId);
  console.log(selected);

  (changedElementId === 'xSelect') ? jgd3.resetScaleX(jgd3.scale.x, selected[0]) : null;

}

jgd3.resetScaleX = function(scale, parameter) {
  console.log(this.datasets[0].data);
  scale.domain(d3.extent(this.datasets[0].data, function(d) {return (+d[parameter] === 0) ? null : +d[parameter]; }));
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
  this.parameters.push(new jgd3.Parameter('colourSelect', 'Color Mapping', 'select', false, this.discreteV));
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

