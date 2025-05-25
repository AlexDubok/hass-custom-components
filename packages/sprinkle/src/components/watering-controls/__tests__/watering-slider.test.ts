import { LitTestKit } from '../../../test/Testkit';
import { elementUpdated } from '../../../test/utils';
import * as fireEventUtils from '../../../utils/fireEvent';

import '../watering-slider';
import { WateringSlider } from '../watering-slider';
import { html } from 'lit';

describe('WateringSlider', () => {
  const driver = new LitTestKit<
    WateringSlider,
    {
      container: string;
      slider: string;
    }
  >({
    container: '.slider-container',
    slider: '.range',
  });

  beforeEach(() => {
    driver.reset();
    vi.clearAllMocks();
  });

  it('is defined', async () => {
    const el = await driver.render(html`<watering-slider></watering-slider>`);
    expect(el).toBeInstanceOf(WateringSlider);
  });

  it('renders with default props', async () => {
    const el = await driver.render(html`<watering-slider></watering-slider>`);

    expect(el.min).toBe(0);
    expect(el.max).toBe(60);
    expect(el.value).toBe(0);
    expect(el.precision).toBe(0.5);
    expect(el.unit).toBe('min');
    expect(el.disabled).toBe(false);

    const container = driver.finders.container();
    const slider = driver.finders.slider();

    expect(container.exists()).toBeTruthy();
    expect(slider.exists()).toBeTruthy();
  });

  it('renders with custom props', async () => {
    const el = await driver.render(html`
      <watering-slider
        min="5"
        max="100"
        value="25"
        precision="1"
        unit="liters"
        ?disabled=${true}
      ></watering-slider>
    `);

    expect(el.min).toBe(5);
    expect(el.max).toBe(100);
    expect(el.value).toBe(25);
    expect(el.precision).toBe(1);
    expect(el.unit).toBe('liters');
    expect(el.disabled).toBe(true);

    const slider = driver.finders.slider();
    expect(slider.getAttribute('min')).toBe('5');
    expect(slider.getAttribute('max')).toBe('100');
    expect(slider.getAttribute('step')).toBe('1');
    expect(slider.getAttribute('disabled')).toBe('');
  });

  it('updates slider value when value prop changes', async () => {
    const el = await driver.render(html`
      <watering-slider min="0" max="60" value="10"></watering-slider>
    `);

    const slider = driver.finders.slider();
    expect((slider.element as HTMLInputElement).value).toBe('10');

    el.value = 25;
    await elementUpdated(el);

    expect((slider.element as HTMLInputElement).value).toBe('25');
  });

  it('applies minimum class when value is at minimum', async () => {
    const el = await driver.render(html`
      <watering-slider min="0" max="60" value="0"></watering-slider>
    `);

    const slider = driver.finders.slider();
    expect(slider.element?.classList.contains('minimum')).toBe(true);

    el.value = 5;
    await elementUpdated(el);

    expect(slider.element?.classList.contains('minimum')).toBe(false);
  });

  it('dispatches value-change event on slider input', async () => {
    vi.spyOn(fireEventUtils, 'fireHapticEvent');
    const el = await driver.render(html`
      <watering-slider min="0" max="60" value="10"></watering-slider>
    `);

    const valueChangeSpy = vi.fn();
    el.addEventListener('value-change', valueChangeSpy);

    const slider = driver.finders.slider();
    const inputElement = slider.element as HTMLInputElement;

    // Simulate slider input change
    inputElement.value = '25';
    inputElement.dispatchEvent(new Event('input'));
    await elementUpdated(el);

    expect(valueChangeSpy).toHaveBeenCalledTimes(1);
    expect(valueChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { value: 25 },
      })
    );
    expect(el.value).toBe(25);
    expect(fireEventUtils.fireHapticEvent).toHaveBeenCalledWith('selection');
  });

  it('handles touch start event', async () => {
    vi.spyOn(fireEventUtils, 'fireHapticEvent');
    const el = await driver.render(html`
      <watering-slider min="0" max="60" value="10"></watering-slider>
    `);

    const valueChangeSpy = vi.fn();
    el.addEventListener('value-change', valueChangeSpy);

    const slider = driver.finders.slider();
    const sliderElement = slider.element as HTMLInputElement;

    // Mock getBoundingClientRect to return a predictable rectangle
    mockGetBoundingClientRect(sliderElement, { width: 100 });

    // Create a mock touch event at 50% position (should be value 30 for range 0-60)
    const touchEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 50, clientY: 10 } as Touch],
    });

    sliderElement.dispatchEvent(touchEvent);
    await elementUpdated(el);

    expect(valueChangeSpy).toHaveBeenCalledTimes(1);
    expect(valueChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { value: 30 },
      })
    );
    expect(fireEventUtils.fireHapticEvent).toHaveBeenCalledWith('selection');
  });

  it('handles touch move event', async () => {
    vi.spyOn(fireEventUtils, 'fireHapticEvent');
    const el = await driver.render(html`
      <watering-slider min="0" max="60" value="10"></watering-slider>
    `);

    const valueChangeSpy = vi.fn();
    el.addEventListener('value-change', valueChangeSpy);

    const slider = driver.finders.slider();
    const sliderElement = slider.element as HTMLInputElement;

    // Mock getBoundingClientRect
    mockGetBoundingClientRect(sliderElement, { width: 100 });

    const touchEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 25, clientY: 10 } as Touch],
    });

    sliderElement.dispatchEvent(touchEvent);
    await elementUpdated(el);

    expect(valueChangeSpy).toHaveBeenCalledTimes(1);
    expect(valueChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { value: 15 },
      })
    );
    expect(fireEventUtils.fireHapticEvent).toHaveBeenCalledWith('selection');
  });

  it('handles touch end event', async () => {
    vi.spyOn(fireEventUtils, 'fireHapticEvent');
    await driver.render(html`
      <watering-slider min="0" max="60" value="10"></watering-slider>
    `);

    const slider = driver.finders.slider();
    const sliderElement = slider.element as HTMLInputElement;

    const touchEvent = new TouchEvent('touchend');
    sliderElement.dispatchEvent(touchEvent);

    expect(fireEventUtils.fireHapticEvent).toHaveBeenCalledWith('light');
  });

  it('calculates value from touch position correctly', async () => {
    const el = await driver.render(html`
      <watering-slider
        min="10"
        max="50"
        value="20"
        precision="2"
      ></watering-slider>
    `);

    const slider = driver.finders.slider();
    const sliderElement = slider.element as HTMLInputElement;

    mockGetBoundingClientRect(sliderElement, { left: 100, width: 200 });

    const mockTouch = { clientX: 200, clientY: 10 } as Touch;
    const calculatedValue = el.calculateValueFromTouch(mockTouch);

    expect(calculatedValue).toBe(30);
  });

  it('respects precision when calculating touch values', async () => {
    const el = await driver.render(html`
      <watering-slider
        min="0"
        max="10"
        value="0"
        precision="0.5"
      ></watering-slider>
    `);

    const slider = driver.finders.slider();
    const sliderElement = slider.element as HTMLInputElement;

    mockGetBoundingClientRect(sliderElement, { width: 100 });

    // Touch at 33% should give us 3.33, which should round to 3.5 with precision 0.5
    const mockTouch = { clientX: 33, clientY: 10 } as Touch;
    const calculatedValue = el.calculateValueFromTouch(mockTouch);

    expect(calculatedValue).toBe(3.5);
  });

  it('clamps calculated values to min/max bounds', async () => {
    const el = await driver.render(html`
      <watering-slider min="10" max="50" value="20"></watering-slider>
    `);

    const slider = driver.finders.slider();
    const sliderElement = slider.element as HTMLInputElement;

    mockGetBoundingClientRect(sliderElement, { width: 100 });

    // Touch at -10 (before slider start) should clamp to min value
    const mockTouchBefore = { clientX: -10, clientY: 10 } as Touch;
    const calculatedValueMin = el.calculateValueFromTouch(mockTouchBefore);
    expect(calculatedValueMin).toBe(10);

    // Touch at 150 (after slider end) should clamp to max value
    const mockTouchAfter = { clientX: 150, clientY: 10 } as Touch;
    const calculatedValueMax = el.calculateValueFromTouch(mockTouchAfter);
    expect(calculatedValueMax).toBe(50);
  });

  it('prevents default on touch events to avoid scrolling', async () => {
    await driver.render(html`
      <watering-slider min="0" max="60" value="10"></watering-slider>
    `);

    const slider = driver.finders.slider();
    const sliderElement = slider.element as HTMLInputElement;

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 50, clientY: 10 } as Touch],
    });
    const touchMoveEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 60, clientY: 10 } as Touch],
    });

    const preventDefaultSpy = vi.spyOn(touchStartEvent, 'preventDefault');
    const preventDefaultSpy2 = vi.spyOn(touchMoveEvent, 'preventDefault');

    sliderElement.dispatchEvent(touchStartEvent);
    sliderElement.dispatchEvent(touchMoveEvent);

    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy2).toHaveBeenCalledTimes(1);
  });

  it('does not fire value-change on touch move if value is unchanged', async () => {
    const el = await driver.render(html`
      <watering-slider min="0" max="60" value="30"></watering-slider>
    `);

    const valueChangeSpy = vi.fn();
    el.addEventListener('value-change', valueChangeSpy);

    const slider = driver.finders.slider();
    const sliderElement = slider.element as HTMLInputElement;

    mockGetBoundingClientRect(sliderElement, { width: 100 });

    // Touch at 50% position should calculate to value 30 (same as current value)
    const touchEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 50, clientY: 10 } as Touch],
    });

    sliderElement.dispatchEvent(touchEvent);
    await elementUpdated(el);

    expect(valueChangeSpy).not.toHaveBeenCalled();
  });

  it('returns current value when sliderInput is not available', async () => {
    const el = await driver.render(html`
      <watering-slider min="0" max="60" value="25"></watering-slider>
    `);

    // @ts-expect-error Set sliderInput to undefined to simulate unavailable input
    (el as WateringSlider).sliderInput = undefined;

    const mockTouch = { clientX: 50, clientY: 10 } as Touch;
    const calculatedValue = el.calculateValueFromTouch(mockTouch);

    expect(calculatedValue).toBe(25); // Should return current value
  });
});

function mockGetBoundingClientRect(element: Element, overrides: Partial<DOMRect> = {}) {
  const defaultRect: DOMRect = {
    left: 0,
    width: 100,
    top: 0,
    height: 20,
    right: 100,
    bottom: 20,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    ...defaultRect,
    ...overrides,
  } as DOMRect);
}