import React from "react";
import { TrendingUp, CheckCircle } from "lucide-react";

interface Criteria {
  production_passing_percentage: number;
  rejection_passing_percentage: number;
}

interface ScoreRange {
  id: number;
  department: number;
  level: number;
  score_type: "production" | "rejection";
  min_value: string;
  max_value: string;
  marks: number;
}

interface MarkingSchemeProps {
  criteria: Criteria | null;
  scoreRange: ScoreRange[] | null;
}

const ProductionMarkingScheme: React.FC<MarkingSchemeProps> = ({
  criteria,
  scoreRange,
}) => {
  if (!criteria || !scoreRange) return null;

  const productionRanges = scoreRange.filter((s) => s.score_type === "production");
  const rejectionRanges = scoreRange.filter((s) => s.score_type === "rejection");

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 border border-green-200/50 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-green-800">
          Production Quantity Marking Scheme
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* --- Production Ranges --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200 font-semibold text-green-800">
            <span>Production Quantity</span>
            <span>Marks</span>
          </div>
          <div className="space-y-3">
            {productionRanges.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-2">
                No production score ranges found
              </div>
            ) : (
              productionRanges.map((range) => (
                <div
                  key={range.id}
                  className="flex justify-between items-center p-3 bg-white/80 rounded-lg border border-green-200"
                >
                  <span className="text-green-700 font-medium">
                    {range.min_value} – {range.max_value}%
                  </span>
                  <span className="font-bold text-green-800 bg-green-100 px-3 py-1 rounded-full">
                    {range.marks}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- Rejection Ranges --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-200 font-semibold text-blue-800">
            <span>Number of Rejections</span>
            <span>Marks</span>
          </div>
          <div className="space-y-3">
            {rejectionRanges.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-2">
                No rejection score ranges found
              </div>
            ) : (
              rejectionRanges.map((range) => (
                <div
                  key={range.id}
                  className="flex justify-between items-center p-3 bg-white/80 rounded-lg border border-blue-200"
                >
                  <span className="text-blue-700 font-medium">
                    {range.min_value} – {range.max_value}
                  </span>
                  <span className="font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                    {range.marks}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Passing criteria note */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-300">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <strong className="text-green-800">Note:</strong>
          <span className="text-green-700 font-medium">
            Minimum {criteria.production_passing_percentage}% in Production and{" "}
            {criteria.rejection_passing_percentage}% in Rejection required
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductionMarkingScheme;
