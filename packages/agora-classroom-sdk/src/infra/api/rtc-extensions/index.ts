import VirtualBackgroundExtension from 'agora-extension-virtual-background';
import BeautyEffectExtension from 'agora-extension-beauty-effect';
export const VirtualBackgroundExtensionInstance = {
  name: 'VirtualBackgroundExtension',
  instance: new VirtualBackgroundExtension(),
  assetsPath: '.',
};
export const BeautyEffectExtensionIInstance = {
  name: 'BeautyEffectExtension',
  instance: new BeautyEffectExtension(),
  assetsPath: '.',
};
