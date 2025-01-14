import * as go from 'gojs'

export class CustomResizingTool extends go.ResizingTool {
  doMouseUp() {
    // Ensure adornedObject exists and has a part
    if (!this.adornedObject || !this.adornedObject.part) {
      super.doMouseUp(); // Call the parent class method
      return;
    }

    const node = this.adornedObject.part;
    if (!(node instanceof go.Node)) {
      super.doMouseUp(); // Call the parent class method
      return;
    }

    if (!node.containingGroup) {
      super.doMouseUp(); // Call the parent class method
      return; // Only handle nodes inside groups
    }

    const size = node.actualBounds;
    const offset = 50; // Fixed offset for copies
    const diagram = node.diagram;
    console.log(node.data.source);
    const directions = [
      { x: -offset, y: 0 }, // Left
      { x: offset, y: 0 },  // Right
      { x: 0, y: -offset }, // Up
      { x: 0, y: offset },  // Down
    ];

    diagram.startTransaction("Resize and Copy");

    directions.forEach((direction) => {
      // Calculate the new position for the copy
      const newPos = new go.Point(node.location.x + direction.x, node.location.y + direction.y);

      // Check if a node already exists at the new position
      const overlappingNode = diagram.findObjectsIn(
        new go.Rect(newPos.x, newPos.y, size.width, size.height),
        (obj) => obj.part,
        (part) => part instanceof go.Node,
        true
      ).first();

      if (!overlappingNode) {
        // Create a new node only if the position is unoccupied
        diagram.model.addNodeData({
          key: `copy-${Date.now()}`,
          pos: go.Point.stringify(newPos),
          source: node.data.source, // Copy the image source
          color: node.data.color,   // Copy other properties as needed
        });
      }
    });

    diagram.commitTransaction("Resize and Copy");
    super.doMouseUp(); // Call the parent class method
    console.log('resizeee')
  }
}
