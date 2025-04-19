Here's a detailed and refined description of your **Main Screen** for the smart irrigation app **"Sprinkle"**, focusing on easy-to-use sliders for watering duration and volume:

---

# Sprinkle App – Main Screen Mockup

## Overall Style
- **Color Theme:**
  - Primary Color: Fresh teal or sky blue
  - Accent Color: Vibrant green (indicates active state)
  - Background: White or very subtle gray
- **Typography:** Clear and rounded (e.g., Inter or Poppins)
- **Icons:** Modern, clean Material Design icons (MDI)

---

## Main Screen Layout

### Top Bar
- **Left side:**  
  - App name ("**Sprinkle**") in bold text.
  - Weather summary next to name (icon + "☀️ 23°C Today").
- **Right side:**  
  - Valve battery indicator (battery icon + "🔋 85%").

### Central Control Area

#### Water ON/OFF Button
- Large round button (easy to tap)
  - **Inactive State (water OFF):**  
    - Color: Light gray/white background, teal outline.  
    - Label: "Start Watering"
  - **Active State (water ON):**  
    - Color: Bright green background, white icon/text  
    - Label: "Stop Watering"  
- Below button: Current state/status text clearly displayed  
  - When active: "Watering now… 4 mins left" or "Watering now… 3L of 10L done"
  - When inactive: "Tap to begin watering"

---

### Easy-to-use Sliders (below ON/OFF button)
- Two tabs or toggle buttons clearly labeled "**Duration**" and "**Volume**", user selects either option.

#### Duration Slider (Default selected)
- Label clearly shown above slider: "**Watering Duration (minutes)**"
- Slider range: **1 min – 60 min** (or customizable range)
- Clearly marked increments every 5 mins
- Selected duration clearly shown below slider, large font, e.g. "**10 minutes**"

**Example visual:**
```
Duration:  [1 ———|——— 10 min —————— 60]
```

#### Volume Slider (alternate tab)
- Label: "**Watering Volume (liters)**"
- Slider range: **1L – 100L** (adjustable)
- Marked increments every 5L or 10L for easy selection
- Clearly visible selected volume: "**20 liters**"

**Example visual:**
```
Volume: [1L —————|————— 20L ——————— 100L]
```

---

### Footer (Navigation)
- **Left side:** "Schedule" button/icon (calendar icon).
- **Right side:** "History" button/icon (chart/graph icon).

---

### Mobile/Responsive Considerations
- Vertical stacking of elements for easy scrolling on small screens.
- Large interactive elements (button/slider handles) for comfortable mobile interaction.
- Instant feedback on slider movements (changing values displayed clearly and smoothly).

---

### Interaction Flow (typical use case):
1. User opens Sprinkle app, sees current weather, battery status clearly at top.
2. Selects watering duration or volume with a simple swipe on the slider.
3. Taps the large "Start Watering" button. The button changes to bright green, status text updates with remaining time or volume.
4. Slider and button disabled/grayed out during active watering to prevent accidental adjustments.
5. Upon completion or manual stop, the app returns to ready-to-use state.

---

Use this structured mockup as a clear guideline to directly translate this into LitElement components. Ask questions if you need clarification