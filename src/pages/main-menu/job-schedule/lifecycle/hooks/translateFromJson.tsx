import { Edge, MarkerType, Node } from "@xyflow/react";
import { Graph } from "../interface";

const sourceHandleMap = {
  top: "top-source",
  right: "right-source",
  bottom: "bottom-source",
  left: "left-source",
};

const targetHandleMap = {
  top: "top-target",
  right: "right-target",
  bottom: "bottom-target",
  left: "left-target",
};

type direction = "top" | "right" | "bottom" | "left";

const dir: direction[] = ["top", "right", "bottom", "left"];

export const translateJsonToFlow = (data: Graph) => {
  const tempNode: Node[] = [];
  const tempEdge: Edge[] = [];

  data.childs.forEach((item) => {
    if (item.elementType === "Rect") {
      const { options, userData } = item;
      const { position, id } = options;

      let x = 0,
        y = 0;

      if (Array.isArray(position)) {
        x = position[0] ?? 0;
        y = position[1] ?? 0;
      }

      const temp: Node = {
        id: id ?? "id",
        position: { x, y },
        data: {
          label: `${userData.prodState}:${userData.prodStateName}`,
          jsonData: item,
        },
        type: "rect",
      };

      tempNode.push(temp);
    } else if (item.elementType === "connection") {
      const { options, startNodeId, endNodeId, userData } = item;
      const { dockers, position } = options;

      let srcSide: direction = "right";
      let trgSide: direction = "left";

      if (startNodeId === endNodeId) {
        srcSide = "bottom";
        trgSide = "left";
      } else if (!Array.isArray(position)) {
        dir.forEach((item) => {
          if (item === position.startPos) srcSide = item;
          if (item === position.endPos) trgSide = item;
        });
      }
      const temp: Edge = {
        id: `${startNodeId}#${endNodeId}`,
        source: startNodeId ?? "",
        target: endNodeId ?? "",
        sourceHandle: sourceHandleMap[srcSide],
        targetHandle: targetHandleMap[trgSide],
        label: options.text?.text ?? "",
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          strokeWidth: 5,
        },

        data: { jsonData: item },
        animated: false,
      };

      // //  console.log(temp);

      tempEdge.push(temp);
    }
  });

  return { Nodes: tempNode, Edges: tempEdge };
};
