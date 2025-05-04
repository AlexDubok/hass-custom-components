import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import '../components/card-mini';

describe('sprinkle-status-card', () => {
  it('renders with default properties', async () => {
    const el = await fixture(
      html`<sprinkle-status-card></sprinkle-status-card>`
    );
    expect(el).shadowDom.to.contain('<ha-card');
  });

  it('renders title, status, and battery', async () => {
    const el = await fixture(
      html`<sprinkle-status-card
        title="Test Title"
        status="Online"
        batteryLevel="85"
      ></sprinkle-status-card>`
    );
    const card = el.shadowRoot!.querySelector('ha-card');
    expect(card?.getAttribute('header')).to.equal('Test Title');
    expect(el.shadowRoot!.textContent).to.include('status:');
    expect(el.shadowRoot!.textContent).to.include('Online');
    expect(el.shadowRoot!.textContent).to.include('battery:');
    expect(el.shadowRoot!.textContent).to.include('85%');
  });

  it('shows the correct icon for isWaterRunning', async () => {
    const elOn = await fixture(
      html`<sprinkle-status-card isWaterRunning></sprinkle-status-card>`
    );
    const elOff = await fixture(
      html`<sprinkle-status-card></sprinkle-status-card>`
    );
    const btnOn = elOn.shadowRoot!.querySelector('.sprinkle-button.on');
    const btnOff = elOff.shadowRoot!.querySelector('.sprinkle-button.off');
    expect(btnOn).to.exist;
    expect(btnOff).to.exist;
  });

  it('fires toggle-valve event on button click', async () => {
    const el = await fixture(
      html`<sprinkle-status-card></sprinkle-status-card>`
    );
    const btn = el.shadowRoot!.querySelector('button')!;
    setTimeout(() => btn.click());
    const event = await oneEvent(el, 'toggle-valve');
    expect(event).to.exist;
  });

  it('shows valveSwitchState', async () => {
    const el = await fixture(
      html`<sprinkle-status-card valveSwitchState="OPEN"></sprinkle-status-card>`
    );
    expect(el.shadowRoot!.textContent).to.include('OPEN');
  });
});
