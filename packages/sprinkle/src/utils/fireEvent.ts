declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
  },
) => {
  options = options ?? {};
  payload = payload ?? {} as HASSDomEvents[HassEvent];
  const event = new Event(type, {
    bubbles: options.bubbles ?? true,
    cancelable: Boolean(options.cancelable),
    composed: options.composed ?? true,
  });
  // @ts-expect-error our events have detail
  (event).detail = payload;
  node.dispatchEvent(event);
  return event;
};

export const fireHapticEvent = (haptic: HapticType) => {
  const event = new Event('haptic', {
    bubbles: true,
    composed: true,
  });
  // @ts-expect-error our events have detail
  event.detail = haptic;
  window.dispatchEvent(event);
};
