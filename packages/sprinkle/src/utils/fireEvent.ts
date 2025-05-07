declare global {
    interface HASSDomEvents {}
  }

export type ValidHassDomEvent = keyof HASSDomEvents;

export interface HASSDomEvent<T> extends Event {
  payload: T;
}

export type HapticType =
	| 'success'
	| 'warning'
	| 'failure'
	| 'light'
	| 'medium'
	| 'heavy'
	| 'selection';

export const fireEvent = <HassEvent extends ValidHassDomEvent>(
    node: HTMLElement | Window,
    type: HassEvent,
    payload?: HASSDomEvents[HassEvent],
    options?: {
      bubbles?: boolean;
      cancelable?: boolean;
      composed?: boolean;
    }
  ) => {
    options = options || {};
    // @ts-ignore
    payload = payload === null || payload === undefined ? {} : payload;
    const event = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed,
    });
    (event as any).detail = payload;
    node.dispatchEvent(event);
    return event;
  };
  
export const fireHapticEvent = (haptic: HapticType) => {
  const event = new Event('haptic', {
    bubbles: true,
    composed: true,
  });
  // @ts-ignore
  event.detail = haptic;
  window.dispatchEvent(event);
};
