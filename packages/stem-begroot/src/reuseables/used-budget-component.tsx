import React from 'react';

export const BudgetUsedList = ({
  maxBudget,
  budgetUsed,
  selectedResources,
}: {
  selectedResources: Array<any>;
  maxBudget: number;
  budgetUsed: number;
}) => {
  return (
    <div className="budget-used-list">
      {selectedResources.map((resource) => (
        <div
          className="budget-badge budget-badge-primary"
          style={{ flex: maxBudget % resource.budget }}>
          <p>&euro;{resource.budget || 0}</p>
        </div>
      ))}
      <div
        style={{ flex: selectedResources.length === 0 ? 1 : 0 }}
        className="osc-stem-begroot-budget-list-budget-left-indication budget-badge budget-badge-plain">
        <p>&euro;{Math.max(maxBudget - budgetUsed, 0)}</p>
      </div>
    </div>
  );
};
