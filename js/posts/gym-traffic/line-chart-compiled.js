'use strict';$(document).ready(function(){d3.csv('/datasets/gym-traffic/linechart-data.csv',function(a,b){if(a)throw a;b=processData(b),initGraphics(b)})});function initGraphics(a){// update line chart using week and day selections
function b(c){var f=d3.select('#pick-week').property('value'),h=d3.select('#pick-day').property('value'),i=d3.select('#pick-scale').property('value'),j=a.filter(function(k){return k.week==f&k.day==h});renderLineChart(j,i,c)}// render chart for the first time upon loading
d3.select('#pick-scale').on('change',function(){return b(!1)}),d3.select('#pick-week').on('change',function(){return b(!1)}).selectAll('option').data(d3.set(a,function(c){return c.week}).values()).enter().append('option').text(function(c){return c}).attr('value',function(c){return c}),d3.select('#pick-day').on('change',function(){return b(!1)}).selectAll('option').data(d3.set(a,function(c){return c.day}).values()).enter().append('option').text(function(c){return c}).attr('value',function(c){return c}),d3.select('#line-chart').append('svg').append('g'),window.yAbsoluteExtent=d3.extent(a,function(c){return c.n_people}),b(!0)}// render line chart
function renderLineChart(a,b,c){c||(d3.select('.y-axis').remove(),d3.select('.x-axis').remove(),d3.selectAll('.time-line').remove());// determine size of container and append svg
var f=$('#line-chart').outerWidth(),h=$('#line-chart').outerHeight(),i=d3.select('#line-chart').select('svg').attr('width',f).attr('height',400),j={left:30,right:30,bottom:60,top:30},k=i.attr('width')-j.left-j.right,l=i.attr('height')-j.top-j.bottom,m=i.select('g').attr('transform','translate('+j.left+','+j.top+')'),n=d3.extent(a,function(A){return A.hour_minute}),o=d3.scaleTime().domain(n).range([0,k]),p=d3.scaleLinear().domain(window.yAbsoluteExtent).range([l,0]),q=d3.scaleLinear().domain([0,100]).range([l,0]),r='absolute'==b?p:q;// scales and axes
a.forEach(function(A){A.y_value='absolute'==b?A.n_people:A.n_people_rel}),m.append('g').attr('class','axis x-axis').attr('transform','translate(0,'+l+')').call(d3.axisBottom(o)),m.append('g').attr('class','axis y-axis').call(d3.axisLeft(r)),$('.line-chart .x-axis .tick text').first().addClass('invisible');// tooltip
var s=d3.tip().attr('class','heatchart-tip').html(function(A){var B=d3.timeFormat('%I:%M %p'),C='<span class=\'bold\'>'+B(A.data.hour_minute)+'</span><br>';return 0==A.data.n_people?C+'<span class=\'bold\'>Closed</span>':C+'<span class=\'bold\'>'+('wooden'==A.data.facility?'Wooden # people: ':'BFit # people: ')+'</span>'+A.data.n_people+'<br><span class=\'bold\'>'+('wooden'==A.data.facility?'Wooden relative to peak: ':'BFit relative to peak: ')+'</span>'+A.data.n_people_rel+'%'});m.call(s);// lines
var t=d3.line().x(function(A){return o(A.hour_minute)}).y(function(A){return r(A.y_value)});m.append('path').datum(a.filter(function(A){return'wooden'==A.facility})).attr('d',t).attr('class','time-line wooden'),m.append('path').datum(a.filter(function(A){return'bfit'==A.facility})).attr('d',t).attr('class','time-line bfit');// mouse interaction
var u=d3.voronoi().x(function(A){return o(A.hour_minute)}).y(function(A){return r(A.y_value)}),v=m.append('g').attr('transform','translate(-100, -100)').attr('class','focus');v.append('circle').attr('r',4);var w=m.append('g').attr('class','voronoi'),x=u.extent([[0,0],[k,l]]).polygons(a);w.selectAll('path').data(x).enter().append('path').attr('d',function(A){return A?'M'+A.join('L')+'Z':null}).on('mouseover',function(B){s.show(B),v.attr('transform','translate('+o(B.data.hour_minute)+','+r(B.data.y_value)+')')}).on('mouseout',function(B){s.hide(B),v.attr('transform','translate(-100,-100)')}// legend
);var y=d3.scaleOrdinal().domain(['Wooden','BFit']).range(['#008fd5','#ffb81c']),z=d3.legendColor().shape('rect').shapeHeight(6).shapeWidth(25).shapePadding(25).orient('horizontal').scale(y);i.append('g').attr('class','line-legend').attr('transform','translate(50,370)'),i.select('.line-legend').call(z)}function processData(a){var b=d3.timeParse('%H:%M');return a.forEach(function(c){c.hour_minute=b(Math.round(c.hour)+':'+Math.round(c.minute)),c.n_people=parseInt(c.n_people),c.n_people_rel=parseInt(100*+c.n_people_rel)}),a}