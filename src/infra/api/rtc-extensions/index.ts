import VirtualBackgroundExtension, {
  IVirtualBackgroundProcessor,
} from 'agora-extension-virtual-background';
import BeautyEffectExtension, { IBeautyProcessor } from 'agora-extension-beauty-effect';
import { AIDenoiserExtension, IAIDenoiserProcessor } from 'agora-extension-ai-denoiser';
import { ExtensionInitializer, ProcessorInitializer } from '../type';
import { EduClassroomConfig } from 'agora-edu-core';
import { IBaseProcessor, IExtension } from 'agora-rte-extension';
import { isProduction } from '@classroom/infra/utils';

let assetsBaseUrl = isProduction ? 'https://solutions-apaas.agora.io/static' : '';

export const builtInExtensions = {
  virtualBackgroundExtension: 'VirtualBackgroundExtension',
  beautyEffectExtension: 'BeautyEffectExtension',
  aiDenoiserExtension: 'AIDenoiserExtension',
};

const builtInExtensionsKeeper: Partial<
  Record<keyof typeof builtInExtensions, IExtension<IBaseProcessor>>
> = {};

export const setAssetsBaseUrl = (baseUrl: string) => {
  assetsBaseUrl = baseUrl;
};

const builtInExtionsionInitializers: Record<string, ExtensionInitializer> = {
  VirtualBackgroundExtension: {
    createInstance: () => {
      return new VirtualBackgroundExtension();
    },
    createProcessor: async (extension) => {
      const processor = (extension as VirtualBackgroundExtension).createProcessor();
      await processor.init(`${assetsBaseUrl}/extensions/virtual-background`);
      return processor;
    },
  },
  BeautyEffectExtension: {
    createInstance: () => {
      return new BeautyEffectExtension();
    },
    createProcessor: async (extension) => {
      return (extension as BeautyEffectExtension).createProcessor();
    },
  },
  AIDenoiserExtension: {
    createInstance: () => {
      return new AIDenoiserExtension({
        assetsPath: `${assetsBaseUrl}/extensions/ai-denoiser`,
      });
    },
    createProcessor: async (extension) => {
      return (extension as AIDenoiserExtension).createProcessor();
    },
  },
};

const loadRTCExtension = <T extends IBaseProcessor>(name: string) => {
  const obj = builtInExtionsionInitializers[name];
  const key = name as keyof typeof builtInExtensionsKeeper;
  if (!builtInExtensionsKeeper[key]) {
    builtInExtensionsKeeper[key] = obj.createInstance();
  }

  const instance = builtInExtensionsKeeper[key] as IExtension<IBaseProcessor>;

  return {
    name,
    instance,
    createProcessor: () => obj.createProcessor(instance) as Promise<T>,
  };
};

export const initializeBuiltInExtensions = () => ({
  virtualBackgroundExtension: loadRTCExtension<IVirtualBackgroundProcessor>(
    builtInExtensions.virtualBackgroundExtension,
  ),
  beautyEffectExtension: loadRTCExtension<IBeautyProcessor>(
    builtInExtensions.beautyEffectExtension,
  ),
  aiDenoiserExtension: loadRTCExtension<IAIDenoiserProcessor>(
    builtInExtensions.aiDenoiserExtension,
  ),
});

export const getProcessorInitializer = <T extends IBaseProcessor>(
  name: string,
): ProcessorInitializer<T> => {
  const initializer = EduClassroomConfig.shared.rteEngineConfig.rtcSDKExtensions.find(
    ({ name: n }) => name === n,
  );
  return initializer as unknown as ProcessorInitializer<T>;
};
