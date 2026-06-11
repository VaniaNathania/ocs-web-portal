import { Edge, Node } from "@xyflow/react";
import { ChildGraph, edgeData, Graph, LifeCycleList } from "../interface";
import { emptyGraph } from "../../mock";
import { nodeData } from "../components/nodeLifecycle";

interface ftj {
  nodes: Node[];
  edges: Edge[];
  lifeCycle?: LifeCycleList;
}

const flowToJsonString = ({ nodes, edges, lifeCycle }: ftj): string => {
  // console.log(nodes, edges);

  const graph: Graph = {
    ...emptyGraph,
    childs: [],
  };

  for (const node of nodes) {
    const data: any = node.data;
    const { jsonData, label } = data as nodeData;

    // console.log(label);

    if (!jsonData) continue;

    const temp: ChildGraph = {
      ...jsonData,
      options: {
        ...jsonData?.options,
        position: [node.position.x, node.position.y],
      },
    };
    graph.childs.push(temp);
  }

  for (const edge of edges) {
    const data: any = edge.data;
    const { jsonData } = data as edgeData;

    if (!jsonData) continue;
    graph.childs.push(jsonData);
  }

  //  console.log(graph.childs.length);

  const strGraph = JSON.stringify(graph);
  //  console.log({ ...lifeCycle, extAttr: strGraph });

  return strGraph;
};

export default flowToJsonString;
