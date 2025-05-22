export class BaseDriver {
  constructor(public element: HTMLElement | null) {}

  public exists = () => this.element !== null;
  public text = () => this.element?.textContent;
  public click = () => this.element?.dispatchEvent(new Event('click'));

  public getSlot = (name: string) => {
    const slotElement = [...(this.element?.children ?? [])].find(
      (child) => (child as HTMLSlotElement).name === name,
    ) as HTMLSlotElement;

    return slotElement.assignedNodes()?.[0];
  };

  public getAttribute = (name: string) => (this.element as HTMLElement).getAttribute(name);
}
