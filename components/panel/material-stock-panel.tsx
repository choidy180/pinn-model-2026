// MaterialStockPanel.tsx
import React from "react";
import styled from "styled-components";
import {
  Panel,
  PanelHeader,
  HeaderTitle,
  HeaderArrow,
  PanelBody,
  Row,
  RowLabel,
} from "./alert-panel-base-dev";

// ----------------------------------------------------
// 1. 필요한 타입들을 파일 내부에 직접 정의
// (원래는 '@/data/warehouse-stock-type'에 있어야 할 내용)
// ----------------------------------------------------

/** 개별 자재의 재고 수량 정보 */
interface MaterialStockDetail {
  현재고수량: number;
}

/** 창고 내 모든 자재 재고 정보를 담는 객체 */
interface MaterialsStock {
  [materialCode: string]: MaterialStockDetail;
}

/** 전체 창고 재고 현황 데이터 인터페이스 */
interface WarehouseStockData {
  timestamp: string;
  warehouseId: string;
  warehouseName: string;
  totalMaterials: number;
  materials: MaterialsStock;
}

/** 컴포넌트가 사용하는 최종 데이터 구조 */
interface MaterialStockRow {
    name: string;
    quantity: number;
}

// ----------------------------------------------------
// 2. Mock 데이터를 파일 내부에 직접 정의
// (원래는 '@/data/mock-warehouse-stock-data'에 있어야 할 내용)
// ----------------------------------------------------
const MOCK_WAREHOUSE_STOCK: WarehouseStockData = {
  "timestamp": "2024-12-09 14:50:00",
  "warehouseId": "WH-RAW-01",
  "warehouseName": "원자재 창고",
  "totalMaterials": 3,
  "materials": {
    "ABS": {
      "현재고수량": 2
    },
    "PP": {
      "현재고수량": 12
    },
    "PMMA": {
      "현재고수량": 24
    }
  }
};
// ----------------------------------------------------
// ----------------------------------------------------


import { GoArrowRight } from "react-icons/go";
import { useRouter } from "next/navigation";


interface MaterialStockPanelProps {
  title?: string;
  // rows?: MaterialStockRow[]; // Props는 이제 사용하지 않음
}

const RightText = styled.span`
  color: #c0c9dd;
  font-size: 14px;
  display: flex;
  align-items: center;

  strong {
    color: #ffffff;
    font-weight: 700;
    display: inline-block;
    min-width: 46px;
    text-align: right;
    font-size: 16px;
  }
`;

/**
 * MOCK 데이터를 MaterialStockRow[] 형태로 변환하고 '총합' 행을 추가하는 함수
 */
const transformStockData = (data: WarehouseStockData): MaterialStockRow[] => {
    // 1. 자재별 재고 배열 생성
    const materialRows: MaterialStockRow[] = Object.entries(data.materials).map(([name, detail]) => ({
        name: name, // "ABS", "PP", "PMMA"
        quantity: detail.현재고수량,
    }));
    
    // 2. 총합 수량 계산
    const totalQuantity = materialRows.reduce((sum, row) => sum + row.quantity, 0);
    
    // 3. '총합' 행 추가
    materialRows.push({
        name: "총합",
        quantity: totalQuantity,
    });
    
    return materialRows;
};


const MaterialStockPanel: React.FC<MaterialStockPanelProps> = ({
  title = "자재창고",
}) => {
  const router = useRouter();
  
  // 데이터 변환 및 사용
  const displayRows = transformStockData(MOCK_WAREHOUSE_STOCK);

  return (
    <Panel>
      <PanelHeader>
        <HeaderTitle>{title}</HeaderTitle>
        <HeaderArrow onClick={()=> router.push('/warehouse?selected=home')}><GoArrowRight/></HeaderArrow>
      </PanelHeader>

      <PanelBody>
        {/* 변환된 데이터(displayRows) 사용 */}
        {displayRows.map((row) => (
          <Row key={row.name} variant="neutral">
            <RowLabel>{row.name}</RowLabel>
            <RightText>
              재고 수량 <strong>{row.quantity}개</strong>
            </RightText>
          </Row>
        ))}
      </PanelBody>
    </Panel>
  );
};

export default MaterialStockPanel;