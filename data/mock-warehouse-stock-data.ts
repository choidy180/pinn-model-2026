import { WarehouseStockData } from '@/types/warehouse-stock-type';

/**
 * 🏢 창고 재고 현황 Mock 데이터
 */
export const MOCK_WAREHOUSE_STOCK: WarehouseStockData = {
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