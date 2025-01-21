<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as go from 'gojs'
import { CustomResizingTool } from './CustomResizingTool';


import product1ImgUrl from "@/assets/cola.png";
import product2ImgUrl from "@/assets/pepsi.png";
import product3ImgUrl from "@/assets/golda.png";


const props = defineProps({ nodeDataArray: Array, linkDataArray: Array })
const emitter = defineEmits([
  "ExternalObjectsDropped",
  "SelectionMoved"
])

const planogram = ref(null)
const diagramDiv = ref(null);
const paletteSmallDiv = ref(null);
const paletteTallDiv = ref(null);
const paletteWideDiv = ref(null);
const paletteBigDiv = ref(null);
const sectionDiv = ref(null);
const shelfeDiv = ref(null);

const savedModel = ref("");

let myDiagram, myPaletteSmall, myPaletteTall, myPaletteWide, myPaletteBig, mySection, myShelfe;


onMounted(function () {
  console.log("On Mounted");
  initDiagram();
})
onUnmounted(function () {
  if (myDiagram) myDiagram.div = null;
})
const initDiagram = () => {
  const CellSize = new go.Size(50, 50);
  const groupSectionFill = "rgba(128,128,128,0.2)";
  const shelfeFroupFill = "transparent";
  const groupStroke = "gray";
  const dropFill = "rgba(128,255,255,0.2)";
  const dropStroke = "red";
  const AllowTopLevel = false;
  // Initialize the main diagram
  myDiagram = new go.Diagram(diagramDiv.value, {
    grid: new go.Panel("Grid", { gridCellSize: CellSize }).add(
      new go.Shape("LineH", { stroke: "lightgray" }),
      new go.Shape("LineV", { stroke: "lightgray" })
    ),
    "draggingTool.isGridSnapEnabled": true,
    "resizingTool.isGridSnapEnabled": true,
    'draggingTool.gridSnapCellSpot': go.Spot.Center,
    ModelChanged: (e) => {
      if (e.isTransactionFinished) {
        savedModel.value = myDiagram.model.toJson();
      }
    },
    "animationManager.isEnabled": false,
    "undoManager.isEnabled": true,
    //resizingTool: new CustomResizingTool()

  });

  // Define templates (Nodes, Groups, Palettes)
  myDiagram.nodeTemplate = createNodeTemplate(CellSize);
  myDiagram.groupTemplate = createGroupTemplate(CellSize, groupSectionFill,shelfeFroupFill, groupStroke, dropFill, dropStroke);
  //myDiagram.toolManager.resizingTool = new CustomResizingTool();

  // decide what kinds of Parts can be added to a Group
  myDiagram.commandHandler.memberValidation = (grp, node) => {
    // Ensure `grp` is a Group and `node` is not a Group if adding a Group to a Group is not allowed
    if (!(grp instanceof go.Group) || !(node instanceof go.Node)) return false;

    // If `node` is a Group, we validate further based on `isShelf`
    if (node instanceof go.Group) {
      // Disallow adding Groups to Groups, unless the conditions are met
      if (node.data.isShelf === true && grp.data.isGroup === true && grp.data.isShelf === false) {
        return true; // Allow `isShelf = true` to be added to `isGroup = true && isShelf = false`
      }
      return false; // Disallow other combinations of Groups
    }
  // Check if the group is a shelf
  if (grp.data.isShelf && !node.data.isShelf) {
    const groupBounds = grp.actualBounds;
    const nodeBounds = node.actualBounds;

    // Calculate the top of the shelf based on the group's bottom and the y-offset
    const shelfTop = groupBounds.bottom - 10; // Adjust for your shelf offset

    // Check if the node is being placed on the shelf
    const isOnShelf =
      Math.abs(nodeBounds.bottom - shelfTop) < 1 && // Node's bottom aligns with shelf's top
      nodeBounds.left >= groupBounds.left && // Node's x within group's bounds
      nodeBounds.right <= groupBounds.right;
    
    console.log({nodeBounds})
    // Check if the node is being placed on top of another node
    const overlappingNodes = grp.memberParts.filter((member) => {
      if (member === node) return false; // Skip the node being moved
      const memberBounds = member.actualBounds;
      console.log({memberBounds});
      console.log("Node Bottom :")
      console.log(Math.abs(nodeBounds.bottom))
      console.log("Member top Bottom :")
      console.log(Math.abs(memberBounds.top))
      console.log(Math.abs(nodeBounds.bottom) - Math.abs(memberBounds.top))
      console.log("--")
      // Check if the node's bottom aligns with the member's top
      return (
        Math.abs(nodeBounds.bottom) - Math.abs(memberBounds.top) <= 1  // Node's bottom aligns with member's top
        && nodeBounds.left === memberBounds.left  // Node's x overlaps with member's x
        && nodeBounds.right === memberBounds.right
      );
    });
    console.log({overlappingNodes});
    const isOnTopOfNode = overlappingNodes.count > 0;

    // Allow placement if the node is on the shelf or on top of another node
    return isOnShelf || isOnTopOfNode;
  }

  return false; // Default behavior for non-shelf groups
};


  // what to do when a drag-drop occurs in the Diagram's background
  myDiagram.mouseDragOver = (e) => {
    if (!AllowTopLevel) {
      // OK to drop a group anywhere or any Node that is a member of a dragged Group
      var tool = e.diagram.toolManager.draggingTool;
      if (!tool.draggingParts.all((p) => p instanceof go.Group || (!p.isTopLevel && tool.draggingParts.has(p.containingGroup)))) {
        e.diagram.currentCursor = 'not-allowed';
      } else {
        e.diagram.currentCursor = '';
      }
    }
  };

  myDiagram.mouseDrop = (e) => {
    if (AllowTopLevel) {
      // when the selection is dropped in the diagram's background,
      // make sure the selected Parts no longer belong to any Group
      if (!e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true)) {
        e.diagram.currentTool.doCancel();
      }
    } else {
      // disallow dropping any regular nodes onto the background, but allow dropping "racks",
      // including any selected member nodes
      if (
        !e.diagram.selection.all((p) => {
          return p instanceof go.Group || (!p.isTopLevel && p.containingGroup.isSelected);
        })
      ) {
        e.diagram.currentTool.doCancel();
      }
    }
  };

  // Set the diagram model
  myDiagram.model = new go.GraphLinksModel([
    // { key: "G1", isGroup: true, pos: "0 0", size: "200 200" },
    // { key: "G2", isGroup: true, pos: "200 0", size: "200 200" },
    // { key: "G3", isGroup: true, pos: "0 200", size: "200 200" },
    // { key: "G4", isGroup: true, pos: "200 200", size: "200 200" },
  ]);

  // Initialize Palettes
  const green = "#B2FF59";
  const blue = "#81D4FA";
  const yellow = "#FFEB3B";
  const white = "#FFFFFF";

  myPaletteSmall = createPalette(paletteSmallDiv.value, myDiagram.nodeTemplate, myDiagram.groupTemplate, [
    { key: "g", color: green, source: product1ImgUrl, showImage: true },
    { key: "y", color: yellow, source: product3ImgUrl, showImage: true },
  ]);

  myPaletteTall = createPalette(paletteTallDiv.value, myDiagram.nodeTemplate, myDiagram.groupTemplate, [
    { key: "tG", size: '50 100', color: blue, source: product2ImgUrl, showImage: true },
  ]);

  mySection = createPalette(sectionDiv.value, myDiagram.nodeTemplate, myDiagram.groupTemplate, [
    { key: "Section", isGroup: true, isShelf: false, size: "200 400" },
  ]);
  myShelfe = createPalette(shelfeDiv.value, myDiagram.nodeTemplate, myDiagram.groupTemplate, [
    { key: "Shelfe", isGroup: true, isShelf: true, color: white, size: "200 100" },
  ]);
};


const createNodeTemplate = (CellSize) => {
  return new go.Node("Auto", {
    resizable: true,
    resizeObjectName: "SHAPE",
    locationSpot: new go.Spot(0, 0, CellSize.width / 2, CellSize.height / 2),
    mouseDragEnter: (e, node) => {
      e.handled = true;
      node.findObject('SHAPE').fill = 'red';
      e.diagram.currentCursor = 'not-allowed';
      highlightGroup(node.containingGroup, false);
    },
    mouseDragLeave: (e, node) => node.updateTargetBindings(),
    // disallow dropping anything onto an "item"
    mouseDrop: (e, node) => node.diagram.currentTool.doCancel()
  })
    // Bind the "position" property to the model, parsing and serializing it as a Point
    .bind(new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify))
    .add(
      new go.Shape("Rectangle", {
        name: "SHAPE",
        fill: "white",
        //minSize: CellSize,
        desiredSize: CellSize,
      })
        // Bind the "fill" property to the "color" in the model
        .bind(new go.Binding("fill", "color"))
        // Bind the "desiredSize" property to the "size" in the model, parsing and serializing as a Size
        .bind(new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),

      new go.Picture({
        source: "", // Default source
        desiredSize: CellSize, // Adjust size as needed
        alignment: go.Spot.Center,
      })
        .bind(new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify))
        .bind(new go.Binding("source", "", (data) => (data.showImage ? data.source : null))),

      new go.TextBlock({
        alignment: go.Spot.Center,
        font: "bold 16px sans-serif",
      })
        // Bind the "text" property to the "key" in the model
        .bind(new go.Binding("text", "key")),

    );
};


const createGroupTemplate = (CellSize, groupSectionFill,groupShelfeFill, groupStroke, dropFill, dropStroke) => {
  return new go.Group({
    layerName: "Background",
    resizable: true,
    resizeObjectName: "SHAPE",
    locationSpot: new go.Spot(0, 0, CellSize.width / 2, CellSize.height / 2),
    mouseDragEnter: (e, grp, prev) => {
      if (!highlightGroup(grp, true)) e.diagram.currentCursor = 'not-allowed';
      else e.diagram.currentCursor = '';
    },
    mouseDragLeave: (e, grp, next) => highlightGroup(grp, false),
    mouseDrop: (e, grp) => {
      const ok = grp.addMembers(grp.diagram.selection, true);
      if (!ok) grp.diagram.currentTool.doCancel();
    },
  })
    .bind(new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify))
    .bind(new go.Binding("isShelf"))
    .add(
      new go.Panel("Spot")
        .add(
          // Main shape
          new go.Shape("Rectangle", {
            name: "SHAPE",
            fill: "transparent",
            stroke: groupStroke,
            minSize: new go.Size(CellSize.width * 2, CellSize.height * 2),
          })
            .bind(
              new go.Binding("fill", "", (data) =>
               data.isShelf ? groupShelfeFill : groupSectionFill
              ) // Use `groupShelfeFill` if isShelf is true, otherwise use `groupSectionFill`
            )
            .bind(new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify))
        )
        .add(
          // Conditionally add the shelf only if isShelf is true
          new go.Panel("Auto", {
            alignment: new go.Spot(0.5, 1, 0, 10), // Align at the bottom center
            alignmentFocus: go.Spot.BottomCenter,
            visible: false, // Default to not visible
          })
            .bind(new go.Binding("visible", "isShelf")) // Visible only if isShelf is true
            .add(
              new go.Shape("Rectangle", {
                fill: "black", // Shelf color
                stroke: "white", // Shelf border
                height: 10, // Shelf height
                width: CellSize.width * 4, // Match group width
              })
            )
            .add(
              new go.TextBlock("Shelf", {
                alignment: go.Spot.Center,
                font: "bold 10pt sans-serif",
                stroke: "white",
              })
            )
        )
    );
};


const createPalette = (div, nodeTemplate, groupTemplate, modelData) => {
  const palette = new go.Palette(div, {
    nodeTemplate,
    groupTemplate,
  });
  palette.model = new go.GraphLinksModel(modelData);
  return palette;
};

function highlightGroup(grp, show) {
  if (!grp) return false;
  // check that the drop may really happen into the Group
  var tool = grp.diagram.toolManager.draggingTool;
  grp.isHighlighted = show && grp.canAddMembers(tool.draggingParts);
  return grp.isHighlighted;
}

function toggleImageForAll() {
  myDiagram.model.startTransaction("toggleImageForAll");

  // Iterate over all nodes in the model
  myDiagram.model.nodeDataArray.forEach((nodeData) => {
    // Toggle the showImage property for each node
    const currentShowImage = nodeData.showImage ?? true; // Default to true if not set
    myDiagram.model.setDataProperty(nodeData, "showImage", !currentShowImage);
  });

  myDiagram.model.commitTransaction("toggleImageForAll");
}

</script>

<template>
  <h1>Planogram App</h1>
  <img alt="Tes" src="https://placehold.co/50">

  <div ref="planogram" class="goPlanogram"></div>
  <div>
    <div id="sample">
      <div style="display: flex; justify-content: space-between">
        <div style="width: 135px; margin-right: 2px; background-color: whitesmoke; border: 1px solid black">
          <div ref="paletteSmallDiv" style="width: 140px; height: 340px"></div>
          <div ref="paletteTallDiv" style="width: 140px; height: 340px"></div>
          <!--<div ref="paletteWideDiv" style="width: 140px; height: 340px"></div>
          <div ref="paletteBigDiv" style="width: 140px; height: 340px"></div> -->
        </div>
        <div ref="diagramDiv" style="flex-grow: 1; height: 500px; border: 1px solid black"></div>
        <div style="width: 250px; margin-right: 2px; background-color: whitesmoke; border: 1px solid black">
          <div ref="sectionDiv" style="width: 250px; height: 350px"></div>
          <div ref="shelfeDiv" style="width: 250px; height: 150px"></div>
        </div>
      </div>
      <div>
        <button @click="toggleImageForAll">Toggle Images for All Nodes</button>
      </div>
      <p>Saved Model:</p>
      <pre>{{ savedModel }}</pre>
    </div>
  </div>
</template>

<style scoped>
/* Add custom styles if needed */
</style>