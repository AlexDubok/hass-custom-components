// test-utils/fixture.js
import { LitElement } from 'lit';
import { render, TemplateResult } from 'lit-html'; // Or 'lit' if you're using Lit 2+

// Array to keep track of containers created by fixture for cleanup
const createdContainers: HTMLElement[] = [];

/**
 * Renders a Lit-html template into the JSDOM body and waits for the
 * first custom element's update to complete.
 * @param {import('lit-html').TemplateResult} templateResult The Lit-html template result.
 * @returns {Promise<Element>} A promise that resolves with the rendered element.
 */
export async function fixture<T extends LitElement>(
  templateResult: TemplateResult
) {
  const container = document.createElement('div');

  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';

  document.body.appendChild(container);
  createdContainers.push(container); // Store for cleanup

  render(templateResult, container);

  const el = container.firstElementChild as T;

  if (
    el &&
    typeof el.updateComplete === 'object' &&
    typeof el.updateComplete.then === 'function'
  ) {
    try {
      await el.updateComplete;
    } catch (e) {
      console.warn('Error waiting for element update:', e);
      await Promise.resolve(); // Fallback to waiting for microtasks
    }
  } else {
    await Promise.resolve();
  }
  return el;
}

/**
 * Removes all containers created by `fixture` from the document body.
 * Call this in your test runner's `afterEach` hook.
 */
export function cleanupFixtures() {
  createdContainers.forEach((container) => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });
  createdContainers.length = 0; // Clear the array
}
