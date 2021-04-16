import { Story } from "@storybook/react"
import { useState } from "react"
import { NavigationBarModel, NavigationBarUIKitStore } from "./store"
import {NavigationBar} from '.'
import {defaultModel} from './store'

class FakeStore extends NavigationBarUIKitStore {
  constructor(payload: NavigationBarModel = defaultModel) {
    super(payload)
    this.attributes = payload
  }
  showDialog(type: string): void {
    throw new Error("Method not implemented.")
  }
}

export default {
  title: 'Containers/NavigationBar'
}

export const NavStory: Story<any> = () => {

  const [store] = useState<FakeStore>(() => new FakeStore())

  return (
    <div>
      <NavigationBar store={store} />
    </div>
  )
}