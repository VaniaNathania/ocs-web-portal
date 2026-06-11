import * as React from 'react';
import { KeenIcon } from '../keenicons';

function IconApproval({ isApproved = null }: any) {
  let icon =
    isApproved == true ? 'check-circle' : isApproved == false ? 'cross-circle' : 'question-2';
  let color =
    isApproved == true ? 'text-success' : isApproved == false ? 'text-danger' : 'text-warning';
  return <KeenIcon icon={icon} style="outline" className={`${color} text-lg font-bold`} />;
}

export { IconApproval };
