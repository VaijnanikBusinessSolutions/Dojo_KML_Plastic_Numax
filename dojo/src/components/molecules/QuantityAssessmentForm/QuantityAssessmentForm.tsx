// QuantityAssessmentForm.tsx - Without status calculation
import React from "react";
import { FileText, User, Plus, Trash2 } from "lucide-react";
import type { FormData, QuantityEvaluation } from "../../constants/types";

interface ScoreRange {
  id: number;
  department: number;
  level: number;
  score_type: "production" | "rejection";
  min_value: string;
  max_value: string;
  marks: number;
}

interface QuantityAssessmentFormProps {
  formData: FormData;
  quantityEvaluations: QuantityEvaluation[];
  scoreRange: ScoreRange[] | null;
  handleQuantityEvaluationChange: (
    index: number,
    field: keyof QuantityEvaluation,
    value: string | number
  ) => void;
  addEvaluationDay: () => void;
  removeEvaluationDay: (index: number) => void;
  handleInputChange: (
    section: string,
    field: string,
    value: string
  ) => void;
}

const QuantityAssessmentForm: React.FC<QuantityAssessmentFormProps> = ({
  formData,
  quantityEvaluations,
  scoreRange,
  handleQuantityEvaluationChange,
  addEvaluationDay,
  removeEvaluationDay,
  handleInputChange,
}) => {
  // Calculate marks
  const getProductionMarks = (actual: number, plan: number) => {
    if (!plan) return 0;
    const percentage = (actual / plan) * 100;
    const range = (scoreRange ?? []).find(
      (r) =>
        r.score_type === "production" &&
        percentage >= parseFloat(r.min_value) &&
        percentage < parseFloat(r.max_value)
    );
    return range ? range.marks : 0;
  };

  const getRejectionMarks = (rejections: number) => {
    const range = (scoreRange ?? []).find(
      (r) =>
        r.score_type === "rejection" &&
        rejections >= parseFloat(r.min_value) &&
        rejections <= parseFloat(r.max_value)
    );
    return range ? range.marks : 0;
  };

  // Totals
  const calculateTotals = () => {
    const productionTotal = quantityEvaluations.reduce(
      (sum, e) => sum + getProductionMarks(e.production_actual, e.plan),
      0
    );
    const rejectionTotal = quantityEvaluations.reduce(
      (sum, e) => sum + getRejectionMarks(e.number_of_rejections),
      0
    );
    return { productionTotal, rejectionTotal };
  };

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Daily Production & Quality Monitoring
          </h2>
        </div>
        <button
          onClick={addEvaluationDay}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Day
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 text-white text-center">
                <th className="px-4 py-3">DAYS</th>
                <th className="px-4 py-3">DATE</th>
                <th className="px-4 py-3">PLAN</th>
                <th className="px-4 py-3 bg-green-700">Production ACT.</th>
                <th className="px-4 py-3 bg-green-700">Marks</th>
                <th className="px-4 py-3 bg-blue-700">QUALITY NO. OF REJ.</th>
                <th className="px-4 py-3 bg-blue-700">Marks</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quantityEvaluations.map((evaluation, index) => (
                <tr key={index} className="text-center border-b">
                  <td className="py-2 font-bold">{evaluation.day}</td>
                  <td>
                    <input
                      type="date"
                      value={evaluation.date || ""}
                      onChange={(e) =>
                        handleQuantityEvaluationChange(
                          index,
                          "date",
                          e.target.value
                        )
                      }
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="Plan"
                      value={evaluation.plan || ""}
                      onChange={(e) =>
                        handleQuantityEvaluationChange(
                          index,
                          "plan",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full border rounded px-2 py-1 text-center text-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="Actual"
                      value={evaluation.production_actual || ""}
                      onChange={(e) =>
                        handleQuantityEvaluationChange(
                          index,
                          "production_actual",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full border rounded px-2 py-1 text-center text-sm"
                    />
                  </td>
                  <td className="font-bold bg-green-50 text-green-700">
                    {getProductionMarks(
                      evaluation.production_actual,
                      evaluation.plan
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="No."
                      value={evaluation.number_of_rejections || ""}
                      onChange={(e) =>
                        handleQuantityEvaluationChange(
                          index,
                          "number_of_rejections",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full border rounded px-2 py-1 text-center text-sm"
                    />
                  </td>
                  <td className="font-bold bg-blue-50 text-blue-700">
                    {getRejectionMarks(evaluation.number_of_rejections)}
                  </td>
                  <td>
                    {quantityEvaluations.length > 1 && (
                      <button
                        onClick={() => removeEvaluationDay(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {/* Totals */}
              <tr className="bg-gray-100 font-bold">
                <td colSpan={4} className="text-center py-2">
                  Total Marks
                </td>
                <td className="text-green-700 text-center py-2">
                  {calculateTotals().productionTotal}
                </td>
                <td className="py-2"></td>
                <td className="text-blue-700 text-center py-2">
                  {calculateTotals().rejectionTotal}
                </td>
                <td className="py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineer Judge */}
      <div className="mt-6 p-4 bg-indigo-50 border rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-indigo-800">Engineer Judge</h3>
        </div>
        <input
          type="text"
          value={formData.signatures?.engineerJudge || ""}
          onChange={(e) =>
            handleInputChange("signatures", "engineerJudge", e.target.value)
          }
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter engineer judge name"
        />
      </div>

      {/* Summary Card */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border rounded-xl">
        <h3 className="font-bold text-gray-800 mb-3">Training Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-blue-600">Total Days</div>
            <div className="text-lg font-bold">{quantityEvaluations.length}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">Production Score</div>
            <div className="text-lg font-bold">
              {calculateTotals().productionTotal}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">Quality Score</div>
            <div className="text-lg font-bold">
              {calculateTotals().rejectionTotal}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantityAssessmentForm;
