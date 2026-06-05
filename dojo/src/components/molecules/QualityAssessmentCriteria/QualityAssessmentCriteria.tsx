import React from "react";
import { Target, CheckCircle } from "lucide-react";

interface ScoreRanges {
  min_score: number;
  max_score: number;
}

interface QualityAssessmentCriteriaProps {
  criteria: number[];
  scoreRanges: ScoreRanges | null;
}

const QualityAssessmentCriteria: React.FC<QualityAssessmentCriteriaProps> = ({
  criteria,
  scoreRanges,
}) => {
  // Helper: split into 4 bands
  const getBands = () => {
    if (!scoreRanges) return [];
    const { min_score, max_score } = scoreRanges;
    const range = max_score - min_score + 1;
    const bandSize = Math.floor(range / 4);

    return [
      {
        label: "Excellent Performance",
        from: max_score - bandSize + 1,
        to: max_score,
        color: "bg-green-100 text-green-800",
      },
      {
        label: "Good Performance",
        from: max_score - bandSize * 2 + 1,
        to: max_score - bandSize,
        color: "bg-blue-100 text-blue-800",
      },
      {
        label: "Satisfactory Performance",
        from: max_score - bandSize * 3 + 1,
        to: max_score - bandSize * 2,
        color: "bg-yellow-100 text-yellow-800",
      },
      {
        label: "Needs Improvement",
        from: min_score,
        to: max_score - bandSize * 3,
        color: "bg-red-100 text-red-800",
      },
    ].filter((b) => b.from <= b.to);
  };

  const bands = getBands();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-200/50 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
          <Target className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-blue-800">
          Quality Assessment Criteria
        </h3>
      </div>

      {/* Performance Bands */}
      <div className="space-y-4">
        {bands.length > 0 ? (
          bands.map((band, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-3 bg-white/60 rounded-lg border border-blue-200"
            >
              <span className="font-medium text-blue-700">{band.label}:</span>
              <span
                className={`font-bold px-3 py-1 rounded-full ${band.color}`}
              >
                {band.from}-{band.to} Points
              </span>
            </div>
          ))
        ) : (
          <p className="text-blue-700">No score ranges available</p>
        )}

        {/* Overall Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border border-blue-300">
          <div className="space-y-2">
            {criteria && criteria.length > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <strong className="text-blue-800">Passing Criteria:</strong>
                  <span className="text-blue-700">
                    Last day assessment must be {criteria[criteria.length - 1]}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <strong className="text-blue-800">Overall Requirement:</strong>
                  <span className="text-blue-700">
                    Minimum {criteria[0]}% average across all days
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 italic">
                  No passing criteria configured
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityAssessmentCriteria;