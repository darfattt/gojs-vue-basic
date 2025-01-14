<script>
import * as go from "gojs";
import { ref, onMounted, onUnmounted } from "vue";

export default {
  name: "PlanogramEditor",
  setup() {
    const diagramDiv = ref(null);
    const paletteSmallDiv = ref(null);
    const paletteTallDiv = ref(null);
    const paletteWideDiv = ref(null);
    const paletteBigDiv = ref(null);
    const savedModel = ref("");

    let myDiagram, myPaletteSmall, myPaletteTall, myPaletteWide, myPaletteBig;

    const initDiagram = () => {
      const CellSize = new go.Size(50, 50);
      const groupFill = "rgba(128,128,128,0.2)";
      const groupStroke = "gray";
      const dropFill = "rgba(128,255,255,0.2)";
      const dropStroke = "red";

      // Initialize the main diagram
      myDiagram = new go.Diagram(diagramDiv.value, {
        grid: new go.Panel("Grid", { gridCellSize: CellSize }).add(
          new go.Shape("LineH", { stroke: "lightgray" }),
          new go.Shape("LineV", { stroke: "lightgray" })
        ),
        "draggingTool.isGridSnapEnabled": true,
        "resizingTool.isGridSnapEnabled": true,
        ModelChanged: (e) => {
          if (e.isTransactionFinished) {
            savedModel.value = myDiagram.model.toJson();
          }
        },
        "animationManager.isEnabled": false,
        "undoManager.isEnabled": true,
      });

      // Define templates (Nodes, Groups, Palettes)
      myDiagram.nodeTemplate = createNodeTemplate(CellSize);
      myDiagram.groupTemplate = createGroupTemplate(CellSize, groupFill, groupStroke, dropFill, dropStroke);

      // Set the diagram model
      myDiagram.model = new go.GraphLinksModel([
        { key: "G1", isGroup: true, pos: "0 0", size: "200 200" },
        { key: "G2", isGroup: true, pos: "200 0", size: "200 200" },
        { key: "G3", isGroup: true, pos: "0 200", size: "200 200" },
        { key: "G4", isGroup: true, pos: "200 200", size: "200 200" },
      ]);

      // Initialize Palettes
      const green = "#B2FF59";
      const blue = "#81D4FA";
      const yellow = "#FFEB3B";

      myPaletteSmall = createPalette(paletteSmallDiv.value, myDiagram.nodeTemplate, myDiagram.groupTemplate, [
        { key: "g", color: green },
        { key: "b", color: blue },
        { key: "y", color: yellow },
      ]);

      // myPaletteTall = createPalette(paletteTallDiv.value, myDiagram.nodeTemplate, myDiagram.groupTemplate, [
      //   { key: "g", color: green, size: "50 100" },
      //   { key: "b", color: blue, size: "50 100" },
      //   { key: "y", color: yellow, size: "50 100" },
      // ]);

      // myPaletteWide = createPalette(paletteWideDiv.value, myDiagram.nodeTemplate, myDiagram.groupTemplate, [
      //   { key: "g", color: green, size: "100 50" },
      //   { key: "b", color: blue, size: "100 50" },
      //   { key: "y", color: yellow, size: "100 50" },
      // ]);

      // myPaletteBig = createPalette(paletteBigDiv.value, myDiagram.nodeTemplate, myDiagram.groupTemplate, [
      //   { key: "g", color: green, size: "100 100" },
      //   { key: "b", color: blue, size: "100 100" },
      //   { key: "y", color: yellow, size: "100 100" },
      // ]);
    };

    const createNodeTemplate = (CellSize) => {
      return new go.Node("Auto", {
        resizable: true,
        resizeObjectName: "SHAPE",
        locationSpot: new go.Spot(0, 0, CellSize.width / 2, CellSize.height / 2),
      })
        // Bind the "position" property to the model, parsing and serializing it as a Point
        .bind(new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify))
        .add(
          new go.Shape("Rectangle", {
            name: "SHAPE",
            fill: "white",
            minSize: CellSize,
            desiredSize: CellSize,
          })
            // Bind the "fill" property to the "color" in the model
            .bind(new go.Binding("fill", "color"))
            // Bind the "desiredSize" property to the "size" in the model, parsing and serializing as a Size
            .bind(new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
          new go.TextBlock({
            alignment: go.Spot.Center,
            font: "bold 16px sans-serif",
          })
            // Bind the "text" property to the "key" in the model
            .bind(new go.Binding("text", "key"))
        );
    };


    const createGroupTemplate = (CellSize, groupFill, groupStroke, dropFill, dropStroke) => {
      return new go.Group({
        layerName: "Background",
        resizable: true,
        resizeObjectName: "SHAPE",
        locationSpot: new go.Spot(0, 0, CellSize.width / 2, CellSize.height / 2),
      })
        // Bind the "position" property to the model, enabling two-way data binding
        .bind(new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify))
        .add(
          new go.Shape("Rectangle", {
            name: "SHAPE",
            fill: groupFill,
            stroke: groupStroke,
            minSize: new go.Size(CellSize.width * 2, CellSize.height * 2),
          })
            // Bind the "desiredSize" property to the model with two-way data binding
            .bind(new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify))
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

    onMounted(() => {
      initDiagram();
    });

    onUnmounted(() => {
      if (myDiagram) myDiagram.div = null;
    });

    return { diagramDiv, paletteSmallDiv, paletteTallDiv, paletteWideDiv, paletteBigDiv, savedModel };
  },
};
</script>

<template>
  <div>
    <div id="sample">
      <div style="display: flex; justify-content: space-between">
        <div style="width: 135px; margin-right: 2px; background-color: whitesmoke; border: 1px solid black">
          <div ref="paletteSmallDiv" style="width: 140px; height: 340px"></div>
          <div ref="paletteTallDiv" style="width: 140px; height: 340px"></div>
          <div ref="paletteWideDiv" style="width: 140px; height: 340px"></div>
          <div ref="paletteBigDiv" style="width: 140px; height: 340px"></div>
        </div>
        <div ref="diagramDiv" style="flex-grow: 1; height: 500px; border: 1px solid black"></div>
      </div>
      <p>Saved Model:</p>
      <pre>{{ savedModel }}</pre>
    </div>
  </div>
</template>

<style scoped>
/* Add custom styles if needed */

</style>
