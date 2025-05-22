const isDefinedPromise = (action: unknown) => typeof action === 'object' && Promise.resolve(action) === action;

export function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}
export async function elementUpdated(el: HTMLElement) {
    let hasSpecificAwait = false;
    // @ts-expect-error Lit element
    let update = el && el.updateComplete;
    if (isDefinedPromise(update)) {
      await update;
      hasSpecificAwait = true;
    }
  
    // @ts-expect-error Lit element property
    update = el && el.componentOnReady ? el.componentOnReady() : false;
    if (isDefinedPromise(update)) {
      await update;
      hasSpecificAwait = true;
    }
  
    if (!hasSpecificAwait) {
      await nextFrame();
    }
  
    if (window.ShadyDOM && typeof window.ShadyDOM.flush === 'function') {
      window.ShadyDOM.flush();
    }
  
    return el;
  }