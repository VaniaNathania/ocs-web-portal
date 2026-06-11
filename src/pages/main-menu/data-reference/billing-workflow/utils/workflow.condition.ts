import { CreateStepNodePayload } from "../hooks/stepForm";
import { BackendMainNode, IStepNode } from "./workflow.data";

/**
 *
 * @param condition array data bwfCondList untuk di validasi
 * @returns isValid untuk status dan errors untuk hasil validasi dari condition
 */
export const validateCondition = (
  condition: bwfCondList
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!condition.reAttr) {
    errors.push("Ratable Event is required");
  }

  if (!condition.sortOperator) {
    errors.push("Operator is required");
  }

  // Zone operators (5 or 6) - only require zone
  if (condition.sortOperator === "5" || condition.sortOperator === "6") {
    if (!condition.zoneId) {
      errors.push("Zone is required for this operator");
    }
  } else {
    // Non-zone operators - require either constant or function
    if (condition.isConst === "Y") {
      if (!condition.operand || condition.operand.trim() === "") {
        errors.push("Operand is required when using Constant mode");
      }
    } else if (condition.isConst === "N") {
      if (!condition.rreAttr) {
        errors.push(
          "Reference Ratable Event is required when using Function mode"
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// export function isStepNode(
//   node: IStepNode | BackendMainNode | null
// ): node is IStepNode {
//   return !!node && node. !== "main";
// }
