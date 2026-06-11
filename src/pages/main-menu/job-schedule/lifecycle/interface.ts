export interface Graph {
  elementType: string;
  mode: string;
  showGridLine: boolean;
  gridLineSpacing: number;
  showGuideLine: boolean;
  linkModify: boolean;
  textEditable: boolean;
  mouseMode: string;
  roam: boolean;
  readonly: boolean;
  isAnimationEnabled: boolean;
  scaleable: boolean;
  rotatable: boolean;
  stepCount: boolean;
  childs: ChildGraph[];
}

export interface ChildGraph {
  elementType?: string;
  options: Options;
  userData: UserData;
  startNodeId?: string;
  endNodeId?: string;
  icons?: any[];
}

export interface Options {
  style?: Style;
  position: number[] | PositionClass;
  shape?: Shape;
  operationIcons?: OperationIcon[];
  id?: string;
  ignore?: boolean;
  symbol?: Symbol;
  hoverStyle?: HoverStyle;
  arrowHoverStyle?: ArrowHoverStyle;
  autoChangePosition?: boolean;
  textContextMenu?: string | null;
  isEdit?: boolean;
  text?: Text;
  image?: Image;
  z?: number;
  dockers?: Docker[];
}

export interface ArrowHoverStyle {
  fill: string;
  stroke?: string | null;
}

export interface Docker {
  x: number;
  y: number;
}

export interface HoverStyle {
  lineWidth: number;
  stroke: string;
  fill?: string | null;
}

export interface Image {
  image?: string | null;
  width: number;
  height: number;
  imagePos: string;
  imageRotateable: boolean;
}

export interface OperationIcon {
  name: string;
  iconPath?: string;
}

export enum Name {
  Curve = "CURVE",
  Del = "DEL",
  Jagged = "JAGGED",
  Loop = "loop",
  Straight = "STRAIGHT",
}

export interface PositionClass {
  startPos: string;
  endPos: string;
  startOffset: number[];
  endOffset: number[];
  escapeDistance: number[];
  points?: number[][] | null;
  direction?: string;
}

export interface Shape {
  width?: number;
  height?: number;
  r?: number;
  points?: number[][] | null;
  smooth?: boolean;
  smoothConstraint?: string | null;
}

export interface Style {
  isAllowEdit?: boolean;
  text?: string;
  textFont?: string;
  fill?: string;
  rich?: Rich;
  lineWidth?: number;
  stroke?: string;
  lineType?: string;
  lineDash?: number[];
}

export interface Rich {}

export interface Symbol {
  type: string;
  size: number;
  color: string;
  both: boolean;
  reverse: boolean;
  offset: number;
}

export interface Text {
  text: string;
  fill: string;
  textFill: string;
  textFont: string;
  textPos: string;
  textRotateable: boolean;
  transformText: boolean;
  offset: number[];
}

export interface UserData {
  comments?: string;
  prodStateName?: string;
  prodState?: string;
  disOrder?: string;
  startState?: State;
  endState?: State;
  eventList?: EventList[];
}

export interface State {
  comments?: string;
  prodStateName?: string;
  prodState?: string;
  disOrder?: string;
}

export interface EventList {
  subsEventId: string;
  srcProdState: string;
  objProdState: string;
  timer?: number;
  adviceType?: string[];
  eventProcess: EventProcess[];
  bcId?: string;
}

export interface EventProcess {
  bcId: string;
  priority: string;
  avp: string;
}

export interface ProdState {
  comments: string;
  prodStateName: string;
  prodState: string;
  disOrder: string;
}

export interface edgeData {
  jsonData: ChildGraph;
}

export interface LifeCycleList {
  lifeCycleType: number;
  spId: string;
  lifeCycleTypeName: string;
  extAttr: string;
}

export interface LifeCycleBc {
  bcId: number;
  bcName?: string;
  inputParam?: string;
  outputParam: string;
  comments: string;
  exeContent: string;
  objType: string;
  className: string;
  methodName: string;
  sqlContent?: string;
  database: string;
}

export interface LifeCycleFuncBc {
  bcId: number;
  bcName: string;
}

export interface OfferApply {
  offerTypeName: string;
  offerType: string;
  offerName: string;
  lifecycleType?: string;
  offerId: string;
}

export type Nav = "Canvas" | "Apply";
