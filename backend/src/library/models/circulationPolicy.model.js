import { BaseModel } from "./base.model.js";

export const CirculationPolicyModel = new BaseModel({
  table: "circulation_policies",
  primaryKey: "policy_id",
  allowedColumns: ['name', 'member_type_id', 'material_type_id', 'max_active_loans', 'loan_period_days', 'renewal_limit', 'grace_period_days', 'fine_per_day', 'max_fine_amount', 'allow_holds', 'allow_renewal', 'allow_reference_checkout', 'is_active'],
});
