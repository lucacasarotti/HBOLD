// funzione per ottenere l'id dello schema corrente
var ssid = window.location.href.split('/').pop();
var nodesSelected;
var nodi;
var links;
var tree;

$('#myTab a[href="#graph"]').tab('show');
$.ajax({
	type: 'GET',
	url: '../getDataSS/' + ssid,
	dataType: 'json',
	success: function(data) {
		console.log(data);
		$(".graph-title").text(data.title); //stampo il nome del dataset a fianco di From
		data.nodes.count;
		data.nodes.id;
		for (var i = 0; i < data.nodes.length; i++) {
			data.nodes[i].count = 10;
			data.nodes[i].id = i;
		}
		tree = data;
		nodi = JSON.parse(sessionStorage.getItem('nodes'));
		nodesSelected = JSON.parse(sessionStorage.getItem('nodesSelected'));

		var nodiCS = new Array();
		var j = 0;

		for (var i = 0; i < nodi.length; i++) {
			nodiCS[j] = nodi[i];
			j++;
		}

		links = JSON.parse(sessionStorage.getItem('links'));
		window['mcpherTreeData'] = {
			"d3": {
				"options": {
					"radius": 4,
					"fontSize": 9,
					"labelFontSize": 14,
					"gravity": 0.1,
					"height": window.screen.height,
					"nodeFocusColor": "black",
					"nodeFocusRadius": 25,
					"nodeFocus": true,
					"linkDistance": 150,
					"charge": -220,
					"nodeResize": "count",
					"nodeLabel": "label",
					"linkName": "tag"
				},
				"data": {
					"nodes": data.nodes,
					"links": links
				}
			}
		};
		initialize().then(
			function(control) {
				fillLegend(data, control);
				doTheTreeViz(control, nodi, nodesSelected);
			}
		);

	}
});

$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
	e.target // newly activated tab
	e.relatedTarget // previous active tab
});

$('#reset').click(function() {
	location.href = "/hbold/cs/" + ssid;
});

$('#expAllbutt').click(function() {
	location.href = "/hbold/ss/" + ssid;
});


$('#expbutt').click(function() {
	console.log(tree);
	var node = JSON.parse(sessionStorage.getItem('d'));
	z = nodesSelected.length;
	nodesSelected[z] = node;
	nodesSelected.length++;
	console.log(nodesSelected);
	var stringaLink = new Object();
	var stringaNodes = new Object();
	stringaNodes.length = nodesSelected.length;
	var z = 0;
	for (var i = 0; i < tree.links.length; i++) {
		for (var j = 0; j < nodesSelected.length; j++) {

			if (tree.links[i].source == nodesSelected[j].id || tree.links[i].target == nodesSelected[j].id) {

				stringaLink[z] = tree.links[i];
				z++;
				break;

			}
		}
	}
	stringaLink.length = z;
	z = nodesSelected.length;
	sessionStorage.clear();
	sessionStorage.setItem('nodesSelected', JSON.stringify(nodesSelected));
	stringaNodes = nodesSelected;
	for (var i = 0; i < stringaLink.length; i++) {
		for (var j = 0; j < tree.nodes.length; j++) {
			if (stringaLink[i].source == tree.nodes[j].id || stringaLink[i].target == tree.nodes[j].id) {
				var flag = 1;
				for (var x = 0; x < stringaNodes.length; x++) {
					if (stringaNodes[x].id == tree.nodes[j].id) {
						flag = 0;
					}
				}
				if (flag == 1) {
					stringaNodes[z] = tree.nodes[j];
					z++;
					stringaNodes.length++;
				}
			}

		}
	}
	sessionStorage.setItem('links', JSON.stringify(stringaLink));
	sessionStorage.setItem('nodes', JSON.stringify(stringaNodes));
	location.reload();

});




function doTheTreeViz(control, nodiCS, nodesSelected) {
	//variabili per la visualizzazione di attributi e proprietà
	var htmlatt = ' ';
	var htmlprop = ' ';
	var nodeName;
	var svg = control.svg;

	var force = control.force;
	force.nodes(control.nodes)
		.links(control.links)
		.start();

	// check if the CS is still expandable or not
	var controlloEsp = 0;
	var contr;
	for (var j = 0; j < nodiCS.length; j++) {
		var o = nodiCS[j];
		contr = false;
		for (var k = 0; j < nodesSelected.length; k++) {
			if (o.id == nodesSelected[k].id) {
				contr = true;
				break;
			}
		}
		if (contr == true) {
			controlloEsp++;
		}
	}
	if (controlloEsp == nodiCS.length) alert("Cluster Schema no more expandable from this point.\nClick 'Reset CS' to return at the starting Cluster Schema or\nClick 'ExpandAll' to get the complete Schema Summary");


	// Update the links
	var link = svg.selectAll("line.link")
		.data(control.links, function(d) {
			return d.unique;
		});

	// Enter any new links
	link.enter().insert("svg:line", ".node")
		.attr("class", "link")
		.attr("x1", function(d) {
			return d.source.x;
		})
		.attr("y1", function(d) {
			return d.source.y;
		})
		.attr("x2", function(d) {
			return d.target.x;
		})
		.attr("y2", function(d) {
			return d.target.y;
		})
		.append("svg:title")
		.text(function(d) {
			return d.source[control.options.nodeLabel] + ":" + d.target[control.options.nodeLabel];
		});

	// Exit any old links.
	link.exit().remove();


	// Update the nodes
	var node = svg.selectAll("g.node")
		.data(control.nodes, function(d) {
			return d.unique;
		});

	node.select("circle")
		.style("fill", function(d) {
			return getColor(d);
		})
		.attr("r", function(d) {
			return getRadius(d);
		})

	// Enter any new nodes.
	var nodeEnter = node.enter()
		.append("svg:g")
		.attr("class", "node")
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		})
		// temporaneo, con il bottne da problemi con d. */ mantiene la navigazione, utilizza sempre il primo nodo
		.on("dblclick", function(d) {
			/*
			  if (!control.nodeClickInProgress ) {
			        control.nodeClickInProgress = true;
			        setTimeout(function(){
			            if (control.nodeClickInProgress) { 
			                control.nodeClickInProgress = false;
			                if (control.options.nodeFocus) {
			                    d.isCurrentlyFocused = !  d.isCurrentlyFocused;
			                    doTheTreeViz(makeFilteredData(control));
			                    
			                }
			            }
			        },control.clickHack); 
			    } */
		})



		.on("click", function(d) {
			sessionStorage.removeItem('d');
			sessionStorage.setItem('d', JSON.stringify(d));

			var flag = 1;
			for (var i = 0; i < nodesSelected.length; i++) {
				if (nodesSelected[i].id == d.index) {
					flag = 0;
				}
			}
			if (flag == 1) {
				$('#expbutt').show();
			} else {
				$('#expbutt').hide();
			}
			$('#expAllbutt').show();
			htmlnome = '';
			htmlatt = ' ';
			htmlprop = ' ';
			nodeName = d.name;

			htmlnome = d.name + " (" + d.ni + ") ";

			/*// MOSTRA ATTRIBUTI NODES
			    $('#nav-home').empty();
			    $('#nav-profile').empty();
			    $('#nameNode').empty(); 
			   for (var i=0; i< d.att.length; ++i){
			                var a= d.att[i].p;
			                        var att= a.fontcolor(control.color(d.att[i].vocab));

			                        htmlatt += '<p>' + att + '</p>';        
			                               
			                

			   }*/

			// MOSTRA ATTRIBUTI NODES
			$('#nav-home tbody').empty();
			$('#nav-profile tbody').empty();
			$('#nameNode').empty();
			for (var i = 0; i < d.att.length; ++i) {
				//var a= d.att[i].p;
				//      var att= a.fontcolor(control.color(d.att[i].vocab));

				//    htmlatt += '<p>' + att + '</p>';
				htmlatt += '<tr><th scope="row"><div style="width: 15px; height: 15px; border-radius: 50%; margin-top: 5px; background-color: ' + control.color(d.att[i].vocab) + '"></div></th><td>' + d.att[i].p + '</td></tr>'



			}

			// DEFINISCO ID FeNODES che sono d.index             


			//MOSTRO PROP LINK

			for (var j = 0; j < control.links.length; j++) {


				if (d.index == control.links[j].source.index || d.index == control.links[j].target.index) {

					for (var k = 0; k < control.links[j].label.length; k++) {

						var symbol = "";
						var name = "";

						if (d.index == control.links[j].source.index && d.index == control.links[j].target.index) {
							symbol = "<>";
							//symbol = "↔";
							//symbol = '<i class="zmdi zmdi-swap zmdi-hc-fw" style="font-size: 24px"></i>';
							name = control.links[j].target.name;
						} else if (d.index == control.links[j].source.index) {
							symbol = ">";
							//symbol = "→";
							//symbol = '<i class="zmdi zmdi-arrow-right zmdi-hc-fw" style="font-size: 24px"></i>';
							name = control.links[j].target.name;
						} else if (d.index == control.links[j].target.index) {
							symbol = "<";
							//symbol = "←";
							//symbol = '<i class="zmdi zmdi-arrow-left zmdi-hc-fw" style="font-size: 24px"></i>';
							name = control.links[j].source.name;
						}

						htmlprop += '<tr><th scope="row"><div style="width: 15px; height: 15px; border-radius: 50%; margin-top: 5px; background-color: ' + control.color(control.links[j].label[k].vocab) + '"></div></th><td>' + control.links[j].label[k].name + '</td><td>' + '<b><big>' + symbol + '</big></b>' + '</td><td>' + name + '</td></tr>';


						//PARTE VECCHIA BUONA
						/*ok=0;
						var prop=control.links[j].label[k].name;
						var result = prop.fontcolor(control.color(control.links[j].label[k].vocab));

						htmlprop += '<p>' + result ;

						if(d.index == control.links[j].source.index && d.index == control.links[j].target.index && ok==0){
						   htmlprop += " ↔  " + control.links[j].target.name + '</p>';
						   ok=1;
						}

						if(d.index == control.links[j].source.index && ok==0){
						   htmlprop += " →  " + control.links[j].target.name + '</p>';
						   ok=1;
						}

						if(d.index == control.links[j].target.index && ok==0 ){
						
						   htmlprop += " ←  " + control.links[j].source.name + '</p>';
						   ok=1;
						} */

					}

				}
			}


			$('#nav-profile tbody').append(htmlprop);
			$('#nav-home tbody').append(htmlatt);
			$('#nameNode').append(htmlnome);



		}).call(force.drag);




	nodeEnter
		.append("svg:circle")
		.attr("r", function(d) {
			return getRadius(d);
		})
		.style("fill", function(d) {
			return getColor(d);
		})
		.append("svg:title")
		.text(function(d) {
			return d[control.options.nodeLabel];
		});

	if (control.options.nodeLabel) {
		// text is done once for shadow as well as for text
		nodeEnter.append("svg:text")
			.attr("x", control.options.labelOffset)
			.attr("dy", ".31em")
			.attr("class", "shadow")
			.style("font-size", control.options.labelFontSize + "px")
			.text(function(d) {
				return d.shortName ? d.shortName : d.name;
			});
		nodeEnter.append("svg:text")
			.attr("x", control.options.labelOffset)
			.attr("dy", ".35em")
			.attr("class", "text")
			.style("font-size", control.options.labelFontSize + "px")
			.text(function(d) {
				return d.shortName ? d.shortName : d.name;
			});
	}

	// Exit any old nodes.
	node.exit().remove();
	control.link = svg.selectAll("line.link");

	control.node = svg.selectAll("g.node");
	d3.selectAll('g.node')
		.each(function(d) {
			var flagN = 1;
			for (var i = 0; i < nodiCS.length; i++) {
				if (nodiCS[i].id == d.index) {
					flagN = 0;
				}
			}
			if (flagN == 1)
				d3.select(this).attr("visibility", "hidden");
		});
	force.on("tick", tick);
	var istNodi = 0;
	var sommaNodi = 0;
	for (var i = 0; i < nodiCS.length; i++) {
		istNodi += nodiCS[i].ni;
	}
	for (var i = 0; i < control.nodes.length; i++) {
		sommaNodi += control.nodes[i].ni;
	}
	var perc = istNodi / sommaNodi * 100;
	perc = perc.toFixed(4);

	$('#perc-ss').append(perc + "% visualized, " + nodiCS.length + "/" + control.nodes.length + " nodes");



	if (control.options.linkName) {
		link.append("title")
			.text(function(d) {
				return d[control.options.linkName];
			});
	}


	function filtered(d) {
		if (!control.nodeClickInProgress) {
			control.nodeClickInProgress = true;
			setTimeout(function() {
				if (control.nodeClickInProgress) {
					control.nodeClickInProgress = false;
					if (control.options.nodeFocus) {
						d.isCurrentlyFocused = !d.isCurrentlyFocused;
						doTheTreeViz(makeFilteredData(control));

					}
				}
			}, control.clickHack);
		}
	}


	function tick() {
		link.attr("x1", function(d) {
				return d.source.x;
			})
			.attr("y1", function(d) {
				return d.source.y;
			})
			.attr("x2", function(d) {
				return d.target.x;
			})
			.attr("y2", function(d) {
				return d.target.y;
			});

		node.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});

	}
	//dimensione dei nodi in base al numero delle istanze
	function getRadius(d) {
		//var r=10;
		//var r = control.options.radius * (control.options.nodeResize ? Math.sqrt(d[control.options.nodeResize]) / Math.PI : 1);
		//return control.options.nodeFocus && d.isCurrentlyFocused ? control.options.nodeFocusRadius  : r;
		var max = 0;
		for (var i = 0; i < control.data.nodes.length; i++) {
			if (control.data.nodes[i].ni > max)
				max = control.data.nodes[i].ni;
		}
		return (d.ni * 20 / max) + 5;
	}
	//seleziona il colore del nodo in base al vocabolario di riferimento
	function getColor(d) {
		return control.options.nodeFocus && d.isCurrentlyFocused ? control.options.nodeFocusColor : control.color(d.vocab);
	}
};

function makeFilteredData(control, selectedNode) {
	// we'll keep only the data where filterned nodes are the source or target
	var newNodes = [];
	var newLinks = [];

	for (var i = 0; i < control.data.links.length; i++) {
		var link = control.data.links[i];
		if (link.target.isCurrentlyFocused || link.source.isCurrentlyFocused) {
			newLinks.push(link);
			addNodeIfNotThere(link.source, newNodes);
			addNodeIfNotThere(link.target, newNodes);
		}
	}
	// if none are selected reinstate the whole dataset
	if (newNodes.length > 0) {
		control.links = newLinks;
		control.nodes = newNodes;
	} else {
		control.nodes = control.data.nodes;
		control.links = control.data.links;
	}
	return control;

	function addNodeIfNotThere(node, nodes) {
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].unique == node.unique) return i;
		}
		return nodes.push(node) - 1;
	}
};

function organizeData(control) {

	for (var i = 0; i < control.nodes.length; i++) {
		var node = control.nodes[i];
		node.unique = i;
		node.isCurrentlyFocused = false;
	}

	for (var i = 0; i < control.links.length; i++) {
		var link = control.links[i];
		link.unique = i;
		link.source = control.nodes[link.source];
		link.target = control.nodes[link.target];
	}
	return control;
};




function initialize() {

	var initPromise = $.Deferred();

	getTheData().then(function(data) {
		var control = {};
		control.data = data;
		control.divName = "#chart";

		control.options = $.extend({
			stackHeight: 12,
			radius: 5,
			fontSize: 14,
			labelFontSize: 8,
			nodeLabel: null,
			markerWidth: 0,
			markerHeight: 0,
			width: window.screen.width / 2,
			gap: 1.5,
			nodeResize: "",
			linkDistance: 80,
			charge: -120,
			styleColumn: null,
			styles: null,
			linkName: null,
			nodeFocus: true,
			nodeFocusRadius: 25,
			nodeFocusColor: "black",
			labelOffset: "5",
			gravity: .05,
			height: window.screen.height
		}, control.data.d3.options);


		var options = control.options;
		options.gap = options.gap * options.radius;
		control.width = options.width;
		control.height = options.height;
		control.data = control.data.d3.data;
		control.nodes = control.data.nodes;
		control.links = control.data.links;
		control.color = d3.scale.category20();
		control.clickHack = 200;
		organizeData(control);

		control.svg = d3.select(control.divName)
			.append("svg:svg")
			.attr("width", control.width)
			.attr("height", control.height);


		// get list of unique values in stylecolumn
		control.linkStyles = [];
		if (control.options.styleColumn) {
			var x;
			for (var i = 0; i < control.links.length; i++) {
				if (control.linkStyles.indexOf(x = control.links[i][control.options.styleColumn].toLowerCase()) == -1)
					control.linkStyles.push(x);
			}
		} else
			control.linkStyles[0] = "defaultMarker";

		control.force = d3.layout.force().
		size([control.width, control.height])
			.linkDistance(control.options.linkDistance)
			.charge(control.options.charge)
			.gravity(control.options.gravity);


		initPromise.resolve(control);
	});
	return initPromise.promise();
};


function getTheData() {
	var dataPromise = $.Deferred();
	// return a promise if data is being received asynch and resolve it when done.
	dataPromise.resolve(mcpherTreeData);
	return dataPromise.promise();
};




/* script che riempie la legenda in basso a destra
     senza questo script non si vede nemmeno il CS "srotolato" */
function fillLegend(data, control) {
	var legend = "";
	var legendprova1;
	var legendprova2;
	for (var i = 0; i < data.vocab.length; i++) {

		legendprova1 = data.vocab[i];
		legendprova2 = legendprova1.fontcolor(control.color(data.vocab[i]));
		legend += legendprova2 + '<br>';
	}

	$("#legenda").attr('data-content', legend);
};

$('#legenda').popover();
