// src/components/pages/EmployeeHistorySearch/components/SkillGauge.tsx
import ReactSpeedometer, {
  Transition,
  CustomSegmentLabelPosition,
} from "react-d3-speedometer";

interface SkillGaugeProps {
  level: number;
}

const SkillGauge = ({ level }: SkillGaugeProps) => {
  const getGaugeValue = (lvl: number) => {
    switch (lvl) {
      case 1: return 125;
      case 2: return 375;
      case 3: return 625;
      case 4: return 875;
      default: return 0;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ReactSpeedometer
        fluidWidth={true}
        minValue={0}
        maxValue={1000}
        value={getGaugeValue(level)}
        segments={4}
        segmentColors={["#ef4444", "#f59e0b", "#eab308", "#84cc16"]}
        needleColor="#374151"
        needleTransitionDuration={2000}
        needleTransition={Transition.easeElastic}
        ringWidth={40}
        textColor="#4b5563"
        customSegmentLabels={[
          { text: "Beginner", position: CustomSegmentLabelPosition.Inside, color: "#fff" },
          { text: "Intermediate", position: CustomSegmentLabelPosition.Inside, color: "#fff" },
          { text: "Advanced", position: CustomSegmentLabelPosition.Inside, color: "#1f2937" },
          { text: "Expert", position: CustomSegmentLabelPosition.Inside, color: "#1f2937" },
        ]}
        currentValueText={`L${level}`}
        valueTextFontSize="32px"
      />
    </div>
  );
};

export default SkillGauge;