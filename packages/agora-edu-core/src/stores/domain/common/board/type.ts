export enum WhiteboardTool {
  unknown,
  pen,
  rectangle,
  ellipse,
  straight,
  selector,
  text,
  hand,
  eraser,
  clicker,
  laserPointer,
  arrow,
  pentagram,
  rhombus,
  triangle,
  clear,
  undo,
  redo,
}

export type WhiteboardShapeTool =
  | WhiteboardTool.triangle
  | WhiteboardTool.rhombus
  | WhiteboardTool.pentagram;
