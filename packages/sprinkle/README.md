# Sprinkle - Custom Home Assistant card for smart irrigation control with Sonoff Zigbee valve

## Overview
Sprinkle is a custom Lovelace card for Home Assistant that provides an intuitive interface to control a Sonoff Zigbee smart-valve used for irrigation. It integrates seamlessly with Home Assistant to provide both basic and advanced irrigation control features.

> **Note:** Sprinkle is in active development and the API may change in future releases.

### Key Features
- **Compact Card View**: Shows valve state, battery level, status, and flow rate
- **Detailed More Info Dialog**: Full control interface with advanced options
- **Dual Control Modes**: 
  - Duration-based watering (minutes)
  - Volume-based watering (liters)
- **Optimistic UI Updates**: Immediate feedback with graceful error handling
- **Zigbee Integration**: Works with Sonoff Zigbee smart water valves
- **MQTT Support**: Advanced control via MQTT for Zigbee2MQTT integration

### Compatibility
- **Home Assistant**: Version 2024.12.0 or newer
- **Supported Devices**: Sonoff Zigbee smart water valves
- **Browser**: Any modern browser with JavaScript enabled

## Installation

- Home Assistant (version 2024.12.0 or newer)
- Sonoff Zigbee smart water valve configured in Home Assistant
- Zigbee2MQTT integration (for advanced features)

### Method 1: HACS Installation (Recommended)
1. Make sure [HACS](https://hacs.xyz/) is installed in your Home Assistant instance
2. Go to HACS → Frontend
3. Click the "+" button to add a new repository
4. Search for "Sprinkle" and install it
5. Restart Home Assistant

### Method 2: Manual Installation
1. Download the latest release from the [GitHub repository](https://github.com/yourusername/hass-custom-components)
2. Extract the `sprinkle` folder to your Home Assistant configuration directory:
   ```
   /config/www/community/sprinkle/
   ```
3. Add the following to your `configuration.yaml` file:
   ```yaml
   lovelace:
     resources:
       - url: /hacsfiles/sprinkle/sprinkle.js
         type: module
   ```
4. Restart Home Assistant

### Verification
After installation, you should be able to add the "Sprinkle Card" from the Lovelace dashboard editor. If it doesn't appear, try clearing your browser cache and refreshing the page.

## Configuration

### Basic Configuration
Add the following to your Lovelace dashboard:

```yaml
type: custom:sprinkle-card
title: Garden Irrigation
device_name: smart_water_valve
valve_entity: switch.smart_water_valve
```

### Full Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `type` | string | Yes | - | Must be `custom:sprinkle-card` |
| `title` | string | No | - | Card title displayed at the top |
| `device_name` | string | Yes | - | Device name as configured in Zigbee2MQTT |
| `valve_entity` | string | Yes | - | Entity ID of the valve switch |
| `battery_entity` | string | No | - | Entity ID for battery level sensor |
| `flow_entity` | string | No | - | Entity ID for flow rate sensor |
| `device_status_entity` | string | No | - | Entity ID for device status sensor |
| `auto_close_entity` | string | No | - | Entity ID for auto-close feature |
| `timed_irrigation_entity` | string | No | - | Entity ID for timed irrigation sensor |
| `quantitative_irrigation_entity` | string | No | - | Entity ID for volume-based irrigation sensor |
| `volume_max` | number | No | 50 | Maximum volume in liters |
| `duration_max` | number | No | 30 | Maximum duration in minutes |
| `weather_entity` | string | No | - | Entity ID for weather information |

### Example Configuration

```yaml
type: custom:sprinkle-card
title: Garden Irrigation
device_name: smart_water_valve
valve_entity: switch.smart_water_valve
battery_entity: sensor.smart_water_valve_battery
flow_entity: sensor.smart_water_valve_flow
device_status_entity: sensor.smart_water_valve_current_device_status
auto_close_entity: switch.smart_water_valve_auto_close_when_water_shortage
timed_irrigation_entity: sensor.smart_water_valve_cyclic_timed_irrigation
quantitative_irrigation_entity: sensor.smart_water_valve_cyclic_quantitative_irrigation
volume_max: 25
duration_max: 30
```

### Finding the Right Entities

To find the correct entity IDs for your configuration:

1. Go to **Developer Tools** → **States** in your Home Assistant dashboard
2. Filter by your device name (e.g., "smart_water_valve")
3. Note the entity IDs for each required sensor or switch
4. Use these entity IDs in your Sprinkle card configuration

## Usage Guide

### Adding the Card to Your Dashboard

1. Edit your Lovelace dashboard
2. Click the "+" button to add a new card
3. Scroll down and select "Custom: Sprinkle Card"
4. Enter your configuration options
5. Click "Save"

### Card Interface

#### Compact Card View
The compact card view provides at-a-glance information and basic control:

- **Valve Icon**: Shows the current state of the valve (on/off)
- **Battery Level**: Displays the current battery percentage
- **Device Status**: Shows the current status of the device
- **Flow Rate**: Displays the current flow rate when water is flowing

**Actions:**
- Tap on the icon to toggle the valve state
- Tap anywhere else on the card to open the More Info dialog

#### More Info Dialog
The More Info dialog provides detailed control and information:

- **Header**: Displays weather information and battery percentage
- **Main Control**: Large button to start or stop watering
- **Mode Selection**: Tabs to switch between Duration and Volume modes
- **Slider Control**: Set the duration (minutes) or volume (liters) for watering
- **Value Display**: Shows the current selected value

### Basic Operations

#### Toggling the Valve
- In the compact card view, tap the valve icon to toggle between on and off
- In the More Info dialog, use the large "Start Watering" or "Stop Watering" button

#### Setting Duration-based Watering
1. Open the More Info dialog by tapping on the card
2. Select the "Duration" tab
3. Use the slider to set the desired watering duration in minutes
4. Tap "Start Watering" to begin

#### Setting Volume-based Watering
1. Open the More Info dialog by tapping on the card
2. Select the "Volume" tab
3. Use the slider to set the desired water volume in liters
4. Tap "Start Watering" to begin