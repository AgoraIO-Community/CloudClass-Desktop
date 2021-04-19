import { HomeStore } from '@/infra/stores/app/home';
import { MobXProviderContext } from 'mobx-react';
import { useContext } from 'react';

export const useHomeStore = (): HomeStore => {
  const context = useContext<HomeContext>(MobXProviderContext)
  return context.store
}

export type HomeContext = Record<string, HomeStore>

export type AudienceParams = Record<string, any>
export const useAudienceParams = (params?: string): string | { [key: string]: any } | null => {
  const searchString = location.href.split('?').pop()
  const urlParams = new URLSearchParams(searchString)
  const audienceParams: Record<string, any> = {}
  if (!params) {
    for (let key of urlParams.keys()) {
      audienceParams[key] = urlParams.get(key)
    }
    return audienceParams
  }
  return urlParams.get(params)
}