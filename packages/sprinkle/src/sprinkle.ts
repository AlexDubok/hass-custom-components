/**
 * Entry point for the Sprinkle bundle
 */
import pjson from '../package.json';
import { SprinkleCard } from './card';
import { MoreInfoSprinkle } from './sprinkle-more-info';

console.info(
  `%c  SPRINKLE  \n%c Version ${pjson.version} `,
  'color: gray; font-weight: bold; background: papayawhip',
  'color: white; font-weight: bold; background: dimgray'
);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'sprinkle-card',
  name: 'Sprinkle Card',
  description: 'Custom card for controlling your irrigation system',
  preview: false,
});

export { SprinkleCard, MoreInfoSprinkle };

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview: boolean;
    }>;
  }
}
