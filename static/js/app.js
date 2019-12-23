/* Plotly Challenge Homework
   Author: Gary Schulke
   Date: December 23, 2019
   Note: For local operation run the Python local file server. "python3 -m http.server"
*/

//  Global Variables
var url = `./data/samples.json`;
var samples_data = null;    // Entire contents of samples.json

// Reads the .json file and initiates creation of the page.
function readData() {
  d3.json(url).then(function (data) {
    samples_data = data;
    initializeIDPulldown();
    buildBarChart(0);
    buildBubbleChart(0);
    buildDemographics(0);
    buildGaugeChart(0);
    // log out the entire dataset
    console.log(samples_data);
  })
};

// The event handler for the Test Subject ID pulldown menu.
function optionChanged(optionValue) {
  console.log(optionValue);
  const id_idx = parseInt(optionValue);
  buildBarChart(id_idx);
  buildBubbleChart(id_idx);
  buildDemographics(id_idx);
  buildGaugeChart(id_idx);
}

// Gets all the Subject Ids and assigns the index.
// The .json file is sorted the same for namd, samples and metadata fields.
function initializeIDPulldown() {
  samples_data.names.forEach((val, index) => {
    let selDataset = d3.select("#selDataset");
    let option = selDataset.append("option");
    option.property("text", val);
    option.property("value", index);
    console.log(samples_data.names);
  })
};


// Construct the Bar Chart
// subID - the index value pulled from the pulldown selector.
function buildBarChart(subID) {
  
  let ids = samples_data.samples[subID].otu_ids;
  let lbl = samples_data.samples[subID].otu_labels;
  let val = samples_data.samples[subID].sample_values;

  console.log(ids);
  console.log(lbl);
  console.log(val);

  var trace1 = {
    x: val.slice(0, 10).reverse(),
    y: ids.slice(0, 10).reverse().map(val => "OTC " + val),
    text: lbl.slice(0, 10).reverse(),
    name: "Belly Button Bacteria",
    type: "bar",
    orientation: "h",
  };

  var data = [trace1];

  var layout = {
    title: {text: "Belly Button Bacteria", font:  {size: 24} },
    xaxis: {title: {text: `Subject: ${samples_data.samples[subID].id}`, font: {size: 24}} },
    margin: { l: 100, r: 100, t: 100, b: 100 }
  };

  Plotly.react("bar", data, layout);
}

// Contruct the Bubble Chart
// subID - the index value pulled from the pulldown selector.
function buildBubbleChart(subID) {
  let reordered = [];
  let ids = samples_data.samples[subID].otu_ids;
  let lbl = samples_data.samples[subID].otu_labels;
  let val = samples_data.samples[subID].sample_values;

  // Loop thorugh the data to put the data for each subject
  // in its own array.  This is needed for sorting by OTC
  for (i = 0; i < ids.length; i++) {
    reordered.push([ids[i], lbl[i], val[i]]);
  };
  reordered.sort((first, second) => {
    return +first[0] - +second[0];
  });
  console.log(reordered);
  ids = [];
  lbl = [];
  val = [];

  // Separate the data type into its own array
  // for use in the bubble chart.
  for (i = 0; i < reordered.length; i++) {
    ids.push(reordered[i][0]);
    lbl.push(reordered[i][1]);
    val.push(reordered[i][2]);
  };

  console.log(ids);
  console.log(lbl);
  console.log(val);

  // There is an array with the color values at the end of the file.
  const colors = getColors(ids.length);
  var trace1 = {
    x: ids,
    y: val,
    mode: 'markers',
    text: lbl,
    marker: {
      color: colors, 
      line: {color: ['rgb(255.255.255)'],
              width: Array(ids.length).fill(3)
            },
      size: val
    }
  };

  let data = [trace1];
  let layout = {
    title: {text: `Sample Distribution<br>Subject: ${samples_data.samples[subID].id}`, font: {size: 24} },
    showlegend: false,
    height: 600,
    width: 1200,
    xaxis: {title: {text: `OTC Sample IDs`, font: {size: 24}}},
  };

  Plotly.react('bubble', data, layout);
}

// Contruct the demographics table
// subID - the index value pulled from the pulldown selector.
function buildDemographics(id_idx) {
  let meta = samples_data.metadata[id_idx];
  let demo = [];
  // Capitalize the first letter of the label text
  // becaue it displays ugly if you don't.
  for (let key in meta) {
    let label = key[0].toUpperCase() + key.slice(1);
    let value = meta[key];
    let lbl = `${label}: ${value}`;
    demo.push(lbl);
  };
  console.log(demo);

  // Use d3 to create the table dynamically.
  d3.select('#sample-metadata').selectAll('*').remove();
  let ul = d3.select('#sample-metadata').append("ul");
  ul.style('marginLeft' , '0px')
  ul.selectAll('li')
    .data(demo)
    .enter()
    .append('li')
    .text(d => d)
    .style('list-style', 'none')
    .style('marginLeft' , '0px')
};

// Contruct the Gauge Chart
// subID - the index value pulled from the pulldown selector.
function buildGaugeChart(subID){
  let val = samples_data.metadata[subID].wfreq;

  console.log(val);

  var data = [
    {
      domain: { x: [0, 1], y: [0, 1] },
      value: val,
      title: { text: "Belly Button Washing Frequency<br>Scrubs Per Week", font: {size: 24} },
      type: "indicator",
      mode: "gauge+number",
      delta: { reference: 10 },
      gauge: {
        axis: { range: [0, 9], tickwidth: 1},
        bar: {color: 'grey'},
        steps: [
          { range: [0, 1], color: "ghostwhite" },
          { range: [1, 2], color: "whitesmoke" },
          { range: [2, 3], color: "oldlace" },
          { range: [3, 4], color: "lightyellow" },
          { range: [4, 5], color: "moccasin" },
          { range: [5, 6], color: "darkseagreen" },
          { range: [6, 7], color: "mediumseagreen" },
          { range: [7, 8], color: "seagreen" },
          { range: [8, 9], color: "darkgreen" }
              ]
            }
    }];
  
  var layout = { width: 600, 
                 height: 450, 
                 margin: { t: 0, b: 0 },
                 xaxis: {title: {text: `Subject: ${samples_data.samples[subID].id}`, font: {size: 24}} },  
};

  Plotly.react('gauge', data, layout);
};


// Returns an array of colors for use by the bubble chart.
// datalen - The list is sliced to return the correct number of colors.
function getColors(datalen) {
  const colorList =
    ['rgb(0,255,0)', 'rgb(0,0,255)', 'rgb(255,255,0)', 'rgb(0,255,255)', 'rgb(255,0,255)', 'rgb(192,192,192)',
      'rgb(128,128,128)', 'rgb(128,0,0)', 'rgb(128,128,0)', 'rgb(0,128,0)', 'rgb(128,0,128)', 'rgb(0,128,128)',
      'rgb(0,0,128)', 'rgb(0,255,0)', 'rgb(0,0,255)', 'rgb(255,255,0)', 'rgb(0,255,255)', 'rgb(255,0,255)',
      'rgb(192,192,192)', 'rgb(128,128,128)', 'rgb(128,0,0)', 'rgb(128,128,0)', 'rgb(0,128,0)', 'rgb(128,0,128)',
      'rgb(0,128,128)', 'rgb(0,0,128)', 'rgb(0,255,0)', 'rgb(0,0,255)', 'rgb(255,255,0)', 'rgb(0,255,255)',
      'rgb(255,0,255)', 'rgb(192,192,192)', 'rgb(128,128,128)', 'rgb(128,0,0)', 'rgb(128,128,0)', 'rgb(0,128,0)',
      'rgb(128,0,128)', 'rgb(0,128,128)', 'rgb(0,0,128)', 'rgb(0,255,0)', 'rgb(0,0,255)', 'rgb(255,255,0)',
      'rgb(0,255,255)', 'rgb(255,0,255)', 'rgb(192,192,192)', 'rgb(128,128,128)', 'rgb(128,0,0)', 'rgb(128,128,0)',
      'rgb(0,128,0)', 'rgb(128,0,128)', 'rgb(0,128,128)', 'rgb(0,0,128)',
      'rgb(0,255,0)', 'rgb(0,0,255)', 'rgb(255,255,0)', 'rgb(0,255,255)', 'rgb(255,0,255)', 'rgb(192,192,192)',
      'rgb(128,128,128)', 'rgb(128,0,0)', 'rgb(128,128,0)', 'rgb(0,128,0)', 'rgb(128,0,128)', 'rgb(0,128,128)',
      'rgb(0,0,128)', 'rgb(0,255,0)', 'rgb(0,0,255)', 'rgb(255,255,0)', 'rgb(0,255,255)', 'rgb(255,0,255)',
      'rgb(192,192,192)', 'rgb(128,128,128)', 'rgb(128,0,0)', 'rgb(128,128,0)', 'rgb(0,128,0)', 'rgb(128,0,128)',
      'rgb(0,128,128)', 'rgb(0,0,128)', 'rgb(0,255,0)', 'rgb(0,0,255)', 'rgb(255,255,0)', 'rgb(0,255,255)',
      'rgb(255,0,255)', 'rgb(192,192,192)', 'rgb(128,128,128)', 'rgb(128,0,0)', 'rgb(128,128,0)', 'rgb(0,128,0)',
      'rgb(128,0,128)', 'rgb(0,128,128)', 'rgb(0,0,128)', 'rgb(0,255,0)', 'rgb(0,0,255)', 'rgb(255,255,0)',
      'rgb(0,255,255)', 'rgb(255,0,255)', 'rgb(192,192,192)', 'rgb(128,128,128)', 'rgb(128,0,0)', 'rgb(128,128,0)',
      'rgb(0,128,0)', 'rgb(128,0,128)', 'rgb(0,128,128)', 'rgb(0,0,128)'
    ];
  return colorList.slice(0, datalen);
};


// Start program execution.
readData();
