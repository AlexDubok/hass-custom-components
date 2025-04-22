src/
├── components/                     # Presentational components
│   ├── watering-controls/
│   │   ├── watering-controls.ts    # UI component for watering interface
│   │   └── watering-slider.ts      # Reusable slider component
│   ├── weather-display/
│   │   └── weather-display.ts      # Weather display component
│   ├── battery-indicator/
│   │   └── battery-indicator.ts    # Battery level component
│   └── ...
├── containers/                     # Container components
│   ├── watering-container.ts       # Logic for watering controls
│   ├── schedule-container.ts       # Schedule management logic
│   └── history-container.ts        # History data processing
├── services/                       # Service layer
│   ├── ha-service.ts               # Home Assistant API wrapper
│   ├── valve-service.ts            # Valve control service
│   ├── history-service.ts          # History data service
│   └── schedule-service.ts         # Schedule management service
├── types/                          # TypeScript type definitions
│   ├── homeassistant.ts            # Home Assistant types
│   └── entities.ts                 # Entity type definitions
├── utils/                          # Utility functions
│   ├── time-utils.ts               # Time formatting helpers
│   └── volume-calculator.ts        # Volume calculation helpers
└── index.ts                        # Main app entry point