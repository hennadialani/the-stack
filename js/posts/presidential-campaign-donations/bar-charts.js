function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var data_structure = []

var curr_cand;
var curr_filter = "total";

// VERTICAL BAR
// var color = d3.scale.category20();
var colorList = ['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354', '#74c476', '#a1d99b'];
var color = d3.scale.ordinal()
  .range(colorList);


var margin = {top: 40, right: 20, bottom: 50, left: 40},
    width = 720 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    var f = curr_filter == "donators" ? "Donators" : "Amount";
    var val = curr_filter == "donators" ? d.y : "$" + d.y.toFixed(2);
    return "<strong>College:</strong> <span style='color:red'>" + d.name.toUpperCase() + "</span><br><strong>" + f + ":</strong> <span style='color:red'>" + val + "</span>";
  })

var svg = d3.select("#vertical-bar").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr('class', 'wrapper')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);

// HORIZONTAL BAR
var margin2 = {top: 50, right: 10, bottom: 50, left: 50},
    width2 = 630 - margin2.left - margin2.right,
    height2 = 600 - margin2.top - margin2.bottom;

var xScale = d3.scale.linear()
  .domain([0, 1])
  .range([0, width2]);

var yScale = d3.scale.ordinal()
  .rangeRoundBands([height2, 0], 0.1);

var barSVG = d3.select("#horizontal-bar").append("svg")
  .attr("width", width2 + margin2.left + margin2.right)
  .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
  .attr("transform", "translate(" + margin2.left + ", " + margin2.top + ")");

var xAxis2 = barSVG.append("g")
  .attr("class", "x axis")
  .call(xScale.axis = d3.svg.axis().scale(xScale).orient("top"))
  .append("text")
  .attr("x", 570)
  .attr("y", -20)
  .style("text-anchor", "end")
  .text("Percentage from UC schools (%)")

var yAxis2 = barSVG.append("g")
  .attr("class", "y axis")
  .call(yScale.axis = d3.svg.axis().scale(yScale).orient("left"));

var schoolRects;
var currMode = 1;

function initBarGraph(initData) {
  transitionyScale(initData);

  var colleges = [];
  initData.colleges.map(function(d) { colleges.push(d.name); });
  yScale.domain(colleges);

  dataRects = barSVG.selectAll(".dataRect")
    .data(initData.colleges)
    .enter().append("g")
    .attr("class", function(d) { return "dataRect " + d.name;});

  dataRects.append("rect")
    .attr("x", 0)
    .attr("y", function(d) { return yScale(d.name); })
    .attr("width", function(d) { return xScale(d.total/initData.colleges_total); })
    .attr("height", yScale.rangeBand())
    .style("fill", "rgb(13, 75, 207)");
}

function transitionyScale(transitionData) {
    var map;
    var newYDomain = [];

    map = transitionData.colleges.map(function(d) {
      newYDomain.push(d["name"]);
    });

    yScale.domain(newYDomain);
    yScale.rangeRoundBands([newYDomain.length*50, 0], 0.1);

    yAxis2.transition()
      .duration(500)
      .ease("linear")
      .call(yScale.axis);
}

function updateHorizontalBar() {


  var dataRects = d3.selectAll(".dataRect").select("rect")
    .transition()
    .duration(500)
    .attr("width", 0);

  for (var i = 0; i < curr_cand.colleges.length; i++) {
    var specificSchoolRect = d3.select("." + curr_cand.colleges[i].name);

    specificSchoolRect.select("rect").transition()
      .duration(500)
      .attr("y", function(d, i) {
        return yScale(d.name); })
      .attr("height", function(d) {
        return yScale.rangeBand();
      })
      .attr("width", function(d) {
        return xScale(curr_cand.colleges[i].total/curr_cand.colleges_total);
      });
  }
}


d3.json("/datasets/presidential-campaign-donations/result.json", function(error, data) {
  var nest = d3.nest()
    .key(function(d) { return d.party; })
    .entries(data);

  initBarGraph(data[0]);

  data_structure = data;

  // console.log(data_structure);

  curr_cand = data_structure[0];

  $('#d1').dropdown({
    onChange: function (val) {
      if (val.split(' ')[0] == 'martin') {
        val = "O'Malley";
      }
      else {
        val = capitalizeFirstLetter(val.split(' ')[1]);
      }
      data.map(function(d) { if (d.name == val) curr_cand = d; });

      updateVerticalBar();
      updateHorizontalBar();
    }
  });

  $('#d2').dropdown({
    onChange: function (val) {
      if (val == "donators") {
        curr_filter = "donators";
      }
      else {
        curr_filter = "total";
      }

      updateVerticalBar();
      // updateHorizontalBar(); TO DO

    }
  });

  function updateVerticalBar() {

    if (curr_cand.colleges.length == 0) {
      new_layers = [
        [
          {
            x : 0,
            y: 0
          }
        ]
      ];
    }
    var colleges = curr_cand.colleges.map(function(c) { return c.name });

    console.log(curr_cand);
    var new_layers = d3.layout.stack()(colleges.map(function(c) {

      return curr_cand.jobs.map(function(d, i) {
        if (typeof d.colleges[c] == 'undefined') {
          return( { x : i, y : 0 })
        }
        return( { x : i, y : d.colleges[c][curr_filter], name : c } );
      });
    }));


    // console.log(new_layers);
    var testList = [];
    // console.log(listOfJobs);


    // console.log(x.domain())
    // console.log(new_layers);
    //   console.log(testList)
    var listOfJobs = ['TECH', 'FACULTY', 'HEALTH', 'PROF', 'GRAD', 'RESEARCH', 'UGRAD',
                      'ADMIN', 'ARTS', 'LEGAL', 'RETIRED', 'OTHER'];
      x.domain(listOfJobs);
    new_layers.forEach(function(d, i) {
        for (var i = 0; i < d.length; i++) {
          d[i].x = listOfJobs[i];
        }
    });

    // console.log(new_layers);
    y.domain([0, d3.max(new_layers[new_layers.length - 1], function(d) { return d.y0 + d.y; })]).nice()

    svg.select(".y.axis").remove()
    svg.select(".x.axis").remove()

    svg.select(".y.axis")
      .transition().duration(300)
      .call(yAxis);

    svg.select(".x.axis")
      .transition().duration(300)
      .call(xAxis);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (parseInt(height-90)).toString() + ")")
      .call(xAxis);


    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)

    svg.selectAll(".layer").remove();

    var new_layer = svg.selectAll(".layer")
      .data(new_layers)
      .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) {
        return color(i);
      });

    new_layer.selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y + d.y0); })
      .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
      .attr("width", x.rangeBand() - 1)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

      // var reverseColors = colorList.reverse();
      // puts college names into array for easier access
      var colleges = curr_cand.colleges;
      console.log(colleges);
      var college_names = [];
      for (var k = 0; k < colleges.length; k++) {
          college_names[k] = colleges[k].name.toUpperCase();
      }

      var rebirth = d3.selectAll(".legend").remove(); // removes legend every update

      // console.log(college_names.reverse());
      // creates legend with college names as data input
      var legend = svg.selectAll(".legend")
      .data(college_names)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(data, i) { return "translate(150," + (200 - i * 20) + ")"; });

      // outputs colored rectangles in order of reverseColors
    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d, i) {
        return colorList[i];
      });

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(data) { return data; });
  }

  updateVerticalBar();
});
