import { LitElement } from 'lit';
import { TemplateResult } from 'lit-html';

import { BaseDriver } from './BaseDriver';
import { fixture, cleanupFixtures } from './fixture';
import { elementUpdated } from './utils';

export class LitTestKit<
  T extends LitElement,
  S extends Record<string, string>
> {
  public el: T = null as unknown as T;
  public finders: Record<keyof S, () => BaseDriver>;

  constructor(private selectors?: S) {
    this.finders = Object.fromEntries(
      Object.entries(this.selectors ?? {}).map(([key, selector]) => [
        key,
        () =>
          new BaseDriver(this.el?.shadowRoot?.querySelector(selector) ?? null),
      ]),
    ) as Record<keyof S, () => BaseDriver>;
  }

  async render(templateResult: TemplateResult) {
    this.el = await fixture<T>(templateResult);
    return this.el;
  }

  async nextTick() {
    return await elementUpdated(this.el);
  }

  reset() {
    cleanupFixtures();
  }
}
