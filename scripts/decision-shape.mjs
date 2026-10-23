// Shared by approve-decisions.mjs and verify-decision-report.mjs: the wording of a decision with its
// numbers masked, so the approved text survives a CSV update but not a change of advice.
export const DECISION_FIELDS = ['title', 'lead', 'forArg', 'againstArg', 'deadline', 'inputRequired'];
export const decisionShape = s => String(s ?? '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim().replace(/\d+(?:[.,]\d+)*/g, '#');
// Report labels that set which way an argument reads: swapping "Argument for" and "Argument against" reverses advice.
export const LABEL_FIELDS = ['forLabel', 'againstLabel', 'deadlinePrefix', 'missingLabel'];
