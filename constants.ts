import { Camera, CameraStatus, Incident, PrivacyLevel, Notification } from "./types";

export const MOCK_CAMERAS: Camera[] = [
  {
    id: 'CAM-001',
    name: 'Sector 4 Market Entrance',
    location: 'Jaipur, Raja Park',
    ownerId: 'Shop-A22',
    status: CameraStatus.ACTIVE,
    privacySetting: PrivacyLevel.BLUR_FACES,
    isShared: true,
    thumbnailUrl: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 
    lat: 26.9124,
    lng: 75.7873
  },
  {
    id: 'CAM-002',
    name: 'Residency Gate B',
    location: 'Civil Lines',
    ownerId: 'RWA-CivilLines',
    status: CameraStatus.ACTIVE,
    privacySetting: PrivacyLevel.NONE,
    isShared: false,
    thumbnailUrl: 'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    lat: 26.9000,
    lng: 75.8000
  },
  {
    id: 'CAM-003',
    name: 'Jewelry Store Front',
    location: 'Johari Bazaar',
    ownerId: 'Jewel-X',
    status: CameraStatus.ACTIVE,
    privacySetting: PrivacyLevel.ANONYMIZED,
    isShared: true,
    thumbnailUrl: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    lat: 26.9200,
    lng: 75.8200
  },
  {
    id: 'CAM-004',
    name: 'Back Alley Logistics',
    location: 'Transport Nagar',
    ownerId: 'Logistics-Hub',
    status: CameraStatus.OFFLINE,
    privacySetting: PrivacyLevel.NONE,
    isShared: true,
    thumbnailUrl: 'https://images.pexels.com/photos/1544420/pexels-photo-1544420.jpeg?auto=compress&cs=tinysrgb&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    lat: 26.8900,
    lng: 75.8500
  },
  {
    id: 'CAM-005',
    name: 'WTP South Gate',
    location: 'Malviya Nagar',
    ownerId: 'WTP-Sec',
    status: CameraStatus.ACTIVE,
    privacySetting: PrivacyLevel.BLUR_FACES,
    isShared: true,
    thumbnailUrl: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    lat: 26.8530,
    lng: 75.8050
  },
  {
    id: 'CAM-006',
    name: 'Amer Fort Parking',
    location: 'Amer',
    ownerId: 'Tourism-Dept',
    status: CameraStatus.ACTIVE,
    privacySetting: PrivacyLevel.NONE,
    isShared: true,
    thumbnailUrl: 'https://content3.jdmagicbox.com/v2/comp/jaipur/n8/0141px141.x141.180821022629.u3n8/catalogue/amer-fort-car-parking-jaipur-city-jaipur-pay-and-park-services-omuQYnvy1V.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    lat: 26.9855,
    lng: 75.8513
  },
  {
    id: 'CAM-007',
    name: 'Sindhi Camp Bus Stand',
    location: 'Sindhi Camp',
    ownerId: 'RSRTC',
    status: CameraStatus.MAINTENANCE,
    privacySetting: PrivacyLevel.BLUR_FACES,
    isShared: true,
    thumbnailUrl: 'https://files.prokerala.com/news/photos/imgs/1024/crowd-at-sindhi-camp-bus-stand-after-4th-grade-1927649.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    lat: 26.9260,
    lng: 75.7900
  },
  {
    id: 'CAM-008',
    name: 'Bapu Bazaar Entry',
    location: 'Old City',
    ownerId: 'Market-Assoc',
    status: CameraStatus.ACTIVE,
    privacySetting: PrivacyLevel.ANONYMIZED,
    isShared: true,
    thumbnailUrl: 'https://www.jaipurmetro.com/locations/bapu-bazar-1.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    lat: 26.9210,
    lng: 75.8150
  },
  {
    id: 'CAM-009',
    name: 'Jal Mahal Viewpoint',
    location: 'Man Sagar Lake',
    ownerId: 'Tourism-Dept',
    status: CameraStatus.ACTIVE,
    privacySetting: PrivacyLevel.NONE,
    isShared: true,
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Jaipur_03-2016_39_Jal_Mahal_-_Water_Palace.jpg/1200px-Jaipur_03-2016_39_Jal_Mahal_-_Water_Palace.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    lat: 26.9535,
    lng: 75.8462
  },
  {
    id: 'CAM-010',
    name: 'Central Park Track',
    location: 'C-Scheme',
    ownerId: 'JDA',
    status: CameraStatus.ACTIVE,
    privacySetting: PrivacyLevel.NONE,
    isShared: true,
    thumbnailUrl: 'https://cdn.dnaindia.com/sites/default/files/styles/full/public/2019/01/21/780574-central-park-01.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    lat: 26.9050,
    lng: 75.8020
  }
];

export const MOCK_INCIDENTS: Incident[] = [
    {
        id: 'INC-101',
        type: 'ACCIDENT',
        severity: 'HIGH',
        location: 'Ajmer Road Junction',
        timestamp: '10:42 AM',
        cameraId: 'CAM-001',
        description: 'Two vehicle collision detected. Traffic halted.',
        resolved: false
    },
    {
        id: 'INC-102',
        type: 'THEFT',
        severity: 'MEDIUM',
        location: 'Johari Bazaar',
        timestamp: '11:15 AM',
        cameraId: 'CAM-003',
        description: 'Suspicious activity reported by shop owner. Requesting visual confirm.',
        resolved: false
    },
    {
        id: 'INC-103',
        type: 'CROWD',
        severity: 'LOW',
        location: 'Hawa Mahal',
        timestamp: '12:00 PM',
        cameraId: 'CAM-EXT',
        description: 'Crowd density exceeded safe limit. Monitoring.',
        resolved: true
    },
    {
        id: 'INC-104',
        type: 'TRAFFIC',
        severity: 'MEDIUM',
        location: 'WTP Intersection',
        timestamp: '02:30 PM',
        cameraId: 'CAM-005',
        description: 'Heavy congestion detected due to stalled truck.',
        resolved: false
    },
    {
        id: 'INC-105',
        type: 'FIRE',
        severity: 'CRITICAL',
        location: 'Amer Fort External Wall',
        timestamp: '03:15 PM',
        cameraId: 'CAM-006',
        description: 'Smoke detected near parking lot west wing.',
        resolved: false
    }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'NOT-001',
    title: 'Emergency Access Request',
    message: 'Jaipur Police requested access to CAM-001 due to reported robbery in Sector 4.',
    time: '2 mins ago',
    read: false,
    type: 'REQUEST'
  },
  {
    id: 'NOT-002',
    title: 'Crowd Density Alert',
    message: 'Abnormal crowd detected at Hawa Mahal junction (CAM-EXT).',
    time: '15 mins ago',
    read: false,
    type: 'ALERT'
  },
  {
    id: 'NOT-003',
    title: 'System Maintenance',
    message: 'Scheduled downtime for AI nodes tonight at 2:00 AM.',
    time: '1 hour ago',
    read: true,
    type: 'INFO'
  },
  {
    id: 'NOT-004',
    title: 'Traffic Clear',
    message: 'Congestion at Ajmer Road has been resolved.',
    time: '3 hours ago',
    read: true,
    type: 'INFO'
  }
];