import { DryRoomEventRecord } from '@/types/dry-room-event-type';

/**
 * 🌡️ 건조실 입/출고 이벤트 Mock 데이터
 */
export const MOCK_DRY_ROOM_EVENT: DryRoomEventRecord = {
  "facilityId": "DRY-ROOM-01",
  "facilityName": "건조실",
  "timestamp": "2025-12-09 14:45:30",
  
  "entryEvent": {
    "eventId": "ENTRY-20251209-124530-001",
    "eventType": "ENTRY",
    "serialNumber": "MJT63702706KSD5NE0286",
    "entryTime": "2024-12-09 12:45:30",
    "worker": {
      "id": "W004",
      "name": "최지훈"
    },
    "productInfo": {
      "productCode": "MJT637",
      "lotNumber": "02706",
      "quantity": 1
    },
    "targetDryingTime": 7200,
    "targetTemperature": 85.0
  },
  
  "exitEvent": {
    "eventId": "EXIT-20241209-144530-001",
    "eventType": "EXIT",
    "serialNumber": "MJT63702706KSD5NE0286",
    "exitTime": "2024-12-09 14:45:30",
    "worker": {
      "id": "W005",
      "name": "이영희"
    },
    "actualDryingTime": 7200
  }
};