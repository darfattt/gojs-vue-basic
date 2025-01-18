import * as go from 'gojs'
const $ = go.GraphObject.make; // Alias for convenience

export class CustomResizingTool extends go.ResizingTool {
  
  resize(newr) {
    const node = this.adornedObject.part;
    if (!node) return;
    
    if(node.data.isGroup === true) {
      super.resize(newr);
      return;
    }
    const shape = node.findObject("SHAPE");
    if (!shape) return;
  
    // Store the original position of the node
    const originalPosition = node.position.copy();
  
    // Calculate new dimensions rounded to the nearest multiple of 50
    const newWidth = Math.round(newr.width / 50) * 50;
    const newHeight = Math.round(newr.height / 50) * 50;
  
    // Apply restrictions: minimum size of 50x50
    const adjustedWidth = Math.max(50, newWidth);
    const adjustedHeight = Math.max(50, newHeight);
  
    // Set the new size for the shape
    shape.desiredSize = new go.Size(adjustedWidth, adjustedHeight);
  
    // Adjust the position to compensate for size changes
    const deltaWidth = adjustedWidth - shape.desiredSize.width;
    const deltaHeight = adjustedHeight - shape.desiredSize.height;

    const isLeftResize = newr.x < originalPosition.x;
    const isUpResize = newr.y < originalPosition.y;
    console.log({isLeftResize});
    console.log({isUpResize});
  
    // Recalculate the position to keep the node stationary
    node.position = new go.Point(
      originalPosition.x - deltaWidth / 2,
      originalPosition.y - deltaHeight / 2
    );
    
    // Remove all existing child pictures
    node.elements.each((child) => {
      if (child instanceof go.Picture) node.remove(child);
    });
  
    // Retrieve the source property from the node's data
    const source = node.data.source;
    const showImage = node.data.showImage;
  
    if (!showImage || !source) return;
  
    // Add new Pictures to match the new dimensions
    const rowCount = adjustedHeight / 50;
    const colCount = adjustedWidth / 50;
  
    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        node.add(
          $(go.Picture, {
            width: 50,
            height: 50,
            source: source, // Use dynamic source from the model
            alignment: new go.Spot(0, 0, col * 50, row * 50), // Positioning the pictures
          })
        );
      }
    }
  }

  resizLeftAndUp(newr) {
    const node = this.adornedObject.part;
    console.log({node});
    if (!node) return;
  
    const shape = node.findObject("SHAPE");
    if (!shape) return;
  
    // Store the original position of the node
    const originalPosition = node.position.copy();
  
    // Calculate new dimensions rounded to the nearest multiple of 50
    const newWidth = Math.round(newr.width / 50) * 50;
    const newHeight = Math.round(newr.height / 50) * 50;
  
    // Apply restrictions: minimum size of 50x50
    const adjustedWidth = Math.max(50, newWidth);
    const adjustedHeight = Math.max(50, newHeight);
  
    // Compute the size changes
    const deltaWidth = adjustedWidth - shape.desiredSize.width;
    const deltaHeight = adjustedHeight - shape.desiredSize.height;
  
    // Update the shape size
    shape.desiredSize = new go.Size(adjustedWidth, adjustedHeight);
  
    // Adjust position based on resizing direction
    const isLeftResize = newr.x < originalPosition.x;
    const isUpResize = newr.y < originalPosition.y;
    console.log({isLeftResize});
    console.log({isUpResize});

    const newPosX = isLeftResize ? originalPosition.x - deltaWidth : originalPosition.x;
    const newPosY = isUpResize ? originalPosition.y - deltaHeight : originalPosition.y;
  
    // Set the new position
    node.position = new go.Point(newPosX, newPosY);
  
    // Remove all existing child pictures
    node.elements.each((child) => {
      if (child instanceof go.Picture) node.remove(child);
    });
  
    // Retrieve the source property from the node's data
    const source = node.data.source;
    const showImage = node.data.showImage;
  
    if (!showImage || !source) return;
  
    // Add new Pictures to match the new dimensions
    const rowCount = adjustedHeight / 50;
    const colCount = adjustedWidth / 50;
  
    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        node.add(
          $(go.Picture, {
            width: 50,
            height: 50,
            source: source, // Use dynamic source from the model
            alignment: new go.Spot(0, 0, col * 50, row * 50), // Positioning the pictures
          })
        );
      }
    }
  }
}
