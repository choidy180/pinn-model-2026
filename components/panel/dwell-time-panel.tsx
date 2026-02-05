// DwellTimePanel.tsx
import React from "react";
import {
  Panel,
  PanelHeader,
  HeaderTitle,
  HeaderArrow,
  PanelBody,
  Row,
  TwoColumn,
  LabelMuted,
  ValueStrong,
} from "./alert-panel-base-dev";
import { DwellTimePanelProps } from "@/data/temp-data";
import { GoArrowRight } from "react-icons/go";
import { useRouter } from "next/navigation";

const DwellTimePanel: React.FC<DwellTimePanelProps> = ({
  title = "사이클타임(sec)",
  status,
  neutralBgColor,
  alertBgColor,
}) => {
  const router = useRouter();
  return (
    <Panel>
      <PanelHeader>
        <HeaderTitle>{title}</HeaderTitle>
        <HeaderArrow onClick={()=> router.push('/dryer?selected=entrance')}><GoArrowRight /></HeaderArrow>
      </PanelHeader>

      <PanelBody>
        {/* ✅ 여기서부터 bgColor -> $bgColor 로 변경 */}
        <Row variant="neutral" $bgColor={neutralBgColor}>
          <TwoColumn>
            <LabelMuted>현재 체류시간</LabelMuted>
            <ValueStrong>{status.currentDwell}</ValueStrong>
          </TwoColumn>
        </Row>

        <Row variant="neutral" $bgColor={neutralBgColor}>
          <TwoColumn>
            <LabelMuted>임계값</LabelMuted>
            <ValueStrong>{status.limit}</ValueStrong>
          </TwoColumn>
        </Row>

        <Row variant="neutral" $bgColor={alertBgColor}>
          <TwoColumn>
            <LabelMuted>건조기 ID</LabelMuted>
            <ValueStrong>{status.dryerId}</ValueStrong>
          </TwoColumn>
        </Row>

        <Row variant="neutral" $bgColor={alertBgColor}>
          <TwoColumn>
            <LabelMuted>체류시간</LabelMuted>
            <ValueStrong>{status.alertDwell}</ValueStrong>
          </TwoColumn>
        </Row>
      </PanelBody>
    </Panel>
  );
};

export default DwellTimePanel;
