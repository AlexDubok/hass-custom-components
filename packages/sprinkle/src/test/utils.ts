const isDefinedPromise = (action: any) => typeof action === 'object' && Promise.resolve(action) === action;

export function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}
export async function elementUpdated(el: HTMLElement) {
    let hasSpecificAwait = false;
    // @ts-ignore
    let update = el && el.updateComplete;
    if (isDefinedPromise(update)) {
      await update;
      hasSpecificAwait = true;
    }
  
    // @ts-ignore
    update = el && el.componentOnReady ? el.componentOnReady() : false;
    if (isDefinedPromise(update)) {
      await update;
      hasSpecificAwait = true;
    }
  
    if (!hasSpecificAwait) {
      await nextFrame();
    }
  
    // @ts-ignore
    if (window.ShadyDOM && typeof window.ShadyDOM.flush === 'function') {
      // @ts-ignore
      window.ShadyDOM.flush();
    }
  
    return el;
  }