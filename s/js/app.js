jsPlumb.ready(function() {
    var forEach = function (context, fn) {
        [].forEach.call(context, fn)
    }

    var winH = $(window).height();

    $('.content .main').height(winH);
    $('.content .aside').height(winH);

    var Stage = (function () {
        var instance = jsPlumb.getInstance({
            // default drag options
            DragOptions: {
                cursor: 'pointer',
                zIndex: 2000
            },
            // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
            // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
            ConnectionOverlays: [
                ["Arrow", {
                    location: 1
                }],
                ["Label", {
                    location: 0.1,
                    id: "label",
                    cssClass: "aLabel"
                }]
            ],
            Container: "flowchart-demo"
        });

        // this is the paint style for the connecting lines..
        var connectorPaintStyle = {
                lineWidth: 4,
                strokeStyle: "#61B7CF",
                joinstyle: "round",
                outlineColor: "white",
                outlineWidth: 2
            },
            // .. and this is the hover style. 
            connectorHoverStyle = {
                lineWidth: 4,
                strokeStyle: "#216477",
                outlineWidth: 2,
                outlineColor: "white"
            },
            endpointHoverStyle = {
                fillStyle: "#216477",
                strokeStyle: "#216477"
            },
            // the definition of source endpoints (the small blue ones)
            sourceEndpoint = {
                endpoint: "Dot",
                paintStyle: {
                    strokeStyle: "#7AB02C",
                    fillStyle: "transparent",
                    radius: 7,
                    lineWidth: 3
                },
                isSource: true,
                connector: ["Flowchart", {
                    stub: [40, 60],
                    gap: 10,
                    cornerRadius: 5,
                    alwaysRespectStubs: true
                }],
                connectorStyle: connectorPaintStyle,
                hoverPaintStyle: endpointHoverStyle,
                connectorHoverStyle: connectorHoverStyle,
                dragOptions: {},
                overlays: [
                    ["Label", {
                        location: [0.5, 1.5],
                        label: "Drag",
                        cssClass: "endpointSourceLabel"
                    }]
                ]
            },
            // the definition of target endpoints (will appear when the user drags a connection) 
            targetEndpoint = {
                endpoint: "Dot",
                paintStyle: {
                    fillStyle: "#7AB02C",
                    radius: 11
                },
                hoverPaintStyle: endpointHoverStyle,
                maxConnections: -1,
                dropOptions: {
                    hoverClass: "hover",
                    activeClass: "active"
                },
                isTarget: true,
                overlays: [
                    ["Label", {
                        location: [0.5, -0.5],
                        label: "Drop",
                        cssClass: "endpointTargetLabel"
                    }]
                ]
            },
            init = function(connection) {
                connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
                connection.bind("editCompleted", function(o) {
                    if (typeof console != "undefined")
                        console.log("connection edited. path is now ", o.path);
                });
            };

        var _addEndpoints = function(toId, sourceAnchors, targetAnchors) {
            for (var i = 0; i < sourceAnchors.length; i++) {
                var sourceUUID = toId + sourceAnchors[i]; //(new Date).getTime()
                console.log(sourceUUID);
                instance.addEndpoint("flowchart" + toId, sourceEndpoint, {
                    anchor: sourceAnchors[i],
                    uuid: sourceUUID
                });
            }
            for (var j = 0; j < targetAnchors.length; j++) {
                var targetUUID = toId + targetAnchors[j];
                instance.addEndpoint("flowchart" + toId, targetEndpoint, {
                    anchor: targetAnchors[j],
                    uuid: targetUUID
                });
            }
        };

        // suspend drawing and initialise.
        instance.doWhileSuspended(function() {

            _addEndpoints("Window4", ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);
            _addEndpoints("Window2", ["LeftMiddle", "BottomCenter"], ["TopCenter", "RightMiddle"]);
            _addEndpoints("Window3", ["RightMiddle", "BottomCenter"], ["LeftMiddle", "TopCenter"]);
            _addEndpoints("Window1", ["LeftMiddle", "RightMiddle"], ["TopCenter", "BottomCenter"]);

            // listen for new connections; initialise them the same way we initialise the connections at startup.
            instance.bind("connection", function(connInfo, originalEvent) {
                init(connInfo.connection);
            });

            // make all the window divs draggable                       
            instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), {
                grid: [20, 20]
            });
            // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector 
            // method, or document.querySelectorAll:
            //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

            // connect a few up
            instance.connect({
                uuids: ["Window2BottomCenter", "Window3TopCenter"],
                editable: true
            });
            instance.connect({
                uuids: ["Window2LeftMiddle", "Window4LeftMiddle"],
                editable: true
            });
            instance.connect({
                uuids: ["Window4TopCenter", "Window4RightMiddle"],
                editable: true
            });
            instance.connect({
                uuids: ["Window3RightMiddle", "Window2RightMiddle"],
                editable: true
            });
            instance.connect({
                uuids: ["Window4BottomCenter", "Window1TopCenter"],
                editable: true
            });
            instance.connect({
                uuids: ["Window3BottomCenter", "Window1BottomCenter"],
                editable: true
            });
            //

            //
            // listen for clicks on connections, and offer to delete connections on click.
            //
            instance.bind("click", function(conn, originalEvent) {
                if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
                    jsPlumb.detach(conn);
            });

            instance.bind("connectionDrag", function(connection) {
                console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
            });

            instance.bind("connectionDragStop", function(connection) {
                console.log("connection " + connection.id + " was dragged");
            });

            instance.bind("connectionMoved", function(params) {
                console.log("connection " + params.connection.id + " was moved");
            });
        });
        
        return {
            addEndpoint: _addEndpoints,
            instance: instance
        }
    })();

    // 绑定组件拖拽事件
    (function () {
        var handleStart = function (e) {
            console.log('dragstart: ', e);

            e.dataTransfer.setData('selector', '.controls li[data-control="' + e.currentTarget.getAttribute('data-control') + '"]')
        };

        var handleDragOver = function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }

            return false;
        };

        var handleDragEnter = function (e) {
            console.log('dragenter:', e);
            // this.classList.add('over');
        };

        var handleDragLeave = function (e) {
            console.log('dragleave:', e);
            // this.classList.remove('over');
        };

        var handleDrop = function (e) {
            console.log('drop:', e);

            if (e.stopPropagation) {
                e.stopPropagation();
            }

            var sourceEl = document.querySelector(e.dataTransfer.getData('selector'));

            var index = parseInt(sourceEl.getAttribute('data-control').replace('ctrl', ''), 10);
            var windowid = index + (new Date).getTime();
            var dragPoints = sourceEl.getAttribute('drag-points');
            var dropPoints = sourceEl.getAttribute('drop-points');

            var left = e.pageX- $('.content .aside').width() - parseInt($('.window').width())/2;
            var top = e.pageY - parseInt($('.window').height())/2;
            var $win = $('<div class="window" id="flowchartWindow' + windowid + '" style="left:'+left+'px; top:'+top+'px"><strong>' + index + '</strong></div>')

            $('.main .stage').prepend($win);

            Stage.instance.doWhileSuspended(function () {
                Stage.addEndpoint("Window" + windowid, ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);//[0.2,0,-0.8,0]
                //Stage.addEndpoint("Window" + windowid, dragPoints.split(','), dropPoints.split(','));
            })

            Stage.instance.draggable(jsPlumb.getSelector("#flowchartWindow" + windowid), {
                grid: [20, 20]
            });

            return false;
        };

        var controls = document.querySelectorAll('.controls li');

        forEach(controls, function (el) {
            el.addEventListener('dragstart', handleStart, false);
            el.addEventListener('dragleave', handleDragLeave, false);
            
            el.addEventListener('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
                return false;

            }, false);
        })

        var stage = document.querySelector('.content .main');
        stage.addEventListener('dragenter', handleDragEnter, false);
        stage.addEventListener('dragover',handleDragOver, false);
        stage.addEventListener('drop', handleDrop, false);
    })();
    


    

});
