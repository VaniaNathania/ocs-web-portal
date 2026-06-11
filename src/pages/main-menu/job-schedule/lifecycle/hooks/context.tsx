import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  useEffect,
  Dispatch,
  useCallback,
} from "react";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { translateJsonToFlow } from "./translateFromJson";
import {
  Connection,
  Edge,
  MarkerType,
  Node,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { ChildGraph, Graph, LifeCycleList, Nav, ProdState } from "../interface";
import { nodeData } from "../components/nodeLifecycle";
import { v4 as uuidv4 } from "uuid";

interface LifeCycleContextType {
  addDialog: boolean;
  setAddDialog: Dispatch<SetStateAction<boolean>>;

  nodes: Node[];
  edges: Edge[];
  setEdges: Dispatch<SetStateAction<Edge[]>>;

  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;

  addNode: (prodState: ProdState) => void;
  deleteSelected: () => void;
  RefreshCanvas: () => void;

  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  edgeDialog: boolean;
  setEdgeDialog: Dispatch<SetStateAction<boolean>>;

  selectedEdge?: Edge;
  setSelectedEdge: Dispatch<SetStateAction<Edge | undefined>>;

  selectedNode?: Node;
  setSelectedNode: Dispatch<SetStateAction<Node | undefined>>;

  selectedLifeCycle?: LifeCycleList;
  setSelectedLifeCycle: Dispatch<SetStateAction<LifeCycleList | undefined>>;
  prods: ProdState[];
  setProds: Dispatch<SetStateAction<ProdState[]>>;

  showConfirm: boolean;
  setShowConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: any;
  setOnConfirm: React.Dispatch<React.SetStateAction<any>>;
  desc: string;
  setDesc: React.Dispatch<React.SetStateAction<string>>;

  refreshSidebar: number;
  setRefreshSidebar: Dispatch<SetStateAction<number>>;

  selectedMenu: Nav;
  setSelectedMenu: React.Dispatch<React.SetStateAction<Nav>>;
  menuPrivAccess: menuAccess;
}

// Create the context with proper typing
export const LifeCycleContext = createContext<LifeCycleContextType | undefined>(
  undefined,
);

const API_URL = apiConfigRef.ref;

// Provider component
interface OrderProviderProps {
  children: ReactNode;
}

export const LifeCycleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [addDialog, setAddDialog] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [edgeDialog, setEdgeDialog] = useState<boolean>(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge>();
  const [selectedNode, setSelectedNode] = useState<Node>();
  const [selectedLifeCycle, setSelectedLifeCycle] = useState<LifeCycleList>();
  const [showConfirm, setShowConfirm] = useState(false);
  const [onConfirm, setOnConfirm] = useState();
  const [desc, setDesc] = useState("");
  const [selectedMenu, setSelectedMenu] = useState<Nav>("Canvas");
  const [prods, setProds] = useState<ProdState[]>([]);
  const [refreshSidebar, setRefreshSidebar] = useState<number>(0);

  const { GetData } = useCallApi();
  const { checkMenusPriv } = useRoleCheck();
  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/job-schedule/lifecycle/LifeCycle",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/job-schedule/lifecycle/LifeCycle",
      "editStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/job-schedule/lifecycle/LifeCycle",
      "readStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/job-schedule/lifecycle/LifeCycle",
      "deleteStatus",
    ),
  };

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const generateDefaultGraph = (): Graph => {
    return {
      elementType: "scene",
      mode: "normal",
      showGridLine: false,
      gridLineSpacing: 10,
      showGuideLine: true,
      linkModify: false,
      textEditable: false,
      mouseMode: "default",
      roam: false,
      readonly: false,
      isAnimationEnabled: true,
      scaleable: false,
      rotatable: false,
      stepCount: false,
      childs: prods.map((pr, index) => ({
        elementType: "Rect",
        options: {
          style: {
            isAllowEdit: true,
            text: `${pr.prodState}:${pr.prodStateName}`,
            textFont: "12px Microsoft YaHei",
            fill: "rgb(230, 228, 229)",
            rich: {},
          },
          position: [0 + index * 150, 0],
          shape: { width: 120, height: 60, r: 30 },
          operationIcons: [
            { name: "DEL" },
            { name: "STRAIGHT" },
            { name: "JAGGED" },
            { name: "CURVE" },
            {
              name: "loop",
              iconPath:
                "path://M23.715,14.546c-0.104,0.172-0.051,0.392,0.115,0.492c0.008,0.004,0.014,0.009,0.018,0.011l5.969,3.622l4.158-6.165c0.078-0.125,0.068-0.286-0.021-0.401c-0.078-0.115-0.229-0.169-0.367-0.133l-2.969,0.744l-0.152,0.038C28.193,8.849,24.047,6.443,19.5,6.443c-7,0-12.695,5.695-12.695,12.694S12.5,31.832,19.5,31.832c5.273,0,10.053-3.319,11.896-8.258c0.354-0.952-0.129-2.012-1.082-2.367c-0.953-0.356-2.012,0.129-2.367,1.081c-1.307,3.508-4.703,5.865-8.447,5.865c-4.973,0-9.016-4.044-9.016-9.015s4.043-9.015,9.016-9.015c2.863,0,5.502,1.345,7.189,3.582l-2.662,0.669C23.902,14.372,23.783,14.434,23.715,14.546z",
            },
          ],
          id: `sid-${uuidv4()}`,
          ignore: false,
        },
        userData: {
          comments: pr.comments,
          prodStateName: pr.prodStateName,
          prodState: pr.prodState,
          disOrder: pr.disOrder,
        },
      })),
    };
  };

  const RefreshCanvas = async () => {
    try {
      setIsLoading(true);
      if (!selectedLifeCycle) return;
      let data;
      if (!selectedLifeCycle.extAttr) data = generateDefaultGraph();
      else if (selectedLifeCycle.extAttr === "") data = generateDefaultGraph();
      else {
        data = JSON.parse(selectedLifeCycle?.extAttr ?? "");
      }
      // if(selectedLifeCycle?.extAttr==="")
      const { Nodes, Edges } = translateJsonToFlow(data);
      setNodes(Nodes);
      setEdges(Edges);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProdState = async () => {
    try {
      const resp = await GetData(
        `${API_URL}/api/lifecycle-type/qry-prodStateName`,
        {},
      );

      if (resp.status) {
        setProds(resp.data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (prods.length === 0) fetchProdState();
    RefreshCanvas();
    setIsEditing(false);
  }, [selectedLifeCycle]);

  // useEffect(() => {
  // //  console.log(edges);
  // }, [edges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      //  console.log(connection, isEditing);
      if (!isEditing) return;
      const edge = edges.find(
        (item) => item.id === `${connection.source}#${connection.target}`,
      );
      // console.log(edge);

      if (edge) {
        return toast.message(
          "already have relation for that node with the same direction, please delete it first",
        );
      }

      const startNode = nodes.find((item) => item.id === connection.source);
      const endNode = nodes.find((item) => item.id === connection.target);

      const tempSrcData: any = startNode?.data;
      const tempTrgData: any = endNode?.data;

      const srcData = tempSrcData as nodeData;
      const trgData = tempTrgData as nodeData;
      //  console.log("start", startNode);
      //  console.log("end", endNode);

      const label = `${srcData.jsonData?.userData.prodState}-->${trgData.jsonData?.userData.prodState}`;

      const srcHandle = connection.sourceHandle
        ? connection.sourceHandle.replace("-source", "")
        : "right";
      const trgHandle = connection.targetHandle
        ? connection.targetHandle.replace("-target", "")
        : "left";

      const jsonData: ChildGraph = {
        elementType: "connection",

        startNodeId: startNode?.id,
        endNodeId: endNode?.id,

        options: {
          symbol: {
            type: "arrow",
            size: 10,
            color: "#000000",
            both: false,
            reverse: false,
            offset: 0,
          },

          style: {
            lineWidth: 1,
            stroke: "#000000",
            lineType: "curve",
            lineDash: [2],
          },

          hoverStyle: {
            lineWidth: 2,
            stroke: "#74B7E0",
          },

          arrowHoverStyle: {
            fill: "#74B7E0",
          },

          shape: {
            points: null,
            smooth: false,
            smoothConstraint: null,
          },

          position: {
            startPos: srcHandle,
            endPos: trgHandle,
            startOffset: [-30, 0],
            endOffset: [30, 0],
            escapeDistance: [30, 30],
            points: null,
            direction: `${srcHandle},${trgHandle}`,
          },

          autoChangePosition: false,
          textContextMenu: null,
          isEdit: false,

          text: {
            text: label,
            fill: "transparent",
            textFill: "#000000",
            textFont: "12px Microsoft YaHei",
            textPos: "center",
            textRotateable: true,
            transformText: true,
            offset: [0, 0],
          },

          image: {
            image: null,
            width: 50,
            height: 50,
            imagePos: "center",
            imageRotateable: true,
          },

          z: 1,

          dockers: [],
        },

        icons: [],

        userData: {
          startState: {
            comments: srcData.jsonData?.userData.comments,
            prodStateName: srcData.jsonData?.userData.prodStateName,
            prodState: srcData.jsonData?.userData.prodState,
            disOrder: srcData.jsonData?.userData.disOrder,
          },
          endState: {
            comments: trgData.jsonData?.userData.comments,
            prodStateName: trgData.jsonData?.userData.prodStateName,
            prodState: trgData.jsonData?.userData.prodState,
            disOrder: trgData.jsonData?.userData.disOrder,
          },
          eventList: [],
        },
      };

      const newEdge: Edge = {
        ...connection,
        id: `${connection.source}#${connection.target}`,
        type: "smoothstep",
        data: { jsonData },
        label: label,
        markerEnd: { type: MarkerType.Arrow, strokeWidth: 5 },
      };

      setSelectedEdge(newEdge);
      setEdgeDialog(true);

      // setEdges((eds) =>
      //   addEdge(
      //     {
      //       ...connection,
      //       id: `${connection.source}#${connection.target}`,
      //       type: "smoothstep",
      //       data: { jsonData },
      //       label: label,
      //       markerEnd: { type: MarkerType.Arrow, strokeWidth: 5 },
      //     },
      //     eds
      //   )
      // );
    },
    [isEditing, nodes, edges],
  );

  // ✅ ADD NODE
  const addNode = (prodState: ProdState) => {
    // console.log(nodes);

    const label = `${prodState.prodState}:${prodState.prodStateName}`;

    if (nodes.find((item: any) => item.data.label === label)) {
      return toast.error(`there are nodes with the name of ${label}`);
    }

    const id = `sid-${uuidv4()}`;

    const jsonData: ChildGraph = {
      elementType: "Rect",
      options: {
        style: {
          isAllowEdit: true,
          text: label,
          textFont: "12px Microsoft YaHei",
          fill: "rgb(250, 174, 15)",
          rich: {},
        },

        position: [100, 100], // default position

        shape: {
          width: 120,
          height: 60,
          r: 30,
        },

        operationIcons: [
          { name: "DEL" },
          { name: "STRAIGHT" },
          { name: "JAGGED" },
          { name: "CURVE" },
          {
            name: "loop",
            iconPath:
              "path://M23.715,14.546c-0.104,0.172-0.051,0.392,0.115,0.492...",
          },
        ],

        id: id,
        ignore: false,
        autoChangePosition: false,
        z: 1,
      },
      userData: prodState,
    };

    setNodes((nds) => [
      ...nds,
      {
        id: id,
        type: "rect",
        position: { x: 100, y: 100 },
        data: { label: label, jsonData },
      },
    ]);
  };

  // ✅ DELETE SELECTED
  const deleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) =>
      eds.filter(
        (e) =>
          !e.selected ||
          e.source === selectedNode?.id ||
          e.target === selectedNode?.id,
      ),
    );
  };

  const value: LifeCycleContextType = {
    addDialog,
    setAddDialog,
    selectedNode,
    setSelectedNode,
    showConfirm,
    setShowConfirm,
    onConfirm,
    setOnConfirm,
    desc,
    setDesc,
    selectedMenu,
    setSelectedMenu,
    refreshSidebar,
    setRefreshSidebar,

    nodes,
    edges,
    setEdges,
    prods,
    setProds,

    onNodesChange,
    onEdgesChange,
    onConnect,
    RefreshCanvas,

    addNode,
    deleteSelected,
    isEditing,
    setIsEditing,
    isLoading,
    setIsLoading,
    selectedLifeCycle,
    setSelectedLifeCycle,

    edgeDialog,
    setEdgeDialog,
    selectedEdge,
    setSelectedEdge,

    menuPrivAccess,
  };

  return (
    <LifeCycleContext.Provider value={value}>
      {children}
    </LifeCycleContext.Provider>
  );
};

// Custom hook to use the context
export const useLifeCycle = () => {
  const context = useContext(LifeCycleContext);
  if (context === undefined) {
    throw new Error("useLifeCycle must be used within an LifeCycleProvider");
  }
  return context;
};

export default LifeCycleContext;
